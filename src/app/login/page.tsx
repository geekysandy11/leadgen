"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/theme-toggle';
import { toast } from 'sonner';
import { Zap, Loader2, ArrowRight, ShieldCheck, UserCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffLoading, setStaffLoading] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => { if (res.ok) return res.json(); setCheckingSession(false); return null; })
      .then(data => { if (data) { if (data.role === 'admin') router.replace('/admin'); else router.replace('/scanner'); } })
      .catch(() => setCheckingSession(false));
  }, [router]);

  const handleStaffLogin = async () => {
    if (!staffUsername.trim() || !staffPassword) { toast.error('Username and password are required.'); return; }
    setStaffLoading(true);
    try {
      const res = await fetch('/api/auth/event-login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: staffUsername, password: staffPassword }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      toast.success('Login successful!');
      router.push(data.redirectTo || '/scanner');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Login failed.'); }
    finally { setStaffLoading(false); }
  };

  const handleAdminLogin = async () => {
    if (!adminUsername.trim() || !adminPassword) { toast.error('Username and password are required.'); return; }
    setAdminLoading(true);
    try {
      const res = await fetch('/api/auth/admin-login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: adminUsername, password: adminPassword }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      toast.success('Welcome, Admin!');
      router.push(data.redirectTo || '/admin');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Login failed.'); }
    finally { setAdminLoading(false); }
  };

  if (checkingSession) return (<main className="min-h-dvh bg-background flex items-center justify-center"><div className="spinner w-10 h-10" /></main>);

  return (
    <main className="min-h-dvh bg-background text-foreground flex flex-col items-center justify-center px-4 py-12 relative">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md space-y-8">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.4 }} className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg shadow-primary/10">
              <Zap className="w-9 h-9 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">EventLead</h1>
          <p className="text-sm text-muted-foreground mt-2">Sign in to your account</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <Card className="shadow-xl border-border/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <Tabs defaultValue="staff" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
                  <TabsTrigger value="staff" className="gap-2 h-10 text-sm font-semibold"><UserCircle className="w-4 h-4" /> Staff Login</TabsTrigger>
                  <TabsTrigger value="admin" className="gap-2 h-10 text-sm font-semibold"><ShieldCheck className="w-4 h-4" /> Admin Login</TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  <TabsContent value="staff" className="space-y-4">
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                      <CardHeader className="px-0 pt-0"><CardTitle className="text-lg">Staff Login</CardTitle><CardDescription>Enter your event credentials provided by the admin.</CardDescription></CardHeader>
                      <div className="space-y-4">
                        <div className="space-y-2"><Label htmlFor="staff-username">Username</Label><Input id="staff-username" placeholder="Enter your username" value={staffUsername} onChange={e => setStaffUsername(e.target.value)} className="h-12" onKeyDown={e => e.key === 'Enter' && handleStaffLogin()} /></div>
                        <div className="space-y-2"><Label htmlFor="staff-password">Password</Label><Input id="staff-password" type="password" placeholder="Enter your password" value={staffPassword} onChange={e => setStaffPassword(e.target.value)} className="h-12" onKeyDown={e => e.key === 'Enter' && handleStaffLogin()} /></div>
                        <Button onClick={handleStaffLogin} disabled={staffLoading} className="w-full h-12 text-base font-bold gap-2 transition-all duration-200 active:scale-[0.98]">
                          {staffLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Signing in...</> : <>Sign In <ArrowRight className="w-5 h-5" /></>}
                        </Button>
                      </div>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="admin" className="space-y-4">
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                      <CardHeader className="px-0 pt-0"><CardTitle className="text-lg">Admin Login</CardTitle><CardDescription>Access the CRM portal to manage events.</CardDescription></CardHeader>
                      <div className="space-y-4">
                        <div className="space-y-2"><Label htmlFor="admin-username">Admin Username</Label><Input id="admin-username" placeholder="Enter admin username" value={adminUsername} onChange={e => setAdminUsername(e.target.value)} className="h-12" onKeyDown={e => e.key === 'Enter' && handleAdminLogin()} /></div>
                        <div className="space-y-2"><Label htmlFor="admin-password">Admin Password</Label><Input id="admin-password" type="password" placeholder="Enter admin password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="h-12" onKeyDown={e => e.key === 'Enter' && handleAdminLogin()} /></div>
                        <Button onClick={handleAdminLogin} disabled={adminLoading} className="w-full h-12 text-base font-bold gap-2 transition-all duration-200 active:scale-[0.98]">
                          {adminLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Signing in...</> : <>Access Admin Portal <ShieldCheck className="w-5 h-5" /></>}
                        </Button>
                      </div>
                    </motion.div>
                  </TabsContent>
                </AnimatePresence>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </main>
  );
}
