import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Shield, Sparkles, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: any) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      if (isRegister) {
        const submittedEmail = email;
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) {
          setError(signUpError.message);
        } else {
          setIsRegister(false);
          setEmail(submittedEmail);
          setPassword('');
          setMessage("Account created! Check your email to confirm before signing in.");
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          setError(signInError.message);
        } else if (data?.session) {
          onLoginSuccess(data.user);
        } else {
          setError('Could not establish session. Please try logging in again.');
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const guestEmail = 'guest@heimdall.ai';
      const guestPassword = 'heimdall123';

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: guestEmail,
        password: guestPassword
      });

      if (signInError) {
        const fallbackUser = {
          id: 'guest_heimdall_user',
          uid: 'guest_heimdall_user',
          email: 'alex.rivers@talent.heimdall',
          user_metadata: { full_name: 'Alex Rivers' }
        };
        localStorage.setItem('heimdall_local_session', JSON.stringify(fallbackUser));
        onLoginSuccess(fallbackUser);
      } else if (signInData?.session) {
        onLoginSuccess(signInData.user);
      }
    } catch (err: any) {
      const fallbackUser = {
        id: 'guest_heimdall_user',
        uid: 'guest_heimdall_user',
        email: 'alex.rivers@talent.heimdall',
        user_metadata: { full_name: 'Alex Rivers' }
      };
      localStorage.setItem('heimdall_local_session', JSON.stringify(fallbackUser));
      onLoginSuccess(fallbackUser);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-container" className="min-h-screen bg-[#EEF3F2] text-zinc-900 flex flex-col justify-between p-6 md:p-12 font-sans relative overflow-hidden">
      
      {/* Background ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-200/25 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between relative z-10 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-teal-900/20">
            H
          </div>
          <span className="font-extrabold tracking-tight text-base font-display text-zinc-900">HEIMDALL</span>
        </div>
        <span className="text-[11px] font-semibold text-zinc-500 bg-white/80 border border-zinc-200 px-3 py-1 rounded-full">
          Autonomous Commercial OS
        </span>
      </div>

      {/* Main Form Box */}
      <div className="w-full max-w-md mx-auto my-auto py-12 relative z-10">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>AI Commercial Intelligence</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 font-display">
            {isRegister ? 'Create your platform account' : 'Welcome to Heimdall'}
          </h1>
          <p className="text-zinc-500 text-xs font-medium">
            {isRegister ? 'Autonomous commercial rate intelligence & contract security' : 'Sign in to access your commercial operating system'}
          </p>
        </div>

        <div className="rounded-[32px] glass-panel p-8 shadow-2xl border border-white space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-zinc-700 text-xs font-bold mb-1.5">Email address</label>
              <input
                id="email-input"
                type="email"
                required
                placeholder="name@creator.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-teal-500 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-zinc-700 text-xs font-bold mb-1.5">Password</label>
              <input
                id="password-input"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-teal-500 text-xs font-medium"
              />
            </div>

            <button
              id="submit-auth-btn"
              type="submit"
              disabled={loading}
              className="w-full teal-pill-button py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              <span>{loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-zinc-200 w-full" />
            <span className="bg-white/90 px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider absolute">
              or instant access
            </span>
          </div>

          <button
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-full bg-zinc-100 hover:bg-zinc-200/80 text-zinc-800 text-xs font-bold transition-all cursor-pointer border border-zinc-200"
          >
            ⚡ 1-Click Guest Experience (Demo Sandbox)
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-zinc-400 relative z-10">
        © 2026 Heimdall Technologies Inc. • Enterprise Creator & Brand Security
      </div>
    </div>
  );
}
