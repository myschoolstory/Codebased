'use client';

import { useState } from 'react';
import { CodebaseGenerator } from '@/components/codebase-generator';
import { GeneratedCodebase } from '@/components/generated-codebase';
import { WorkspaceManager } from '@/components/workspace-manager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code2, Rocket, Settings, Zap } from 'lucide-react';
import type { CodebaseResponse } from '@/lib/config';

export default function Home() {
  const [generatedCodebase, setGeneratedCodebase] = useState<CodebaseResponse | null>(null);
  const [activeTab, setActiveTab] = useState('generate');

  const handleCodebaseGenerated = (codebase: CodebaseResponse) => {
    setGeneratedCodebase(codebase);
    setActiveTab('codebase');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Code2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
              AI Codebase Agent
            </h1>
          </div>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Generate complete, production-ready software codebases from a single prompt using 
            Codestral, Langbase SDK, and Daytona.io sandbox environments.
          </p>
          
          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Codestral AI
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Settings className="h-3 w-3" />
              Langbase SDK
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Rocket className="h-3 w-3" />
              Daytona Sandbox
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Code2 className="h-4 w-4" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="codebase" disabled={!generatedCodebase} className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Codebase
            </TabsTrigger>
            <TabsTrigger value="workspaces" className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              Workspaces
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate New Codebase</CardTitle>
                <CardDescription>
                  Describe your project requirements and let AI generate a complete, production-ready codebase.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodebaseGenerator onCodebaseGenerated={handleCodebaseGenerated} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="codebase" className="space-y-6">
            {generatedCodebase ? (
              <GeneratedCodebase codebase={generatedCodebase} />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Code2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">
                      No codebase generated yet. Go to the Generate tab to create one.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="workspaces" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sandbox Workspaces</CardTitle>
                <CardDescription>
                  Manage your Daytona.io sandbox environments where your generated codebases are deployed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WorkspaceManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
