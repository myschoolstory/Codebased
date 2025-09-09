import { NextRequest, NextResponse } from 'next/server';
import { orchestratorService } from '@/lib/services/orchestrator';
import type { CodebaseResponse } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const body: { codebaseResponse: CodebaseResponse } = await request.json();
    
    if (!body.codebaseResponse || !body.codebaseResponse.files || body.codebaseResponse.files.length === 0) {
      return NextResponse.json(
        { error: 'Invalid codebase response: files are required' },
        { status: 400 }
      );
    }

    console.log('Deploying codebase to sandbox:', body.codebaseResponse.id);

    // Deploy to Daytona sandbox
    const deployment = await orchestratorService.deployToSandbox(body.codebaseResponse);

    return NextResponse.json({
      success: deployment.status === 'success',
      workspaceUrl: deployment.workspaceUrl,
      logs: deployment.deploymentLogs,
      status: deployment.status
    });
  } catch (error) {
    console.error('Error in deploy API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to deploy codebase',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
