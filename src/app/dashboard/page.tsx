"use client";

import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/authService';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-lg w-full flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-4 text-blue-700">Welcome to your Dashboard!</h1>
          <p className="text-lg text-gray-700 mb-2">You are signed in as:</p>
          <div className="text-blue-600 font-semibold text-lg mb-6">{user?.email}</div>
          <button
            onClick={handleSignOut}
            className="mt-4 px-6 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors shadow"
          >
            Sign Out
          </button>
          <p className="text-gray-500 mt-6">This is a protected page. Only authenticated users can see this.</p>
        </div>
      </div>
    </ProtectedRoute>
  );
} 