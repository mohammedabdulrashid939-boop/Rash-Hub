import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BUSINESS_INFO } from '../lib/constants';

interface LoginPageProps {
  onNavigate: (page: string) => void;
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const { signInWithEmail, isDemoMode, setDemoUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    const res = await signInWithEmail(email.trim(), password);
    setLoading(false);

    if (res.success) {
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        onNavigate('account');
      }
    } else {
      setError(res.error || 'Invalid email or password.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16">
      <div className="bg-[#0D121F] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Official Brand Header */}
        <div className="text-center space-y-3">
          <img
            src="/logo.png"
            alt="Rash Hub Store"
            className="h-16 w-auto mx-auto object-contain drop-shadow-[0_0_15px_rgba(0,230,118,0.25)] cursor-pointer"
            onClick={() => onNavigate('home')}
          />
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            SIGN IN TO YOUR ACCOUNT
          </h1>
          <p className="text-xs text-gray-400">
            Access your orders, track Abofour delivery, and manage your jersey profile.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="fan@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#080B11] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00E676]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-gray-300 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-[11px] text-[#00E676] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-[#080B11] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00E676]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#00E676] text-black font-extrabold uppercase tracking-wider hover:bg-[#00FF7F] transition shadow-lg shadow-[#00E676]/20 disabled:opacity-50 flex items-center justify-center gap-2 pt-3"
          >
            {loading ? <span>Signing in...</span> : <span>Sign In</span>}
          </button>
        </form>

        {/* Demo Fast-Login Helper (When in setup mode) */}
        {isDemoMode && (
          <div className="p-3.5 rounded-xl bg-[#080B11] border border-gray-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-gray-400">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#00E676]" />
                Preview Mode Quick Logins:
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setDemoUser('customer');
                  onNavigate('account');
                }}
                className="py-1.5 px-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-[11px] font-semibold"
              >
                Customer Role
              </button>
              <button
                type="button"
                onClick={() => {
                  setDemoUser('admin');
                  onNavigate('admin');
                }}
                className="py-1.5 px-2 rounded-lg bg-emerald-500/20 text-[#00E676] border border-[#00E676]/40 hover:bg-emerald-500/30 text-[11px] font-bold"
              >
                Admin Role
              </button>
            </div>
          </div>
        )}

        <div className="pt-2 text-center text-xs text-gray-400 border-t border-gray-800">
          <span>Don't have an account yet? </span>
          <button
            onClick={() => onNavigate('signup')}
            className="text-[#00E676] font-bold hover:underline"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};
