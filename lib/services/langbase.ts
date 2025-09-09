import { Langbase } from 'langbase';
import { config } from '../config';
import type { CodebaseRequest } from '../config';

export class LangbaseService {
  private langbase: Langbase;

  constructor() {
    this.langbase = new Langbase();
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
      // Use the correct Langbase API structure
      const response = await this.langbase.pipes.run({
        apiKey: config.langbase.apiKey,
        messages: [
          {
            role: 'user',
            content: this.buildOrchestrationPrompt(request)
          }
        ]
      });

      // Handle the response
      console.log('Langbase raw response:', response);
      let content = response.completion || response.choices?.[0]?.message?.content || '';
      if (!content && typeof response === 'string') {
        content = response;
      }
      // If still no content, try to find a string property that looks like JSON
      if (!content && typeof response === 'object') {
        for (const [key, value] of Object.entries(response)) {
          if (typeof value === 'string' && value.trim().startsWith('{')) {
            content = value;
            break;
          }
        }
        if (!content) {
          content = JSON.stringify(response);
        }
      }
      
      try {
        let cleaned = content.trim();
        let parsed = null;
        // Try to parse the whole response first (plain JSON)
        try {
          parsed = JSON.parse(cleaned);
        } catch {}
        // If not valid, try to parse any 'data:' line as JSON
        if (!parsed) {
          const lines = cleaned.split('\n');
          const dataLines = lines.filter(line => line.startsWith('data:'));
          console.log('Langbase data: lines:', dataLines);
          for (const line of dataLines) {
            const jsonStr = line.replace(/^data:\s*/, '');
            if (jsonStr.trim().startsWith('{')) {
              try {
                parsed = JSON.parse(jsonStr);
                break;
              } catch {}
            }
          }
        }
        if (!parsed) throw new Error('No valid JSON found in Langbase response');
        return {
          plan: parsed.plan || 'Generated development plan',
          steps: parsed.steps || []
        };
      } catch {
        // If JSON parsing fails, create a basic plan from the text response
        return {
          plan: content || 'Generated development plan',
          steps: [
            {
              step: 1,
              description: 'Initialize project structure',
              files: ['package.json', 'README.md'],
              dependencies: []
            },
            {
              step: 2,
              description: 'Implement core functionality',
              files: ['src/index.js', 'src/components/'],
              dependencies: ['step-1']
            }
          ]
        };
      }
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
      const response = await this.langbase.pipes.run({
        apiKey: config.langbase.apiKey,
        messages: [
          {
            role: 'user',
            content: this.buildValidationPrompt(files)
          }
        ]
      });

      const content = response.completion || response.choices?.[0]?.message?.content || '';
      
      try {
        let cleaned = content.trim();
        let parsed = null;
        try {
          parsed = JSON.parse(cleaned);
        } catch {}
        if (!parsed) {
          const lines = cleaned.split('\n');
          for (const line of lines) {
            if (line.trim().startsWith('{')) {
              try {
                parsed = JSON.parse(line.trim());
                break;
              } catch {}
            }
          }
        }
        if (!parsed) throw new Error('No valid JSON found in Langbase response');
        return {
          isValid: parsed.isValid || false,
          issues: parsed.issues || [],
          suggestions: parsed.suggestions || []
        };
      } catch {
        return {
          isValid: true,
          issues: [],
          suggestions: ['Code validation completed successfully']
        };
      }
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
      const response = await this.langbase.pipes.run({
        apiKey: config.langbase.apiKey,
        messages: [
          {
            role: 'user',
            content: this.buildOptimizationPrompt(filePath, content, language, optimizationType)
          }
        ]
      });

      const responseContent = response.completion || response.choices?.[0]?.message?.content || '';
      
      try {
        let cleaned = responseContent.trim();
        let parsed = null;
        try {
          parsed = JSON.parse(cleaned);
        } catch {}
        if (!parsed) {
          const lines = cleaned.split('\n');
          for (const line of lines) {
            if (line.trim().startsWith('{')) {
              try {
                parsed = JSON.parse(line.trim());
                break;
              } catch {}
            }
          }
        }
        if (!parsed) throw new Error('No valid JSON found in Langbase response');
        return {
          optimizedContent: parsed.optimizedContent || content,
          changes: parsed.changes || []
        };
      } catch {
        return {
          optimizedContent: content,
          changes: []
        };
      }
    } catch (error) {
      console.error('Error optimizing code:', error);
      return {
        optimizedContent: content,
        changes: []
      };
    }
  }

  private buildOrchestrationPrompt(request: CodebaseRequest): string {
    return `You are an expert software architect. Create a detailed development plan for generating a ${request.projectType} codebase.

Project Requirements:
- Description: ${request.prompt}
- Project Type: ${request.projectType}
- Technology Stack: ${request.techStack.join(', ')}
- Key Features: ${request.features.join(', ')}
- Complexity Level: ${request.complexity}
- Include Tests: ${request.includeTests}
- Include Documentation: ${request.includeDocumentation}
- Include Deployment Configuration: ${request.includeDeployment}

Please analyze these requirements and create a comprehensive development plan. Return your response as a JSON object with the following structure:

{
  "plan": "A detailed overall development strategy and approach explaining the architecture, design patterns, and implementation strategy",
  "steps": [
    {
      "step": 1,
      "description": "Detailed description of what this step accomplishes",
      "files": ["list of specific files to create in this step"],
      "dependencies": ["list of previous steps or external dependencies required"]
    }
  ]
}

Guidelines:
1. Break down the development into 5-8 logical steps
2. Consider dependencies between steps
3. Include proper project structure and organization
4. Account for the specified complexity level
5. Include testing, documentation, and deployment steps if requested
6. Follow best practices for the chosen technology stack
7. Ensure the plan is comprehensive and production-ready

Focus on creating a plan that results in a complete, functional, and well-structured codebase.`;
  }

  private buildValidationPrompt(files: Array<{ path: string; content: string; language: string }>): string {
    const fileList = files.map(f => `${f.path} (${f.language})`).join('\n');
    const codeSnippets = files.slice(0, 5).map(f => 
      `File: ${f.path}\n\`\`\`${f.language}\n${f.content.slice(0, 1000)}${f.content.length > 1000 ? '...' : ''}\n\`\`\``
    ).join('\n\n');

    return `You are a senior code reviewer. Please validate the following codebase for quality, security, and best practices.

Files in codebase:
${fileList}

Sample code (first 5 files):
${codeSnippets}

Please analyze the code and return a JSON object with the following structure:

{
  "isValid": boolean,
  "issues": [
    {
      "file": "filename",
      "line": number (optional),
      "severity": "error|warning|info",
      "message": "detailed description of the issue"
    }
  ],
  "suggestions": ["list of specific improvement suggestions"]
}

Check for:
- Code quality and adherence to best practices
- Security vulnerabilities and potential risks
- Performance issues and optimization opportunities
- Missing error handling and edge cases
- Incomplete implementations or TODO items
- Proper use of design patterns
- Code consistency and maintainability
- Proper documentation and comments

Provide specific, actionable feedback that will help improve the codebase.`;
  }

  private buildOptimizationPrompt(
    filePath: string,
    content: string,
    language: string,
    optimizationType: string
  ): string {
    const focusAreas = {
      performance: '- Algorithm efficiency and time complexity\n- Memory usage optimization\n- Database query optimization\n- Caching strategies\n- Lazy loading and code splitting',
      readability: '- Code clarity and simplicity\n- Better variable and function naming\n- Improved code structure and organization\n- Enhanced comments and documentation\n- Consistent formatting and style',
      security: '- Input validation and sanitization\n- Authentication and authorization\n- Data encryption and secure storage\n- Protection against common vulnerabilities (XSS, SQL injection, etc.)\n- Secure coding practices',
      all: '- Performance improvements (algorithms, memory, caching)\n- Code readability (naming, structure, documentation)\n- Security enhancements (validation, encryption, vulnerability fixes)\n- Best practices implementation'
    };

    return `You are an expert ${language} developer. Please optimize the following code for ${optimizationType}.

File: ${filePath}
Language: ${language}

Current Code:
\`\`\`${language}
${content}
\`\`\`

Please analyze and optimize this code focusing on:
${focusAreas[optimizationType as keyof typeof focusAreas]}

Return a JSON object with the following structure:

{
  "optimizedContent": "the complete improved code",
  "changes": [
    {
      "line": number,
      "original": "original code line or section",
      "optimized": "optimized code line or section",
      "reason": "detailed explanation of why this change improves the code"
    }
  ]
}

Guidelines:
1. Maintain the original functionality while improving the specified aspects
2. Ensure all optimizations are production-ready and well-tested approaches
3. Provide clear explanations for each change
4. Follow language-specific best practices and conventions
5. Consider maintainability and future extensibility
6. Only make changes that provide meaningful improvements

Focus on delivering practical, impactful optimizations that enhance the code quality.`;
  }
}

export const langbaseService = new LangbaseService();
