'use client';

import { SystemStatus } from '@/components/SystemStatus';
import { DatabaseSetup } from '@/components/DatabaseSetup';
import { RobustUploadSystem } from '@/components/RobustUploadSystem';
import { AdminDirectUpload } from '@/components/AdminDirectUpload';
import { PendingVectorProcessor } from '@/components/PendingVectorProcessor';
import { ClipIndexer } from '@/components/ClipIndexer';
import { ArenaAuth } from '@/components/ArenaAuth';

interface AdminContentProps {
  onContentAdded: () => void;
}

export default function AdminContent({ onContentAdded }: AdminContentProps) {
  return (
    <div className="min-h-screen bg-swiss-gray-50">
      <div className="container mx-auto p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl swiss-title mb-2">Admin Dashboard</h1>
            <p className="text-swiss-gray-600">System administration and data management</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => window.location.href = '/admin/uploads'}
              className="px-4 py-2 border border-swiss-black bg-swiss-white hover:bg-swiss-black hover:text-swiss-white transition-colors swiss-mono text-sm"
            >
              UPLOAD CONTROL
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 border border-swiss-black bg-swiss-white hover:bg-swiss-black hover:text-swiss-white transition-colors swiss-mono text-sm flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
              VIEW SITE
            </button>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="px-4 py-2 border border-swiss-black bg-swiss-black text-swiss-white hover:bg-swiss-gray-800 transition-colors swiss-mono text-sm"
            >
              DASHBOARD
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Arena Content Import - MOVED TO TOP */}
          <div className="bg-white border border-swiss-black">
            <div className="p-6 border-b border-swiss-black">
              <h2 className="text-lg swiss-title">Arena Content Import</h2>
              <p className="text-sm text-swiss-gray-600 mt-1">Primary content import from Are.na platform</p>
            </div>
            <div className="p-6">
              <RobustUploadSystem />
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white border border-swiss-black">
            <div className="p-6 border-b border-swiss-black">
              <h2 className="text-lg swiss-title">System Status</h2>
            </div>
            <div className="p-6">
              <SystemStatus />
            </div>
          </div>

          {/* Database Setup */}
          <div className="bg-white border border-swiss-black">
            <div className="p-6 border-b border-swiss-black">
              <h2 className="text-lg swiss-title">Database Setup</h2>
            </div>
            <div className="p-6">
              <DatabaseSetup />
            </div>
          </div>

          {/* CLIP Indexing Section */}
          <div className="bg-white border border-swiss-black">
            <div className="p-6 border-b border-swiss-black">
              <h2 className="text-lg swiss-title">CLIP Similarity Engine</h2>
              <p className="text-sm text-swiss-gray-600 mt-1">Index images and search using CLIP embeddings</p>
            </div>
            <div className="p-6">
              <ClipIndexer />
            </div>
          </div>

          {/* Arena OAuth Setup */}
          <div className="bg-white border border-swiss-black">
            <div className="p-6 border-b border-swiss-black">
              <h2 className="text-lg swiss-title">Arena OAuth Setup</h2>
              <p className="text-sm text-swiss-gray-600 mt-1">Connect to Are.na for content import</p>
            </div>
            <div className="p-6">
              <ArenaAuth />
            </div>
          </div>

          {/* Direct Upload */}
          <div className="bg-white border border-swiss-black">
            <div className="p-6 border-b border-swiss-black">
              <h2 className="text-lg swiss-title">Direct Upload</h2>
            </div>
            <div className="p-6">
              <AdminDirectUpload onContentAdded={onContentAdded} />
            </div>
          </div>

          {/* Vector Processing Section */}
          <div className="bg-white border border-swiss-black">
            <div className="p-6 border-b border-swiss-black">
              <h2 className="text-lg swiss-title">Vector Processing</h2>
              <p className="text-sm text-swiss-gray-600 mt-1">Process pending CLIP embeddings</p>
            </div>
            <div className="p-6">
              <PendingVectorProcessor />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}