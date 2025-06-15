'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Grid2X2, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    acceptTerms: false
  });

  console.log('Register page rendered');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log('Registration attempt:', formData);
    
    // Simulate registration
    setTimeout(() => {
      setIsLoading(false);
      console.log('Registration successful - redirecting to dashboard');
      window.location.href = '/dashboard';
    }, 2000);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-swiss-white flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-swiss-black text-swiss-white flex-col justify-between p-12">
        <div>
          <div className="flex items-center space-x-3 mb-12">
            <div className="w-8 h-8 border border-swiss-white flex items-center justify-center">
              <Grid2X2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl swiss-title font-light tracking-wider">
                UNBSERVED
              </h1>
              <p className="text-xs swiss-mono text-gray-400 mt-1">
                DESIGN PLATFORM
              </p>
            </div>
          </div>
          
          <div className="max-w-md">
            <h2 className="text-3xl swiss-title font-light mb-6 leading-tight">
              Start your creative journey
            </h2>
            <p className="swiss-body text-gray-300 leading-relaxed mb-8">
              Join thousands of designers sharing their work and discovering 
              inspiration from around the world.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 border border-swiss-white flex items-center justify-center mt-1">
                  <Check className="w-3 h-3" />
                </div>
                <div>
                  <h4 className="swiss-body font-medium mb-1">Upload & Share</h4>
                  <p className="text-sm text-gray-400">Share your designs with unlimited uploads</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 border border-swiss-white flex items-center justify-center mt-1">
                  <Check className="w-3 h-3" />
                </div>
                <div>
                  <h4 className="swiss-body font-medium mb-1">Discover & Save</h4>
                  <p className="text-sm text-gray-400">Build collections from millions of designs</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 border border-swiss-white flex items-center justify-center mt-1">
                  <Check className="w-3 h-3" />
                </div>
                <div>
                  <h4 className="swiss-body font-medium mb-1">Connect & Follow</h4>
                  <p className="text-sm text-gray-400">Follow designers and get inspired daily</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-xs swiss-mono text-gray-500">
          © 2024 UNBSERVED Platform
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 lg:max-w-md xl:max-w-lg flex flex-col justify-center px-8 sm:px-12">
        <div className="w-full max-w-sm mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-12">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border border-swiss-black flex items-center justify-center">
                <Grid2X2 className="w-4 h-4" />
              </div>
              <span className="text-lg swiss-title font-light tracking-wider">
                UNBSERVED
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl swiss-title font-light mb-2">
              Create your account
            </h1>
            <p className="text-sm swiss-body text-swiss-gray-600">
              Join the creative community today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="text-sm swiss-body font-medium">
                  Full name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Your full name"
                  className="mt-1 h-12 border-swiss-black focus:border-swiss-black focus:ring-1 focus:ring-swiss-black"
                  required
                />
              </div>

              <div>
                <Label htmlFor="username" className="text-sm swiss-body font-medium">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Choose a username"
                  className="mt-1 h-12 border-swiss-black focus:border-swiss-black focus:ring-1 focus:ring-swiss-black"
                  required
                />
                <p className="text-xs text-swiss-gray-500 mt-1">
                  This will be your public profile name
                </p>
              </div>

              <div>
                <Label htmlFor="email" className="text-sm swiss-body font-medium">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                  className="mt-1 h-12 border-swiss-black focus:border-swiss-black focus:ring-1 focus:ring-swiss-black"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm swiss-body font-medium">
                  Password
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Create a strong password"
                    className="h-12 pr-10 border-swiss-black focus:border-swiss-black focus:ring-1 focus:ring-swiss-black"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-swiss-gray-500 hover:text-swiss-black"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-swiss-gray-500 mt-1">
                  Minimum 8 characters
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <input 
                type="checkbox" 
                id="acceptTerms"
                checked={formData.acceptTerms}
                onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                className="w-4 h-4 border border-swiss-black rounded-none mt-0.5" 
                required
              />
              <label htmlFor="acceptTerms" className="text-sm swiss-body text-swiss-gray-600">
                I agree to the{' '}
                <Link href="/terms" className="text-swiss-black hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-swiss-black hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !formData.acceptTerms}
              className="w-full h-12 bg-swiss-black text-swiss-white hover:bg-swiss-gray-800 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin w-4 h-4 border border-swiss-white border-t-transparent rounded-full"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Create account</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <Separator className="bg-swiss-gray-200" />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-swiss-white px-4 text-xs swiss-mono text-swiss-gray-500">
                OR
              </span>
            </div>
            
            <Button
              variant="outline"
              className="w-full h-12 mt-6 border-swiss-black hover:bg-swiss-gray-50"
              onClick={() => console.log('Google sign up')}
            >
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-swiss-black rounded-full"></div>
                <span>Continue with Google</span>
              </div>
            </Button>
          </div>

          <p className="mt-8 text-center text-sm swiss-body text-swiss-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-swiss-black font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}