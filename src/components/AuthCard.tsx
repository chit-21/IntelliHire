"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '@/lib/authService';

interface AuthCardProps {
  mode: 'login' | 'signup';
}

export default function AuthCard({ mode }: AuthCardProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuthAction = async (action: () => Promise<any>) => {
    setLoading(true);
    setError(null);
    try {
      await action();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const action = mode === 'login' ? () => signInWithEmail(email, password) : () => signUpWithEmail(email, password);
    handleAuthAction(action);
  };

  const handleGoogleSignIn = () => {
    handleAuthAction(signInWithGoogle);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
      <div className="mb-6 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m-5.747-8.994l11.494 0M10.5 3.75v16.5M3.75 10.5h16.5" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-1">
          {mode === 'login' ? 'Welcome Back!' : 'Create an Account'}
        </h2>
        <p className="text-gray-500 text-sm">
          {mode === 'login' ? 'Sign in to continue to IntelliHire' : 'Sign up to get started'}
        </p>
      </div>

      {error && <p className="w-full text-center bg-red-100 text-red-700 p-2 rounded-lg mb-4 text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow disabled:bg-blue-300 flex items-center justify-center"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (mode === 'login' ? 'Sign In' : 'Sign Up')}
        </button>
      </form>
      
      <div className="w-full my-4 flex items-center">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="mx-4 text-xs text-gray-400 font-semibold">OR</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-100"
      >
        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C44.57,34.036,48,29.282,48,24C48,22.659,47.862,21.35,47.611,20.083z"></path>
        </svg>
        Sign in with Google
      </button>

      <div className="mt-6 text-sm text-gray-500">
        {mode === 'login' ? (
          <span>
            New here? <a href="/signup" className="text-blue-600 hover:underline">Create an account</a>
          </span>
        ) : (
          <span>
            Already have an account? <a href="/login" className="text-blue-600 hover:underline">Sign in</a>
          </span>
        )}
      </div>
    </div>
  );
} 