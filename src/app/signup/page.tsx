"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUpWithEmail, signInWithGoogle } from '@/lib/authService';
import { toast } from 'react-hot-toast';
import { motion } from "framer-motion";

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleAuthAction = async (action: () => Promise<any>) => {
    setLoading(true);
    setError(null);
    try {
      await action();
      router.push('/dashboard');
      toast.success('Account created and signed in!');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      toast.error(err.message || 'An unexpected error occurred.');
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
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex overflow-hidden"
      >
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
            {error && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full text-center bg-red-100 text-red-700 p-2 rounded-lg mb-4 text-sm"
              >
                {error}
              </motion.p>
            )}
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
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300 bg-green-50 text-gray-900 font-mono placeholder-gray-400 pr-10"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
                    onClick={() => setShowPassword(v => !v)}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 2.25 12c2.036 3.952 6.1 6.75 9.75 6.75 1.563 0 3.06-.362 4.396-1.02M21.75 12c-.512-1.003-1.246-2.053-2.193-3.032m-3.07-2.58A6.75 6.75 0 0 0 12 5.25c-2.25 0-4.5 1.5-6.75 4.5.726 1.41 1.726 2.75 2.98 3.777m3.77 2.98c.726.726 1.726 1.726 2.98 3.777C19.5 16.5 21.75 15 21.75 12c-2.036-3.952-6.1-6.75-9.75-6.75-1.563 0-3.06.362-4.396 1.02" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6.75 0c0 1.25-.5 2.5-1.5 3.5-2.25 2.25-6.25 2.25-8.5 0-1-1-1.5-2.25-1.5-3.5s.5-2.5 1.5-3.5c2.25-2.25 6.25-2.25 8.5 0 1 1 1.5 2.25 1.5 3.5Z" />
                      </svg>
                    )}
                  </button>
                </div>
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
      </motion.div>
    </div>
  );
} 