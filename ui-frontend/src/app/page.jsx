'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import EventCard from '@/components/EventCard';
import Loading from '@/components/Loading';
import SkeletonCard from '@/components/SkeletonCard';

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events?status=ACTIVE');
        setEvents(res.data.data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1 className="slide-up">Book Your<br />Next Experience</h1>
          <p className="fade-in delay-1">
            Discover amazing events, select your perfect seats, and book instantly
            with real-time availability and QR code tickets.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }} className="fade-in delay-2">
            <Link href="/events" className="btn btn-primary btn-lg">
              Browse Events →
            </Link>
            <Link href="/register" className="btn btn-outline btn-lg">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="page-container">
        <div className="page-header" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800 }}>🔥 Live & Upcoming Events</h2>
          <p>Don&apos;t miss out on these incredible experiences</p>
        </div>

        {loading ? (
          <div className="grid-3">
            {[1, 2, 3].map((n) => (
              <SkeletonCard key={n} />
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid-3">
            {events.map((event, i) => (
              <div key={event._id} className="fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <EventCard event={event} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center" style={{ padding: '60px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>🎭</p>
            <p>No active events right now. Check back soon!</p>
            <Link href="/events" className="btn btn-outline mt-3">
              View All Events
            </Link>
          </div>
        )}
      </section>

      {/* Features section */}
      <section className="page-container" style={{ paddingTop: 0 }}>
        <div className="grid-3">
          {[
            { icon: '🎟️', title: 'Real-Time Seats', desc: 'Interactive seat maps with live availability updates' },
            { icon: '⚡', title: 'Instant Booking', desc: 'Hold seats, checkout, and get QR code tickets instantly' },
            { icon: '🔔', title: 'Smart Waitlist', desc: 'Auto-notification when your desired seats become available' },
          ].map((feature, i) => (
            <div key={i} className="card text-center fade-in" style={{ animationDelay: `${i * 0.15}s` }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{feature.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
