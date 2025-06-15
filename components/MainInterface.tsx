"use client";

import { useState } from 'react';
import { Upload, Search, Database, Eye, RefreshCw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArenaIndexer } from '@/components/ArenaIndexer';
import { VisualSearch } from '@/components/VisualSearch';
import { ImageUploader } from '@/components/ImageUploader';
import { Dashboard } from '@/components/Dashboard';
import { PendingVectorProcessor } from '@/components/PendingVectorProcessor';
import { DatabaseSetup } from '@/components/DatabaseSetup';

export function MainInterface() {
  const [activeTab, setActiveTab] = useState('search');

  return (
    <div className="min-h-screen bg-swiss-white">
      {/* Header */}
      <header className="border-b border-swiss-black bg-swiss-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center space-x-4 hover:opacity-75 transition-opacity"
            >
              <div className="w-8 h-8 border border-swiss-black flex items-center justify-center">
                <div className="w-4 h-4 border border-swiss-black"></div>
              </div>
              <div>
                <h1 className="text-2xl swiss-title font-light tracking-wider">UNBSERVED</h1>
                <p className="text-swiss-gray-600 text-xs swiss-mono uppercase tracking-wider">ADMIN PANEL</p>
              </div>
            </button>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 border border-swiss-black text-swiss-black hover:bg-swiss-black hover:text-swiss-white transition-colors text-sm swiss-body"
              >
                Ver Site
              </button>
              <div className="text-sm text-swiss-gray-600 font-mono">ADMIN MODE</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
          {/* Navigation */}
          <TabsList className="grid w-full grid-cols-5 bg-swiss-white border border-swiss-black">
            <TabsTrigger 
              value="search" 
              className="data-[state=active]:bg-swiss-black data-[state=active]:text-swiss-white border-r border-swiss-black"
            >
              <Search className="w-4 h-4 mr-2" />
              SEARCH
            </TabsTrigger>
            <TabsTrigger 
              value="upload"
              className="data-[state=active]:bg-swiss-black data-[state=active]:text-swiss-white border-r border-swiss-black"
            >
              <Upload className="w-4 h-4 mr-2" />
              UPLOAD
            </TabsTrigger>
            <TabsTrigger 
              value="index"
              className="data-[state=active]:bg-swiss-black data-[state=active]:text-swiss-white border-r border-swiss-black"
            >
              <Database className="w-4 h-4 mr-2" />
              INDEX
            </TabsTrigger>
            <TabsTrigger 
              value="setup"
              className="data-[state=active]:bg-swiss-black data-[state=active]:text-swiss-white border-r border-swiss-black"
            >
              <Settings className="w-4 h-4 mr-2" />
              SETUP
            </TabsTrigger>
            <TabsTrigger 
              value="dashboard"
              className="data-[state=active]:bg-swiss-black data-[state=active]:text-swiss-white"
            >
              <Eye className="w-4 h-4 mr-2" />
              DASHBOARD
            </TabsTrigger>
          </TabsList>

          {/* Content */}
          <TabsContent value="search" className="space-y-6">
            <Card className="border border-swiss-black bg-swiss-white">
              <CardHeader className="border-b border-swiss-black">
                <CardTitle className="text-swiss-black flex items-center space-x-2 font-mono">
                  <Search className="w-5 h-5" />
                  <span>VISUAL SIMILARITY SEARCH</span>
                </CardTitle>
                <CardDescription className="text-swiss-gray-600 font-mono text-sm">
                  Upload an image or provide a URL to find visually similar images using CLIP embeddings
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <VisualSearch />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <Card className="border border-swiss-black bg-swiss-white">
              <CardHeader className="border-b border-swiss-black">
                <CardTitle className="text-swiss-black flex items-center space-x-2 font-mono">
                  <Upload className="w-5 h-5" />
                  <span>UPLOAD & INDEX IMAGES</span>
                </CardTitle>
                <CardDescription className="text-swiss-gray-600 font-mono text-sm">
                  Upload images to Vercel Blob Storage and automatically index them with CLIP embeddings
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ImageUploader />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="index" className="space-y-6">
            <Card className="border border-swiss-black bg-swiss-white">
              <CardHeader className="border-b border-swiss-black">
                <CardTitle className="text-swiss-black flex items-center space-x-2 font-mono">
                  <Database className="w-5 h-5" />
                  <span>ARE.NA CHANNEL INDEXER</span>
                </CardTitle>
                <CardDescription className="text-swiss-gray-600 font-mono text-sm">
                  Index images from public Are.na channels to build your visual search database
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ArenaIndexer />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="setup" className="space-y-6">
            <Card className="border border-swiss-black bg-swiss-white">
              <CardHeader className="border-b border-swiss-black">
                <CardTitle className="text-swiss-black flex items-center space-x-2 font-mono">
                  <Settings className="w-5 h-5" />
                  <span>DATABASE SETUP</span>
                </CardTitle>
                <CardDescription className="text-swiss-gray-600 font-mono text-sm">
                  Configure Supabase database tables and functions for CLIP vector storage
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <DatabaseSetup />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <Card className="border border-swiss-black bg-swiss-white">
              <CardHeader className="border-b border-swiss-black">
                <CardTitle className="text-swiss-black flex items-center space-x-2 font-mono">
                  <Eye className="w-5 h-5" />
                  <span>DASHBOARD & ANALYTICS</span>
                </CardTitle>
                <CardDescription className="text-swiss-gray-600 font-mono text-sm">
                  View indexed images, manage your database, and explore uploaded content
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Dashboard />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="border-t border-swiss-black bg-swiss-white mt-24">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-swiss-black font-mono font-bold mb-6 uppercase tracking-wide">Features</h3>
              <ul className="space-y-3 text-swiss-gray-600 font-mono text-sm">
                <li>– CLIP-powered visual similarity</li>
                <li>– Are.na channel indexing</li>
                <li>– Vercel Blob storage</li>
                <li>– Supabase vector database</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-swiss-black font-mono font-bold mb-6 uppercase tracking-wide">Technology</h3>
              <ul className="space-y-3 text-swiss-gray-600 font-mono text-sm">
                <li>– Next.js 15</li>
                <li>– Hugging Face CLIP API</li>
                <li>– PostgreSQL with pgvector</li>
                <li>– Tailwind CSS</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-swiss-black font-mono font-bold mb-6 uppercase tracking-wide">Status</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-swiss-black"></div>
                  <span className="text-swiss-gray-600 font-mono text-sm">CLIP API ACTIVE</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-swiss-black"></div>
                  <span className="text-swiss-gray-600 font-mono text-sm">DATABASE CONNECTED</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-swiss-black"></div>
                  <span className="text-swiss-gray-600 font-mono text-sm">BLOB STORAGE READY</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-swiss-black mt-12 pt-8 text-center">
            <p className="text-swiss-gray-600 font-mono text-sm uppercase tracking-wide">
              Built with precision using modern AI technologies
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}