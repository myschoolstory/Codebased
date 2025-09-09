import { mistralService } from './mistral';
import { langbaseService } from './langbase';
import { daytonaService } from './daytona';
import type { CodebaseRequest, CodebaseResponse, GeneratedFile } from '../config';

export class OrchestratorService {
  async generateCodebase(request: CodebaseRequest): Promise<CodebaseResponse> {
    const startTime = Date.now();
    const id = `codebase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Step 1: Create development plan using Langbase
      console.log('Creating development plan...');
      const plan = await langbaseService.orchestrateCodeGeneration(request);
      
      // Step 2: Generate codebase using Mistral
      console.log('Generating codebase with Mistral...');
      const files = await mistralService.generateCodebase(request);
      
      // Step 3: Validate generated code
      console.log('Validating generated code...');
      const validation = await langbaseService.validateCodebase(
        files.map(f => ({ path: f.path, content: f.content, language: f.language }))
      );
      
      // Step 4: Fix any critical issues
      if (!validation.isValid) {
        console.log('Fixing critical issues...');
        const fixedFiles = await this.fixCriticalIssues(files, validation.issues);
        files.splice(0, files.length, ...fixedFiles);
      }
      
      // Step 5: Generate project structure documentation
      const structure = this.generateProjectStructure(files);
      
      // Step 6: Generate setup instructions
      const instructions = this.generateInstructions(request, files, plan);
      
      const estimatedTime = Date.now() - startTime;
      
      return {
        id,
        status: 'completed',
        files,
        structure,
        instructions,
        estimatedTime,
        createdAt: new Date()
      };
      
    } catch (error) {
      console.error('Error in orchestrator:', error);
      return {
        id,
        status: 'error',
        files: [],
        structure: '',
        instructions: `Error generating codebase: ${error instanceof Error ? error.message : 'Unknown error'}`,
        estimatedTime: Date.now() - startTime,
        createdAt: new Date()
      };
    }
  }

  async deployToSandbox(codebaseResponse: CodebaseResponse): Promise<{
    workspaceUrl: string;
    deploymentLogs: string[];
    status: 'success' | 'error';
  }> {
    try {
      // Create Daytona workspace
      const workspace = await daytonaService.createWorkspace(
        `codebase-${codebaseResponse.id}`,
        this.detectTemplate(codebaseResponse.files)
      );
      
      // Generate setup commands
      const setupCommands = daytonaService.generateSetupCommands(
        codebaseResponse.files,
        this.detectProjectType(codebaseResponse.files),
        this.detectTechStack(codebaseResponse.files)
      );
      
      // Deploy project
      const deployment = await daytonaService.deployProject({
        workspaceId: workspace.id,
        files: codebaseResponse.files,
        structure: codebaseResponse.structure,
        setupCommands
      });
      
      return {
        workspaceUrl: deployment.workspaceUrl,
        deploymentLogs: deployment.logs,
        status: 'success'
      };
      
    } catch (error) {
      console.error('Error deploying to sandbox:', error);
      return {
        workspaceUrl: '',
        deploymentLogs: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        status: 'error'
      };
    }
  }

  async optimizeCodebase(
    files: GeneratedFile[],
    optimizationType: 'performance' | 'readability' | 'security' | 'all'
  ): Promise<GeneratedFile[]> {
    const optimizedFiles: GeneratedFile[] = [];
    
    for (const file of files) {
      if (file.type === 'code') {
        try {
          const optimization = await langbaseService.optimizeCode(
            file.path,
            file.content,
            file.language,
            optimizationType
          );
          
          optimizedFiles.push({
            ...file,
            content: optimization.optimizedContent
          });
        } catch (error) {
          console.error(`Error optimizing ${file.path}:`, error);
          optimizedFiles.push(file); // Keep original if optimization fails
        }
      } else {
        optimizedFiles.push(file);
      }
    }
    
    return optimizedFiles;
  }

  private async fixCriticalIssues(
    files: GeneratedFile[],
    issues: Array<{ file: string; severity: string; message: string }>
  ): Promise<GeneratedFile[]> {
    const criticalIssues = issues.filter(issue => issue.severity === 'error');
    const fixedFiles = [...files];
    
    for (const issue of criticalIssues) {
      const fileIndex = fixedFiles.findIndex(f => f.path === issue.file);
      if (fileIndex !== -1) {
        try {
          const fixedContent = await mistralService.generateSingleFile(
            issue.file,
            `Fix the following issue: ${issue.message}`,
            `Fix the following issue: ${issue.message}`,
            []
          );
          
          fixedFiles[fileIndex] = {
            ...fixedFiles[fileIndex],
            content: fixedContent
          };
        } catch (error) {
          console.error(`Error fixing ${issue.file}:`, error);
        }
      }
    }
    
    return fixedFiles;
  }

  private generateProjectStructure(files: GeneratedFile[]): string {
    const structure: { [key: string]: string[] } = {};
    
    files.forEach(file => {
      const parts = file.path.split('/');
      const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : 'root';
      const filename = parts[parts.length - 1];
      
      if (!structure[dir]) {
        structure[dir] = [];
      }
      structure[dir].push(filename);
    });
    
    let result = 'Project Structure:\n\n';
    Object.keys(structure).sort().forEach(dir => {
      result += `${dir}/\n`;
      structure[dir].sort().forEach(file => {
        result += `  ├── ${file}\n`;
      });
      result += '\n';
    });
    
    return result;
  }

  private generateInstructions(
    request: CodebaseRequest,
    files: GeneratedFile[],
    plan: { plan: string; steps: Array<{ step: number; description: string; files: string[]; dependencies: string[]; }> }
  ): string {
    const hasPackageJson = files.some(f => f.path === 'package.json');
    const hasRequirementsTxt = files.some(f => f.path === 'requirements.txt');
    const hasDockerfile = files.some(f => f.path === 'Dockerfile');
    const hasReadme = files.some(f => f.path.toLowerCase() === 'readme.md');
    
    let instructions = `# ${request.projectType.toUpperCase()} Project Setup Instructions\n\n`;
    instructions += `## Project Overview\n${plan.plan}\n\n`;
    
    instructions += `## Prerequisites\n`;
    if (hasPackageJson) {
      instructions += `- Node.js (v16 or higher)\n- npm or yarn\n`;
    }
    if (hasRequirementsTxt) {
      instructions += `- Python (v3.8 or higher)\n- pip\n`;
    }
    if (hasDockerfile) {
      instructions += `- Docker\n`;
    }
    
    instructions += `\n## Setup Steps\n\n`;
    instructions += `1. Extract all files to your project directory\n\n`;
    
    if (hasPackageJson) {
      instructions += `2. Install dependencies:\n   \`\`\`bash\n   npm install\n   \`\`\`\n\n`;
    }
    
    if (hasRequirementsTxt) {
      instructions += `2. Install Python dependencies:\n   \`\`\`bash\n   pip install -r requirements.txt\n   \`\`\`\n\n`;
    }
    
    instructions += `3. Configure environment variables (check .env.example if present)\n\n`;
    
    if (request.projectType === 'web-app' || request.projectType === 'full-stack') {
      instructions += `4. Start the development server:\n   \`\`\`bash\n   npm run dev\n   \`\`\`\n\n`;
    }
    
    if (hasDockerfile) {
      instructions += `## Docker Setup (Alternative)\n\n`;
      instructions += `1. Build the Docker image:\n   \`\`\`bash\n   docker build -t ${request.projectType} .\n   \`\`\`\n\n`;
      instructions += `2. Run the container:\n   \`\`\`bash\n   docker run -p 3000:3000 ${request.projectType}\n   \`\`\`\n\n`;
    }
    
    if (hasReadme) {
      instructions += `## Additional Information\nCheck the README.md file for more detailed instructions and documentation.\n\n`;
    }
    
    instructions += `## Features Implemented\n`;
    request.features.forEach(feature => {
      instructions += `- ${feature}\n`;
    });
    
    return instructions;
  }

