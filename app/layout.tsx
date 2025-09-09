import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Codebase Agent',
  description: 'Generate complete software codebases from a single prompt using Codestral, Langbase SDK, and Daytona.io',
  keywords: ['AI', 'code generation', 'Codestral', 'Langbase', 'Daytona', 'software development'],
  authors: [{ name: 'AI Codebase Agent' }],
  openGraph: {
    title: 'AI Codebase Agent',
    description: 'Generate complete software codebases from a single prompt',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-background">
            {children}
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
