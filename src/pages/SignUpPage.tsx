import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  CheckCircle,
  AlertCircle,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BUSINESS_INFO } from '../lib/constants';

interface SignUpPageProps {
  onNavigate: (page: string) => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onNavigate }) => {
  const { signUpWithEmail } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationPending, setVerificationPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Validations
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Please provide your full legal name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password confirmation.');
      return;
    }

    setLoading(true);
    const res = await signUpWithEmail(email.trim(), password, fullName.trim());
    setLoading(false);

    if (res.success) {
      if (res.needsEmailVerification) {
        setVerificationPending(true);
      } else {
        onNavigate('account');
      }
    } else {
      setError(res.error || 'Failed to create account. Please check your credentials.');
    }
  };

  // VERIFICATION PENDING SCREEN (Section 9)
  if (verificationPending) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-[#0D121F] border border-gray-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#00E676]/10 border-2 border-[#00E676] flex items-center justify-center mx-auto text-[#00E676]">
            <Mail className="w-8 h-8" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#00E676]/20 text-[#00E676] uppercase tracking-wider">
              Verification Link Sent
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-3 uppercase tracking-tight">
              CHECK YOUR EMAIL
            </h2>
            <p className="text-xs text-gray-300 mt-2 leading-relaxed">
              We sent a verification link to <strong className="text-white">{email}</strong>. Please
              open the email and click the confirmation link to activate your Rash Hub Store account.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#080B11] border border-gray-800 text-xs text-gray-400 space-y-2 text-left">
            <p className="font-bold text-white">Next Steps:</p>
            <ul className="list-disc list-inside space-y-1 text-[11px]">
              <li>Check your inbox and Spam/Junk folder.</li>
              <li>Click the confirmation link to verify your email.</li>
              <li>Then log in with your email and password.</li>
            </ul>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('login')}
              className="w-full py-3 rounded-xl bg-[#00E676] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#00FF7F] transition"
            >
              Go to Login Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16">
      <div className="bg-[#0D121F] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <img
            src="/logo.png"
            alt="Rash Hub Store"
            className="h-16 w-auto mx-auto object-contain drop-shadow-[0_0_15px_rgba(0,230,118,0.25)] cursor-pointer"
            onClick={() => onNavigate('home')}
          />
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            CREATE FAN ACCOUNT
          </h1>
          <p className="text-xs text-gray-400">
            Join Rash Hub Store to track your orders, save delivery details, and get early jersey drop alerts.
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
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Kwame Mensah"
                className="w-full pl-10 pr-4 py-2.5 bg-[#080B11] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00E676]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Email Address *
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
            <label className="block font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Password (min. 6 characters) *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
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

          <div>
            <label className="block font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#080B11] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00E676]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#00E676] text-black font-extrabold uppercase tracking-wider hover:bg-[#00FF7F] transition shadow-lg shadow-[#00E676]/20 disabled:opacity-50 flex items-center justify-center gap-2 pt-3"
          >
            {loading ? <span>Creating Account...</span> : <span>Create Account</span>}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-gray-400 border-t border-gray-800">
          <span>Already registered? </span>
          <button
            onClick={() => onNavigate('login')}
            className="text-[#00E676] font-bold hover:underline"
          >
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
};
