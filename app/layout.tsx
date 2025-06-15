import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from '@/components/ui/toaster';
import { Suspense } from 'react';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Unbserved _ Visual References Collection",
  description: "Descubra e compartilhe inspirações visuais. Uma curadoria de design, tipografia, branding e muito mais.",
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
};

// Error boundary component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-swiss-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-swiss-black border-t-transparent mx-auto mb-4"></div>
          <p className="font-mono text-sm text-swiss-black">LOADING...</p>
        </div>
      </div>
    }>
      {children}
    </Suspense>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('Server: RootLayout rendering...');
  
  return (
    <html lang="pt-BR">
        <body className={`${inter.className} antialiased`}>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <Toaster />
        </body>
    </html>
  );
}