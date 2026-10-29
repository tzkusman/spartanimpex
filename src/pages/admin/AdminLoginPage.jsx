import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import logoImg from '../../assets/spartan-logo.png';
import Button from '../../components/common/Button';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Save token and user details
      localStorage.setItem('spartan_admin_token', data.token);
      localStorage.setItem('spartan_admin_user', JSON.stringify(data.user));

      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #00E5FF 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #1E50C8 0%, transparent 70%)' }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-navy-card/90 backdrop-blur-xl border border-navy-border rounded-3xl p-8 sm:p-10 shadow-2xl relative">
          {/* Subtle Top Cyan Accent Bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-DEFAULT to-transparent rounded-t-3xl" />

          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-navy border border-navy-border p-2 mb-4 shadow-lg flex items-center justify-center">
              <img
                src={logoImg}
                alt="Spartan Impex"
                className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]"
              />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-semibold text-cyan-400 uppercase tracking-widest mb-2">
              <Shield size={12} />
              <span>ADMINISTRATIVE PORTAL</span>
            </div>

            <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
              Spartan Impex Control
            </h1>
            <p className="text-xs text-navy-300 mt-1">
              Restricted management portal for executive leadership
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-3 animate-fadeIn">
              <AlertCircle size={16} className="text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} autoComplete="off" className="space-y-5">
            <div>
              <label className="block text-xs uppercase font-semibold tracking-wider text-navy-200 mb-2">
                Administrator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-navy-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="off"
                  placeholder="admin@spartanimpex.com"
                  className="w-full pl-10 pr-4 py-3 bg-navy text-white text-sm rounded-xl border border-navy-border focus:border-cyan-DEFAULT focus:outline-none focus:ring-1 focus:ring-cyan-DEFAULT transition-colors placeholder:text-navy-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-semibold tracking-wider text-navy-200 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-navy-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Enter administrator password"
                  className="w-full pl-10 pr-10 py-3 bg-navy text-white text-sm rounded-xl border border-navy-border focus:border-cyan-DEFAULT focus:outline-none focus:ring-1 focus:ring-cyan-DEFAULT transition-colors placeholder:text-navy-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-navy-400 hover:text-cyan-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              size="md"
              className="w-full shadow-lg shadow-cyan-500/20"
              icon={ArrowRight}
              iconPosition="right"
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
            </Button>
          </form>

          {/* Return link */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-xs text-navy-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1"
            >
              <span>&larr; Return to Public Portfolio</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
