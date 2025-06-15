'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Grid2X2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { authManager } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const router = useRouter();
  const { toast } = useToast();

  console.log('Login page rendered');

  useEffect(() => {
    try {
      // Load auth state from storage
      authManager.loadFromStorage();
      
      // Redirect if already authenticated
      if (authManager.isAuthenticated()) {
        console.log('User already authenticated, redirecting...');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login page auth error:', error);
      // Continue to show login form
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log('Login attempt:', formData.email);
    
    try {
      const result = await authManager.login(formData.email, formData.password);
      
      if (result.success && result.user) {
        console.log('Login successful for:', result.user.email);
        
        toast({
          title: "Welcome back!",
          description: `Logged in as ${result.user.isAdmin ? 'Admin' : 'User'}`,
        });

        // Redirect based on user type
        if (result.user.isAdmin) {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        toast({
          title: "Login failed",
          description: result.error || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
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
              <p className="text-xs swiss-mono text-swiss-gray-400 mt-1">
                DESIGN PLATFORM
              </p>
            </div>
          </div>
          
          <div className="max-w-md">
            <h2 className="text-3xl swiss-title font-light mb-6 leading-tight">
              Join the creative community
            </h2>
            <p className="swiss-body text-swiss-gray-300 leading-relaxed mb-8">
              Upload, save, and discover design inspiration. 
              Create your personal collections and organize your visual library.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-1 h-1 bg-swiss-white"></div>
                <span className="text-sm swiss-body">Upload unlimited content</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-1 h-1 bg-swiss-white"></div>
                <span className="text-sm swiss-body">Create private collections</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-1 h-1 bg-swiss-white"></div>
                <span className="text-sm swiss-body">Save inspiration from anywhere</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-xs swiss-mono text-swiss-gray-500">
          © 2024 UNBSERVED Platform
        </div>
      </div>

      {/* Right Side - Login Form */}
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
              Welcome back
            </h1>
            <p className="text-sm swiss-body text-swiss-gray-600">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
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
                    placeholder="Enter your password"
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
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 border border-swiss-black rounded-none" />
                <span className="ml-2 text-sm swiss-body text-swiss-gray-600">
                  Remember me
                </span>
              </label>
              <Link href="/auth/forgot-password" className="text-sm swiss-body text-swiss-black hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-swiss-black text-swiss-white hover:bg-swiss-gray-800 transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin w-4 h-4 border border-swiss-white border-t-transparent rounded-full"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm swiss-body text-swiss-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-swiss-black font-medium hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}