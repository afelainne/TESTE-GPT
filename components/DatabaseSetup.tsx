"use client";

import { useState } from 'react';
import { Database, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface SetupResult {
  success: boolean;
  message: string;
  steps_completed?: string[];
  next_steps?: string[];
  sql_commands?: {
    extension: string;
    table: string;
    rls: string;
  };
  manual_setup_required?: boolean;
}

export function DatabaseSetup() {
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [result, setResult] = useState<SetupResult | null>(null);
  const { toast } = useToast();

  const handleSetup = async () => {
    setIsSettingUp(true);
    setResult(null);

    try {
      console.log('🔧 Starting database setup');

      const response = await fetch('/api/setup-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        toast({
          title: "Database Setup Complete",
          description: "All tables and functions have been created successfully",
        });
      } else {
        toast({
          title: "Setup Failed",
          description: data.message || "Manual setup may be required",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('❌ Setup error:', error);
      const errorMessage = error instanceof Error ? error.message : "Setup failed";
      
      setResult({
        success: false,
        message: errorMessage,
        manual_setup_required: true
      });
      
      toast({
        title: "Setup Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSettingUp(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Setup Button */}
      <div className="space-y-4">
        <div className="space-y-3">
          <h3 className="text-swiss-black font-mono text-sm uppercase tracking-wide">
            Database Setup
          </h3>
          <p className="text-swiss-gray-600 text-sm font-mono">
            Automatically create the required database tables and functions for CLIP vector storage
          </p>
        </div>

        <Button 
          onClick={handleSetup}
          disabled={isSettingUp}
          className="bg-swiss-black hover:bg-swiss-gray-800 text-swiss-white w-full font-mono uppercase tracking-wide"
        >
          {isSettingUp ? (
            <>
              <Database className="w-4 h-4 mr-2 animate-pulse" />
              SETTING UP DATABASE...
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              SETUP DATABASE
            </>
          )}
        </Button>
      </div>

      {/* Results */}
      {result && (
        <Card className="border border-swiss-black bg-swiss-white">
          <CardHeader className="border-b border-swiss-black">
            <CardTitle className="text-swiss-black flex items-center space-x-2 font-mono">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
              <span>{result.success ? 'SETUP COMPLETED' : 'SETUP FAILED'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            
            {/* Main Message */}
            <div className="border border-swiss-black p-4 bg-swiss-gray-50">
              <p className="text-swiss-black text-sm font-mono">
                {result.message}
              </p>
            </div>

            {/* Success: Steps Completed */}
            {result.success && result.steps_completed && (
              <div>
                <h4 className="text-swiss-black font-mono font-bold text-sm mb-3 uppercase">
                  Steps Completed:
                </h4>
                <ul className="space-y-2">
                  {result.steps_completed.map((step, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm font-mono">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-swiss-gray-700">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Success: Next Steps */}
            {result.success && result.next_steps && (
              <div>
                <h4 className="text-swiss-black font-mono font-bold text-sm mb-3 uppercase">
                  Next Steps:
                </h4>
                <ul className="space-y-2">
                  {result.next_steps.map((step, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm font-mono">
                      <div className="w-4 h-4 border border-swiss-black flex items-center justify-center">
                        <div className="w-2 h-2 bg-swiss-black"></div>
                      </div>
                      <span className="text-swiss-gray-700">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Failure: Manual Setup Required */}
            {!result.success && result.manual_setup_required && (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 p-4 rounded">
                  <h4 className="text-red-800 font-mono font-bold text-sm mb-2 uppercase">
                    Manual Setup Required
                  </h4>
                  <p className="text-red-700 text-sm font-mono mb-3">
                    Automatic setup failed. Please run the SQL commands manually in your Supabase dashboard.
                  </p>
                  
                  <Button
                    onClick={() => window.open('https://supabase.com/dashboard/project/zvchgnlwhuiobxptmdcu/sql/new', '_blank')}
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Supabase SQL Editor
                  </Button>
                </div>

                {/* SQL Commands */}
                {result.sql_commands && (
                  <div className="space-y-3">
                    <h5 className="text-swiss-black font-mono font-bold text-xs uppercase">
                      SQL Commands to Run:
                    </h5>
                    
                    <div className="space-y-2">
                      <div className="bg-swiss-gray-100 p-3 border border-swiss-black">
                        <h6 className="text-xs font-mono font-bold mb-1 uppercase">1. Enable Extension:</h6>
                        <code className="text-xs font-mono text-swiss-gray-800">
                          {result.sql_commands.extension}
                        </code>
                      </div>
                      
                      <div className="bg-swiss-gray-100 p-3 border border-swiss-black">
                        <h6 className="text-xs font-mono font-bold mb-1 uppercase">2. Create Table:</h6>
                        <code className="text-xs font-mono text-swiss-gray-800 whitespace-pre-wrap">
                          {result.sql_commands.table}
                        </code>
                      </div>
                      
                      <div className="bg-swiss-gray-100 p-3 border border-swiss-black">
                        <h6 className="text-xs font-mono font-bold mb-1 uppercase">3. Disable RLS:</h6>
                        <code className="text-xs font-mono text-swiss-gray-800">
                          {result.sql_commands.rls}
                        </code>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Documentation Link */}
      <div className="text-center">
        <Button
          onClick={() => window.open('/SUPABASE_SETUP.md', '_blank')}
          variant="outline"
          size="sm"
          className="border-swiss-black text-swiss-black hover:bg-swiss-gray-50 font-mono"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          VIEW SETUP DOCUMENTATION
        </Button>
      </div>
    </div>
  );
}