"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Copy, CheckCircle2, AlertCircle, Loader2, ArrowRight, Link2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [sheetId, setSheetId] = useState('');
  const [driveFolderId, setDriveFolderId] = useState('');
  const [serviceEmail, setServiceEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  // Check if already logged in
  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => {
        if (res.ok) router.replace('/scanner');
        else setCheckingSession(false);
      })
      .catch(() => setCheckingSession(false));
  }, [router]);

  // Fetch service email
  useEffect(() => {
    fetch('/api/auth/connect')
      .then(res => res.json())
      .then(data => {
        if (data.serviceEmail) setServiceEmail(data.serviceEmail);
      })
      .catch(() => setServiceEmail('Error loading email'));
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(serviceEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnect = async () => {
    if (!username.trim() || !sheetId.trim() || !driveFolderId.trim()) {
      setErrorMsg('All fields are required.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, sheetId, driveFolderId }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Connection failed');

      router.push(data.redirectTo || '/');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <main className="min-h-dvh bg-background flex items-center justify-center">
        <div className="spinner w-10 h-10" />
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="pt-12 pb-6 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-3 mb-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Zap className="w-7 h-7 text-primary" />
          </div>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-3xl font-extrabold tracking-tight"
        >
          EventLead
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-sm text-muted-foreground mt-2"
        >
          Connect your workspace to start capturing leads
        </motion.p>
      </header>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="flex-1 px-5 pb-10 max-w-md mx-auto w-full"
      >
        {/* Step 1: Share Service Email */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="w-4 h-4 text-primary" />
            <p className="text-sm font-bold text-primary">Step 1: Grant Access</p>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Share your Google Sheet and Drive Folder with this email as <strong>Editor</strong>.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-background border border-border px-3 py-2.5 rounded-xl text-xs truncate select-all font-mono">
              {serviceEmail || 'Loading...'}
            </code>
            <button
              onClick={handleCopy}
              className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors shrink-0"
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl flex items-start gap-3 mb-5 shadow-sm"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{errorMsg}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 2: Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">
              Step 2: Operator / Workspace Name
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. John @ TechCon 2025"
              className="w-full px-4 py-3.5 rounded-xl bg-input border border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">
              Step 3: Google Sheet ID or URL
            </label>
            <input
              type="text"
              value={sheetId}
              onChange={(e) => setSheetId(e.target.value)}
              placeholder="Paste Sheet URL or ID..."
              className="w-full px-4 py-3.5 rounded-xl bg-input border border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">
              Step 4: Google Drive Folder ID or URL
            </label>
            <input
              type="text"
              value={driveFolderId}
              onChange={(e) => setDriveFolderId(e.target.value)}
              placeholder="Paste Drive Folder URL or ID..."
              className="w-full px-4 py-3.5 rounded-xl bg-input border border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
            />
          </div>
        </div>

        {/* Connect Button */}
        <button
          onClick={handleConnect}
          disabled={isLoading}
          className="w-full mt-8 py-4 bg-primary text-primary-foreground font-bold text-lg rounded-2xl hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Connecting...
            </>
          ) : (
            <>
              Connect & Launch Scanner <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </motion.div>
    </main>
  );
}
