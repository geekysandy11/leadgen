"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ArrowRight, FolderPlus, FileSpreadsheet, Rocket, Share2, Link2, Copy, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  
  // Login Form State
  const [username, setUsername] = useState('');
  const [sheetId, setSheetId] = useState('');
  const [driveFolderId, setDriveFolderId] = useState('');
  const [serviceEmail, setServiceEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Check session on mount to redirect early if already logged in
  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => {
        if (res.ok) router.replace('/scanner');
      })
      .catch(() => {});
  }, [router]);

  // Fetch service email on mount
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

      router.push(data.redirectTo || '/scanner');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const fadeLeft = {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const fadeRight = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <main className="min-h-dvh bg-background text-foreground pb-48 lg:pb-32 font-sans selection:bg-primary/20 overflow-x-hidden">
      {/* Hero Section */}
      <header className="pt-20 pb-16 lg:pt-24 lg:pb-20 px-5 sm:px-6 text-center max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "backOut" }}
          className="flex items-center justify-center gap-3 mb-6 lg:mb-8"
        >
          <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl lg:rounded-3xl bg-primary/10 flex items-center justify-center shadow-inner">
            <Zap className="w-8 h-8 lg:w-10 lg:h-10 text-primary" />
          </div>
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5 lg:mb-6 text-balance leading-tight"
        >
          Connect Your Event Workspace
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 lg:mb-10 text-balance leading-relaxed"
        >
          EventLead securely syncs captured leads directly to your Google Drive and Sheets. 
          Follow this 3-step guide to set up your private workspace in minutes.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <button 
            onClick={() => document.getElementById('setup-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground py-3.5 px-8 lg:py-4 lg:px-10 rounded-xl lg:rounded-2xl font-bold text-base lg:text-lg hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
          >
            Start Setup Now <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
        </motion.div>
      </header>

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 space-y-24 lg:space-y-32">
        
        {/* Phase 1: Google Drive */}
        <section className="scroll-mt-20 overflow-hidden py-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <motion.div 
              variants={fadeLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="lg:col-span-5 space-y-6"
            >
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-bold text-sm mb-2">
                <FolderPlus className="w-4 h-4" /> Phase 1
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">Prepare Google Drive</h2>
              <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
                Create a folder where all visitor photos will be securely stored.
              </p>
              
              <ul className="space-y-6 mt-8">
                <li className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">1</div>
                  <div>
                    <h3 className="font-bold text-xl mb-1">Create a Folder</h3>
                    <p className="text-muted-foreground">In your Google Drive, create a new folder (e.g., "Event Leads 2026").</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">2</div>
                  <div>
                    <h3 className="font-bold text-xl mb-1">Copy Folder Link</h3>
                    <p className="text-muted-foreground">Click "Share", copy the link, and save it for the final step.</p>
                  </div>
                </li>
              </ul>
            </motion.div>
            
            <motion.div 
              variants={fadeRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="lg:col-span-7 relative"
            >
              <div className="absolute inset-0 bg-blue-500/5 rounded-3xl lg:rounded-[2rem] transform translate-x-3 translate-y-3 lg:translate-x-4 lg:translate-y-4 -z-10"></div>
              <div className="bg-card border-4 border-border rounded-3xl lg:rounded-[2rem] overflow-hidden shadow-xl lg:shadow-2xl aspect-[4/3] flex items-center justify-center bg-muted/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/guide/drive-create.png" alt="Google Drive Folder Link" className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Phase 2: Create Sheet */}
        <section className="scroll-mt-20 overflow-hidden py-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <motion.div 
              variants={fadeLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="lg:col-span-7 relative order-2 lg:order-1"
            >
              <div className="absolute inset-0 bg-green-500/5 rounded-3xl lg:rounded-[2rem] transform -translate-x-3 translate-y-3 lg:-translate-x-4 lg:translate-y-4 -z-10"></div>
              <div className="bg-card border-4 border-border rounded-3xl lg:rounded-[2rem] overflow-hidden shadow-xl lg:shadow-2xl aspect-[4/3] flex items-center justify-center bg-muted/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/guide/sheet-create.png" alt="Create Blank Sheet" className="w-full h-full object-cover" />
              </div>
            </motion.div>

            <motion.div 
              variants={fadeRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="lg:col-span-5 space-y-6 order-1 lg:order-2"
            >
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-sm mb-2">
                <FileSpreadsheet className="w-4 h-4" /> Phase 2
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">Create your Database</h2>
              <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
                Set up a fresh Google Sheet. Our system will automatically format it and add the correct headers when you connect.
              </p>
              
              <ul className="space-y-6 mt-8">
                <li className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">3</div>
                  <div>
                    <h3 className="font-bold text-xl mb-1">Start a Blank Sheet</h3>
                    <p className="text-muted-foreground">Go to Google Sheets and click the "Blank spreadsheet" template.</p>
                  </div>
                </li>
              </ul>
            </motion.div>
          </div>
        </section>

        {/* Phase 2: Share Sheet */}
        <section className="scroll-mt-20 overflow-hidden py-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <motion.div 
              variants={fadeLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="lg:col-span-5 space-y-6"
            >
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-sm mb-2">
                <Share2 className="w-4 h-4" /> Phase 2
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">Grant Bot Access</h2>
              <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
                Allow our AI processing bot to write leads into your spreadsheet securely.
              </p>
              
              <ul className="space-y-6 mt-8">
                <li className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">4</div>
                  <div>
                    <h3 className="font-bold text-xl mb-1">Share as Editor</h3>
                    <p className="text-muted-foreground mb-3">Click Share, and invite our Service Account Email as an <strong>Editor</strong>.</p>
                    <div className="bg-muted border border-border rounded-xl p-3 flex items-center gap-2">
                      <code className="text-xs lg:text-sm text-foreground truncate flex-1 font-mono select-all">lead-retrieval-bot@leadgen-506213.iam.gserviceaccount.com</code>
                    </div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">5</div>
                  <div>
                    <h3 className="font-bold text-xl mb-1">Copy Sheet Link</h3>
                    <p className="text-muted-foreground">Copy the Sheet link from the share dialog or your browser URL bar.</p>
                  </div>
                </li>
              </ul>
            </motion.div>
            
            <motion.div 
              variants={fadeRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="lg:col-span-7 relative"
            >
              <div className="absolute inset-0 bg-primary/5 rounded-3xl lg:rounded-[2rem] transform translate-x-3 translate-y-3 lg:translate-x-4 lg:translate-y-4 -z-10"></div>
              <div className="bg-card border-4 border-border rounded-3xl lg:rounded-[2rem] overflow-hidden shadow-xl lg:shadow-2xl aspect-[4/3] flex items-center justify-center bg-muted/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/guide/sheet-share.png" alt="Share Sheet as Editor" className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Phase 3: Launch (Actual Setup Form) */}
        <section id="setup-form" className="scroll-mt-20 overflow-hidden py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* The Login / Setup Form */}
            <motion.div 
              variants={fadeLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="lg:col-span-6 relative order-2 lg:order-1"
            >
              <div className="absolute inset-0 bg-purple-500/10 rounded-3xl lg:rounded-[2.5rem] transform -translate-x-3 translate-y-3 lg:-translate-x-4 lg:translate-y-4 -z-10"></div>
              
              <div className="bg-card border-2 border-border rounded-3xl lg:rounded-[2.5rem] p-5 sm:p-8 shadow-xl lg:shadow-2xl relative z-10">
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 sm:p-5 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Link2 className="w-4 h-4 text-primary" />
                    <p className="text-sm font-bold text-primary">Final Check: Grant Access</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Did you share your Sheet and Drive folder with this email as <strong>Editor</strong>?
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-background border border-border px-3 py-2 rounded-xl text-xs truncate select-all font-mono">
                      {serviceEmail || 'Loading...'}
                    </code>
                    <button
                      onClick={handleCopy}
                      className="p-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors shrink-0"
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

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

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">
                      Operator / Workspace Name
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. John @ TechCon 2026"
                      className="w-full px-4 py-3.5 rounded-xl bg-input border border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">
                      Google Sheet URL
                    </label>
                    <input
                      type="text"
                      value={sheetId}
                      onChange={(e) => setSheetId(e.target.value)}
                      placeholder="Paste Sheet URL here..."
                      className="w-full px-4 py-3.5 rounded-xl bg-input border border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">
                      Google Drive Folder URL
                    </label>
                    <input
                      type="text"
                      value={driveFolderId}
                      onChange={(e) => setDriveFolderId(e.target.value)}
                      placeholder="Paste Drive Folder URL here..."
                      className="w-full px-4 py-3.5 rounded-xl bg-input border border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <button
                  onClick={handleConnect}
                  disabled={isLoading}
                  className="w-full mt-6 py-4 bg-primary text-primary-foreground font-bold text-lg rounded-2xl hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Initializing Workspace...</>
                  ) : (
                    <><Rocket className="w-5 h-5" /> Launch Scanner</>
                  )}
                </button>
              </div>
            </motion.div>

            <motion.div 
              variants={fadeRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="lg:col-span-6 space-y-8 order-1 lg:order-2"
            >
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-bold text-sm mb-2">
                <Rocket className="w-4 h-4" /> Phase 3
              </div>
              <h2 className="text-4xl lg:text-6xl font-extrabold tracking-tight">Connect & Launch</h2>
              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
                You're all set! Just paste the links into this secure setup form and start scanning leads immediately. 
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                  <p className="text-muted-foreground font-medium">Automatic Column Formatting</p>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                  <p className="text-muted-foreground font-medium">End-to-End Encrypted Session Cookie</p>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                  <p className="text-muted-foreground font-medium">Multi-tenant Zero-DB Architecture</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

      </div>
      
      {/* Sticky Bottom Bar for mobile convenience */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-xl border-t border-border md:hidden z-50 flex justify-center">
        <button 
          onClick={() => document.getElementById('setup-form')?.scrollIntoView({ behavior: 'smooth' })}
          className="flex items-center justify-center gap-2 w-full max-w-sm bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg active:scale-[0.98] transition-transform shadow-lg shadow-primary/20"
        >
          Connect Workspace <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </main>
  );
}
