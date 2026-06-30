'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/components/Loading';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    const fetchBookings = async () => {
      try {
        const res = await api.get('/bookings/my');
        setBookings(res.data.data || []);
      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [authLoading, isAuthenticated]);

  const getStatusBadge = (status) => {
    const map = { CONFIRMED: 'badge-confirmed', CANCELLED: 'badge-cancelled', EXPIRED: 'badge-expired' };
    return map[status] || '';
  };

  return (
    <ProtectedRoute>
      <div className="page-container">
        <div className="page-header">
          <h1>🎫 My Bookings</h1>
          <p>View and manage your ticket bookings</p>
        </div>

        {loading ? (
          <Loading />
        ) : bookings.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {bookings.map((booking, i) => (
              <div
                key={booking._id}
                className="card card-clickable fade-in"
                style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => router.push(`/bookings/${booking._id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h3 style={{ fontWeight: 700, fontSize: '16px' }}>{booking.event?.title || 'Event'}</h3>
                      <span className={`badge ${getStatusBadge(booking.status)}`}>{booking.status}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', color: 'var(--text-secondary)', fontSize: '13px', flexWrap: 'wrap' }}>
                      <span>📍 {booking.event?.venue}</span>
                      <span>📅 {new Date(booking.event?.eventDate).toLocaleDateString('en-IN')}</span>
                      <span>🪑 {booking.seats?.map((s) => s.label).join(', ')}</span>
                      <span>🎫 {booking.bookingRef}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-primary)' }}>
                      ₹{booking.totalAmount}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center" style={{ padding: '80px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>🎫</p>
            <p>No bookings yet. Start exploring events!</p>
            <button onClick={() => router.push('/events')} className="btn btn-primary mt-3">
              Browse Events
            </button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
