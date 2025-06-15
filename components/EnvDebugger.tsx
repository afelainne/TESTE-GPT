'use client';

import { useEffect, useState } from 'react';

export function EnvDebugger() {
  const [envData, setEnvData] = useState<any>(null);
  const [clientEnvs, setClientEnvs] = useState<any>(null);

  useEffect(() => {
    // Client-side environment check
    const clientSideEnvs = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
      NEXT_PUBLIC_OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY ? 'Set' : 'Missing'
    };
    
    setClientEnvs(clientSideEnvs);
    console.log('🔍 Client Environment Variables:', clientSideEnvs);

    // Fetch server-side environment check
    fetch('/api/debug-env')
      .then(res => res.json())
      .then(data => {
        setEnvData(data);
        console.log('🔍 Server Environment Response:', data);
      })
      .catch(error => {
        console.error('❌ Failed to fetch server environment:', error);
      });
  }, []);

  if (!envData || !clientEnvs) {
    return (
      <div className="fixed bottom-4 right-4 bg-black text-white p-3 rounded text-xs max-w-sm">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-yellow-400 animate-pulse"></div>
          <span>Checking environment...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-3 rounded text-xs max-w-sm">
      <div className="mb-2 font-bold">Environment Status:</div>
      
      <div className="mb-2">
        <div className="text-gray-300">Client-side:</div>
        <div className="text-xs space-y-1">
          <div>Supabase URL: {clientEnvs.NEXT_PUBLIC_SUPABASE_URL}</div>
          <div>Supabase Anon: {clientEnvs.NEXT_PUBLIC_SUPABASE_ANON_KEY}</div>
          <div>OpenAI Key: {clientEnvs.NEXT_PUBLIC_OPENAI_API_KEY}</div>
        </div>
      </div>

      <div>
        <div className="text-gray-300">Server-side:</div>
        <div className="text-xs space-y-1">
          <div>Service Key: {envData.server_environment?.supabase_service_key_set ? 'Set' : 'Missing'}</div>
          <div>HuggingFace: {envData.server_environment?.huggingface_key_set ? 'Set' : 'Missing'}</div>
          <div>OpenAI: {envData.server_environment?.openai_key_set ? 'Set' : 'Missing'}</div>
        </div>
      </div>
      
      <div className="mt-2 pt-2 border-t border-gray-600">
        <div className={`flex items-center space-x-1 ${envData.success ? 'text-green-400' : 'text-red-400'}`}>
          <div className={`w-2 h-2 rounded-full ${envData.success ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span>{envData.success ? 'Connected' : 'Error'}</span>
        </div>
      </div>
    </div>
  );
}