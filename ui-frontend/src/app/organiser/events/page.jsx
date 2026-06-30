'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/components/Loading';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function OrganiserEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isAuthenticated, isOrganiser, isAdmin, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading || !isAuthenticated || (!isOrganiser && !isAdmin)) return;
    const fetchEvents = async () => {
      try {
        const res = await api.get('/organiser/events');
        setEvents(res.data.data || []);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [authLoading, isAuthenticated, isOrganiser, isAdmin]);

  const getStatusBadge = (status) => {
    const map = {
      UPCOMING: 'badge-upcoming', ACTIVE: 'badge-active',
      SOLD_OUT: 'badge-sold-out', COMPLETED: 'badge-completed',
      CANCELLED: 'badge-cancelled',
    };
    return map[status] || '';
  };

  return (
    <ProtectedRoute roles={['ORGANISER', 'ADMIN']}>
      <div className="page-container">
        <div className="flex-between mb-3">
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h1>🎪 My Events</h1>
            <p>Manage your events</p>
          </div>
          <Link href="/organiser/events/new" className="btn btn-primary">
            + Create Event
          </Link>
        </div>

        {loading ? (
          <Loading />
        ) : events.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {events.map((event, i) => (
              <div key={event._id} className="card fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h3 style={{ fontWeight: 700 }}>{event.title}</h3>
                      <span className={`badge ${getStatusBadge(event.status)}`}>{event.status}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                      <span>📍 {event.venue}</span>
                      <span>📅 {new Date(event.eventDate).toLocaleDateString('en-IN')}</span>
                      <span>🕐 {event.eventTime}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => router.push(`/organiser/reports/${event._id}`)} className="btn btn-outline btn-sm">
                      📊 Report
                    </button>
                    <button onClick={() => router.push(`/events/${event._id}`)} className="btn btn-outline btn-sm">
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center" style={{ padding: '80px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>🎪</p>
            <p>No events yet. Create your first event!</p>
            <Link href="/organiser/events/new" className="btn btn-primary mt-3">
              Create Event
            </Link>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
