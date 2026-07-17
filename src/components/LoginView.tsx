import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Shield, Sparkles, AlertCircle } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: any) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) {
          setError(signUpError.message);
        } else {
          if (data.user) {
            onLoginSuccess(data.user);
            window.location.href = '/';
          } else {
            setError('Account creation succeeded! Please check your email for confirmation.');
          }
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          setError(signInError.message);
        } else {
          onLoginSuccess(data.user);
          window.location.href = '/';
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const { error: oAuthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (oAuthError) {
        setError(oAuthError.message);
      }
    } catch (err: any) {
      console.error(err);
      setError('Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const guestEmail = 'guest@heimdall.ai';
      const guestPassword = 'heimdall123';

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: guestEmail,
        password: guestPassword
      });

      if (signInError) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: guestEmail,
          password: guestPassword
        });

        if (signUpError) {
          setError(signUpError.message);
        } else if (signUpData.user) {
          onLoginSuccess(signUpData.user);
          window.location.href = '/';
        } else {
          setError('Guest sign-up completed. Please check credentials.');
        }
      } else {
        onLoginSuccess(signInData.user);
        window.location.href = '/';
      }
    } catch (err: any) {
      console.error(err);
      setError('Guest login failed. Please try email sign-in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-container" className="min-h-screen bg-[#030712] text-white flex flex-col justify-between p-6 md:p-12 font-sans selection:bg-[#00C8FF] selection:text-black relative overflow-hidden">
      
      {/* Cinematic background grid and glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#00C8FF]/10 via-[#030712] to-[#030712] pointer-events-none z-0"></div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#32E8FF]/5 rounded-full filter blur-[100px] pointer-events-none z-0"></div>

      {/* Top Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <Shield className="w-6 h-6 text-[#00C8FF] animate-pulse" />
          <span className="font-semibold tracking-widest text-sm uppercase font-sans">HEIMDALL OS</span>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">v2.0.0 JARVIS</span>
      </div>

      {/* Main Form Box */}
      <div className="w-full max-w-md mx-auto my-auto py-12 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.02] border border-white/10 text-[#32E8FF] text-xs mb-4 shadow backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-mono uppercase tracking-wider text-[10px] font-bold">AI Brand Partnerships Manager</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-white font-sans">
            {isRegister ? 'Create your platform account' : 'Sign in to Heimdall'}
          </h1>
          <p className="text-zinc-400 text-sm font-light">
            {isRegister ? 'Start securing six-figure brand partnerships with AI' : 'Your personal automated brand representative'}
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3.5 bg-red-950/40 border border-red-900 rounded-lg text-red-400 text-xs mb-5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="cyber-panel p-6 md:p-8 rounded-[28px] shadow-xl space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#00C8FF]/3 rounded-full filter blur-xl"></div>
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-zinc-400 text-[10px] uppercase font-bold tracking-wider mb-1.5 font-mono">Email address</label>
              <input
                id="email-input"
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-zinc-650 focus:outline-none focus:border-[#00C8FF] text-sm transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-[10px] uppercase font-bold tracking-wider mb-1.5 font-mono">Password</label>
              <input
                id="password-input"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-zinc-650 focus:outline-none focus:border-[#00C8FF] text-sm transition-colors font-mono"
              />
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 btn-emerald text-black font-bold shadow-lg shadow-[#00C8FF]/15 transition-colors text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
            >
              {loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <span className="relative bg-[#101826] px-3 text-zinc-500 text-[9px] uppercase tracking-widest font-mono font-bold">Or continue with</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              id="google-signin-btn"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-xs text-white font-mono cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0 text-white" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google</span>
            </button>

            <button
              id="guest-signin-btn"
              onClick={handleGuestLogin}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl border border-[#00C8FF]/20 bg-[#00C8FF]/10 text-[#00C8FF] hover:bg-[#00C8FF]/25 transition-all text-xs font-mono font-bold uppercase tracking-wider cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0 animate-pulse" />
              <span>Guest Login</span>
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-xs">
          <button
            id="toggle-auth-mode-btn"
            onClick={() => setIsRegister(!isRegister)}
            className="text-zinc-500 hover:text-[#00C8FF] transition-colors cursor-pointer"
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="flex flex-col md:flex-row items-center justify-between text-zinc-500 text-xs border-t border-white/5 pt-6 relative z-10">
        <p>© 2026 Heimdall Brand Intelligence. All rights reserved.</p>
        <div className="flex gap-4 mt-2 md:mt-0">
          <span className="hover:text-zinc-400 cursor-pointer">Security</span>
          <span className="hover:text-zinc-400 cursor-pointer">Privacy Protocol</span>
          <span className="hover:text-zinc-400 cursor-pointer">Terms of Service</span>
        </div>
      </div>
    </div>
  );
}
