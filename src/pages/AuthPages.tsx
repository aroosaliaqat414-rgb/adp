import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, Phone, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthPagesProps {
  initialMode?: 'login' | 'register' | 'forgot';
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onSuccess?: () => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({
  initialMode = 'login',
  onNavigate,
  onSuccess
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      setLoading(true);
      try {
        await register({ name, email, password, phone });
        if (onSuccess) onSuccess();
        else onNavigate('dashboard');
      } catch (err: any) {
        setError(err.message || 'Registration failed.');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'login') {
      setLoading(true);
      try {
        await login({ email, password });
        if (onSuccess) onSuccess();
        else onNavigate('dashboard');
      } catch (err: any) {
        setError(err.message || 'Invalid email or password.');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'forgot') {
      setForgotSent(true);
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'customer') => {
    setError(null);
    setLoading(true);
    try {
      if (role === 'admin') {
        await login({ email: 'admin@ladiescomfort.com', password: 'admin123' });
        onNavigate('admin');
      } else {
        await login({ email: 'aroosa@example.com', password: 'customer123' });
        onNavigate('dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-20">
      <div className="bg-white rounded-3xl border border-[#EFE6EE] p-8 sm:p-10 shadow-sm space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-linear-to-tr from-[#8E1EA2] to-[#ED96D7] text-white text-lg font-serif font-bold mx-auto">
            L
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#231826]">
            {mode === 'login'
              ? 'Welcome to Ladies Comfort'
              : mode === 'register'
              ? 'Create Your Account'
              : 'Reset Your Password'}
          </h2>
          <p className="text-xs text-[#8E8191]">
            {mode === 'login'
              ? 'Access saved addresses, order tracking, and exclusive pret drops'
              : mode === 'register'
              ? 'Join our circle of women celebrating effortless elegance'
              : 'Enter your email to receive recovery instructions'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {forgotSent ? (
          <div className="text-center py-6 space-y-3 text-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="font-serif text-base font-bold text-[#231826]">Recovery Link Dispatched</h4>
            <p className="text-[#5A4E5C]">
              We have sent password reset instructions to <strong>{email}</strong>.
            </p>
            <button
              onClick={() => {
                setForgotSent(false);
                setMode('login');
              }}
              className="text-[#8E1EA2] font-semibold hover:underline mt-2 block mx-auto"
            >
              Return to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'register' && (
              <div>
                <label className="block font-semibold text-[#231826] mb-1">Full Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Aroosa Liaqat"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#EFE6EE] focus:outline-hidden focus:border-[#8E1EA2]"
                  />
                  <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-[#231826] mb-1">Email Address *</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#EFE6EE] focus:outline-hidden focus:border-[#8E1EA2]"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block font-semibold text-[#231826] mb-1">Mobile Number (Optional)</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#EFE6EE] focus:outline-hidden focus:border-[#8E1EA2]"
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>
            )}

            {mode !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-[#231826]">Password *</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[#8E1EA2] hover:underline text-[11px]"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#EFE6EE] focus:outline-hidden focus:border-[#8E1EA2]"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block font-semibold text-[#231826] mb-1">Confirm Password *</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#EFE6EE] focus:outline-hidden focus:border-[#8E1EA2]"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#8E1EA2] hover:bg-[#751786] text-white font-semibold rounded-xl transition-all shadow-md active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>
                {loading
                  ? 'Processing...'
                  : mode === 'login'
                  ? 'Sign In to Account'
                  : mode === 'register'
                  ? 'Create My Account'
                  : 'Send Reset Link'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Toggle Mode */}
        <div className="text-center text-xs text-[#5A4E5C] pt-2 border-t border-[#EFE6EE]">
          {mode === 'login' ? (
            <p>
              Don't have an account yet?{' '}
              <button
                onClick={() => {
                  setError(null);
                  setMode('register');
                }}
                className="font-bold text-[#8E1EA2] hover:underline"
              >
                Register Here
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                onClick={() => {
                  setError(null);
                  setMode('login');
                }}
                className="font-bold text-[#8E1EA2] hover:underline"
              >
                Sign In Instead
              </button>
            </p>
          )}
        </div>

        {/* Quick Demo Credentials shortcut box for testing */}
        <div className="bg-[#F8F4EE] p-3.5 rounded-2xl border border-[#ED96D7]/40 space-y-2 text-[11px] text-[#5A4E5C]">
          <p className="font-bold text-[#8E1EA2] uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Demo Sign-In</span>
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="py-1.5 px-2 bg-white border border-[#EFE6EE] rounded-lg text-center hover:border-[#8E1EA2] font-semibold text-[#8E1EA2]"
            >
              👑 Admin Demo
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('customer')}
              className="py-1.5 px-2 bg-white border border-[#EFE6EE] rounded-lg text-center hover:border-[#8E1EA2] font-semibold text-[#231826]"
            >
              👗 Customer Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
