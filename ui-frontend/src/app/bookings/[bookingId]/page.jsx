'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function BookingDetailPage() {
  const { bookingId } = useParams();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/bookings/${bookingId}`);
        setBooking(res.data.data);
      } catch (err) {
        setError('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId, authLoading, isAuthenticated]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    setCancelLoading(true);
    setError('');

    try {
      await api.delete(`/bookings/${bookingId}/cancel`);
      const res = await api.get(`/bookings/${bookingId}`);
      setBooking(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) return <div className="page-container"><Loading /></div>;
  if (error && !booking) return <div className="page-container"><ErrorMessage message={error} /></div>;
  if (!booking) return null;

  const getStatusBadge = (status) => {
    const map = { CONFIRMED: 'badge-confirmed', CANCELLED: 'badge-cancelled', EXPIRED: 'badge-expired' };
    return map[status] || '';
  };

  return (
    <ProtectedRoute>
      <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button onClick={() => router.push('/bookings')} className="btn btn-outline btn-sm mb-3">
          ← Back to Bookings
        </button>

        <ErrorMessage message={error} />

        <div className="print-area" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
          <div className="card slide-up">
            <div className="flex-between mb-3">
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>
                  {booking.event?.title || 'Event'}
                </h1>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{booking.bookingRef}</span>
              </div>
              <span className={`badge ${getStatusBadge(booking.status)}`} style={{ fontSize: '14px', padding: '6px 16px' }}>
                {booking.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div className="card" style={{ padding: '16px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '4px' }}>VENUE</div>
                <div style={{ fontWeight: 600 }}>{booking.event?.venue}</div>
              </div>
              <div className="card" style={{ padding: '16px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '4px' }}>DATE & TIME</div>
                <div style={{ fontWeight: 600 }}>
                  {new Date(booking.event?.eventDate).toLocaleDateString('en-IN')} at {booking.event?.eventTime}
                </div>
              </div>
              <div className="card" style={{ padding: '16px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '4px' }}>SEATS</div>
                <div style={{ fontWeight: 600 }}>{booking.seats?.map((s) => s.label).join(', ')}</div>
              </div>
              <div className="card" style={{ padding: '16px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '4px' }}>TOTAL AMOUNT</div>
                <div style={{ fontWeight: 800, fontSize: '20px', color: 'var(--accent-primary)' }}>₹{booking.totalAmount}</div>
              </div>
            </div>

            {booking.customer && (
              <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
                <strong>Booked by:</strong> {booking.customer.fullName} ({booking.customer.email})
              </div>
            )}

            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Booked on: {new Date(booking.createdAt).toLocaleString('en-IN')}
              {booking.cancelledAt && ` • Cancelled on: ${new Date(booking.cancelledAt).toLocaleString('en-IN')}`}
            </div>
          </div>

          {/* QR Code */}
          {booking.status === 'CONFIRMED' && booking.qrCode && (
            <div className="card text-center slide-up" style={{ animationDelay: '0.1s' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>🎟️ Your Ticket QR Code</h3>
              <div className="qr-container">
                <img src={booking.qrCode} alt="Booking QR Code" />
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '12px' }}>
                Present this QR code at the venue for entry
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
          {booking.status === 'CONFIRMED' && (
            <button
              onClick={() => window.print()}
              className="btn btn-primary btn-block btn-lg"
            >
              📥 Download PDF Ticket
            </button>
          )}

          {booking.status === 'CONFIRMED' && (
            <button
              onClick={handleCancel}
              disabled={cancelLoading}
              className="btn btn-danger btn-block btn-lg"
            >
              {cancelLoading ? 'Cancelling...' : '✕ Cancel Booking'}
            </button>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
