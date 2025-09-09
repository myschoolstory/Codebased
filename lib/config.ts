export const config = {
  mistral: {
    apiKey: process.env.MISTRAL_API_KEY || '',
    model: 'codestral-latest',
    baseURL: 'https://api.mistral.ai/v1',
  },
  langbase: {
    apiKey: process.env.LANGBASE_API_KEY || '',
    pipeId: process.env.LANGBASE_PIPE_ID || '',
    baseURL: 'https://api.langbase.com/v1',
  },
  daytona: {
    apiUrl: process.env.DAYTONA_API_URL || 'https://api.daytona.io',
    apiKey: process.env.DAYTONA_API_KEY || '',
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
  app: {
    name: 'AI Codebase Agent',
    description: 'Generate complete software codebases from a single prompt',
    version: '1.0.0',
  },
};

export type ProjectType = 
  | 'web-app'
  | 'api'
  | 'mobile-app'
  | 'desktop-app'
  | 'cli-tool'
  | 'library'
  | 'microservice'
  | 'full-stack';

export type TechStack = 
  | 'react'
  | 'nextjs'
  | 'vue'
  | 'angular'
  | 'svelte'
  | 'nodejs'
  | 'python'
  | 'java'
  | 'go'
  | 'rust'
  | 'php'
  | 'ruby'
  | 'csharp'
  | 'flutter'
  | 'react-native';

export interface CodebaseRequest {
  prompt: string;
  projectType: ProjectType;
  techStack: TechStack[];
  features: string[];
  complexity: 'simple' | 'medium' | 'complex';
  includeTests: boolean;
  includeDocumentation: boolean;
  includeDeployment: boolean;
}

export interface GeneratedFile {
  path: string;
  content: string;
  type: 'code' | 'config' | 'documentation' | 'test';
  language: string;
}

export interface CodebaseResponse {
  id: string;
  status: 'generating' | 'completed' | 'error';
  files: GeneratedFile[];
  structure: string;
  instructions: string;
  estimatedTime: number;
  createdAt: Date;
}
