'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import EventCard from '@/components/EventCard';
import Loading from '@/components/Loading';
import SkeletonCard from '@/components/SkeletonCard';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      const res = await api.get(`/events?${params.toString()}`);
      setEvents(res.data.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🎭 Discover Events</h1>
        <p>Find and book tickets for the best events near you</p>
      </div>

      {/* Search & Filter */}
      <div className="card mb-3" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '200px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search events by title or venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ margin: 0 }}
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
        <select
          className="form-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: 'auto', minWidth: '160px', margin: 0 }}
        >
          <option value="">All Statuses</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="ACTIVE">Active</option>
          <option value="SOLD_OUT">Sold Out</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <SkeletonCard key={n} />
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="grid-3">
          {events.map((event, i) => (
            <div key={event._id} className="fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <EventCard event={event} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center" style={{ padding: '80px 0', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</p>
          <p>No events found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
