import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://staging-api.mysaarathi.in';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { status: 'error', message: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Call the backend login endpoint (which forwards to auth server)
    const response = await fetch(`${API_BASE_URL}/api/token/login-pravesh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
      redirect: 'manual',
    });

    // The backend forwards the auth server response
    // Auth server may return a redirect (302) or JSON response
    if (response.status === 302) {
      const location = response.headers.get('location');
      if (location) {
        // Parse redirect URL to extract query parameters
        // Format: /api/auth/otp/?phone_number={phone}&email={email}&employee_user_name={name}
        const url = new URL(location, API_BASE_URL);
        const phoneNumber = url.searchParams.get('phone_number') || '';
        const email = url.searchParams.get('email') || '';
        const employeeUserName = url.searchParams.get('employee_user_name') || '';
        const verificationCode = url.searchParams.get('verification_code') || '';
        
        // Check cookies for verification code
        const cookies = response.headers.get('set-cookie') || '';
        let cookieVerificationCode = '';
        if (cookies) {
          const match = cookies.match(/verification_code=([^;]+)/);
          if (match) {
            cookieVerificationCode = decodeURIComponent(match[1]);
          }
        }
        
        return NextResponse.json({
          success: true,
          verification_code: verificationCode || cookieVerificationCode,
          phone_number: phoneNumber,
          email: email,
          employee_user_name: employeeUserName,
        });
      }
    }

    // Handle JSON response (if auth server returns JSON instead of redirect)
    if (response.ok) {
      try {
        const data = await response.json();
        // Check if response contains verification_code or redirect info
        if (data.verification_code) {
          return NextResponse.json({
            success: true,
            verification_code: data.verification_code,
            phone_number: data.phone_number || '',
            email: data.email || '',
            employee_user_name: data.employee_user_name || '',
          });
        }
        // If response has redirect info, extract it
        if (data.redirect_url) {
          const url = new URL(data.redirect_url, API_BASE_URL);
          return NextResponse.json({
            success: true,
            verification_code: url.searchParams.get('verification_code') || '',
            phone_number: url.searchParams.get('phone_number') || '',
            email: url.searchParams.get('email') || '',
            employee_user_name: url.searchParams.get('employee_user_name') || '',
          });
        }
      } catch {
        // Response is not JSON
      }
    }

    // Handle errors
    const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
    return NextResponse.json(
      { status: 'error', message: errorData.message || errorData.status || 'Login failed' },
      { status: response.status || 500 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

