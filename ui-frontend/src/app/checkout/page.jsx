'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import CountdownTimer from '@/components/CountdownTimer';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [holdData, setHoldData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expired, setExpired] = useState(false);
  const [success, setSuccess] = useState(false);

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState('');

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    const stored = sessionStorage.getItem('currentHold');
    if (!stored) {
      router.push('/events');
      return;
    }
    setHoldData(JSON.parse(stored));
  }, [router, authLoading, isAuthenticated]);

  const handleApplyPromo = () => {
    setPromoError('');
    const code = promoInput.trim().toUpperCase();
    if (code === 'RESERVEX20') {
      setAppliedPromo(code);
      setDiscountPercent(20);
    } else if (code === 'WELCOME10') {
      setAppliedPromo(code);
      setDiscountPercent(10);
    } else {
      setPromoError('Invalid promo code');
      setAppliedPromo('');
      setDiscountPercent(0);
    }
  };

  const handleConfirm = async () => {
    if (!holdData?.holdId) return;
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/bookings', { 
        holdId: holdData.holdId,
        promoCode: appliedPromo 
      });
      setSuccess(true);
      sessionStorage.removeItem('currentHold');
      setTimeout(() => {
        router.push(`/bookings/${res.data.data._id}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      await api.delete(`/seats/hold/${holdData.holdId}`);
    } catch {
      // Ignore
    }
    sessionStorage.removeItem('currentHold');
    router.back();
  };

  return (
    <ProtectedRoute roles={['CUSTOMER']}>
      {!holdData ? <Loading /> : (
      <div className="page-container" style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div className="page-header text-center">
          <h1>🎟️ Checkout</h1>
          <p>Review and confirm your booking</p>
        </div>

        {success && (
          <div className="success-message text-center mb-3">
            ✅ Booking confirmed! Redirecting to your ticket...
          </div>
        )}

        <ErrorMessage message={error} />

        {/* Countdown */}
        <div className="mb-3">
          <CountdownTimer expiresAt={holdData.expiresAt} onExpire={() => setExpired(true)} />
        </div>

        {/* Booking Summary */}
        <div className="card mb-3 slide-up">
          <h3 style={{ fontWeight: 700, marginBottom: '20px' }}>📋 Booking Summary</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Event</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{holdData.eventTitle}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Venue</span>
              <span>{holdData.venue}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Date & Time</span>
              <span>{new Date(holdData.eventDate).toLocaleDateString('en-IN')} at {holdData.eventTime}</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '12px' }}>SELECTED SEATS</h4>
            {holdData.seats?.map((seat, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '10px 12px', marginBottom: '8px',
                background: 'rgba(59, 130, 246, 0.08)', borderRadius: 'var(--radius-sm)',
              }}>
                <span>
                  <strong>{seat.label}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px', marginLeft: '8px' }}>
                    {seat.category}
                  </span>
                </span>
                <span style={{ fontWeight: 600 }}>₹{seat.price}</span>
              </div>
            ))}
          </div>

          {/* Promo Code section */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px' }}>
            <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '12px' }}>PROMO CODE</h4>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                placeholder="e.g. WELCOME10, RESERVEX20"
                className="form-input"
                style={{ flex: 1, marginBottom: 0, textTransform: 'uppercase' }}
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
              />
              <button type="button" onClick={handleApplyPromo} className="btn btn-outline" style={{ padding: '0 20px' }}>
                Apply
              </button>
            </div>
            {promoError && (
              <div style={{ color: 'var(--accent-danger)', fontSize: '13px', fontWeight: 600 }}>
                ❌ {promoError}
              </div>
            )}
            {appliedPromo && (
              <div style={{ color: 'var(--accent-success)', fontSize: '13px', fontWeight: 600 }}>
                ✅ Code <strong>{appliedPromo}</strong> applied successfully ({discountPercent}% off)!
              </div>
            )}
          </div>

          {/* Cost Calculations */}
          <div style={{
            padding: '20px 0 0', marginTop: '16px', borderTop: '2px solid var(--accent-primary)',
            display: 'flex', flexDirection: 'column', gap: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Base Total</span>
              <span>₹{holdData.totalPrice}</span>
            </div>
            {discountPercent > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-success)', fontWeight: 600 }}>
                <span>Discount ({discountPercent}%)</span>
                <span>- ₹{Math.round(holdData.totalPrice * (discountPercent / 100))}</span>
              </div>
            )}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontWeight: 800, fontSize: '20px', marginTop: '8px', paddingTop: '8px',
              borderTop: '1px dashed var(--border-color)'
            }}>
              <span>Total Amount</span>
              <span style={{ color: 'var(--accent-primary)' }}>
                ₹{Math.round(holdData.totalPrice * (1 - discountPercent / 100))}
              </span>
            </div>
          </div>
        </div>

        {/* Mock Payment */}
        <div className="card mb-3" style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px dashed var(--border-glow)' }}>
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <p style={{ color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '4px' }}>💳 Payment (Mock)</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              No real payment required. Click confirm to complete your booking.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleCancel} className="btn btn-outline btn-lg" style={{ flex: 1 }}>
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || expired || success}
            className="btn btn-success btn-lg"
            style={{ flex: 2 }}
          >
            {loading ? 'Confirming...' : success ? '✅ Confirmed!' : '✓ Confirm Booking'}
          </button>
        </div>
      </div>
      )}
    </ProtectedRoute>
  );
}
