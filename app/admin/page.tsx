'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authManager } from '@/lib/auth';
import AdminContent from './AdminContent';

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Load auth state from storage
    authManager.loadFromStorage();
    
    // Check if user is authenticated
    if (!authManager.isAuthenticated()) {
      console.log('User not authenticated, redirecting to login');
      router.push('/auth/login');
      return;
    }
    
    // Check if user is admin
    if (!authManager.isAdmin()) {
      console.log('User is not admin, redirecting to dashboard');
      router.push('/dashboard');
      return;
    }
    
    console.log('Admin access granted');
    setIsAuthorized(true);
    setIsLoading(false);
  }, [router]);

  const handleContentAdded = () => {
    console.log('Content added successfully');
    // Trigger any necessary revalidation or cache clearing
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-swiss-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border border-swiss-black border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-swiss-gray-600 font-mono text-sm">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect
  }

  return <AdminContent onContentAdded={handleContentAdded} />;
}