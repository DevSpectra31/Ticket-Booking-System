'use client';

import { useRouter } from 'next/navigation';

export default function EventCard({ event }) {
  const router = useRouter();

  const getStatusBadge = (status) => {
    const map = {
      UPCOMING: 'badge-upcoming',
      ACTIVE: 'badge-active',
      SOLD_OUT: 'badge-sold-out',
      COMPLETED: 'badge-completed',
      CANCELLED: 'badge-cancelled',
    };
    return map[status] || 'badge-upcoming';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      className="card card-clickable event-card fade-in"
      onClick={() => router.push(`/events/${event._id}`)}
    >
      {/* Shine Effect Overlay */}
      <div className="card-shine-container">
        <div className="card-shine" />
      </div>

      <div className="event-card-image-wrapper">
        <img
          src={event.posterUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500'}
          alt={event.title}
          className="event-card-image"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500';
          }}
        />
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <span className={`badge ${getStatusBadge(event.status)}`}>{event.status}</span>
        </div>
      </div>

      <div className="event-card-body">
        <h3 className="event-card-title">{event.title}</h3>
        <div className="event-card-info">
          <span>📍 {event.venue}</span>
          <span>📅 {formatDate(event.eventDate)}</span>
          <span>🕐 {event.eventTime}</span>
        </div>
      </div>
    </div>
  );
}
