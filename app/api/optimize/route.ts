import { NextRequest, NextResponse } from 'next/server';
import { orchestratorService } from '@/lib/services/orchestrator';
import type { GeneratedFile } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const body: { 
      files: GeneratedFile[];
      optimizationType: 'performance' | 'readability' | 'security' | 'all';
    } = await request.json();
    
    if (!body.files || body.files.length === 0) {
      return NextResponse.json(
        { error: 'Files are required for optimization' },
        { status: 400 }
      );
    }

    if (!body.optimizationType) {
      return NextResponse.json(
        { error: 'Optimization type is required (performance, readability, security, or all)' },
        { status: 400 }
      );
    }

    console.log('Optimizing codebase for:', body.optimizationType);

    // Optimize the codebase
    const optimizedFiles = await orchestratorService.optimizeCodebase(
      body.files,
      body.optimizationType
    );

    return NextResponse.json({
      success: true,
      optimizedFiles,
      optimizationType: body.optimizationType,
      filesOptimized: optimizedFiles.filter(f => f.type === 'code').length
    });
  } catch (error) {
    console.error('Error in optimize API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to optimize codebase',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