  private detectTemplate(files: GeneratedFile[]): string {
    if (files.some(f => f.path === 'package.json')) {
      const packageJson = files.find(f => f.path === 'package.json');
      if (packageJson?.content.includes('next')) return 'nextjs';
      if (packageJson?.content.includes('react')) return 'react';
      if (packageJson?.content.includes('vue')) return 'vue';
      return 'nodejs';
    }
    
    if (files.some(f => f.path === 'requirements.txt')) return 'python';
    if (files.some(f => f.path === 'go.mod')) return 'golang';
    if (files.some(f => f.path === 'Cargo.toml')) return 'rust';
    
    return 'blank';
  }

  private detectProjectType(files: GeneratedFile[]): string {
    if (files.some(f => f.path.includes('pages') || f.path.includes('components'))) {
      return 'web-app';
    }
    if (files.some(f => f.path.includes('api') || f.path.includes('routes'))) {
      return 'api';
    }
    return 'application';
  }

  private detectTechStack(files: GeneratedFile[]): string[] {
    const stack: string[] = [];
    
    if (files.some(f => f.path === 'package.json')) {
      const packageJson = files.find(f => f.path === 'package.json');
      if (packageJson?.content.includes('next')) stack.push('nextjs');
      if (packageJson?.content.includes('react')) stack.push('react');
      if (packageJson?.content.includes('vue')) stack.push('vue');
      if (packageJson?.content.includes('express')) stack.push('express');
    }
    
    if (files.some(f => f.path === 'requirements.txt')) stack.push('python');
    if (files.some(f => f.path === 'go.mod')) stack.push('golang');
    if (files.some(f => f.path === 'Cargo.toml')) stack.push('rust');
    
    return stack;
  }
}

export const orchestratorService = new OrchestratorService();
