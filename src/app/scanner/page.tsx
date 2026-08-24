"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LeadCaptureForm } from "@/components/LeadCaptureForm";
import { Button } from '@/components/ui/button';
import { Zap, LayoutDashboard, LogOut, User } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

interface SessionData {
  username: string;
  sheetTitle: string;
  folderName: string;
  eventName?: string;
}

export default function Home() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => {
        if (!res.ok) { router.replace('/login'); return null; }
        return res.json();
      })
      .then(data => {
        if (data) setSession(data);
        setCheckingSession(false);
      })
      .catch(() => router.replace('/login'));
  }, [router]);

  const handleDisconnect = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
  };

  if (checkingSession) {
    return (<main className="min-h-dvh bg-background flex items-center justify-center"><div className="spinner w-10 h-10" /></main>);
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-md mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.2)]">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold tracking-tight text-foreground leading-none">
                {session?.eventName || 'EventLead'}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="flex items-center gap-1 bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded-md border border-green-500/20">
                  <User className="w-2.5 h-2.5" />
                  <p className="text-[9px] font-bold uppercase tracking-wider truncate">
                    {session?.username}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="h-10 w-10 rounded-full hover:bg-muted transition-colors">
              <LayoutDashboard className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDisconnect} className="h-10 w-10 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <LeadCaptureForm />
    </main>
  );
}


