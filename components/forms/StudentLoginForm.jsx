'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

export function StudentLoginForm({ locale = 'da' }) {
  const router = useRouter();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Verify it's a candidate account
      if (data.user.role !== 'candidate') {
        setError(locale === 'da' ? 'Denne konto er ikke en studentkonto' : 'This account is not a student account');
        setLoading(false);
        return;
      }

      // Store in Redux (this will automatically save to localStorage via StoreProvider)
      dispatch(setCredentials({ user: data.user, token: data.token }));
      
      // Also store token separately for API calls (backward compatibility)
      localStorage.setItem('token', data.token);
      
      // Redirect to dashboard
      router.push(`/${locale}/dashboard/candidate`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="student-email">{locale === 'da' ? 'E-mail' : 'Email'}</Label>
        <Input
          id="student-email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="student-password">{locale === 'da' ? 'Adgangskode' : 'Password'}</Label>
        <Input
          id="student-password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {locale === 'da' ? 'Logger ind...' : 'Signing in...'}
          </>
        ) : (
          locale === 'da' ? 'Log ind' : 'Sign in'
        )}
      </Button>
    </form>
  );
}
