# AI Codebase Agent

A comprehensive AI-powered tool for generating complete software codebases from a single prompt. Built with Codestral, Langbase SDK, Daytona.io, and Next.js.

## Features

- **Complete Codebase Generation**: Generate entire project structures with production-ready code
- **Multiple Project Types**: Support for web apps, APIs, mobile apps, desktop apps, CLI tools, libraries, and microservices
- **Multi-Language Support**: JavaScript, TypeScript, Python, Java, Go, Rust, PHP, Ruby, C#, and more
- **AI-Powered Orchestration**: Uses Langbase SDK for intelligent development planning
- **Code Optimization**: Built-in optimization for performance, readability, and security
- **Sandbox Deployment**: Automatic deployment to Daytona.io sandbox environments
- **Real-time Progress**: Live updates during codebase generation
- **Modern UI**: Clean, responsive interface built with shadcn/ui

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS, Radix UI
- **AI Services**: 
  - Codestral (Mistral AI) for code generation
  - Langbase SDK for orchestration and optimization
- **Sandbox**: Daytona.io for remote development environments
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or bun
- API keys for:
  - Mistral AI (Codestral)
  - Langbase
  - Daytona.io

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-codebase-agent
```

2. Install dependencies:
```bash
bun install
# or
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your API keys:
```env
MISTRAL_API_KEY=your_mistral_api_key_here
LANGBASE_API_KEY=your_langbase_api_key_here
LANGBASE_PIPE_ID=your_pipe_id_here
DAYTONA_API_URL=https://api.daytona.io
DAYTONA_API_KEY=your_daytona_api_key_here
```

4. Start the development server:
```bash
bun dev
# or
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Generating a Codebase

1. **Describe Your Project**: Provide a detailed description of what you want to build
2. **Select Project Type**: Choose from web app, API, mobile app, etc.
3. **Choose Tech Stack**: Select the technologies you want to use
4. **Add Features**: Specify key features and functionality
5. **Configure Options**: Set complexity level and include tests/documentation
6. **Generate**: Click "Generate Codebase" and wait for AI to create your project

### Deploying to Sandbox

1. After generation, click "Deploy to Sandbox"
2. The system will create a Daytona workspace
3. Upload all generated files
4. Execute setup commands automatically
5. Provide you with a live workspace URL

### Code Optimization

Use the optimization features to improve your generated code:
- **Performance**: Optimize for speed and efficiency
- **Readability**: Improve code clarity and maintainability
- **Security**: Fix vulnerabilities and add security best practices
- **All**: Apply all optimizations

## API Endpoints

### POST /api/generate
Generate a complete codebase from a prompt.

**Request Body:**
```json
{
  "prompt": "Create a task management app...",
  "projectType": "web-app",
  "techStack": ["nextjs", "typescript"],
  "features": ["user authentication", "real-time updates"],
  "complexity": "medium",
  "includeTests": true,
  "includeDocumentation": true,
  "includeDeployment": false
}
```

### POST /api/deploy
Deploy a generated codebase to Daytona sandbox.

### POST /api/optimize
Optimize existing codebase files.

### GET /api/workspaces
List all active Daytona workspaces.

## Project Structure

```
ai-codebase-agent/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── generate/      # Codebase generation
│   │   ├── deploy/        # Sandbox deployment
│   │   ├── optimize/      # Code optimization
│   │   └── workspaces/    # Workspace management
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Main page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── codebase-generator.tsx
│   ├── generated-codebase.tsx
│   └── workspace-manager.tsx
├── lib/                  # Utilities and services
│   ├── services/         # External service integrations
│   │   ├── mistral.ts    # Codestral integration
│   │   ├── langbase.ts   # Langbase SDK integration
│   │   ├── daytona.ts    # Daytona.io integration
│   │   └── orchestrator.ts # Main orchestration service
│   ├── config.ts         # Configuration and types
│   └── utils.ts          # Utility functions
└── README.md
```

## Supported Project Types

- **Web Application**: Frontend web apps with UI components
- **API/Backend**: REST APIs or GraphQL services
- **Full-Stack Application**: Complete apps with frontend and backend
- **Mobile Application**: React Native or Flutter apps
- **Desktop Application**: Electron or native desktop apps
- **CLI Tool**: Command-line interface applications
- **Library/Package**: Reusable code libraries
- **Microservice**: Single-purpose service applications

## Supported Technologies

### Frontend
- React, Next.js, Vue.js, Angular, Svelte

### Backend
- Node.js, Python, Java, Go, Rust, PHP, Ruby, C#

### Mobile
- React Native, Flutter

### Databases
- PostgreSQL, MySQL, MongoDB, SQLite

### Deployment
- Docker, Kubernetes, Vercel, Netlify, AWS

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints

## Roadmap

- [ ] Support for more programming languages
- [ ] Integration with additional AI models
- [ ] Advanced project templates
- [ ] Team collaboration features
- [ ] Version control integration
- [ ] Automated testing and CI/CD
- [ ] Performance analytics
- [ ] Custom optimization rules
