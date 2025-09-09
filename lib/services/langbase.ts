import { Langbase } from 'langbase';
import { config } from '../config';
import type { CodebaseRequest } from '../config';

export class LangbaseService {
  private client: Langbase;

  constructor() {
    this.client = new Langbase({
      apiKey: config.langbase.apiKey,
    });
  }

  async orchestrateCodeGeneration(request: CodebaseRequest): Promise<{
    plan: string;
    steps: Array<{
      step: number;
      description: string;
      files: string[];
      dependencies: string[];
    }>;
  }> {
    try {
      const response = await this.client.pipe.run({
        name: config.langbase.pipeId,
        messages: [
          {
            role: 'user',
            content: this.buildOrchestrationPrompt(request)
          }
        ]
      });

      const content = response.completion;
      const parsed = JSON.parse(content);
      
      return {
        plan: parsed.plan || 'Generated development plan',
        steps: parsed.steps || []
      };
    } catch (error) {
      console.error('Error orchestrating with Langbase:', error);
      throw new Error(`Failed to create development plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateCodebase(files: Array<{ path: string; content: string; language: string }>): Promise<{
    isValid: boolean;
    issues: Array<{
      file: string;
      line?: number;
      severity: 'error' | 'warning' | 'info';
      message: string;
    }>;
    suggestions: string[];
  }> {
    try {
      const response = await this.client.pipe.run({
        name: config.langbase.pipeId,
        messages: [
          {
            role: 'user',
            content: this.buildValidationPrompt(files)
          }
        ]
      });

      const content = response.completion;
      const parsed = JSON.parse(content);
      
      return {
        isValid: parsed.isValid || false,
        issues: parsed.issues || [],
        suggestions: parsed.suggestions || []
      };
    } catch (error) {
      console.error('Error validating codebase:', error);
      return {
        isValid: false,
        issues: [{ file: 'validation', severity: 'error', message: 'Failed to validate codebase' }],
        suggestions: []
      };
    }
  }

  async optimizeCode(
    filePath: string,
    content: string,
    language: string,
    optimizationType: 'performance' | 'readability' | 'security' | 'all'
  ): Promise<{
    optimizedContent: string;
    changes: Array<{
      line: number;
      original: string;
      optimized: string;
      reason: string;
    }>;
  }> {
    try {
      const response = await this.client.pipe.run({
        name: config.langbase.pipeId,
        messages: [
          {
            role: 'user',
            content: `Optimize the following ${language} code for ${optimizationType}:

File: ${filePath}

Code:
\`\`\`${language}
${content}
\`\`\`

Return a JSON object with:
- optimizedContent: the improved code
- changes: array of specific changes made with explanations

Focus on:
${optimizationType === 'performance' ? '- Performance improvements\n- Memory optimization\n- Algorithm efficiency' : ''}
${optimizationType === 'readability' ? '- Code clarity\n- Better naming\n- Improved structure' : ''}
${optimizationType === 'security' ? '- Security vulnerabilities\n- Input validation\n- Safe practices' : ''}
${optimizationType === 'all' ? '- Performance, readability, and security improvements' : ''}`
          }
        ]
      });

      const content_response = response.completion;
      const parsed = JSON.parse(content_response);
      
      return {
        optimizedContent: parsed.optimizedContent || content,
        changes: parsed.changes || []
      };
    } catch (error) {
      console.error('Error optimizing code:', error);
      return {
        optimizedContent: content,
        changes: []
      };
    }
  }

  private buildOrchestrationPrompt(request: CodebaseRequest): string {
    return `Create a detailed development plan for generating a ${request.projectType} codebase.

Requirements:
- Project: ${request.prompt}
- Type: ${request.projectType}
- Tech Stack: ${request.techStack.join(', ')}
- Features: ${request.features.join(', ')}
- Complexity: ${request.complexity}
- Include Tests: ${request.includeTests}
- Include Documentation: ${request.includeDocumentation}
- Include Deployment: ${request.includeDeployment}

Return a JSON object with:
{
  "plan": "Overall development strategy and approach",
  "steps": [
    {
      "step": 1,
      "description": "Step description",
      "files": ["list of files to create in this step"],
      "dependencies": ["required dependencies or previous steps"]
    }
  ]
}

Break down the development into logical steps, considering dependencies and best practices.`;
  }

  private buildValidationPrompt(files: Array<{ path: string; content: string; language: string }>): string {
    const fileList = files.map(f => `${f.path} (${f.language})`).join('\n');
    const codeSnippets = files.slice(0, 5).map(f => 
      `File: ${f.path}\n\`\`\`${f.language}\n${f.content.slice(0, 1000)}...\n\`\`\``
    ).join('\n\n');

    return `Validate the following codebase for quality, security, and best practices:

Files in codebase:
${fileList}

Sample code (first 5 files):
${codeSnippets}

Return a JSON object with:
{
  "isValid": boolean,
  "issues": [
    {
      "file": "filename",
      "line": number (optional),
      "severity": "error|warning|info",
      "message": "description of issue"
    }
  ],
  "suggestions": ["list of improvement suggestions"]
}

Check for:
- Code quality and best practices
- Security vulnerabilities
- Performance issues
- Missing error handling
- Incomplete implementations`;
  }
}

export const langbaseService = new LangbaseService();
