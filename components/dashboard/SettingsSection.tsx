'use client';

import { useState } from 'react';
import { Shield, Bell, Eye, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { User } from '@/types/user';

interface SettingsSectionProps {
  user: User;
}

export function SettingsSection({ user }: SettingsSectionProps) {
  const [settings, setSettings] = useState({
    isPrivate: user.isPrivate,
    allowComments: user.allowComments,
    showEmail: user.showEmail,
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: false,
    allowDownloads: true
  });

  console.log('SettingsSection rendered for user:', user.username);

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    console.log(`Setting ${key} changed to:`, value);
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log('Account deletion confirmed');
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl swiss-title font-light mb-2">Settings</h1>
        <p className="swiss-body text-swiss-gray-600">
          Manage your account preferences and privacy settings
        </p>
      </div>

      <div className="space-y-8 max-w-2xl">
        {/* Privacy Settings */}
        <Card className="border-swiss-black">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="swiss-body font-medium">Private Account</h4>
                <p className="text-sm swiss-body text-swiss-gray-600">
                  Only followers can see your uploads
                </p>
              </div>
              <Switch
                checked={settings.isPrivate}
                onCheckedChange={(checked) => handleSettingChange('isPrivate', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="swiss-body font-medium">Allow Comments</h4>
                <p className="text-sm swiss-body text-swiss-gray-600">
                  Let others comment on your uploads
                </p>
              </div>
              <Switch
                checked={settings.allowComments}
                onCheckedChange={(checked) => handleSettingChange('allowComments', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="swiss-body font-medium">Show Email</h4>
                <p className="text-sm swiss-body text-swiss-gray-600">
                  Display email address on your profile
                </p>
              </div>
              <Switch
                checked={settings.showEmail}
                onCheckedChange={(checked) => handleSettingChange('showEmail', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="swiss-body font-medium">Allow Downloads</h4>
                <p className="text-sm swiss-body text-swiss-gray-600">
                  Let others download your uploads
                </p>
              </div>
              <Switch
                checked={settings.allowDownloads}
                onCheckedChange={(checked) => handleSettingChange('allowDownloads', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="border-swiss-black">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="swiss-body font-medium">Email Notifications</h4>
                <p className="text-sm swiss-body text-swiss-gray-600">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="swiss-body font-medium">Push Notifications</h4>
                <p className="text-sm swiss-body text-swiss-gray-600">
                  Receive push notifications in browser
                </p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="swiss-body font-medium">Weekly Digest</h4>
                <p className="text-sm swiss-body text-swiss-gray-600">
                  Get weekly summary of activity
                </p>
              </div>
              <Switch
                checked={settings.weeklyDigest}
                onCheckedChange={(checked) => handleSettingChange('weeklyDigest', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data & Account */}
        <Card className="border-swiss-black">
          <CardHeader>
            <CardTitle>Data & Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="swiss-body font-medium mb-2">Export Data</h4>
              <p className="text-sm swiss-body text-swiss-gray-600 mb-4">
                Download a copy of all your data including uploads, saves, and profile information
              </p>
              <Button variant="outline" className="border-swiss-black">
                <Download className="w-4 h-4 mr-2" />
                Export My Data
              </Button>
            </div>

            <div className="pt-6 border-t border-swiss-gray-200">
              <h4 className="swiss-body font-medium mb-2 text-red-600">Danger Zone</h4>
              <p className="text-sm swiss-body text-swiss-gray-600 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button 
                variant="outline" 
                onClick={handleDeleteAccount}
                className="border-red-500 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}