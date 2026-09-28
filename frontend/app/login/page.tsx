'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/ui/LoadingState';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

function LoginFormContent() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectUrl = searchParams.get('redirect');
  const isExpired = searchParams.get('expired') === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email address and password.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const loggedUser = await login({ email: email.trim(), password });
      toast.success(`Welcome back, ${loggedUser.fullName}!`);

      if (redirectUrl) {
        router.push(redirectUrl);
        return;
      }

      switch (loggedUser.role) {
        case 'CUSTOMER':
          router.push('/customer');
          break;
        case 'ADMIN':
          router.push('/admin');
          break;
        case 'FLEET_MANAGER':
          router.push('/fleet');
          break;
        case 'MAINTENANCE_STAFF':
          router.push('/maintenance');
          break;
        default:
          router.push('/customer');
          break;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid login credentials.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-200">
      {isExpired && (
        <div className="mb-5">
          <Alert variant="warning" title="Session Expired">
            Your session has expired. Please log in again to continue.
          </Alert>
        </div>
      )}

      {error && (
        <div className="mb-5">
          <Alert variant="error" title="Authentication Failed">
            {error}
          </Alert>
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <Input
          label="Email Address"
          type="email"
          autoComplete="email"
          placeholder="name@velorent.in"
          leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="••••••••••••"
          leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="focus:outline-none hover:text-slate-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-slate-400" />
              ) : (
                <Eye className="w-4 h-4 text-slate-400" />
              )}
            </button>
          }
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          required
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Sign In
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          256-bit Encrypted Session
        </span>
        <span>REST API v1.0</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3B82F6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60 shadow-lg">
            <div className="p-3 bg-blue-600 rounded-xl text-white font-black tracking-wider text-lg shadow-sm">
              VR
            </div>
            <div className="flex flex-col text-left pr-2">
              <span className="font-bold text-xl tracking-tight text-white leading-tight">
                Velo<span className="text-blue-500">Rent</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono tracking-wider uppercase">
                Fleet Management System
              </span>
            </div>
          </div>
        </div>

        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-xs text-slate-400">
          Enter your authorized credentials to access the VeloRent platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Suspense fallback={<LoadingState label="Loading login form..." />}>
          <LoginFormContent />
        </Suspense>
      </div>
    </div>
  );
}
