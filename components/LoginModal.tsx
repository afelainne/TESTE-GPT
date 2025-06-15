"use client";

import { useState } from 'react';
import { X, Eye, EyeOff, Grid2X2, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authManager } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
  title?: string;
  message?: string;
}

export function LoginModal({ 
  isOpen, 
  onClose, 
  onLoginSuccess, 
  title = "Sign in required",
  message = "Please sign in to continue with this action"
}: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log('Modal login attempt:', formData.email);
    
    try {
      const result = await authManager.login(formData.email, formData.password);
      
      if (result.success && result.user) {
        console.log('Modal login successful for:', result.user.email);
        
        toast({
          title: "Welcome back!",
          description: `Logged in as ${result.user.isAdmin ? 'Admin' : 'User'}`,
        });

        // Reset form
        setFormData({ email: '', password: '' });
        
        // Call success callback
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        
        // Close modal
        onClose();
      } else {
        toast({
          title: "Login failed",
          description: result.error || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Modal login error:', error);
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

  const handleClose = () => {
    setFormData({ email: '', password: '' });
    setShowPassword(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md border-swiss-black bg-swiss-white p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-swiss-black">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border border-swiss-black flex items-center justify-center">
              <Grid2X2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg swiss-title font-light">{title}</h2>
              <p className="text-xs swiss-mono text-swiss-gray-600">{message}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="modal-email" className="text-sm swiss-body font-medium">
                  Email address
                </Label>
                <Input
                  id="modal-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                  className="mt-1 h-10 border-swiss-black focus:border-swiss-black focus:ring-1 focus:ring-swiss-black"
                  required
                />
              </div>

              <div>
                <Label htmlFor="modal-password" className="text-sm swiss-body font-medium">
                  Password
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="modal-password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter your password"
                    className="h-10 pr-10 border-swiss-black focus:border-swiss-black focus:ring-1 focus:ring-swiss-black"
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

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                onClick={handleClose}
                variant="outline"
                className="flex-1 h-10 border-swiss-black swiss-mono text-sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 h-10 bg-swiss-black text-swiss-white hover:bg-swiss-gray-800 transition-colors swiss-mono text-sm"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-3 h-3 border border-swiss-white border-t-transparent rounded-full"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Sign in</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-swiss-gray-200">
            <p className="text-center text-xs swiss-body text-swiss-gray-600">
              Don't have an account?{' '}
              <button 
                onClick={() => window.location.href = '/auth/register'}
                className="text-swiss-black font-medium hover:underline"
              >
                Create account
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}