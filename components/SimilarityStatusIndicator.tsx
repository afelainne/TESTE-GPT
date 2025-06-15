"use client";

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface SimilarityStatus {
  overall_status: 'operational' | 'degraded' | 'error';
  primary_method: 'supabase_database' | 'external_clip_api' | 'none';
  methods: {
    supabase_database: {
      available: boolean;
      status: string;
      message: string;
    };
    external_clip_api: {
      available: boolean;
      status: string;
      message: string;
    };
  };
  timestamp: string;
}

interface SimilarityStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export function SimilarityStatusIndicator({ 
  className = "", 
  showDetails = false 
}: SimilarityStatusIndicatorProps) {
  const [status, setStatus] = useState<SimilarityStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showExpanded, setShowExpanded] = useState(false);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/similarity-status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch similarity status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (!status && !isLoading) return null;

  const getStatusIcon = (available: boolean, statusType: string) => {
    if (available && statusType === 'healthy') {
      return <CheckCircle className="w-3 h-3 text-green-600" />;
    } else if (statusType === 'error') {
      return <XCircle className="w-3 h-3 text-red-500" />;
    } else {
      return <AlertCircle className="w-3 h-3 text-yellow-500" />;
    }
  };

  const getOverallStatusColor = (overallStatus: string) => {
    switch (overallStatus) {
      case 'operational': return 'text-green-600 border-green-200';
      case 'degraded': return 'text-yellow-600 border-yellow-200';
      case 'error': return 'text-red-600 border-red-200';
      default: return 'text-gray-600 border-gray-200';
    }
  };

  return (
    <div className={`${className}`}>
      <div 
        className={`inline-flex items-center gap-2 px-3 py-1 border text-xs swiss-mono cursor-pointer transition-all ${getOverallStatusColor(status?.overall_status || 'error')}`}
        onClick={() => setShowExpanded(!showExpanded)}
        title="Click to view similarity system status"
      >
        {isLoading ? (
          <RefreshCw className="w-3 h-3 animate-spin" />
        ) : (
          getStatusIcon(
            status?.methods.supabase_database.available || false, 
            status?.methods.supabase_database.status || 'error'
          )
        )}
        <span>
          {status?.overall_status === 'operational' ? 'SIMILARITY OK' : 
           status?.overall_status === 'degraded' ? 'SIMILARITY DEGRADED' : 
           'SIMILARITY ERROR'}
        </span>
        <span className="text-gray-400">
          ({status?.primary_method?.replace('_', ' ').toUpperCase() || 'NONE'})
        </span>
      </div>

      {showExpanded && status && (showDetails || true) && (
        <div className="absolute top-full left-0 mt-1 bg-swiss-white border border-swiss-black shadow-lg z-50 p-3 min-w-80 text-xs swiss-mono">
          <div className="mb-3">
            <div className="font-medium text-swiss-black mb-1">Similarity System Status</div>
            <div className="text-swiss-gray-500">Updated: {new Date(status.timestamp).toLocaleTimeString()}</div>
          </div>
          
          <div className="space-y-2">
            {/* Supabase Database */}
            <div className="flex items-start gap-2">
              {getStatusIcon(status.methods.supabase_database.available, status.methods.supabase_database.status)}
              <div>
                <div className="font-medium">Supabase Database</div>
                <div className="text-swiss-gray-600">{status.methods.supabase_database.message}</div>
              </div>
            </div>
            
            {/* External CLIP API */}
            <div className="flex items-start gap-2">
              {getStatusIcon(status.methods.external_clip_api.available, status.methods.external_clip_api.status)}
              <div>
                <div className="font-medium">External CLIP API</div>
                <div className="text-swiss-gray-600">{status.methods.external_clip_api.message}</div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-swiss-gray-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                fetchStatus();
              }}
              className="text-swiss-black hover:underline"
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh Status'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}