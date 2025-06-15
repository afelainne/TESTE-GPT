'use client';

import { useState } from 'react';
import { Camera, MapPin, Globe, Mail, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@/types/user';

interface ProfileSectionProps {
  user: User;
}

export function ProfileSection({ user }: ProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user.fullName,
    username: user.username,
    bio: user.bio || '',
    website: user.website || '',
    location: user.location || '',
    email: user.email
  });

  console.log('ProfileSection rendered for user:', user.username);

  const handleSave = () => {
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl swiss-title font-light mb-2">Profile</h1>
          <p className="swiss-body text-swiss-gray-600">
            Manage your public profile information
          </p>
        </div>
        
        <Button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="bg-swiss-black text-swiss-white hover:bg-swiss-gray-800"
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Picture & Basic Info */}
        <Card className="border-swiss-black">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="relative mb-6">
              <Avatar className="w-32 h-32 mx-auto">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-4xl">
                  {user.fullName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/2 border-swiss-black"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg swiss-title font-light">{user.fullName}</h3>
              <p className="text-sm swiss-mono text-swiss-gray-600">@{user.username}</p>
              {user.isVerified && (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 bg-swiss-black rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-xs swiss-mono">VERIFIED</span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-swiss-gray-200">
              <div className="text-center">
                <div className="text-xl swiss-title font-light">
                  {user.followersCount.toLocaleString()}
                </div>
                <div className="text-xs swiss-mono text-swiss-gray-600">
                  FOLLOWERS
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl swiss-title font-light">
                  {user.uploadsCount}
                </div>
                <div className="text-xs swiss-mono text-swiss-gray-600">
                  UPLOADS
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <Card className="border-swiss-black">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName" className="swiss-body font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    disabled={!isEditing}
                    className="mt-1 border-swiss-black focus:border-swiss-black"
                  />
                </div>

                <div>
                  <Label htmlFor="username" className="swiss-body font-medium">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    disabled={!isEditing}
                    className="mt-1 border-swiss-black focus:border-swiss-black"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio" className="swiss-body font-medium">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself and your work..."
                  className="mt-1 border-swiss-black focus:border-swiss-black"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website" className="swiss-body font-medium flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    disabled={!isEditing}
                    placeholder="https://yourwebsite.com"
                    className="mt-1 border-swiss-black focus:border-swiss-black"
                  />
                </div>

                <div>
                  <Label htmlFor="location" className="swiss-body font-medium flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    disabled={!isEditing}
                    placeholder="City, Country"
                    className="mt-1 border-swiss-black focus:border-swiss-black"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="swiss-body font-medium flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                  className="mt-1 border-swiss-black focus:border-swiss-black"
                />
              </div>

              <div className="pt-4 border-t border-swiss-gray-200">
                <div className="flex items-center space-x-2 text-xs swiss-mono text-swiss-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Member since {new Date(user.joinedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}