import { Mistral } from '@mistralai/mistralai';
import { config } from '../config';
import type { CodebaseRequest, GeneratedFile } from '../config';

export class MistralService {
  private client: Mistral;

  constructor() {
    this.client = new Mistral({
      apiKey: config.mistral.apiKey,
    });
  }

  async generateCodebase(request: CodebaseRequest): Promise<GeneratedFile[]> {
    try {
      const prompt = this.buildCodeGenerationPrompt(request);
      
      const response = await this.client.chat.complete({
        model: 'codestral-latest',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        maxTokens: 8000,
      });

      const content = response.choices[0]?.message?.content;
      console.log('Raw Mistral response:', response);
      if (!content) {
        throw new Error('No content received from Mistral');
      }

      // Handle both string and array content types
      const contentString = typeof content === 'string' ? content : JSON.stringify(content);
      let parsed = null;
      try {
        parsed = JSON.parse(contentString);
      } catch {}
      if (!parsed) {
        const lines = contentString.split('\n');
        for (const line of lines) {
          if (line.trim().startsWith('{')) {
            try {
              parsed = JSON.parse(line.trim());
              break;
            } catch {}
          }
        }
      }
      if (!parsed) throw new Error('No valid JSON found in Mistral response');
      return parsed.files || [];
    } catch (error) {
      console.error('Error generating codebase with Mistral:', error);
      throw new Error(`Failed to generate codebase: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateSingleFile(
    filePath: string,
    description: string,
    language: string,
    dependencies: string[] = []
  ): Promise<string> {
    try {
      const prompt = `Generate a ${language} file for: ${filePath}

Description: ${description}
Dependencies: ${dependencies.join(', ')}

Requirements:
- Write production-ready, well-documented code
- Follow best practices for ${language}
- Include proper error handling
- Add comments for complex logic
- Ensure code is secure and performant

Return only the code content, no explanations or markdown formatting.`;

      const response = await this.client.chat.complete({
        model: 'codestral-latest',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        maxTokens: 4000,
      });

      const content = response.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from Mistral');
      }

      return typeof content === 'string' ? content : JSON.stringify(content);
    } catch (error) {
      console.error('Error generating file with Mistral:', error);
      throw new Error(`Failed to generate file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildCodeGenerationPrompt(request: CodebaseRequest): string {
    return `Generate a complete ${request.projectType} codebase based on the following requirements:

Project Description: ${request.prompt}
Project Type: ${request.projectType}
Tech Stack: ${request.techStack.join(', ')}
Features: ${request.features.join(', ')}
Complexity Level: ${request.complexity}
Include Tests: ${request.includeTests}
Include Documentation: ${request.includeDocumentation}
Include Deployment: ${request.includeDeployment}

Generate a complete, production-ready codebase with the following structure:

Return a JSON object with this exact format:
{
  "files": [
    {
      "path": "relative/path/to/file.ext",
      "content": "complete file content here",
      "language": "javascript|typescript|python|etc",
      "description": "brief description of file purpose"
    }
  ]
}

Requirements:
1. Create a complete project structure with all necessary files
2. Include package.json/requirements.txt with all dependencies
3. Add proper configuration files (tsconfig.json, .env.example, etc.)
4. Write production-ready code with error handling
5. Include proper documentation and comments
6. Follow best practices for the chosen tech stack
7. Ensure all files work together as a cohesive project
8. Add proper typing (if using TypeScript)
9. Include basic styling (if web project)
10. Add deployment configuration if requested

${request.includeTests ? 'Include comprehensive test files for all major components.' : ''}
${request.includeDocumentation ? 'Include README.md and API documentation.' : ''}
${request.includeDeployment ? 'Include Docker and deployment configuration files.' : ''}

Make sure the generated code is:
- Secure and follows security best practices
- Performant and optimized
- Well-structured and maintainable
- Properly documented
- Ready to run without modifications`;
  }
}

export const mistralService = new MistralService();
