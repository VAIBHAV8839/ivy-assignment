import React, { useState } from 'react';
import { Building2, KeyRound, Mail, AlertCircle, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import { api } from '../api';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('demo1@ivy.homes');
  const [password, setPassword] = useState('d5ea62d081');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await api.login(email, password);
      onLoginSuccess(data.user || { email });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('d5ea62d081');
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 mb-4">
            <Building2 className="w-9 h-9 text-slate-950" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Ivy Homes Portal
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            Chennai Real Estate Intelligence & Property Verification
          </p>
        </div>

        {/* Demo Account Quick-Select Buttons */}
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-750">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 text-center">
            Demo Test Accounts (Click to Fill)
          </span>
          <div className="grid grid-cols-3 gap-2">
            {['demo1', 'demo2', 'demo3'].map((acc) => (
              <button
                key={acc}
                type="button"
                onClick={() => setDemoAccount(`${acc}@ivy.homes`)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition border ${
                  email === `${acc}@ivy.homes`
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {acc}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo1@ivy.homes"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Account Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating Session...</span>
            ) : (
              <>
                <span>Sign In to Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security & Expiry Note */}
        <div className="text-center pt-2 text-[11px] text-slate-500 space-y-1">
          <div className="flex items-center justify-center space-x-1 text-emerald-400/80">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Automatic 15-Minute Token Silent Refresh Active</span>
          </div>
          <p>Session persists across browser reload and re-login</p>
        </div>
      </div>
    </div>
  );
}
