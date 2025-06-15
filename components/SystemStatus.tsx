"use client";

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Database, Zap, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface SystemStatus {
  supabase_connected: boolean;
  table_exists: boolean;
  vector_extension_enabled: boolean;
  table_structure?: any;
  environment: {
    supabase_url: string;
    supabase_key: string;
    clip_api_url: string;
    blob_token: string;
  };
}

export function SystemStatus() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [setupInstructions, setSetupInstructions] = useState<any>(null);
  const { toast } = useToast();

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      
      // Check multiple status endpoints
      const [statusResponse, dbResponse, clipResponse] = await Promise.allSettled([
        fetch('/api/status'),
        fetch('/api/test-supabase'),
        fetch('/api/clip-vectors')
      ]);
      
      let systemStatus = {
        supabase_connected: false,
        table_exists: false,
        vector_extension_enabled: false,
        environment: {
          supabase_url: 'Not Set',
          supabase_key: 'Not Set', 
          clip_api_url: 'Not Set',
          blob_token: 'Not Set'
        }
      };
      
      // Process status response
      if (statusResponse.status === 'fulfilled' && statusResponse.value.ok) {
        const statusData = await statusResponse.value.json();
        if (statusData.status === 'success') {
          systemStatus = { ...systemStatus, ...statusData.data };
        }
      }
      
      // Process Supabase test response
      if (dbResponse.status === 'fulfilled' && dbResponse.value.ok) {
        const dbData = await dbResponse.value.json();
        if (dbData.success) {
          systemStatus.supabase_connected = true;
        }
      }
      
      // Process CLIP vectors response
      if (clipResponse.status === 'fulfilled' && clipResponse.value.ok) {
        const clipData = await clipResponse.value.json();
        if (clipData.success) {
          systemStatus.table_exists = true;
          systemStatus.vector_extension_enabled = true;
        }
      }
      
      setStatus(systemStatus);
      
    } catch (error) {
      console.error('Error fetching status:', error);
      toast({
        title: "Error",
        description: "Failed to fetch system status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSetupInstructions = async () => {
    try {
      const response = await fetch('/api/status', { method: 'POST' });
      const data = await response.json();
      setSetupInstructions(data);
    } catch (error) {
      console.error('Error fetching setup instructions:', error);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchSetupInstructions();
  }, []);

  const getStatusBadge = (condition: boolean, trueText: string, falseText: string) => {
    return (
      <Badge 
        variant={condition ? "default" : "destructive"}
        className={condition ? "bg-green-600" : "bg-red-600"}
      >
        {condition ? (
          <>
            <CheckCircle className="w-3 h-3 mr-1" />
            {trueText}
          </>
        ) : (
          <>
            <AlertCircle className="w-3 h-3 mr-1" />
            {falseText}
          </>
        )}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className="border border-swiss-black bg-swiss-white">
        <CardContent className="p-6 text-center">
          <RefreshCw className="w-8 h-8 text-swiss-black animate-spin mx-auto mb-4" />
          <p className="text-swiss-gray-700 font-mono">CHECKING SYSTEM STATUS...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Status Overview */}
      <Card className="border border-swiss-black bg-swiss-white">
        <CardHeader className="border-b border-swiss-black">
          <CardTitle className="text-swiss-black flex items-center space-x-2 font-mono">
            <Database className="w-5 h-5" />
            <span>SYSTEM STATUS</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={fetchStatus}
              className="ml-auto text-swiss-black hover:bg-swiss-gray-100 border border-swiss-black"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-swiss-gray-700 font-mono text-sm">Supabase Connection:</span>
                  {getStatusBadge(status.supabase_connected, "Connected", "Disconnected")}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-swiss-gray-700 font-mono text-sm">Database Table:</span>
                  {getStatusBadge(status.table_exists, "Ready", "Missing")}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-swiss-gray-700 font-mono text-sm">Vector Extension:</span>
                  {getStatusBadge(status.table_exists, "Enabled", "Disabled")}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-swiss-black font-mono font-bold text-sm uppercase">Environment Variables</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-swiss-gray-700 font-mono">Supabase URL:</span>
                    <Badge variant={status.environment.supabase_url === 'Set' ? "default" : "destructive"} 
                           className={status.environment.supabase_url === 'Set' ? "bg-green-600" : "bg-red-600"}>
                      {status.environment.supabase_url}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-swiss-gray-700 font-mono">Supabase Key:</span>
                    <Badge variant={status.environment.supabase_key === 'Set' ? "default" : "destructive"}
                           className={status.environment.supabase_key === 'Set' ? "bg-green-600" : "bg-red-600"}>
                      {status.environment.supabase_key}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-swiss-gray-700 font-mono">CLIP API:</span>
                    <Badge variant={status.environment.clip_api_url === 'Set' ? "default" : "destructive"}
                           className={status.environment.clip_api_url === 'Set' ? "bg-green-600" : "bg-red-600"}>
                      {status.environment.clip_api_url}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-swiss-gray-700 font-mono">Blob Token:</span>
                    <Badge variant={status.environment.blob_token === 'Set' ? "default" : "destructive"}
                           className={status.environment.blob_token === 'Set' ? "bg-green-600" : "bg-red-600"}>
                      {status.environment.blob_token}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      {setupInstructions && !status?.table_exists && (
        <Card className="border border-swiss-black bg-swiss-white">
          <CardHeader className="border-b border-swiss-black">
            <CardTitle className="text-swiss-black flex items-center space-x-2 font-mono">
              <AlertCircle className="w-5 h-5" />
              <span>SETUP REQUIRED</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <p className="text-swiss-gray-700 text-sm font-mono">
              Database table does not exist. Please run the SQL commands in the SETUP tab.
            </p>
            
            <div className="bg-swiss-gray-100 p-4 border border-swiss-black">
              <pre className="text-swiss-black text-xs overflow-x-auto whitespace-pre-wrap font-mono">
{setupInstructions.required_sql}
              </pre>
            </div>

            <div className="space-y-2">
              <h4 className="text-swiss-black font-mono font-bold text-sm uppercase">Setup Steps:</h4>
              <ol className="text-swiss-gray-700 text-sm space-y-1 list-decimal list-inside font-mono">
                <li>Go to SETUP tab above</li>
                <li>Click "SETUP DATABASE"</li>
                <li>Or manually run SQL in Supabase dashboard</li>
                <li>Refresh this page to verify setup</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {status?.supabase_connected && status?.table_exists && (
        <Card className="border border-swiss-black bg-swiss-white">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-4" />
            <h3 className="text-swiss-black font-mono font-bold text-lg uppercase mb-2">SYSTEM READY!</h3>
            <p className="text-swiss-gray-700 text-sm font-mono">
              All components are properly configured. You can now use all features.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}