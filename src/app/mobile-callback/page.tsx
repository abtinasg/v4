'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function MobileAuthCallbackPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const handleCallback = async () => {
      if (!isLoaded) return;

      if (!isSignedIn || !user) {
        // Redirect to sign-in with return URL
        window.location.href = `/sign-in?redirect_url=${encodeURIComponent(window.location.href)}`;
        return;
      }

      try {
        // Get token from API
        const response = await fetch('/api/auth/mobile-token', {
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error('Failed to get token');
        }

        const { token } = await response.json();

        // Redirect to mobile app
        const mobileScheme = 'deepin://auth';
        const redirectUrl = `${mobileScheme}?token=${token}`;
        
        setStatus('Redirecting to app...');
        window.location.href = redirectUrl;
      } catch (error) {
        console.error('Error:', error);
        setStatus('Error: Could not complete authentication');
      }
    };

    handleCallback();
  }, [isLoaded, isSignedIn, user]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-lg">{status}</p>
        <p className="text-gray-500 text-sm mt-2">
          If the app doesn't open, <a href="deepin://auth" className="text-cyan-500">tap here</a>
        </p>
      </div>
    </div>
  );
}
