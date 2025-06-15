"use client";

import { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface ProcessResult {
  message: string;
  processed: {
    success: number;
    errors: number;
  };
  total_pending: number;
  remaining_pending: boolean;
}

export function PendingVectorProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleProcess = async () => {
    setIsProcessing(true);
    setResult(null);
    setError(null);

    try {
      console.log('🔄 Starting pending vector processing');

      const response = await fetch('/api/process-pending-vectors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          limit: 100 // Process up to 100 vectors at once
        }),
      });

      if (!response.ok) {
        throw new Error(`Processing failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
      
      toast({
        title: "Processing Complete",
        description: `Successfully processed ${data.processed.success} pending vectors`,
      });

      console.log('✅ Processing completed:', data);

    } catch (error) {
      console.error('❌ Processing error:', error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);
      
      toast({
        title: "Processing Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Process Button */}
      <div className="space-y-4">
        <div className="space-y-3">
          <h3 className="text-swiss-black font-mono text-sm uppercase tracking-wide">
            Process Pending Vectors
          </h3>
          <p className="text-swiss-gray-600 text-sm font-mono">
            Process indexed images that are missing CLIP embeddings due to service unavailability
          </p>
        </div>

        <Button 
          onClick={handleProcess}
          disabled={isProcessing}
          className="bg-swiss-black hover:bg-swiss-gray-800 text-swiss-white w-full font-mono uppercase tracking-wide"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              PROCESSING VECTORS...
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              PROCESS PENDING VECTORS
            </>
          )}
        </Button>
      </div>

      {/* Results */}
      {result && (
        <Card className="border border-swiss-black bg-swiss-white">
          <CardHeader className="border-b border-swiss-black">
            <CardTitle className="text-swiss-black flex items-center space-x-2 font-mono">
              <CheckCircle className="w-5 h-5" />
              <span>PROCESSING RESULTS</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* Processing Stats */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center border border-swiss-black p-3">
                <div className="text-swiss-black font-mono font-bold text-lg">{result.total_pending}</div>
                <div className="text-swiss-gray-600 font-mono text-xs uppercase">Total Found</div>
              </div>
              <div className="text-center border border-swiss-black p-3">
                <div className="text-swiss-black font-mono font-bold text-lg">{result.processed.success}</div>
                <div className="text-swiss-gray-600 font-mono text-xs uppercase">Processed</div>
              </div>
              <div className="text-center border border-swiss-black p-3">
                <div className="text-swiss-black font-mono font-bold text-lg">{result.processed.errors}</div>
                <div className="text-swiss-gray-600 font-mono text-xs uppercase">Errors</div>
              </div>
            </div>

            <div className="border border-swiss-black p-4 bg-swiss-gray-50">
              <p className="text-swiss-black text-sm font-mono">
                {result.message}
              </p>
              
              {result.remaining_pending && (
                <p className="text-swiss-gray-600 text-xs font-mono mt-2">
                  More vectors remain pending. Run again to continue processing.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border border-swiss-black bg-swiss-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-swiss-black mb-4">
              <AlertCircle className="w-5 h-5" />
              <span className="font-mono font-bold uppercase tracking-wide">Processing Failed</span>
            </div>
            <div className="border border-swiss-black p-4 bg-swiss-gray-50">
              <p className="text-swiss-black text-sm font-mono">{error}</p>
              
              <div className="mt-4 pt-4 border-t border-swiss-black">
                <p className="text-swiss-gray-600 text-xs font-mono uppercase tracking-wide mb-2">Possible Solutions:</p>
                <ul className="space-y-1 text-xs font-mono text-swiss-gray-600">
                  <li>• Check if CLIP service is available</li>
                  <li>• Verify network connectivity</li>
                  <li>• Try again in a few minutes</li>
                  <li>• Check if vectors are actually pending</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}