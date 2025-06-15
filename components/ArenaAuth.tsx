"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, LogIn } from 'lucide-react';

export function ArenaAuth() {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleArenaConnect = async () => {
    setIsConnecting(true);
    console.log('🔗 Connecting to Are.na OAuth...');
    
    try {
      // Get OAuth URL from server-side API to avoid exposing credentials
      const response = await fetch('/api/arena-auth-url');
      const data = await response.json();
      
      if (data.authUrl) {
        console.log('🚀 Redirecting to Are.na OAuth...');
        window.location.href = data.authUrl;
      } else {
        console.error('❌ Failed to get Arena auth URL');
        setIsConnecting(false);
      }
    } catch (error) {
      console.error('❌ Error connecting to Arena:', error);
      setIsConnecting(false);
    }
  };

  return (
    <div className="bg-white border border-swiss-black p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm swiss-mono text-swiss-gray-600 tracking-wider">
          ARENA INTEGRATION
        </h3>
        <ExternalLink className="w-4 h-4 text-swiss-gray-400" />
      </div>
      
      <div className="space-y-4">
        <p className="text-sm swiss-body text-swiss-gray-700 leading-relaxed">
          Connect your Are.na account to import and sync your channels directly into the inspiration feed.
        </p>
        
        <Button
          onClick={handleArenaConnect}
          disabled={isConnecting}
          className={`
            w-full h-10 border border-swiss-black text-sm swiss-mono
            ${isConnecting ? 
              'bg-swiss-gray-100 text-swiss-gray-500 cursor-not-allowed' : 
              'bg-swiss-black text-swiss-white hover:bg-swiss-white hover:text-swiss-black'
            }
            transition-colors duration-200
          `}
        >
          <LogIn className="w-4 h-4 mr-2" />
          {isConnecting ? 'CONNECTING...' : 'CONNECT ARE.NA'}
        </Button>
        
        <div className="text-xs swiss-mono text-swiss-gray-400 text-center">
          Redirects to Are.na for secure authorization
        </div>
      </div>
    </div>
  );
}