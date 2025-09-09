import { NextRequest, NextResponse } from 'next/server';
import { daytonaService } from '@/lib/services/daytona';

export async function GET() {
  try {
    const workspaces = await daytonaService.listWorkspaces();
    
    return NextResponse.json({
      success: true,
      workspaces,
      count: workspaces.length
    });
  } catch (error) {
    console.error('Error listing workspaces:', error);
    return NextResponse.json(
      { 
        error: 'Failed to list workspaces',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('id');
    
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }

    await daytonaService.deleteWorkspace(workspaceId);
    
    return NextResponse.json({
      success: true,
      message: 'Workspace deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting workspace:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete workspace',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
