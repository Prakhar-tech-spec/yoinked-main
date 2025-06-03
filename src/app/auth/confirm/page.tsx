'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function ConfirmNotice() {
  const router = useRouter();
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        router.replace('/overview');
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-app-background p-4">
      <div className="bg-white w-full max-w-md p-6 sm:p-8 rounded-xl shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Confirm Your Email</h2>
        <p className="text-gray-700">
          We have sent a confirmation link to your email address.<br />
          Please check your inbox and confirm your email to continue.
        </p>
      </div>
    </div>
  );
} 