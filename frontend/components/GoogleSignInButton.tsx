'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Loader } from 'lucide-react';
import { API_CONFIG } from '@/lib/apiConfig';

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleSignInButtonProps {
  onSuccess: (token: string, user: any) => void;
}

export default function GoogleSignInButton({ onSuccess }: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scriptReady, setScriptReady] = useState(false);
  const scriptLoadedRef = useRef(false);

  const handleGoogleLogin = async (response: any) => {
    if (!response?.credential) {
      setError('Google credential not received');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(API_CONFIG.ENDPOINTS.AUTH_GOOGLE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: response.credential,
        }),
      });

      const data = await res.json();

      if (!data.success || !res.ok) {
        throw new Error(data.error || data.message || 'Google login failed');
      }

      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: data.data.playerId,
        username: data.data.username,
        email: data.data.email,
        level: data.data.level,
      }));

      onSuccess(data.data.token, {
        id: data.data.playerId,
        username: data.data.username,
        email: data.data.email,
        level: data.data.level,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Google login failed';
      setError(errorMessage);
      console.error('Google login error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Prevent multiple script loads
    if (scriptLoadedRef.current) return;

    // Check if script already exists
    if (typeof window !== 'undefined' && window.google) {
      scriptLoadedRef.current = true;
      setScriptReady(true);
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        callback: handleGoogleLogin,
      });
      return;
    }

    // Load Google Sign-In script only once
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.id = 'google-gsi-script';

    script.onload = () => {
      if (window.google && !scriptLoadedRef.current) {
        scriptLoadedRef.current = true;
        setScriptReady(true);
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          callback: handleGoogleLogin,
        });
      }
    };

    script.onerror = () => {
      setError('Failed to load Google Sign-In');
      console.error('Failed to load Google Sign-In script');
    };

    // Only append if not already in DOM
    if (!document.getElementById('google-gsi-script')) {
      document.head.appendChild(script);
    }

    return () => {
      // Safer cleanup - check if script exists before removing
      const existingScript = document.getElementById('google-gsi-script');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, []);

  // useEffect to render Google button after script loads
  useEffect(() => {
    if (window.google && scriptReady) {
      const container = document.getElementById('google-signin-container');
      if (container && container.children.length === 0) {
        window.google.accounts.id.renderButton(container, {
          type: 'standard',
          size: 'large',
          text: 'signin_with',
          theme: 'outline',
          locale: 'vi',
        });
      }
    }
  }, [scriptReady]);

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Google will render its button here */}
      <div
        id="google-signin-container"
        className="flex justify-center"
        style={{ minHeight: '44px' }}
      />
    </div>
  );
}
