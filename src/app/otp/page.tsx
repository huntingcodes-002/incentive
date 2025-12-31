'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Shield, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function OTPPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const { verifyOTP, resendOTP } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Get verification code from session storage
    const code = sessionStorage.getItem('verification_code');
    const phone = sessionStorage.getItem('phone_number');
    
    if (!code) {
      // No verification code, redirect to login
      router.push('/login');
      return;
    }
    
    setVerificationCode(code);
    if (phone) {
      setPhoneNumber(phone);
    }
    
    // Start countdown timer (10 minutes = 600 seconds)
    setCountdown(600);
  }, [router]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [countdown]);

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOTP = value.slice(0, 6).split('');
      const newOTP = [...otp];
      pastedOTP.forEach((digit, i) => {
        if (index + i < 6 && /^\d$/.test(digit)) {
          newOTP[index + i] = digit;
        }
      });
      setOtp(newOTP);
      
      // Focus next empty input or submit if all filled
      const nextIndex = Math.min(index + pastedOTP.length, 5);
      if (nextIndex < 6) {
        const nextInput = document.getElementById(`otp-${nextIndex}`);
        nextInput?.focus();
      } else if (newOTP.every(d => d !== '')) {
        handleSubmit();
      }
      return;
    }
    
    if (value && !/^\d$/.test(value)) {
      return; // Only allow digits
    }
    
    const newOTP = [...otp];
    newOTP[index] = value;
    setOtp(newOTP);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
    
    // Auto-submit when all fields are filled
    if (newOTP.every(d => d !== '') && newOTP.every(d => d !== '')) {
      setTimeout(() => handleSubmit(), 100);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }
    
    if (!verificationCode) {
      setError('Verification code not found. Please login again.');
      router.push('/login');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      await verifyOTP(otpString, verificationCode);
      // Navigation will happen in AuthContext after successful verification
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      const firstInput = document.getElementById('otp-0');
      firstInput?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!verificationCode) {
      setError('Verification code not found. Please login again.');
      router.push('/login');
      return;
    }
    
    setIsResending(true);
    setError('');
    
    try {
      await resendOTP(verificationCode);
      setCountdown(600); // Reset countdown
      setOtp(['', '', '', '', '', '']);
      const firstInput = document.getElementById('otp-0');
      firstInput?.focus();
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Login */}
        <Link 
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify OTP</h1>
          <p className="text-gray-600">
            Enter the 6-digit code sent to {phoneNumber || 'your phone'}
          </p>
        </div>

        {/* OTP Form */}
        <div className="bg-white rounded-lg shadow-xl p-8 border border-gray-200">
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* OTP Input Fields */}
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedData = e.clipboardData.getData('text');
                    handleOTPChange(index, pastedData);
                  }}
                  className="w-12 h-14 text-center text-2xl font-semibold border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-colors"
                  disabled={isLoading}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {/* Timer */}
            {countdown > 0 && (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  OTP expires in <span className="font-semibold text-indigo-600">{formatTime(countdown)}</span>
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || otp.some(d => !d)}
              className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Verify OTP'
              )}
            </button>

            {/* Resend OTP */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Didn&apos;t receive the code?</p>
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || countdown > 0}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Resend OTP
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            OTP is valid for 10 minutes. You have up to 3 retry attempts.
          </p>
        </div>
      </div>
    </div>
  );
}

