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
      <header className="sticky top-0 z-30 bg-card border-b border-border shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push('/admin')}><ArrowLeft className="w-5 h-5" /></Button>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none truncate">{event.eventName}</h1>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Event Details</p>
            </div>
          </div>
          <a href={`https://docs.google.com/spreadsheets/d/${event.sheetId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-border text-sm font-medium hover:bg-accent transition-colors">
            <ExternalLink className="w-4 h-4" /> Open Sheet
          </a>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{event.eventName}</CardTitle>
              <Badge variant="outline" className="font-mono text-xs">{event.eventId}</Badge>
            </div>
            <CardDescription>Event configuration and workspace details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <User className="w-5 h-5 text-primary shrink-0" />
                <div><p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Username</p><p className="text-sm font-bold">{event.username}</p></div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <Calendar className="w-5 h-5 text-primary shrink-0" />
                <div><p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Created</p><p className="text-sm font-bold">{event.createdAt ? new Date(event.createdAt).toLocaleDateString() : 'N/A'}</p></div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <FileSpreadsheet className="w-5 h-5 text-primary shrink-0" />
                <div className="min-w-0"><p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Google Sheet</p><p className="text-sm font-bold truncate">{event.sheetTitle || event.sheetId}</p></div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <FolderOpen className="w-5 h-5 text-primary shrink-0" />
                <div className="min-w-0"><p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Drive Folder</p><p className="text-sm font-bold truncate">{event.folderTitle || event.driveId}</p></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">AI Summary</CardTitle>
                {totalLeads > 0 && <Badge variant="secondary" className="ml-2">{totalLeads} leads</Badge>}
              </div>
              <Button variant="ghost" size="sm" onClick={() => generateSummary(event.eventId)} disabled={loadingSummary} className="gap-1.5">
                <RefreshCw className={`w-4 h-4 ${loadingSummary ? 'animate-spin' : ''}`} /> Regenerate
              </Button>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            {loadingSummary ? (
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded-lg skeleton w-full" />
                <div className="h-4 bg-muted rounded-lg skeleton w-4/5" />
                <div className="h-4 bg-muted rounded-lg skeleton w-3/5" />
              </div>
            ) : (
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{summary || 'No summary available.'}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}