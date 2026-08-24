"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/theme-toggle';
import { Plus, LogOut, ExternalLink, Pencil, Eye, Copy, CheckCircle2, Loader2, Calendar, User, FileSpreadsheet, FolderOpen, Zap, Shield } from 'lucide-react';

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

export default function AdminPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [serviceEmail, setServiceEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newEvent, setNewEvent] = useState({ eventName: '', username: '', password: '', sheetUrl: '', driveUrl: '' });
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editEvent, setEditEvent] = useState({ eventId: '', eventName: '', username: '', password: '', sheetUrl: '', driveUrl: '' });

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => { if (!res.ok) { router.replace('/login'); return null; } return res.json(); })
      .then(data => { if (data && data.role !== 'admin') { router.replace('/login'); return; } fetchEvents(); })
      .catch(() => router.replace('/login'));
    fetch('/api/admin/create-event').then(r => r.json()).then(d => { if (d.serviceEmail) setServiceEmail(d.serviceEmail); }).catch(() => {});
  }, [router]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/list-events');
      const data = await res.json();
      if (data.events) setEvents(data.events);
    } catch { toast.error('Failed to load events.'); }
    finally { setIsLoading(false); }
  };

  const handleCopy = () => { navigator.clipboard.writeText(serviceEmail); setCopied(true); toast.success('Service email copied!'); setTimeout(() => setCopied(false), 2000); };

  const handleCreate = async () => {
    if (!newEvent.eventName || !newEvent.username || !newEvent.password || !newEvent.sheetUrl || !newEvent.driveUrl) { toast.error('All fields are required.'); return; }
    setCreating(true);
    try {
      const res = await fetch('/api/admin/create-event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newEvent) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Event "${data.event.eventName}" created!`);
      setNewEvent({ eventName: '', username: '', password: '', sheetUrl: '', driveUrl: '' });
      setCreateOpen(false);
      fetchEvents();
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to create event.'); }
    finally { setCreating(false); }
  };

  const handleEdit = async () => {
    setEditing(true);
    try {
      const res = await fetch('/api/admin/update-event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editEvent) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Event updated!');
      setEditOpen(false);
      fetchEvents();
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to update event.'); }
    finally { setEditing(false); }
  };

  const openEdit = (ev: EventData) => {
    setEditEvent({ eventId: ev.eventId, eventName: ev.eventName, username: ev.username, password: '', sheetUrl: ev.sheetId, driveUrl: ev.driveId });
    setEditOpen(true);
  };

  const handleLogout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.replace('/login'); };

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 bg-card border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Shield className="w-6 h-6 text-primary" /></div>
            <div><h1 className="text-lg font-bold tracking-tight leading-none">EventLead Admin</h1><p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">CRM Portal</p></div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-red-500"><LogOut className="w-5 h-5" /></Button>`n          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs font-bold text-primary mb-2">Share this email with your Google Sheet & Drive Folder (as Editor):</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-background border border-border px-3 py-2 rounded-lg text-xs truncate select-all font-mono">{serviceEmail || 'Loading...'}</code>
              <Button size="sm" variant="default" onClick={handleCopy} className="shrink-0">{copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-sm px-3 py-1.5"><Zap className="w-3.5 h-3.5 mr-1.5" /> {events.length} Events</Badge>
          <Drawer open={createOpen} onOpenChange={setCreateOpen}>
            <Button className="gap-2 h-12 px-5" onClick={() => setCreateOpen(true)}><Plus className="w-5 h-5" /> New Event</Button>
            <DrawerContent>
              <DrawerHeader><DrawerTitle>Create New Event</DrawerTitle><DrawerDescription>Set up a new event with credentials and Google workspace links.</DrawerDescription></DrawerHeader>
              <div className="px-4 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2"><Label>Event Name</Label><Input placeholder="e.g. TechCon 2026" value={newEvent.eventName} onChange={e => setNewEvent({...newEvent, eventName: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Username</Label><Input placeholder="staff_user" value={newEvent.username} onChange={e => setNewEvent({...newEvent, username: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Password</Label><Input type="password" placeholder="Set password" value={newEvent.password} onChange={e => setNewEvent({...newEvent, password: e.target.value})} /></div>
                </div>
                <Separator />
                <div className="space-y-2"><Label>Google Sheet URL or ID</Label><Input placeholder="Paste Sheet URL..." value={newEvent.sheetUrl} onChange={e => setNewEvent({...newEvent, sheetUrl: e.target.value})} /></div>
                <div className="space-y-2"><Label>Google Drive Folder URL or ID</Label><Input placeholder="Paste Folder URL..." value={newEvent.driveUrl} onChange={e => setNewEvent({...newEvent, driveUrl: e.target.value})} /></div>
              </div>
              <DrawerFooter>
                <Button onClick={handleCreate} disabled={creating} className="w-full h-12">{creating ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Creating...</> : 'Create Event'}</Button>
                <DrawerClose><Button variant="outline" className="w-full" type="button">Cancel</Button></DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary mb-4" /><p className="text-sm text-muted-foreground">Loading events...</p></div>
        ) : events.length === 0 ? (
          <Card className="border-dashed"><CardContent className="flex flex-col items-center justify-center py-16"><Zap className="w-12 h-12 text-muted-foreground/30 mb-4" /><p className="text-lg font-bold mb-1">No events yet</p><p className="text-sm text-muted-foreground">Create your first event to get started.</p></CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map(ev => (
              <Card key={ev.eventId} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0"><CardTitle className="text-lg truncate">{ev.eventName}</CardTitle><CardDescription className="flex items-center gap-1.5 mt-1"><User className="w-3 h-3" /> {ev.username}</CardDescription></div>
                    <Badge variant="outline" className="shrink-0 text-[10px] font-mono">{ev.eventId}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground"><FileSpreadsheet className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{ev.sheetTitle || ev.sheetId}</span></div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground"><FolderOpen className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{ev.folderTitle || ev.driveId}</span></div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground"><Calendar className="w-3.5 h-3.5 shrink-0" /><span>{ev.createdAt ? new Date(ev.createdAt).toLocaleDateString() : 'N/A'}</span></div>
                  <Separator />
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex-1 h-10" onClick={() => router.push(`/admin/event/${ev.eventId}`)}><Eye className="w-4 h-4 mr-1.5" /> Details</Button>
                    <Button variant="outline" size="sm" className="flex-1 h-10" onClick={() => openEdit(ev)}><Pencil className="w-4 h-4 mr-1.5" /> Edit</Button>
                    <a href={`https://docs.google.com/spreadsheets/d/${ev.sheetId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-10 w-10 shrink-0 rounded-md hover:bg-accent transition-colors"><ExternalLink className="w-4 h-4 text-muted-foreground" /></a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Drawer open={editOpen} onOpenChange={setEditOpen}>
        <DrawerContent>
          <DrawerHeader><DrawerTitle>Edit Event</DrawerTitle><DrawerDescription>Update event credentials or workspace links. Leave password blank to keep unchanged.</DrawerDescription></DrawerHeader>
          <div className="px-4 space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2"><Label>Event Name</Label><Input value={editEvent.eventName} onChange={e => setEditEvent({...editEvent, eventName: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Username</Label><Input value={editEvent.username} onChange={e => setEditEvent({...editEvent, username: e.target.value})} /></div>
              <div className="space-y-2"><Label>New Password (optional)</Label><Input type="password" placeholder="Leave blank to keep" value={editEvent.password} onChange={e => setEditEvent({...editEvent, password: e.target.value})} /></div>
            </div>
            <Separator />
            <div className="space-y-2"><Label>Google Sheet URL or ID</Label><Input value={editEvent.sheetUrl} onChange={e => setEditEvent({...editEvent, sheetUrl: e.target.value})} /></div>
            <div className="space-y-2"><Label>Google Drive Folder URL or ID</Label><Input value={editEvent.driveUrl} onChange={e => setEditEvent({...editEvent, driveUrl: e.target.value})} /></div>
          </div>
          <DrawerFooter>
            <Button onClick={handleEdit} disabled={editing} className="w-full h-12">{editing ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Saving...</> : 'Save Changes'}</Button>
            <DrawerClose><Button variant="outline" className="w-full" type="button">Cancel</Button></DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </main>
  );
}





