# Authentication Implementation

This document describes the authentication flow integrated into the Incentive Portal.

## Overview

The application uses a two-step authentication process:
1. **Login**: Username/password authentication
2. **OTP Verification**: One-time password verification via SMS

## Authentication Flow

1. User enters username and password on `/login`
2. Backend validates credentials and returns a verification code
3. User is redirected to `/otp` page
4. User enters the 6-digit OTP received via SMS
5. Upon successful verification, user receives tokens (id_token, refresh_token)
6. User is redirected to their role-specific dashboard

## Files Created/Modified

### Core Authentication Files

- **`src/contexts/AuthContext.tsx`**: React context for managing authentication state
  - Provides `useAuth()` hook for accessing auth state and methods
  - Handles token storage, refresh, and user profile management
  - Auto-refreshes tokens before expiration

- **`src/lib/auth.ts`**: Authentication API functions
  - `login()`: Authenticate with username/password
  - `verifyOTP()`: Verify OTP and get tokens
  - `refreshToken()`: Refresh expired access tokens
  - `getUserProfile()`: Get authenticated user profile
  - `logout()`: Logout and clear tokens
  - `resendOTP()`: Resend OTP to user's phone

- **`src/lib/api.ts`**: Base API utilities
  - `apiRequest()`: Make authenticated API requests
  - `publicApiRequest()`: Make unauthenticated API requests
  - Handles token injection in Authorization header

### Pages

- **`src/app/login/page.tsx`**: Login page component
  - Username/password form
  - Error handling and loading states
  - Redirects to OTP page on success

- **`src/app/otp/page.tsx`**: OTP verification page
  - 6-digit OTP input with auto-focus
  - Paste support for OTP
  - Countdown timer (10 minutes)
  - Resend OTP functionality
  - Auto-submit when all digits are entered

### Components

- **`src/components/ProtectedRoute.tsx`**: Route protection wrapper
  - Checks authentication status
  - Redirects to login if not authenticated
  - Stores intended path for post-login redirect
  - Shows loading state during auth check

### API Routes

- **`src/app/api/auth/login/route.ts`**: Next.js API route for login
  - Proxies login request to backend
  - Handles redirects from auth server
  - Extracts verification code from response/cookies

### Updated Files

- **`src/app/layout.tsx`**: Wrapped with `AuthProvider`
- **`src/app/page.tsx`**: Updated to check auth and redirect accordingly
- **`src/components/Header.tsx`**: Added logout functionality with dropdown menu
- All role pages (`src/app/*/page.tsx`): Wrapped with `ProtectedRoute`

## Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_BASE_URL=https://staging-api.mysaarathi.in
```

The default fallback is set to `https://staging-api.mysaarathi.in` for staging environment. Update the URL if you need to use a different environment.

## Usage

### Using Auth Context

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please login</div>;
  
  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Making Authenticated API Calls

```tsx
import { apiRequest } from '@/lib/api';

async function fetchData() {
  try {
    const response = await apiRequest('/api/incentives/my-incentives/');
    console.log(response.data);
  } catch (error) {
    console.error('API call failed:', error);
  }
}
```

### Protecting Routes

```tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function MyPage() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

## Token Management

- **id_token**: Stored in `localStorage`, used for authenticated requests
- **refresh_token**: Stored in `localStorage`, used to refresh expired tokens
- **token_expires_at**: Timestamp stored in `localStorage` for expiration tracking
- **user_profile**: Cached user profile data in `localStorage`

Tokens are automatically refreshed 5 minutes before expiration.

## API Endpoints Used

- `POST /api/token/login-pravesh/`: Login with username/password
- `POST /api/token/verify-otp/`: Verify OTP and get tokens
- `POST /api/token/refresh-token/`: Refresh expired tokens
- `GET /api/token/user-profile/`: Get authenticated user profile
- `GET /api/token/logout/`: Logout and invalidate session
- `POST /api/token/resend-otp/`: Resend OTP

## Security Features

1. **Token Storage**: Tokens stored in `localStorage` (consider `httpOnly` cookies for production)
2. **Auto Token Refresh**: Tokens refreshed automatically before expiration
3. **Route Protection**: All app routes protected by default
4. **Session Management**: Proper cleanup on logout
5. **Error Handling**: Comprehensive error handling throughout auth flow

## Notes

- The login endpoint may return a 302 redirect from the auth server
- Verification code extraction handles multiple scenarios (URL params, cookies, response body)
- OTP is valid for 10 minutes with up to 3 retry attempts
- All protected routes redirect to login if user is not authenticated
- Intended path is stored in sessionStorage for post-login redirect

