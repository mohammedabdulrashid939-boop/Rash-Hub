import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ForgotPasswordPageProps {
  onNavigate: (page: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const { resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your account email address.');
      return;
    }

    setLoading(true);
    const res = await resetPasswordForEmail(email.trim());
    setLoading(false);

    if (res.success) {
      setSubmitted(true);
    } else {
      setError(res.error || 'Failed to send password recovery email.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-[#0D121F] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-3">
          <img
            src="/logo.png"
            alt="Rash Hub Store"
            className="h-14 w-auto mx-auto object-contain drop-shadow-[0_0_12px_rgba(0,230,118,0.2)] cursor-pointer"
            onClick={() => onNavigate('home')}
          />
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            RESET YOUR PASSWORD
          </h1>
          <p className="text-xs text-gray-400">
            Enter the email address associated with your Rash Hub Store account.
          </p>
        </div>

        {submitted ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 rounded-full bg-[#00E676]/10 border border-[#00E676] flex items-center justify-center mx-auto text-[#00E676]">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Recovery Email Dispatched</h3>
              <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                If an account exists with <strong className="text-white">{email}</strong>, a password reset link has been sent. Please check your inbox and spam folder.
              </p>
            </div>
            <button
              onClick={() => onNavigate('login')}
              className="w-full py-3 rounded-xl bg-[#0F172A] border border-gray-700 text-white font-bold text-xs uppercase hover:bg-gray-800"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#00E676] text-black font-extrabold uppercase tracking-wider hover:bg-[#00FF7F] transition shadow-lg shadow-[#00E676]/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Sending Link...' : 'Send Password Reset Link'}
              </button>
            </form>

            <div className="pt-2 text-center text-xs">
              <button
                onClick={() => onNavigate('login')}
                className="text-gray-400 hover:text-white transition flex items-center justify-center gap-1.5 mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
