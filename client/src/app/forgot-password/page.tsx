'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold text-2xl mb-2">
            <Home className="w-7 h-7" /> REMS
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Reset your password</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your email and we&apos;ll send you a reset link</p>
        </div>

        <form className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          <Button type="submit" className="w-full h-11 text-base">
            Send Reset Link
          </Button>
        </form>

        <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-primary mt-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </motion.div>
    </div>
  );
}
