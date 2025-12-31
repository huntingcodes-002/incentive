/**
 * Authentication API functions
 */

import { publicApiRequest, apiRequest, ApiResponse } from './api';
import type { TokenResponse } from './api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface VerifyOTPRequest {
  otp: string;
  verification_code: string;
}

export interface ResendOTPRequest {
  verification_code: string;
}

// Re-export TokenResponse for use in other files
export type { TokenResponse } from './api';

/**
 * Login with username and password
 * Returns verification code for OTP step
 * Direct API call to backend
 * 
 * Response format:
 * {
 *   "success": true,
 *   "message": "OTP sent successfully to +91***970",
 *   "data": {
 *     "masked_phone_number": "+91***970",
 *     "verification_code": "gAAAAABpU8NYo..."
 *   }
 * }
 */
export async function login(credentials: LoginCredentials): Promise<{ verification_code: string; phone_number?: string; email?: string; employee_user_name?: string; masked_phone_number?: string }> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://staging-api.mysaarathi.in';
  
  // Direct call to backend login endpoint
  const response = await fetch(`${API_BASE_URL}/api/token/login-pravesh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(errorData.message || `Login failed with status ${response.status}`);
  }

  // Parse JSON response
  const responseData = await response.json();
  
  // Handle the standard response format
  if (responseData.success && responseData.data) {
    return {
      verification_code: responseData.data.verification_code || '',
      masked_phone_number: responseData.data.masked_phone_number || '',
      phone_number: responseData.data.masked_phone_number || '', // Use masked for display
      email: responseData.data.email || '',
      employee_user_name: responseData.data.employee_user_name || '',
    };
  }

  // Fallback: check if verification_code is at top level
  if (responseData.verification_code) {
    return {
      verification_code: responseData.verification_code,
      masked_phone_number: responseData.masked_phone_number || responseData.phone_number || '',
      phone_number: responseData.masked_phone_number || responseData.phone_number || '',
      email: responseData.email || '',
      employee_user_name: responseData.employee_user_name || '',
    };
  }

  throw new Error(responseData.message || 'Login failed - verification code not received');
}

/**
 * Verify OTP and get tokens
 */
export async function verifyOTP(request: VerifyOTPRequest): Promise<ApiResponse<TokenResponse>> {
  return publicApiRequest<ApiResponse<TokenResponse>>('/api/token/verify-otp/', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Refresh access token
 */
export async function refreshToken(refreshToken: string): Promise<ApiResponse<TokenResponse>> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://staging-api.mysaarathi.in';
  return fetch(`${API_BASE_URL}/api/token/refresh-token/`, {
    method: 'POST',
    headers: {
      'Authorization': refreshToken, // Without Bearer prefix as per docs
      'Content-Type': 'application/json',
    },
  }).then(async (response) => {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Token refresh failed' }));
      throw new Error(errorData.message || 'Token refresh failed');
    }
    return response.json();
  });
}

/**
 * Get user profile
 */
export async function getUserProfile(): Promise<ApiResponse<any>> {
  return apiRequest('/api/token/user-profile/');
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('id_token') : null;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://staging-api.mysaarathi.in';
  
  if (token) {
    await fetch(`${API_BASE_URL}/api/token/logout/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }).catch(() => {
      // Ignore errors on logout
    });
  }
  
  // Clear local storage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('id_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expires_at');
    localStorage.removeItem('user_profile');
  }
}

/**
 * Resend OTP
 */
export async function resendOTP(request: ResendOTPRequest): Promise<any> {
  return publicApiRequest('/api/token/resend-otp/', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// Export resendOTP function for use in AuthContext
export { resendOTP as resendOTPFunction };

