'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserDashboard } from '@/components/UserDashboard';
import { authManager } from '@/lib/auth';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load auth state from storage
    authManager.loadFromStorage();
    
    // Check if user is authenticated
    if (!authManager.isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    
    // If admin, redirect to admin panel
    if (authManager.isAdmin()) {
      router.push('/admin');
      return;
    }
    
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-swiss-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border border-swiss-black border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-swiss-gray-600 font-mono text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return <UserDashboard />;
}