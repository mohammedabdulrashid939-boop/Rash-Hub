import React, { useState } from 'react';
import { Database, CheckCircle, AlertCircle, ExternalLink, Copy, Check, Key, ShieldCheck, X } from 'lucide-react';
import {
  isSupabaseConfigured,
  SUPABASE_URL,
  saveRuntimeSupabaseConfig,
  clearRuntimeSupabaseConfig,
  testSupabaseConnection,
} from '../lib/supabase';
import { SUPABASE_SQL_MIGRATION } from '../lib/sqlScripts';

export const SupabaseSetupModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [urlInput, setUrlInput] = useState(SUPABASE_URL || '');
  const [keyInput, setKeyInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ connected: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_MIGRATION);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection();
    setTestResult(res);
    setTesting(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || !keyInput.trim()) return;
    saveRuntimeSupabaseConfig(urlInput, keyInput);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0D121F] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#080B11]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Supabase Backend Configuration</h2>
              <p className="text-xs text-gray-400">Rash Hub Store Database & Authentication Setup</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-sm text-gray-300">
          {/* Status Alert */}
          {isSupabaseConfigured() ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-white">Supabase Connected to App</p>
                <p className="text-xs text-emerald-300/80 mt-0.5">
                  Connected endpoint: <code className="bg-black/40 px-1 py-0.5 rounded">{SUPABASE_URL}</code>
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={handleTest}
                    disabled={testing}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 transition"
                  >
                    {testing ? 'Testing Tables...' : 'Verify Schema & Tables'}
                  </button>
                  <button
                    onClick={clearRuntimeSupabaseConfig}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-white">Supabase Project Not Yet Connected</p>
                <p className="text-xs text-amber-300/80 mt-1">
                  Rash Hub Store is ready to link with your live Supabase project. You can provide your credentials below or in <code className="text-white">.env</code>.
                </p>
              </div>
            </div>
          )}

          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs ${
                testResult.connected
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : 'bg-red-950/40 border-red-800 text-red-300'
              }`}
            >
              {testResult.message}
            </div>
          )}

          {/* Quick Setup Form */}
          <form onSubmit={handleSave} className="space-y-4 p-4 rounded-xl bg-[#080B11] border border-gray-800">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-[#00E676]" />
              Connect Supabase Project
            </h3>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Project URL (<code className="text-[#00E676]">VITE_SUPABASE_URL</code>)
              </label>
              <input
                type="text"
                placeholder="https://your-project.supabase.co"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full px-3 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white text-xs focus:outline-none focus:border-[#00E676]"
                required
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Use your Project URL (e.g. <code>https://xxx.supabase.co</code>). Any accidental <code>/rest/v1</code> or trailing slashes will be automatically stripped.
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Public Anon Key (<code className="text-[#00E676]">VITE_SUPABASE_ANON_KEY</code>)
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="w-full px-3 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white text-xs focus:outline-none focus:border-[#00E676]"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-lg bg-[#00E676] text-black font-semibold text-xs hover:bg-[#00FF7F] transition flex items-center justify-center gap-2"
            >
              <Database className="w-4 h-4" />
              Save & Connect Supabase
            </button>
          </form>

          {/* Setup Steps */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00E676]" />
              Setup Guide in 3 Simple Steps
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-xs text-gray-300">
              <li>
                <span className="font-medium text-white">Create a free Supabase Project:</span> Visit{' '}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#00E676] underline inline-flex items-center gap-1"
                >
                  supabase.com <ExternalLink className="w-3 h-3" />
                </a>{' '}
                and create a project.
              </li>
              <li>
                <span className="font-medium text-white">Execute Database Migration & RLS:</span> Go to the SQL
                Editor in Supabase, paste the script below, and click <span className="text-[#00E676]">Run</span>.
              </li>
              <li>
                <span className="font-medium text-white">Assign First Admin:</span> After registering your account,
                run <code className="text-[#00E676]">UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';</code>.
              </li>
            </ol>
          </div>

          {/* Copy SQL Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Complete SQL Migration & RLS Rules</span>
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-gray-800 hover:bg-gray-700 text-white transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#00E676]" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied SQL!' : 'Copy Migration SQL'}
              </button>
            </div>
            <pre className="max-h-40 overflow-y-auto p-3 bg-black/70 rounded-lg text-[11px] font-mono text-gray-400 border border-gray-800">
              {SUPABASE_SQL_MIGRATION}
            </pre>
          </div>
        </div>

        <div className="p-4 border-t border-gray-800 bg-[#080B11] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export const SupabaseStatusBadge: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const configured = isSupabaseConfigured();

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition ${
          configured
            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800 hover:bg-emerald-900/60'
            : 'bg-amber-950/60 text-amber-400 border border-amber-800 hover:bg-amber-900/60'
        }`}
        title="Supabase Backend Status"
      >
        <span
          className={`w-2 h-2 rounded-full ${
            configured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
          }`}
        />
        <span className="hidden sm:inline">
          {configured ? 'Supabase Live' : 'Supabase Config'}
        </span>
      </button>

      <SupabaseSetupModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};
