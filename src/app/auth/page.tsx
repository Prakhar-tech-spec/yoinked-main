'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // For signup
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const testimonials = [
    { id: 1, text: "Yoinked helped me streamline my campaigns and boosted my conversions!", author: "Aarav Sharma" },
    { id: 2, text: "The pricing page is clear and the upgrade was seamless.", author: "Zara Khan" },
    { id: 3, text: "Loving the new UI, especially the dashboard layout.", author: "Vihaan Patel" },
    { id: 4, text: "Best email marketing platform I've used so far!", author: "Ananya Singh" },
    { id: 5, text: "The analytics features are incredibly detailed.", author: "Arjun Reddy" },
    { id: 6, text: "Customer support is always helpful and responsive.", author: "Ishaan Mehta" },
  ];

  // Split testimonials into two rows and create seamless loop
  const row1Testimonials = [...testimonials.slice(0, 3), ...testimonials.slice(0, 3), ...testimonials.slice(0, 3)];
  const row2Testimonials = [...testimonials.slice(3), ...testimonials.slice(3), ...testimonials.slice(3)];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!email || !password) {
      setError('Please fill in email and password.');
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      window.location.href = '/'; // Redirect to dashboard
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      window.location.href = '/auth/confirm'; // Redirect to confirmation notice
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    // Clear form fields when switching
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

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
    <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen bg-app-background p-6">
      {/* Left Section: Auth Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center lg:justify-end pr- lg:pr-12 mb-8 lg:mb-0">
        <Card className="w-[calc(100%-2rem)] mx-auto sm:max-w-sm p-6 rounded-xl shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">{isLogin ? 'Welcome Back!' : 'Sign Up to Yoinked!'}</CardTitle>
          </CardHeader>
          <CardContent>
            <motion.form
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={isLogin ? handleLogin : handleSignUp}
              className="space-y-4"
            >
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              {/* Password Field */}
              <div className="space-y-2 relative">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-9 text-gray-500 focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Confirm Password Field (only for Sign Up) */}
              {!isLogin && (
                <div className="space-y-2 relative">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-9 text-gray-500 focus:outline-none"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full bg-rich-green hover:bg-rich-green/90 text-white" disabled={loading}>
                {loading ? (isLogin ? 'Logging in...' : 'Signing up...') : (isLogin ? 'Login' : 'Sign Up')}
              </Button>

              {error && <p className="text-center text-sm text-red-500">{error}</p>}

              {/* Toggle Form Link */}
              <p className="text-center text-sm text-gray-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                <Button variant="link" onClick={toggleForm} className="p-0 h-auto">
                  {isLogin ? 'Sign Up' : 'Login'}
                </Button>
              </p>
            </motion.form>
          </CardContent>
        </Card>
      </div>

      {/* Right Section: Testimonials */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center pl- lg:pl-12">
        <div className="w-[calc(100%-2rem)] mx-auto sm:max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center lg:text-left">What our users say:</h2>
          
          {/* First Row - Right to Left */}
          <div className="relative overflow-hidden mb-4">
            {/* Left blur gradient */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-app-background to-transparent z-10" />
            {/* Right blur gradient */}
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-app-background to-transparent z-10" />
            <motion.div
              className="flex gap-4"
              animate={{
                x: ["0%", "-66.666%"],
              }}
              transition={{
                x: {
                  duration: 30,
                  repeat: Infinity,
                  ease: "linear",
                  repeatType: "loop",
                },
              }}
              style={{
                willChange: "transform",
              }}
            >
              {row1Testimonials.map((testimonial, index) => (
                <div
                  key={`row1-${testimonial.id}-${index}`}
                  className="min-w-[calc(100%-2rem)] sm:min-w-[calc(50%-1rem)] lg:min-w-[calc(33.333%-1rem)] bg-white p-4 rounded-xl shadow-lg"
                >
                  <p className="text-gray-700 italic mb-2 text-sm">"{testimonial.text}"</p>
                  <p className="text-right font-semibold text-gray-800 text-sm">- {testimonial.author}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Second Row - Left to Right */}
          <div className="relative overflow-hidden">
            {/* Left blur gradient */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-app-background to-transparent z-10" />
            {/* Right blur gradient */}
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-app-background to-transparent z-10" />
            <motion.div
              className="flex gap-4"
              animate={{
                x: ["-66.666%", "0%"],
              }}
              transition={{
                x: {
                  duration: 30,
                  repeat: Infinity,
                  ease: "linear",
                  repeatType: "loop",
                },
              }}
              style={{
                willChange: "transform",
              }}
            >
              {row2Testimonials.map((testimonial, index) => (
                <div
                  key={`row2-${testimonial.id}-${index}`}
                  className="min-w-[calc(100%-2rem)] sm:min-w-[calc(50%-1rem)] lg:min-w-[calc(33.333%-1rem)] bg-white p-4 rounded-xl shadow-lg"
                >
                  <p className="text-gray-700 italic mb-2 text-sm">"{testimonial.text}"</p>
                  <p className="text-right font-semibold text-gray-800 text-sm">- {testimonial.author}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage; 