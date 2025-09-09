'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ExternalLink, 
  Trash2, 
  RefreshCw, 
  Loader2,
  Server,
  Clock,
  AlertCircle,
  CheckCircle,
  Pause,
} from 'lucide-react';
import type { DaytonaWorkspace } from '@/lib/services/daytona';

export function WorkspaceManager() {
  const [workspaces, setWorkspaces] = useState<DaytonaWorkspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingWorkspace, setDeletingWorkspace] = useState<string | null>(null);

  const fetchWorkspaces = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/workspaces');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch workspaces');
      }
      
      setWorkspaces(data.workspaces || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWorkspace = async (workspaceId: string) => {
    try {
      setDeletingWorkspace(workspaceId);
      
      const response = await fetch(`/api/workspaces?id=${workspaceId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete workspace');
      }
      
      // Remove from local state
      setWorkspaces(prev => prev.filter(ws => ws.id !== workspaceId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete workspace');
    } finally {
      setDeletingWorkspace(null);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'stopped':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'creating':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="h-4 w-4" />;
      case 'stopped':
        return <Pause className="h-4 w-4" />;
      case 'creating':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Server className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600 dark:text-slate-400">Loading workspaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Active Workspaces</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Manage your Daytona.io sandbox environments
          </p>
        </div>
        <Button onClick={fetchWorkspaces} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Workspaces List */}
      {workspaces.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Server className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 mb-2">
                No workspaces found
              </p>
              <p className="text-sm text-slate-500">
                Deploy a codebase to create your first workspace
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {workspaces.map((workspace) => (
            <Card key={workspace.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="h-4 w-4" />
                      {workspace.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3" />
                      Created {formatDate(workspace.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(workspace.status)}
                    >
                      {getStatusIcon(workspace.status)}
                      <span className="ml-1 capitalize">{workspace.status}</span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      <strong>ID:</strong> {workspace.id}
                    </p>
                    {workspace.gitUrl && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <strong>Git:</strong> {workspace.gitUrl}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {workspace.status === 'running' && workspace.url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(workspace.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteWorkspace(workspace.id)}
                      disabled={deletingWorkspace === workspace.id}
                    >
                      {deletingWorkspace === workspace.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">About Daytona Workspaces</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <p>
              • <strong>Running:</strong> Workspace is active and accessible
            </p>
            <p>
              • <strong>Stopped:</strong> Workspace is paused to save resources
            </p>
            <p>
              • <strong>Creating:</strong> Workspace is being set up
            </p>
            <p>
              • <strong>Error:</strong> Workspace encountered an issue
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
