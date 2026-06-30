'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import SeatGrid from '@/components/SeatGrid';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function SeatSelectionPage() {
  const { eventId } = useParams();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [seats, setSeats] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [holdLoading, setHoldLoading] = useState(false);
  const [error, setError] = useState('');
  const [event, setEvent] = useState(null);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    const fetchData = async () => {
      try {
        const [seatsRes, catRes, eventRes] = await Promise.all([
          api.get(`/events/${eventId}/seats`),
          api.get(`/events/${eventId}/categories`),
          api.get(`/events/${eventId}`),
        ]);
        setSeats(seatsRes.data.data || []);
        setCategories(catRes.data.data || []);
        setEvent(eventRes.data.data);
      } catch (err) {
        setError('Failed to load seats');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId, authLoading, isAuthenticated]);

  const handleSeatClick = (seat) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seat._id)) {
        return prev.filter((id) => id !== seat._id);
      }
      return [...prev, seat._id];
    });
  };

  const getSelectedSeatDetails = () => {
    return seats.filter((s) => selectedSeats.includes(s._id));
  };

  const getTotalPrice = () => {
    return getSelectedSeatDetails().reduce((sum, s) => sum + (s.category?.price || 0), 0);
  };

  const handleHoldAndProceed = async () => {
    if (selectedSeats.length === 0) return;
    setError('');
    setHoldLoading(true);

    try {
      const res = await api.post('/seats/hold', { eventId, seatIds: selectedSeats });
      const holdData = res.data.data;
      // Store hold data for checkout page
      sessionStorage.setItem('currentHold', JSON.stringify({
        ...holdData,
        eventTitle: event?.title,
        eventDate: event?.eventDate,
        eventTime: event?.eventTime,
        venue: event?.venue,
        seats: getSelectedSeatDetails().map((s) => ({
          label: s.label,
          category: s.category?.name,
          price: s.category?.price,
        })),
        totalPrice: getTotalPrice(),
      }));
      router.push('/checkout');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to hold seats. They may have been taken.');
      // Refresh seats
      const seatsRes = await api.get(`/events/${eventId}/seats`);
      setSeats(seatsRes.data.data || []);
      setSelectedSeats([]);
    } finally {
      setHoldLoading(false);
    }
  };

  return (
    <ProtectedRoute roles={['CUSTOMER']}>
      <div className="page-container">
        <div className="page-header">
          <h1>🎟️ Select Your Seats</h1>
          <p>{event?.title} — {event?.venue}</p>
        </div>

        <ErrorMessage message={error} />

        {loading ? (
          <Loading />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }}>
            {/* Seat Map */}
            <div className="card">
              <SeatGrid
                seats={seats}
                selectedSeats={selectedSeats}
                onSeatClick={handleSeatClick}
                currentUserId={user?._id}
              />
            </div>

            {/* Selection Summary */}
            <div className="card" style={{ position: 'sticky', top: '90px' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>🛒 Your Selection</h3>

              {selectedSeats.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  Click on available seats to select them
                </p>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {getSelectedSeatDetails().map((seat) => (
                      <div key={seat._id} style={{
                        display: 'flex', justifyContent: 'space-between',
                        padding: '8px 12px', background: 'rgba(59, 130, 246, 0.1)',
                        borderRadius: 'var(--radius-sm)', fontSize: '14px'
                      }}>
                        <span>{seat.label} ({seat.category?.name})</span>
                        <span style={{ fontWeight: 600 }}>₹{seat.category?.price}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '16px 0', borderTop: '1px solid var(--border-color)',
                    fontWeight: 700, fontSize: '18px'
                  }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--accent-primary)' }}>₹{getTotalPrice()}</span>
                  </div>

                  <button
                    onClick={handleHoldAndProceed}
                    disabled={holdLoading}
                    className="btn btn-primary btn-block btn-lg mt-2"
                  >
                    {holdLoading ? 'Holding seats...' : `Hold & Proceed (${selectedSeats.length} seats)`}
                  </button>
                </>
              )}

              {/* Category legend */}
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>CATEGORIES</h4>
                {categories.map((cat) => (
                  <div key={cat._id} style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: '13px', padding: '4px 0', color: 'var(--text-secondary)'
                  }}>
                    <span>{cat.name}</span>
                    <span>₹{cat.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
