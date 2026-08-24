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
      <header className="sticky top-0 z-30 bg-card border-b border-border shadow-sm">
        <div className="max-w-md mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold tracking-tight text-foreground leading-none">
                {session?.eventName || 'EventLead'}
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <User className="w-3 h-3 text-green-500" />
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider truncate">
                  {session?.username}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <ThemeToggle />`n            <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="h-10 w-10">
              <LayoutDashboard className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDisconnect} className="h-10 w-10 hover:bg-red-50 hover:text-red-500">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <LeadCaptureForm />
    </main>
  );
}


