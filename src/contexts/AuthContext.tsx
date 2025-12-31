'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { login, verifyOTP, refreshToken, getUserProfile, logout as apiLogout, TokenResponse } from '@/lib/auth';

interface User {
  id?: string;
  username?: string;
  email?: string;
  name?: string;
  employee_code?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  verifyOTP: (otp: string, verificationCode: string) => Promise<void>;
  logout: () => Promise<void>;
  resendOTP: (verificationCode: string) => Promise<void>;
  refreshAccessToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = useCallback(async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('id_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token_expires_at');
      localStorage.removeItem('user_profile');
      router.push('/login');
    }
  }, [router]);

  const refreshAccessToken = useCallback(async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refresh_token');
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const response = await refreshToken(refreshTokenValue);
      
      if (response.success && response.data) {
        const tokenData = response.data as TokenResponse;
        
        // Update tokens
        localStorage.setItem('id_token', tokenData.id_token);
        localStorage.setItem('refresh_token', tokenData.refresh_token);
        
        // Update expiration time
        const expiresAt = Date.now() + (tokenData.expires_in * 1000);
        localStorage.setItem('token_expires_at', expiresAt.toString());
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await handleLogout();
      throw error;
    }
  }, [handleLogout]);

  const checkAuth = useCallback(async () => {
    try {
      const idToken = localStorage.getItem('id_token');
      if (!idToken) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Try to get user profile
      try {
        const profileResponse = await getUserProfile();
        if (profileResponse.success && profileResponse.data) {
          setUser(profileResponse.data);
          setIsAuthenticated(true);
        } else {
          throw new Error('Failed to get user profile');
        }
      } catch (error) {
        // Token might be expired, try to refresh
        const refreshTokenValue = localStorage.getItem('refresh_token');
        if (refreshTokenValue) {
          try {
            await refreshAccessToken();
            // Retry getting profile
            const profileResponse = await getUserProfile();
            if (profileResponse.success && profileResponse.data) {
              setUser(profileResponse.data);
              setIsAuthenticated(true);
            }
          } catch (refreshError) {
            // Refresh failed, clear auth
            await handleLogout();
          }
        } else {
          await handleLogout();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await handleLogout();
    } finally {
      setIsLoading(false);
    }
  }, [refreshAccessToken, handleLogout]);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Auto-refresh token before expiration
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      const expiresAt = localStorage.getItem('token_expires_at');
      if (expiresAt) {
        const expiresIn = parseInt(expiresAt) - Date.now();
        // Refresh if token expires in less than 5 minutes
        if (expiresIn < 5 * 60 * 1000 && expiresIn > 0) {
          refreshAccessToken();
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshAccessToken]);

  const handleLogin = useCallback(async (username: string, password: string) => {
    try {
      const result = await login({ username, password });
      // Store verification code temporarily
      sessionStorage.setItem('verification_code', result.verification_code);
      // Store masked phone number for display (prefer masked_phone_number)
      const phoneToStore = result.masked_phone_number || result.phone_number;
      if (phoneToStore) {
        sessionStorage.setItem('phone_number', phoneToStore);
      }
      if (result.email) {
        sessionStorage.setItem('email', result.email);
      }
      if (result.employee_user_name) {
        sessionStorage.setItem('employee_user_name', result.employee_user_name);
      }
      // Redirect to OTP page
      router.push('/otp');
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }, [router]);

  const handleVerifyOTP = useCallback(async (otp: string, verificationCode: string) => {
    try {
      const response = await verifyOTP({ otp, verification_code: verificationCode });
      
      if (response.success && response.data) {
        const tokenData = response.data as TokenResponse;
        
        // Store tokens
        localStorage.setItem('id_token', tokenData.id_token);
        localStorage.setItem('refresh_token', tokenData.refresh_token);
        
        // Calculate expiration time
        const expiresAt = Date.now() + (tokenData.expires_in * 1000);
        localStorage.setItem('token_expires_at', expiresAt.toString());
        
        // Get user profile
        try {
          const profileResponse = await getUserProfile();
          if (profileResponse.success && profileResponse.data) {
            setUser(profileResponse.data);
            localStorage.setItem('user_profile', JSON.stringify(profileResponse.data));
          }
        } catch (profileError) {
          console.error('Failed to get user profile:', profileError);
        }
        
        setIsAuthenticated(true);
        
        // Clear verification code from session
        sessionStorage.removeItem('verification_code');
        sessionStorage.removeItem('phone_number');
        sessionStorage.removeItem('email');
        sessionStorage.removeItem('employee_user_name');
        
        // Redirect to home or intended page
        const intendedPath = sessionStorage.getItem('intended_path') || '/ops/admin';
        sessionStorage.removeItem('intended_path');
        router.push(intendedPath);
      } else {
        throw new Error(response.message || 'OTP verification failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'OTP verification failed');
    }
  }, [router]);


  const handleResendOTP = useCallback(async (verificationCode: string) => {
    try {
      const { resendOTP } = await import('@/lib/auth');
      await resendOTP({ verification_code: verificationCode });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to resend OTP');
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    verifyOTP: handleVerifyOTP,
    logout: handleLogout,
    resendOTP: handleResendOTP,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

