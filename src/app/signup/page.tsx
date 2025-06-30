"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUpWithEmail, signInWithGoogle } from '@/lib/authService';

export default function SignupPage() {
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
    handleAuthAction(() => signUpWithEmail(email, password));
  };

  const handleGoogleSignIn = () => {
    handleAuthAction(signInWithGoogle);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex overflow-hidden">
        {/* Left Side */}
        <div className="hidden md:flex flex-col justify-between items-center w-1/2 p-10" style={{ backgroundColor: '#D4EEDA' }}>
          <div className="w-full">
            <span className="text-2xl font-bold text-green-700">INTELLIHIRE</span>
            <div className="text-sm font-medium text-gray-700 mt-1">Interviews</div>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center">
            <img
              src="/Mobile login-pana.png"
              alt="Mobile signup illustration"
              className="w-4/5 max-w-xs md:max-w-sm lg:max-w-md mx-auto mb-4"
              style={{ objectFit: 'contain' }}
            />
            <div className="flex gap-8 mt-6">
              <div className="bg-green-200 rounded-full p-3">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#34D399"/><path d="M12 7v5l3 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="bg-green-200 rounded-full p-3">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#34D399"/><path d="M12 8l4 4-4 4-4-4 4-4z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          </div>
          <div className="w-full flex justify-between items-end">
            {/* <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10C22 6.48 17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-4.41 3.59-8 8-8 4.41 0 8 3.59 8 8 0 4.41-3.59 8-8 8z" fill="#34D399"/></svg>
            </div> */}
            <div className="w-10"></div>
            {/* <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10C22 6.48 17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-4.41 3.59-8 8-8 4.41 0 8 3.59 8 8 0 4.41-3.59 8-8 8z" fill="#34D399"/></svg>
            </div> */}
          </div>
        </div>
        {/* Right Side */}
        <div className="flex-1 flex flex-col justify-center items-center p-10">
          <div className="w-full max-w-sm">
            <h2 className="text-4xl font-bold mb-2 text-gray-900">
              Create <span className="text-green-600">an Account</span>
            </h2>
            {error && <p className="w-full text-center bg-red-100 text-red-700 p-2 rounded-lg mb-4 text-sm">{error}</p>}
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div>
                <label className="block text-gray-700 text-sm mb-1">Email</label>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300 bg-green-50 text-gray-900 placeholder-gray-400"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300 bg-green-50 text-gray-900 font-mono placeholder-gray-400"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <div></div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors shadow disabled:bg-green-300 flex items-center justify-center"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Sign Up'}
              </button>
            </form>
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="mx-4 text-xs text-gray-400 font-semibold">or sign in with</span>
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
            <div className="mt-6 text-sm text-gray-500 text-center">
              Already have an account? <a href="/login" className="text-green-600 hover:underline">Sign in</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 