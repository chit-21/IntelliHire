import AuthCard from '@/components/AuthCard';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <AuthCard mode="login" />
    </div>
  );
} 