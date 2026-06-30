'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/components/Loading';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function OrganiserDashboard() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isAuthenticated, isOrganiser, isAdmin, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading || !isAuthenticated || (!isOrganiser && !isAdmin)) return;
    const fetchReport = async () => {
      try {
        const res = await api.get('/reports/organiser');
        setReport(res.data.data);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [authLoading, isAuthenticated, isOrganiser, isAdmin]);

  return (
    <ProtectedRoute roles={['ORGANISER', 'ADMIN']}>
      <div className="page-container">
        <div className="flex-between mb-3">
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h1>📊 Organiser Dashboard</h1>
            <p>Overview of your events and bookings</p>
          </div>
          <Link href="/organiser/events/new" className="btn btn-primary">
            + Create Event
          </Link>
        </div>

        {loading ? (
          <Loading />
        ) : report ? (
          <>
            {/* Stats */}
            <div className="grid-4 mb-3">
              {[
                { value: report.totalEvents, label: 'Total Events' },
                { value: report.totalBookings, label: 'Total Bookings' },
                { value: `₹${report.totalRevenue?.toLocaleString() || 0}`, label: 'Total Revenue' },
                { value: report.waitlistCount, label: 'Waitlisted' },
              ].map((stat, i) => (
                <div key={i} className="card stat-card fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Analytics Charts */}
            {report.events?.length > 0 && (
              <div className="grid-2 mb-3 slide-up" style={{ animationDelay: '0.2s' }}>
                {/* Revenue Chart */}
                <div className="card" style={{ padding: '20px' }}>
                  <h3 style={{ fontWeight: 700, marginBottom: '16px', fontSize: '16px' }}>💰 Revenue per Event</h3>
                  <div style={{ position: 'relative', width: '100%' }}>
                    {(() => {
                      const chartEvents = report.events.slice(0, 5);
                      const maxRevenue = Math.max(...chartEvents.map(e => e.revenue || 0), 1000);
                      return (
                        <svg width="100%" height="220" viewBox="0 0 400 220" style={{ overflow: 'visible' }}>
                          <line x1="40" y1="20" x2="380" y2="20" stroke="var(--border-color)" strokeDasharray="4 4" />
                          <line x1="40" y1="90" x2="380" y2="90" stroke="var(--border-color)" strokeDasharray="4 4" />
                          <line x1="40" y1="160" x2="380" y2="160" stroke="var(--border-color)" strokeDasharray="4 4" />
                          <line x1="40" y1="10" x2="40" y2="160" stroke="var(--text-muted)" strokeWidth="1" />
                          <line x1="40" y1="160" x2="390" y2="160" stroke="var(--text-muted)" strokeWidth="1" />
                          {chartEvents.map((event, index) => {
                            const height = (event.revenue / maxRevenue) * 130 || 0;
                            const x = 60 + index * 65;
                            const y = 160 - height;
                            return (
                              <g key={event._id} className="chart-bar-group">
                                <rect x={x} y={y} width="35" height={height} rx="4" fill="url(#revGrad)" style={{ transition: 'all 0.3s' }} />
                                <text x={x + 17.5} y="180" fill="var(--text-secondary)" fontSize="10" textAnchor="middle" transform={`rotate(12, ${x + 17.5}, 180)`}>
                                  {event.title.length > 10 ? event.title.substring(0, 10) + '..' : event.title}
                                </text>
                                <text x={x + 17.5} y={y - 6} fill="var(--accent-primary)" fontSize="10" fontWeight="bold" textAnchor="middle">
                                  ₹{event.revenue > 1000 ? (event.revenue / 1000).toFixed(1) + 'k' : event.revenue}
                                </text>
                              </g>
                            );
                          })}
                          <defs>
                            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="var(--accent-primary)" />
                              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
                            </linearGradient>
                          </defs>
                        </svg>
                      );
                    })()}
                  </div>
                </div>

                {/* Bookings Chart */}
                <div className="card" style={{ padding: '20px' }}>
                  <h3 style={{ fontWeight: 700, marginBottom: '16px', fontSize: '16px' }}>🎟️ Bookings per Event</h3>
                  <div style={{ position: 'relative', width: '100%' }}>
                    {(() => {
                      const chartEvents = report.events.slice(0, 5);
                      const maxBookings = Math.max(...chartEvents.map(e => e.bookingsCount || 0), 10);
                      return (
                        <svg width="100%" height="220" viewBox="0 0 400 220" style={{ overflow: 'visible' }}>
                          <line x1="40" y1="20" x2="380" y2="20" stroke="var(--border-color)" strokeDasharray="4 4" />
                          <line x1="40" y1="90" x2="380" y2="90" stroke="var(--border-color)" strokeDasharray="4 4" />
                          <line x1="40" y1="160" x2="380" y2="160" stroke="var(--border-color)" strokeDasharray="4 4" />
                          <line x1="40" y1="10" x2="40" y2="160" stroke="var(--text-muted)" strokeWidth="1" />
                          <line x1="40" y1="160" x2="390" y2="160" stroke="var(--text-muted)" strokeWidth="1" />
                          {chartEvents.map((event, index) => {
                            const height = (event.bookingsCount / maxBookings) * 130 || 0;
                            const x = 60 + index * 65;
                            const y = 160 - height;
                            return (
                              <g key={event._id} className="chart-bar-group">
                                <rect x={x} y={y} width="35" height={height} rx="4" fill="url(#bookGrad)" style={{ transition: 'all 0.3s' }} />
                                <text x={x + 17.5} y="180" fill="var(--text-secondary)" fontSize="10" textAnchor="middle" transform={`rotate(12, ${x + 17.5}, 180)`}>
                                  {event.title.length > 10 ? event.title.substring(0, 10) + '..' : event.title}
                                </text>
                                <text x={x + 17.5} y={y - 6} fill="var(--accent-success)" fontSize="10" fontWeight="bold" textAnchor="middle">
                                  {event.bookingsCount}
                                </text>
                              </g>
                            );
                          })}
                          <defs>
                            <linearGradient id="bookGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="var(--accent-success)" />
                              <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
                            </linearGradient>
                          </defs>
                        </svg>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Events list */}
            <div className="card">
              <div className="flex-between mb-2">
                <h3 style={{ fontWeight: 700 }}>Your Events</h3>
                <Link href="/organiser/events" className="btn btn-outline btn-sm">View All</Link>
              </div>

              {report.events?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {report.events.slice(0, 5).map((event) => (
                    <div key={event._id}
                      className="card-clickable"
                      onClick={() => router.push(`/organiser/reports/${event._id}`)}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '14px 16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)',
                        cursor: 'pointer', transition: 'background 0.2s',
                      }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{event.title}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          {new Date(event.eventDate).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                      <span className={`badge badge-${event.status?.toLowerCase()}`}>{event.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No events yet. Create your first event!</p>
              )}
            </div>
          </>
        ) : null}
      </div>
    </ProtectedRoute>
  );
}
