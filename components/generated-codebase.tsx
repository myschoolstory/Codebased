'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Download, 
  ExternalLink, 
  FileText, 
  Folder, 
  Code, 
  TestTube, 
  BookOpen, 
  Settings,
  Rocket,
  Loader2,
  CheckCircle,
  AlertCircle,
  Zap
} from 'lucide-react';
import type { CodebaseResponse, GeneratedFile } from '@/lib/config';

interface GeneratedCodebaseProps {
  codebase: CodebaseResponse;
}

export function GeneratedCodebase({ codebase }: GeneratedCodebaseProps) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<{
    success: boolean;
    workspaceUrl?: string;
    logs?: string[];
  } | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<{
    success: boolean;
    filesOptimized?: number;
  } | null>(null);

  const filesByType = {
    code: codebase.files.filter(f => f.type === 'code'),
    config: codebase.files.filter(f => f.type === 'config'),
    documentation: codebase.files.filter(f => f.type === 'documentation'),
    test: codebase.files.filter(f => f.type === 'test'),
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codebaseResponse: codebase }),
      });

      const result = await response.json();
      setDeploymentResult(result);
    } catch {
      setDeploymentResult({
        success: false,
        logs: ["Deployment failed"]
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleOptimize = async (type: 'performance' | 'readability' | 'security' | 'all') => {
    setIsOptimizing(true);
    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          files: codebase.files,
          optimizationType: type
        }),
      });

      const result = await response.json();
      setOptimizationResult(result);
    } catch {
      setOptimizationResult({
        success: false
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const downloadCodebase = () => {
    const zip = new Blob([JSON.stringify(codebase, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(zip);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codebase-${codebase.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFileIcon = (file: GeneratedFile) => {
    switch (file.type) {
      case 'code':
        return <Code className="h-4 w-4 text-blue-500" />;
      case 'test':
        return <TestTube className="h-4 w-4 text-green-500" />;
      case 'documentation':
        return <BookOpen className="h-4 w-4 text-purple-500" />;
      case 'config':
        return <Settings className="h-4 w-4 text-orange-500" />;
      default:
        return <FileText className="h-4 w-4 text-slate-500" />;
    }
  };

  const getLanguageColor = (language: string) => {
    const colors: { [key: string]: string } = {
      javascript: 'bg-yellow-100 text-yellow-800',
      typescript: 'bg-blue-100 text-blue-800',
      python: 'bg-green-100 text-green-800',
      java: 'bg-red-100 text-red-800',
      go: 'bg-cyan-100 text-cyan-800',
      rust: 'bg-orange-100 text-orange-800',
      php: 'bg-purple-100 text-purple-800',
      ruby: 'bg-red-100 text-red-800',
      csharp: 'bg-purple-100 text-purple-800',
      html: 'bg-orange-100 text-orange-800',
      css: 'bg-blue-100 text-blue-800',
      json: 'bg-gray-100 text-gray-800',
      yaml: 'bg-green-100 text-green-800',
      markdown: 'bg-gray-100 text-gray-800',
    };
    return colors[language.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Codebase Generated Successfully
              </CardTitle>
              <CardDescription>
                Generated {codebase.files.length} files in {(codebase.estimatedTime / 1000).toFixed(1)}s
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={downloadCodebase} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button 
                onClick={handleDeploy} 
                disabled={isDeploying}
                size="sm"
              >
                {isDeploying ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Rocket className="h-4 w-4 mr-2" />
                )}
                Deploy to Sandbox
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Deployment Result */}
      {deploymentResult && (
        <Alert variant={deploymentResult.success ? "default" : "destructive"}>
          {deploymentResult.success ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            {deploymentResult.success ? (
              <div>
                <p>Successfully deployed to sandbox!</p>
                {deploymentResult.workspaceUrl && (
                  <Button 
                    variant="link" 
                    className="p-0 h-auto mt-2"
                    onClick={() => window.open(deploymentResult.workspaceUrl, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Open Workspace
                  </Button>
                )}
              </div>
            ) : (
              <div>
                <p>Deployment failed</p>
                {deploymentResult.logs && (
                  <details className="mt-2">
                    <summary className="cursor-pointer">View logs</summary>
                    <pre className="text-xs mt-1 whitespace-pre-wrap">
                      {deploymentResult.logs.join('\n')}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Optimization Result */}
      {optimizationResult && (
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription>
            {optimizationResult.success ? (
              `Successfully optimized ${optimizationResult.filesOptimized} files`
            ) : (
              'Optimization failed'
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="structure">Structure</TabsTrigger>
          <TabsTrigger value="instructions">Setup</TabsTrigger>
          <TabsTrigger value="optimize">Optimize</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{filesByType.code.length}</p>
                    <p className="text-sm text-slate-600">Code Files</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TestTube className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{filesByType.test.length}</p>
                    <p className="text-sm text-slate-600">Test Files</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{filesByType.config.length}</p>
                    <p className="text-sm text-slate-600">Config Files</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{filesByType.documentation.length}</p>
                    <p className="text-sm text-slate-600">Docs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>File Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(filesByType).map(([type, files]) => (
                  files.length > 0 && (
                    <div key={type} className="flex items-center justify-between">
                      <span className="capitalize">{type} Files</span>
                      <Badge variant="secondary">{files.length}</Badge>
                    </div>
                  )
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <div className="grid gap-4">
            {Object.entries(filesByType).map(([type, files]) => (
              files.length > 0 && (
                <Card key={type}>
                  <CardHeader>
                    <CardTitle className="capitalize flex items-center gap-2">
                      {type === 'code' && <Code className="h-4 w-4" />}
                      {type === 'test' && <TestTube className="h-4 w-4" />}
                      {type === 'documentation' && <BookOpen className="h-4 w-4" />}
                      {type === 'config' && <Settings className="h-4 w-4" />}
                      {type} Files ({files.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            {getFileIcon(file)}
                            <span className="font-mono text-sm">{file.path}</span>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={getLanguageColor(file.language)}
                          >
                            {file.language}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            ))}
          </div>
        </TabsContent>

        <TabsContent value="structure">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-4 w-4" />
                Project Structure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <pre className="text-sm font-mono whitespace-pre-wrap">
                  {codebase.structure}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructions">
          <Card>
            <CardHeader>
              <CardTitle>Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm">
                    {codebase.instructions}
                  </pre>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimize" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Code Optimization</CardTitle>
              <CardDescription>
                Improve your generated codebase with AI-powered optimizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => handleOptimize('performance')}
                  disabled={isOptimizing}
                  variant="outline"
                >
                  {isOptimizing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
                  Performance
                </Button>
                <Button 
                  onClick={() => handleOptimize('readability')}
                  disabled={isOptimizing}
                  variant="outline"
                >
                  {isOptimizing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <BookOpen className="h-4 w-4 mr-2" />}
                  Readability
                </Button>
                <Button 
                  onClick={() => handleOptimize('security')}
                  disabled={isOptimizing}
                  variant="outline"
                >
                  {isOptimizing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <AlertCircle className="h-4 w-4 mr-2" />}
                  Security
                </Button>
                <Button 
                  onClick={() => handleOptimize('all')}
                  disabled={isOptimizing}
                >
                  {isOptimizing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
                  Optimize All
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
