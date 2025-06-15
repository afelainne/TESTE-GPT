'use client';

import { useState } from 'react';
import { UploadModal } from './UploadModal';
import { OverviewSection } from './dashboard/OverviewSection';
import { UploadsSection } from './dashboard/UploadsSection';
import { SavedSection } from './dashboard/SavedSection';
import { LikesSection } from './dashboard/LikesSection';
import { FollowingSection } from './dashboard/FollowingSection';
import { AnalyticsSection } from './dashboard/AnalyticsSection';
import { ProfileSection } from './dashboard/ProfileSection';
import { SettingsSection } from './dashboard/SettingsSection';
import { User } from '@/lib/auth';

interface DashboardContentProps {
  activeSection: string;
  searchQuery: string;
  user: User;
}

export function DashboardContent({ activeSection, searchQuery, user }: DashboardContentProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  console.log('DashboardContent rendered with section:', activeSection);

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection user={user} onUploadClick={() => setIsUploadModalOpen(true)} />;
      case 'uploads':
        return <UploadsSection user={user} searchQuery={searchQuery} />;
      case 'saved':
        return <SavedSection user={user} searchQuery={searchQuery} />;
      case 'likes':
        return <LikesSection user={user} searchQuery={searchQuery} />;
      case 'following':
        return <FollowingSection user={user} searchQuery={searchQuery} />;
      case 'analytics':
        return <AnalyticsSection user={user} />;
      case 'profile':
        return <ProfileSection user={user} />;
      case 'settings':
        return <SettingsSection user={user} />;
      default:
        return <OverviewSection user={user} onUploadClick={() => setIsUploadModalOpen(true)} />;
    }
  };

  return (
    <main className="flex-1 bg-swiss-white min-h-screen">
      {renderSection()}
      
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        user={user}
      />
    </main>
  );
}