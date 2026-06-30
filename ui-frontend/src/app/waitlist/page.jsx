'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function WaitlistPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const fetchWaitlist = async () => {
    try {
      const res = await api.get('/waitlist/my');
      setEntries(res.data.data || []);
    } catch (err) {
      setError('Failed to load waitlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    fetchWaitlist();
  }, [authLoading, isAuthenticated]);

  const handleLeave = async (waitlistId) => {
    if (!confirm('Leave this waitlist?')) return;
    try {
      await api.delete(`/waitlist/${waitlistId}`);
      fetchWaitlist();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to leave waitlist');
    }
  };

  const handleAccept = async (waitlistId) => {
    try {
      const res = await api.post(`/waitlist/${waitlistId}/accept`);
      const booking = res.data.data.booking;
      router.push(`/bookings/${booking._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept offer');
      fetchWaitlist();
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      WAITING: 'badge-waiting', OFFERED: 'badge-offered',
      BOOKED: 'badge-confirmed', EXPIRED: 'badge-expired',
      CANCELLED: 'badge-cancelled',
    };
    return map[status] || '';
  };

  return (
    <ProtectedRoute>
      <div className="page-container">
        <div className="page-header">
          <h1>⏳ My Waitlist</h1>
          <p>Track your waitlist entries and offers</p>
        </div>

        <ErrorMessage message={error} />

        {loading ? (
          <Loading />
        ) : entries.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {entries.map((entry, i) => (
              <div key={entry._id} className="card fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h3 style={{ fontWeight: 700, fontSize: '16px' }}>{entry.event?.title || 'Event'}</h3>
                      <span className={`badge ${getStatusBadge(entry.status)}`}>{entry.status}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', color: 'var(--text-secondary)', fontSize: '13px', flexWrap: 'wrap' }}>
                      <span>📍 {entry.event?.venue}</span>
                      <span>💺 {entry.category?.name} — ₹{entry.category?.price}</span>
                      <span>📅 Joined {new Date(entry.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                    {entry.status === 'OFFERED' && entry.offerExpiresAt && (
                      <div style={{ marginTop: '8px', color: 'var(--accent-warning)', fontSize: '13px', fontWeight: 600 }}>
                        ⏰ Offer expires: {new Date(entry.offerExpiresAt).toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {entry.status === 'OFFERED' && (
                      <button onClick={() => handleAccept(entry._id)} className="btn btn-success btn-sm">
                        ✓ Accept Offer
                      </button>
                    )}
                    {['WAITING', 'OFFERED'].includes(entry.status) && (
                      <button onClick={() => handleLeave(entry._id)} className="btn btn-outline btn-sm">
                        Leave
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center" style={{ padding: '80px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</p>
            <p>You&apos;re not on any waitlists yet.</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
