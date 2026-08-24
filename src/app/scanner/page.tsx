"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LeadCaptureForm } from "@/components/LeadCaptureForm";
import { Button } from '@/components/ui/button';
import Image from "next/image";
import { Zap, LayoutDashboard, LogOut, User, FileSpreadsheet, FolderOpen, Loader2, History, HomeIcon } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useTypewriter } from '@/hooks/useTypewriter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger } from '@/components/ui/drawer';

interface SessionData {
  username: string;
  sheetTitle: string;
  folderName: string;
  eventName?: string;
  role?: string;
}

export default function Home() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  const { text: typedEventName } = useTypewriter(session?.eventName || 'Capturing Event Lead', 50);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => {
        if (!res.ok) { router.replace('/login'); return null; }
        return res.json();
      })
      .then(data => {
        if (data) {
          setSession(data);
          fetchRecentLeads();
        }
        setCheckingSession(false);
      })
      .catch(() => router.replace('/login'));
  }, [router]);

  const fetchRecentLeads = async () => {
    setLoadingLeads(true);
    try {
      const res = await fetch('/api/get-leads');
      const data = await res.json();
      if (data.leads) {
        setRecentLeads(data.leads.reverse().slice(0, 5));
      }
    } catch (error) {
      console.error("Failed to fetch leads", error);
    } finally {
      setLoadingLeads(false);
    }
  };

  const handleDisconnect = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
  };

  if (checkingSession) {
    return (<main className="min-h-dvh bg-background flex items-center justify-center"><div className="spinner w-10 h-10" /></main>);
  }

  return (
    <main className="min-h-dvh bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-md mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 flex items-center justify-center shrink-0 relative overflow-hidden">
              <Image src="/logo.png" alt="Logo" fill className="object-contain scale-[2.5]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold tracking-tight text-foreground leading-none truncate">
                {typedEventName}
              </h1>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">The Catalysts Group</p>
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
            <Drawer>
              <DrawerTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary">
                <History className="w-5 h-5" />
              </DrawerTrigger>
              <DrawerContent className="sm:max-w-xl mx-auto max-h-[85vh]">
                <DrawerHeader>
                  <DrawerTitle>Event Dashboard</DrawerTitle>
                  <DrawerDescription>Workspace links and recent leads</DrawerDescription>
                </DrawerHeader>
                <div className="px-4 overflow-y-auto pb-6 space-y-6">
                  {/* Workspace Links */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/50">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="truncate">Sheet: {session?.sheetTitle || 'Loading...'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/50">
                      <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="truncate">Drive: {session?.folderName || 'Loading...'}</span>
                    </div>
                  </div>

                  {/* Recent Leads */}
                  <Card className="bg-card/40 backdrop-blur-sm border-border/60 shadow-none">
                    <CardHeader className="pb-3 border-b border-border/40 px-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold">Recent Leads</CardTitle>
                        <Badge variant="secondary" className="bg-background border-border/50 text-xs shadow-sm">Latest 5</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {loadingLeads ? (
                        <div className="flex justify-center p-6"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
                      ) : recentLeads.length > 0 ? (
                        <div className="divide-y divide-border/40">
                          {recentLeads.map((lead, idx) => (
                            <div key={idx} className="p-4 flex flex-col gap-1 hover:bg-muted/20 transition-colors">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-foreground">{lead.Name || lead.name || 'Unknown'}</span>
                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{lead.Company || lead.company || 'No Company'}</span>
                              </div>
                              <span className="text-xs text-muted-foreground truncate">{lead.Email || lead.email || lead.Mobile || lead.mobile || 'No contact info'}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-sm text-muted-foreground">
                          No leads captured yet.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </DrawerContent>
            </Drawer>
            <ThemeToggle />
            
            <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
              <HomeIcon className="w-5 h-5" />
            </Button>

            {session?.role === 'admin' && (
              <Button variant="ghost" size="sm" onClick={() => router.push('/admin')} className="text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-full transition-colors gap-2 px-3">
                <LayoutDashboard className="w-4 h-4" /> <span className="hidden sm:inline">Admin</span>
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={handleDisconnect} className="h-10 w-10 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col">
        <LeadCaptureForm />
      </div>
    </main>
  );
}


