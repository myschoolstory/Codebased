'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, X, Sparkles, AlertCircle } from 'lucide-react';
import type { CodebaseRequest, CodebaseResponse, ProjectType, TechStack } from '@/lib/config';

interface CodebaseGeneratorProps {
  onCodebaseGenerated: (codebase: CodebaseResponse) => void;
}

const PROJECT_TYPES: { value: ProjectType; label: string; description: string }[] = [
  { value: 'web-app', label: 'Web Application', description: 'Frontend web application with UI components' },
  { value: 'api', label: 'API/Backend', description: 'REST API or GraphQL backend service' },
  { value: 'full-stack', label: 'Full-Stack App', description: 'Complete application with frontend and backend' },
  { value: 'mobile-app', label: 'Mobile App', description: 'React Native or Flutter mobile application' },
  { value: 'desktop-app', label: 'Desktop App', description: 'Electron or native desktop application' },
  { value: 'cli-tool', label: 'CLI Tool', description: 'Command-line interface application' },
  { value: 'library', label: 'Library/Package', description: 'Reusable code library or npm package' },
  { value: 'microservice', label: 'Microservice', description: 'Single-purpose microservice application' },
];

const TECH_STACKS: { value: TechStack; label: string; category: string }[] = [
  { value: 'react', label: 'React', category: 'Frontend' },
  { value: 'nextjs', label: 'Next.js', category: 'Full-Stack' },
  { value: 'vue', label: 'Vue.js', category: 'Frontend' },
  { value: 'angular', label: 'Angular', category: 'Frontend' },
  { value: 'svelte', label: 'Svelte', category: 'Frontend' },
  { value: 'nodejs', label: 'Node.js', category: 'Backend' },
  { value: 'python', label: 'Python', category: 'Backend' },
  { value: 'java', label: 'Java', category: 'Backend' },
  { value: 'go', label: 'Go', category: 'Backend' },
  { value: 'rust', label: 'Rust', category: 'Backend' },
  { value: 'php', label: 'PHP', category: 'Backend' },
  { value: 'ruby', label: 'Ruby', category: 'Backend' },
  { value: 'csharp', label: 'C#', category: 'Backend' },
  { value: 'flutter', label: 'Flutter', category: 'Mobile' },
  { value: 'react-native', label: 'React Native', category: 'Mobile' },
];

export function CodebaseGenerator({ onCodebaseGenerated }: CodebaseGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState('');
  
  const [formData, setFormData] = useState<CodebaseRequest>({
    prompt: '',
    projectType: 'web-app',
    techStack: [],
    features: [],
    complexity: 'medium',
    includeTests: true,
    includeDocumentation: true,
    includeDeployment: false,
  });

  const [newFeature, setNewFeature] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.prompt.trim()) {
      setError('Please provide a project description');
      return;
    }
    
    if (formData.techStack.length === 0) {
      setError('Please select at least one technology stack');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProgress(0);
    setCurrentStep('Initializing...');

    try {
      // Simulate progress updates
      const progressSteps = [
        { progress: 10, step: 'Creating development plan...' },
        { progress: 30, step: 'Generating codebase with Codestral...' },
        { progress: 60, step: 'Validating generated code...' },
        { progress: 80, step: 'Optimizing and finalizing...' },
        { progress: 100, step: 'Complete!' },
      ];

      let stepIndex = 0;
      const progressInterval = setInterval(() => {
        if (stepIndex < progressSteps.length) {
          setProgress(progressSteps[stepIndex].progress);
          setCurrentStep(progressSteps[stepIndex].step);
          stepIndex++;
        }
      }, 2000);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate codebase');
      }

      const result: CodebaseResponse = await response.json();
      
      if (result.status === 'error') {
        throw new Error(result.instructions);
      }

      setProgress(100);
      setCurrentStep('Complete!');
      onCodebaseGenerated(result);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  const toggleTechStack = (tech: TechStack) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter(t => t !== tech)
        : [...prev.techStack, tech]
    }));
  };

  if (isGenerating) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h3 className="text-lg font-semibold mb-2">Generating Your Codebase</h3>
          <p className="text-slate-600 dark:text-slate-400">{currentStep}</p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
          <h4 className="font-medium mb-2">What&apos;s happening:</h4>
          <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
            <li>• Langbase SDK orchestrates the development plan</li>
            <li>• Codestral generates production-ready code</li>
            <li>• AI validates and optimizes the codebase</li>
            <li>• Complete project structure is created</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Project Description */}
      <div className="space-y-2">
        <Label htmlFor="prompt">Project Description *</Label>
        <Textarea
          id="prompt"
          placeholder="Describe your project in detail. For example: 'Create a task management web app with user authentication, real-time updates, and team collaboration features. Users should be able to create projects, assign tasks, set deadlines, and track progress.'"
          value={formData.prompt}
          onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
          className="min-h-[120px]"
          required
        />
      </div>

      {/* Project Type */}
      <div className="space-y-2">
        <Label>Project Type *</Label>
        <Select
          value={formData.projectType}
          onValueChange={(value: ProjectType) => setFormData(prev => ({ ...prev, projectType: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROJECT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <div>
                  <div className="font-medium">{type.label}</div>
                  <div className="text-sm text-slate-500">{type.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Technology Stack */}
      <div className="space-y-3">
        <Label>Technology Stack * (Select multiple)</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {TECH_STACKS.map((tech) => (
            <div
              key={tech.value}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.techStack.includes(tech.value)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
              onClick={() => toggleTechStack(tech.value)}
            >
              <div className="font-medium text-sm">{tech.label}</div>
              <div className="text-xs text-slate-500">{tech.category}</div>
            </div>
          ))}
        </div>
        {formData.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {formData.techStack.map((tech) => (
              <Badge key={tech} variant="secondary">
                {TECH_STACKS.find(t => t.value === tech)?.label}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Features */}
      <div className="space-y-3">
        <Label>Key Features</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add a feature (e.g., user authentication, real-time chat)"
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
          />
          <Button type="button" onClick={addFeature} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {formData.features.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.features.map((feature) => (
              <Badge key={feature} variant="outline" className="flex items-center gap-1">
                {feature}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFeature(feature)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Advanced Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Advanced Options</h3>
        
        <div className="space-y-2">
          <Label>Complexity Level</Label>
          <Select
            value={formData.complexity}
            onValueChange={(value: 'simple' | 'medium' | 'complex') => 
              setFormData(prev => ({ ...prev, complexity: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="simple">Simple - Basic functionality</SelectItem>
              <SelectItem value="medium">Medium - Standard features</SelectItem>
              <SelectItem value="complex">Complex - Advanced features</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeTests"
              checked={formData.includeTests}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, includeTests: !!checked }))
              }
            />
            <Label htmlFor="includeTests">Include test suites</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeDocumentation"
              checked={formData.includeDocumentation}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, includeDocumentation: !!checked }))
              }
            />
            <Label htmlFor="includeDocumentation">Include documentation</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeDeployment"
              checked={formData.includeDeployment}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, includeDeployment: !!checked }))
              }
            />
            <Label htmlFor="includeDeployment">Include deployment configs</Label>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg">
        <Sparkles className="h-4 w-4 mr-2" />
        Generate Codebase
      </Button>
    </form>
  );
}
