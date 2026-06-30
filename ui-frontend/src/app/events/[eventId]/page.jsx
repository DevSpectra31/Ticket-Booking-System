'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';

export default function EventDetailPage() {
  const { eventId } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, catRes] = await Promise.all([
          api.get(`/events/${eventId}`),
          api.get(`/events/${eventId}/categories`),
        ]);
        setEvent(eventRes.data.data);
        setCategories(catRes.data.data || []);
      } catch (err) {
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  if (loading) return <div className="page-container"><Loading /></div>;
  if (error) return <div className="page-container"><ErrorMessage message={error} /></div>;
  if (!event) return null;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const map = {
      UPCOMING: 'badge-upcoming', ACTIVE: 'badge-active',
      SOLD_OUT: 'badge-sold-out', COMPLETED: 'badge-completed',
      CANCELLED: 'badge-cancelled',
    };
    return map[status] || '';
  };

  return (
    <div className="page-container">
      <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
        {/* Left - Image */}
        <div>
          <img
            src={event.posterUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600'}
            alt={event.title}
            style={{ width: '100%', borderRadius: 'var(--radius-lg)', objectFit: 'cover', maxHeight: '500px' }}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600';
            }}
          />
        </div>

        {/* Right - Details */}
        <div>
          <div className="flex-between mb-2">
            <span className={`badge ${getStatusBadge(event.status)}`}>{event.status}</span>
          </div>

          <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px' }}>{event.title}</h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: '20px' }}>📍</span>
              <span>{event.venue}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: '20px' }}>📅</span>
              <span>{formatDate(event.eventDate)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: '20px' }}>🕐</span>
              <span>{event.eventTime}</span>
            </div>
            {event.createdBy && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                <span style={{ fontSize: '20px' }}>👤</span>
                <span>Organised by {event.createdBy.fullName}</span>
              </div>
            )}
          </div>

          <div className="card mb-3">
            <h3 style={{ marginBottom: '12px', fontWeight: 700 }}>About this Event</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{event.description}</p>
          </div>

          {/* Seat Categories */}
          {categories.length > 0 && (
            <div className="card mb-3">
              <h3 style={{ marginBottom: '16px', fontWeight: 700 }}>💺 Ticket Prices</h3>
              {categories.map((cat) => (
                <div key={cat._id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 0', borderBottom: '1px solid var(--border-color)'
                }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{cat.name}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px', marginLeft: '8px' }}>
                      {cat.availableSeats}/{cat.totalSeats} available
                    </span>
                  </div>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-primary)' }}>
                    ₹{cat.price}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          {['ACTIVE', 'UPCOMING'].includes(event.status) && (
            <div style={{ display: 'flex', gap: '12px' }}>
              {isAuthenticated ? (
                <Link href={`/events/${eventId}/seats`} className="btn btn-primary btn-lg btn-block">
                  🎟️ Select Seats & Book
                </Link>
              ) : (
                <Link href="/login" className="btn btn-primary btn-lg btn-block">
                  Login to Book Tickets
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
