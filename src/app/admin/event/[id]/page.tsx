"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ArrowLeft, ExternalLink, RefreshCw, Loader2, User, FileSpreadsheet, FolderOpen, Calendar, Sparkles } from 'lucide-react';

interface EventData {
  eventId: string;
  eventName: string;
  username: string;
  sheetId: string;
  driveId: string;
  createdAt: string;
  sheetTitle: string;
  folderTitle: string;
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [event, setEvent] = useState<EventData | null>(null);
  const [summary, setSummary] = useState('');
  const [totalLeads, setTotalLeads] = useState(0);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => { if (!res.ok) { router.replace('/login'); return null; } return res.json(); })
      .then(data => { if (data && data.role !== 'admin') { router.replace('/login'); return; } fetchEventData(); })
      .catch(() => router.replace('/login'));
  }, [router, id]);

  const fetchEventData = async () => {
    setLoadingEvent(true);
    try {
      const res = await fetch('/api/admin/list-events');
      const data = await res.json();
      if (data.events) {
        const found = data.events.find((e: EventData) => e.eventId === id);
        if (found) { setEvent(found); generateSummary(id); }
        else { toast.error('Event not found.'); router.push('/admin'); }
      }
    } catch { toast.error('Failed to load event.'); }
    finally { setLoadingEvent(false); }
  };

  const generateSummary = async (eventId: string) => {
    setLoadingSummary(true);
    try {
      const res = await fetch('/api/admin/event-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });
      const data = await res.json();
      if (data.summary) setSummary(data.summary);
      if (data.totalLeads) setTotalLeads(data.totalLeads);
    } catch { setSummary('Failed to generate summary.'); }
    finally { setLoadingSummary(false); }
  };

  if (loadingEvent) {
    return (<main className="min-h-dvh bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></main>);
  }

  if (!event) return null;

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/admin')} className="rounded-full hover:bg-muted gap-2 pr-4"><ArrowLeft className="w-4 h-4" /> Back</Button>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none truncate">{event.eventName}</h1>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">Event Details</p>
            </div>
          </div>
          <a href={`https://docs.google.com/spreadsheets/d/${event.sheetId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-border/50 bg-background hover:bg-accent hover:border-accent text-sm font-medium transition-all shadow-sm">
            <ExternalLink className="w-4 h-4 text-emerald-500" /> Open Sheet
          </a>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <Card className="bg-card/40 backdrop-blur-sm border-border/60 shadow-lg overflow-hidden">
          <CardHeader className="pb-4 bg-muted/20 border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{event.eventName}</CardTitle>
              <Badge variant="outline" className="font-mono text-xs bg-background/50 border-border/50">{event.eventId}</Badge>
            </div>
            <CardDescription>Event configuration and workspace details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-background border border-border/40 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><User className="w-5 h-5 text-blue-500" /></div>
                <div><p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-0.5">Username</p><p className="text-sm font-bold">{event.username}</p></div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-background border border-border/40 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><Calendar className="w-5 h-5 text-purple-500" /></div>
                <div><p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-0.5">Created</p><p className="text-sm font-bold">{event.createdAt ? new Date(event.createdAt).toLocaleDateString() : 'N/A'}</p></div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-background border border-border/40 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><FileSpreadsheet className="w-5 h-5 text-emerald-500" /></div>
                <div className="min-w-0"><p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-0.5">Google Sheet</p><p className="text-sm font-bold truncate">{event.sheetTitle || event.sheetId}</p></div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-background border border-border/40 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><FolderOpen className="w-5 h-5 text-amber-500" /></div>
                <div className="min-w-0"><p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-0.5">Drive Folder</p><p className="text-sm font-bold truncate">{event.folderTitle || event.driveId}</p></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-primary/30 shadow-[0_0_40px_rgba(var(--primary),0.1)]">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
          <CardHeader className="relative z-10 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center"><Sparkles className="w-4 h-4 text-primary" /></div>
                <CardTitle className="text-lg">AI Summary</CardTitle>
                {totalLeads > 0 && <Badge variant="secondary" className="ml-2 bg-background border-border/50 text-xs px-2 shadow-sm">{totalLeads} leads</Badge>}
              </div>
              <Button variant="ghost" size="sm" onClick={() => generateSummary(event.eventId)} disabled={loadingSummary} className="gap-1.5 rounded-full hover:bg-background shadow-sm border border-transparent hover:border-border/50 transition-all">
                <RefreshCw className={`w-3.5 h-3.5 ${loadingSummary ? 'animate-spin text-primary' : ''}`} /> <span className="hidden sm:inline">Regenerate</span>
              </Button>
            </div>
          </CardHeader>
          <Separator className="opacity-50 relative z-10 mx-6 w-auto" />
          <CardContent className="pt-6 relative z-10">
            {loadingSummary ? (
              <div className="space-y-4">
                <div className="h-4 bg-muted/60 rounded-md animate-pulse w-full" />
                <div className="h-4 bg-muted/60 rounded-md animate-pulse w-5/6" />
                <div className="h-4 bg-muted/60 rounded-md animate-pulse w-4/6" />
              </div>
            ) : (
              <div className="bg-background/40 p-5 rounded-xl border border-border/30 shadow-inner backdrop-blur-sm">
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{summary || 'No summary available.'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}