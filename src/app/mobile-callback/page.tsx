'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function MobileAuthCallback() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const handleCallback = async () => {
      if (!isLoaded) return;

      // Get the redirect URL from params (from mobile app)
      const mobileRedirect = searchParams.get('redirect') || 'deepin://auth';
      console.log('Mobile redirect URL:', mobileRedirect);

      if (!isSignedIn || !user) {
        // Redirect to sign-in with return URL (preserve the redirect param)
        const returnUrl = `${window.location.origin}/mobile-callback?redirect=${encodeURIComponent(mobileRedirect)}`;
        window.location.href = `/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`;
        return;
      }

      try {
        setStatus('Generating secure token...');
        
        // Get token from API
        const response = await fetch('/api/auth/mobile-token', {
          method: 'POST',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to get token');
        }

        const { token } = await response.json();
        console.log('Token received, redirecting to app...');

        // Build redirect URL with token
        const separator = mobileRedirect.includes('?') ? '&' : '?';
        const redirectUrl = `${mobileRedirect}${separator}token=${token}`;
        
        setStatus('Redirecting to app...');
        
        // Small delay to show the message
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 500);
        
      } catch (error: any) {
        console.error('Error:', error);
        setStatus(`Error: ${error.message || 'Could not complete authentication'}`);
      }
    };

    handleCallback();
  }, [isLoaded, isSignedIn, user, searchParams]);

  return (
    <div className="min-h-screen bg-[#04060A] flex items-center justify-center">
      <div className="text-center px-6">
        {/* Logo */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 flex items-center justify-center border border-cyan-500/20">
          <span className="text-4xl">📊</span>
        </div>
        
        {/* Spinner */}
        <div className="w-12 h-12 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        
        {/* Status */}
        <p className="text-white text-lg font-medium mb-2">{status}</p>
        <p className="text-gray-500 text-sm">
          Connecting to Deepin app...
        </p>
        
        {/* Manual link */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-gray-600 text-xs mb-3">
            If the app doesn't open automatically:
          </p>
          <a 
            href="deepin://auth" 
            className="inline-block px-6 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-xl text-sm font-medium transition-colors border border-cyan-500/20"
          >
            Open Deepin App
          </a>
        </div>
      </div>
    </div>
  );
}

export default function MobileAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#04060A] flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MobileAuthCallback />
    </Suspense>
  );
}
