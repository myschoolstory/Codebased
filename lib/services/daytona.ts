import axios from 'axios';
import { config } from '../config';
import type { GeneratedFile } from '../config';

export interface DaytonaWorkspace {
  id: string;
  name: string;
  status: 'creating' | 'running' | 'stopped' | 'error';
  url: string;
  gitUrl?: string;
  createdAt: Date;
}

export interface DaytonaProject {
  workspaceId: string;
  files: GeneratedFile[];
  structure: string;
  setupCommands: string[];
}

export class DaytonaService {
  private apiClient;

  constructor() {
    this.apiClient = axios.create({
      baseURL: config.daytona.apiUrl,
      headers: {
        'Authorization': `Bearer ${config.daytona.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async createWorkspace(projectName: string, template?: string): Promise<DaytonaWorkspace> {
    try {
      const response = await this.apiClient.post('/workspaces', {
        name: projectName,
        template: template || 'blank',
        config: {
          resources: {
            cpu: '2',
            memory: '4Gi',
            storage: '10Gi'
          },
          environment: {
            NODE_VERSION: '18',
            PYTHON_VERSION: '3.11'
          }
        }
      });

      return {
        id: response.data.id,
        name: response.data.name,
        status: response.data.status,
        url: response.data.url,
        gitUrl: response.data.gitUrl,
        createdAt: new Date(response.data.createdAt)
      };
    } catch (error) {
      console.error('Error creating Daytona workspace:', error);
      throw new Error(`Failed to create workspace: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deployProject(project: DaytonaProject): Promise<{
    workspaceUrl: string;
    deploymentStatus: string;
    logs: string[];
  }> {
    try {
      // Upload files to workspace
      await this.uploadFiles(project.workspaceId, project.files);
      
      // Execute setup commands
      const setupLogs = await this.executeSetupCommands(project.workspaceId, project.setupCommands);
      
      // Get workspace URL
      const workspace = await this.getWorkspace(project.workspaceId);
      
      return {
        workspaceUrl: workspace.url,
        deploymentStatus: 'success',
        logs: setupLogs
      };
    } catch (error) {
      console.error('Error deploying project:', error);
      throw new Error(`Failed to deploy project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async uploadFiles(workspaceId: string, files: GeneratedFile[]): Promise<void> {
    try {
      for (const file of files) {
        await this.apiClient.post(`/workspaces/${workspaceId}/files`, {
          path: file.path,
          content: file.content,
          encoding: 'utf8'
        });
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      throw new Error(`Failed to upload files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async executeSetupCommands(workspaceId: string, commands: string[]): Promise<string[]> {
    const logs: string[] = [];
    
    try {
      for (const command of commands) {
        const response = await this.apiClient.post(`/workspaces/${workspaceId}/execute`, {
          command,
          timeout: 300000 // 5 minutes
        });
        
        logs.push(`Command: ${command}`);
        logs.push(`Output: ${response.data.output}`);
        
        if (response.data.exitCode !== 0) {
          logs.push(`Error: Command failed with exit code ${response.data.exitCode}`);
        }
      }
      
      return logs;
    } catch (error) {
      console.error('Error executing setup commands:', error);
      logs.push(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return logs;
    }
  }

  async getWorkspace(workspaceId: string): Promise<DaytonaWorkspace> {
    try {
      const response = await this.apiClient.get(`/workspaces/${workspaceId}`);
      
      return {
        id: response.data.id,
        name: response.data.name,
        status: response.data.status,
        url: response.data.url,
        gitUrl: response.data.gitUrl,
        createdAt: new Date(response.data.createdAt)
      };
    } catch (error) {
      console.error('Error getting workspace:', error);
      throw new Error(`Failed to get workspace: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listWorkspaces(): Promise<DaytonaWorkspace[]> {
    try {
      const response = await this.apiClient.get('/workspaces');
      
      return response.data.map((ws: DaytonaWorkspace) => ({
        id: ws.id,
        name: ws.name,
        status: ws.status,
        url: ws.url,
        gitUrl: ws.gitUrl,
        createdAt: new Date(ws.createdAt)
      }));
    } catch (error) {
      console.error('Error listing workspaces:', error);
      throw new Error(`Failed to list workspaces: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteWorkspace(workspaceId: string): Promise<void> {
    try {
      await this.apiClient.delete(`/workspaces/${workspaceId}`);
    } catch (error) {
      console.error('Error deleting workspace:', error);
      throw new Error(`Failed to delete workspace: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getWorkspaceLogs(workspaceId: string): Promise<string[]> {
    try {
      const response = await this.apiClient.get(`/workspaces/${workspaceId}/logs`);
      return response.data.logs || [];
    } catch (error) {
      console.error('Error getting workspace logs:', error);
      return [`Error fetching logs: ${error instanceof Error ? error.message : 'Unknown error'}`];
    }
  }

  generateSetupCommands(files: GeneratedFile[], projectType: string, techStack: string[]): string[] {
    const commands: string[] = [];
    
    // Detect package manager and install dependencies
    const hasPackageJson = files.some(f => f.path === 'package.json');
    const hasRequirementsTxt = files.some(f => f.path === 'requirements.txt');
    const hasGoMod = files.some(f => f.path === 'go.mod');
    const hasCargoToml = files.some(f => f.path === 'Cargo.toml');
    
    if (hasPackageJson) {
      commands.push('npm install');
      
      // Add build command for common frameworks
      if (techStack.includes('nextjs')) {
        commands.push('npm run build');
      } else if (techStack.includes('react')) {
        commands.push('npm run build');
      }
    }
    
    if (hasRequirementsTxt) {
      commands.push('pip install -r requirements.txt');
    }
    
    if (hasGoMod) {
      commands.push('go mod tidy');
      commands.push('go build');
    }
    
    if (hasCargoToml) {
      commands.push('cargo build');
    }
    
    // Add database setup if needed
    const hasDbMigrations = files.some(f => f.path.includes('migration') || f.path.includes('schema'));
    if (hasDbMigrations) {
      commands.push('# Database setup required - check migration files');
    }
    
    // Add Docker setup if Dockerfile exists
    const hasDockerfile = files.some(f => f.path === 'Dockerfile');
    if (hasDockerfile) {
      commands.push('docker build -t project .');
    }
    
    return commands;
  }
}

export const daytonaService = new DaytonaService();
