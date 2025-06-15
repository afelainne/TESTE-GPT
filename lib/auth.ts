"use client";

export interface User {
  id: string;
  email: string;
  name?: string;
  isAdmin: boolean;
  createdAt: Date;
  username: string;
  fullName: string;
  joinedAt: string;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  uploadsCount: number;
  savedCount: number;
  isPrivate: boolean;
  allowComments: boolean;
  showEmail: boolean;
  avatar?: string;
  bio?: string;
  website?: string;
  location?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Credenciais do admin
const ADMIN_CREDENTIALS = {
  email: 'afelainne@gmail.com',
  password: 'Lotipa12!'
};

export class AuthManager {
  private static instance: AuthManager;
  private authState: AuthState = {
    user: null,
    isAuthenticated: false
  };

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    console.log('Login attempt for:', email);

    // Check admin credentials
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      const adminUser: User = {
        id: 'admin-001',
        email: email,
        name: 'Admin',
        isAdmin: true,
        createdAt: new Date(),
        username: 'admin',
        fullName: 'Administrator',
        joinedAt: new Date().toISOString(),
        isVerified: true,
        followersCount: 0,
        followingCount: 0,
        uploadsCount: 0,
        savedCount: 0,
        isPrivate: false,
        allowComments: true,
        showEmail: false
      };

      this.authState = {
        user: adminUser,
        isAuthenticated: true
      };

      // Store in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(adminUser));
        localStorage.setItem('auth_token', 'admin_token_' + Date.now());
      }

      console.log('Admin login successful');
      return { success: true, user: adminUser };
    }

    // Regular user login (simplified - in real app would check database)
    if (email && password && password.length >= 6) {
      const user: User = {
        id: 'user_' + Date.now(),
        email: email,
        name: email.split('@')[0],
        isAdmin: false,
        createdAt: new Date(),
        username: email.split('@')[0],
        fullName: email.split('@')[0],
        joinedAt: new Date().toISOString(),
        isVerified: false,
        followersCount: 0,
        followingCount: 0,
        uploadsCount: 0,
        savedCount: 0,
        isPrivate: false,
        allowComments: true,
        showEmail: false
      };

      this.authState = {
        user: user,
        isAuthenticated: true
      };

      // Store in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(user));
        localStorage.setItem('auth_token', 'user_token_' + Date.now());
      }

      console.log('User login successful');
      return { success: true, user: user };
    }

    return { success: false, error: 'Invalid credentials' };
  }

  logout(): void {
    console.log('Logging out user');
    this.authState = {
      user: null,
      isAuthenticated: false
    };

    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
    }
  }

  getCurrentUser(): User | null {
    return this.authState.user;
  }

  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  isAdmin(): boolean {
    return this.authState.user?.isAdmin === true;
  }

  // Load user from localStorage on page load
  loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('auth_user');
      const storedToken = localStorage.getItem('auth_token');

      if (storedUser && storedToken) {
        try {
          const user = JSON.parse(storedUser);
          this.authState = {
            user: user,
            isAuthenticated: true
          };
          console.log('User loaded from storage:', user.email);
        } catch (error) {
          console.error('Error loading user from storage:', error);
          this.logout();
        }
      }
    }
  }
}

export const authManager = AuthManager.getInstance();