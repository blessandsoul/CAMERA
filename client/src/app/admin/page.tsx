'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json() as { success: boolean };

      if (data.success) {
        router.push('/admin/dashboard');
      } else {
        setError('Wrong password');
        setLoading(false);
      }
    } catch {
      setError('Network error');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-muted/50 px-4">
      <div className="w-full max-w-sm p-8 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
            <span className="text-background font-bold text-xs">TB</span>
          </div>
          <span className="font-semibold text-foreground text-lg">TechBrain Admin</span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="admin-password" className="text-sm text-muted-foreground mb-1.5">
              Password
            </Label>
            <Input
              id="admin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
            />
          </div>

          {error && (
            <p className="text-destructive text-sm" role="alert">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </div>
    </div>
  );
}
