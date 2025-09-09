import { NextRequest, NextResponse } from 'next/server';
import { orchestratorService } from '@/lib/services/orchestrator';
import type { CodebaseRequest } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const body: CodebaseRequest = await request.json();
    
    // Validate required fields
    if (!body.prompt || !body.projectType || !body.techStack || body.techStack.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt, projectType, and techStack are required' },
        { status: 400 }
      );
    }

    // Set defaults for optional fields
    const codebaseRequest: CodebaseRequest = {
      prompt: body.prompt,
      projectType: body.projectType,
      techStack: body.techStack,
      features: body.features || [],
      complexity: body.complexity || 'medium',
      includeTests: body.includeTests ?? true,
      includeDocumentation: body.includeDocumentation ?? true,
      includeDeployment: body.includeDeployment ?? false,
    };

    console.log('Generating codebase for request:', codebaseRequest);

    // Generate the codebase
    const result = await orchestratorService.generateCodebase(codebaseRequest);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in generate API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate codebase',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AI Codebase Generator API',
    version: '1.0.0',
    endpoints: {
      generate: 'POST /api/generate - Generate a complete codebase',
      deploy: 'POST /api/deploy - Deploy codebase to sandbox',
      optimize: 'POST /api/optimize - Optimize existing codebase',
      workspaces: 'GET /api/workspaces - List all workspaces'
    },
    supportedProjectTypes: [
      'web-app',
      'api',
      'mobile-app',
      'desktop-app',
      'cli-tool',
      'library',
      'microservice',
      'full-stack'
    ],
    supportedTechStacks: [
      'react',
      'nextjs',
      'vue',
      'angular',
      'svelte',
      'nodejs',
      'python',
      'java',
      'go',
      'rust',
      'php',
      'ruby',
      'csharp',
      'flutter',
      'react-native'
    ]
  });
}
