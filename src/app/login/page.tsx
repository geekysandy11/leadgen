"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Zap, Loader2, ArrowRight, Shield, User } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  // Staff login state
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffLoading, setStaffLoading] = useState(false);

  // Admin login state
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => {
        if (res.ok) return res.json();
        setCheckingSession(false);
        return null;
      })
      .then(data => {
        if (data) {
          if (data.role === 'admin') router.replace('/admin');
          else router.replace('/scanner');
        }
      })
      .catch(() => setCheckingSession(false));
  }, [router]);

  const handleStaffLogin = async () => {
    if (!staffUsername.trim() || !staffPassword) { toast.error('Username and password are required.'); return; }
    setStaffLoading(true);
    try {
      const res = await fetch('/api/auth/event-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: staffUsername, password: staffPassword }),
      });
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
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsername, password: adminPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      toast.success('Welcome, Admin!');
      router.push(data.redirectTo || '/admin');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Login failed.'); }
    finally { setAdminLoading(false); }
  };

  if (checkingSession) {
    return (<main className="min-h-dvh bg-background flex items-center justify-center"><div className="spinner w-10 h-10" /></main>);
  }

  return (
    <main className="min-h-dvh bg-background text-foreground flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Branding */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Zap className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">EventLead</h1>
          <p className="text-sm text-muted-foreground mt-2">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <Tabs defaultValue="staff" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="staff" className="gap-2 h-11"><User className="w-4 h-4" /> Staff Login</TabsTrigger>
                <TabsTrigger value="admin" className="gap-2 h-11"><Shield className="w-4 h-4" /> Admin Login</TabsTrigger>
              </TabsList>

              {/* Staff Login Tab */}
              <TabsContent value="staff" className="space-y-4">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-lg">Staff Login</CardTitle>
                  <CardDescription>Enter your event credentials provided by the admin.</CardDescription>
                </CardHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="staff-username">Username</Label>
                    <Input id="staff-username" placeholder="Enter your username" value={staffUsername} onChange={e => setStaffUsername(e.target.value)} className="h-12" onKeyDown={e => e.key === 'Enter' && handleStaffLogin()} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="staff-password">Password</Label>
                    <Input id="staff-password" type="password" placeholder="Enter your password" value={staffPassword} onChange={e => setStaffPassword(e.target.value)} className="h-12" onKeyDown={e => e.key === 'Enter' && handleStaffLogin()} />
                  </div>
                  <Button onClick={handleStaffLogin} disabled={staffLoading} className="w-full h-12 text-base font-bold gap-2">
                    {staffLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Signing in...</> : <>Sign In <ArrowRight className="w-5 h-5" /></>}
                  </Button>
                </div>
              </TabsContent>

              {/* Admin Login Tab */}
              <TabsContent value="admin" className="space-y-4">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-lg">Admin Login</CardTitle>
                  <CardDescription>Access the admin CRM portal to manage events.</CardDescription>
                </CardHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-username">Admin Username</Label>
                    <Input id="admin-username" placeholder="Enter admin username" value={adminUsername} onChange={e => setAdminUsername(e.target.value)} className="h-12" onKeyDown={e => e.key === 'Enter' && handleAdminLogin()} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Admin Password</Label>
                    <Input id="admin-password" type="password" placeholder="Enter admin password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="h-12" onKeyDown={e => e.key === 'Enter' && handleAdminLogin()} />
                  </div>
                  <Button onClick={handleAdminLogin} disabled={adminLoading} className="w-full h-12 text-base font-bold gap-2">
                    {adminLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Signing in...</> : <>Access Admin Portal <Shield className="w-5 h-5" /></>}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
