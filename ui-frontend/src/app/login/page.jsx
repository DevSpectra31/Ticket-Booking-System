'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ErrorMessage from '@/components/ErrorMessage';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'ORGANISER') router.push('/organiser');
      else if (user.role === 'ADMIN') router.push('/admin');
      else router.push('/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-card slide-up">
        <h1>Welcome Back</h1>
        <p>Sign in to your ReserveX account</p>

        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-3 text-center" style={{ fontSize: '14px' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ fontWeight: 600 }}>Create one</Link>
        </p>

        <div className="mt-3" style={{ padding: '16px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--accent-primary)' }}>Test Accounts:</strong><br />
          Customer: customer@example.com / customer123<br />
          Organiser: organiser@example.com / organiser123<br />
          Admin: admin@example.com / admin123
        </div>
      </div>
    </div>
  );
}
