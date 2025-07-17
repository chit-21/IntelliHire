import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'IntelliHire - AI-Powered Mock Interviews',
  description: 'Practice interviews with AI-generated questions and get instant feedback',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster position="bottom-right" />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
