'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/components/Loading';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminDashboard() {
  const [report, setReport] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading || !isAuthenticated || !isAdmin) return;
    const fetchData = async () => {
      try {
        const [reportRes, usersRes] = await Promise.all([
          api.get('/reports/admin'),
          api.get('/users'),
        ]);
        setReport(reportRes.data.data);
        setUsers(usersRes.data.data || []);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [authLoading, isAuthenticated, isAdmin]);

  return (
    <ProtectedRoute roles={['ADMIN']}>
      <div className="page-container">
        <div className="page-header">
          <h1>🛡️ Admin Dashboard</h1>
          <p>System-wide overview and management</p>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <>
             {/* System Stats */}
            {report && (
              <div className="grid-4 mb-3">
                {[
                  { value: report.totalEvents, label: 'Total Events' },
                  { value: report.totalBookings, label: 'Confirmed Bookings' },
                  { value: `₹${report.totalRevenue?.toLocaleString() || 0}`, label: 'Total Revenue' },
                  { value: report.totalSeats, label: 'Total Seats' },
                  { value: report.bookedSeats, label: 'Booked Seats' },
                  { value: report.cancelledBookings, label: 'Cancelled Bookings' },
                  { value: report.waitlistCount, label: 'Waitlisted' },
                  { value: users.length, label: 'Total Users' },
                ].map((stat, i) => (
                  <div key={i} className="card stat-card fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Analytics Charts */}
            {report?.events?.length > 0 && (
              <div className="grid-2 mb-3 slide-up" style={{ animationDelay: '0.2s' }}>
                {/* Revenue Chart */}
                <div className="card" style={{ padding: '20px' }}>
                  <h3 style={{ fontWeight: 700, marginBottom: '16px', fontSize: '16px' }}>💰 System Revenue per Event</h3>
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
                                <rect x={x} y={y} width="35" height={height} rx="4" fill="url(#adminRevGrad)" style={{ transition: 'all 0.3s' }} />
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
                            <linearGradient id="adminRevGrad" x1="0" y1="0" x2="0" y2="1">
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
                  <h3 style={{ fontWeight: 700, marginBottom: '16px', fontSize: '16px' }}>🎟️ System Bookings per Event</h3>
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
                                <rect x={x} y={y} width="35" height={height} rx="4" fill="url(#adminBookGrad)" style={{ transition: 'all 0.3s' }} />
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
                            <linearGradient id="adminBookGrad" x1="0" y1="0" x2="0" y2="1">
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

            {/* Users Table */}
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>👥 Users</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                      <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Name</th>
                      <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Email</th>
                      <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Role</th>
                      <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{user.fullName}</td>
                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{user.email}</td>
                        <td style={{ padding: '12px' }}>
                          <span className={`badge ${user.role === 'ADMIN' ? 'badge-active' : user.role === 'ORGANISER' ? 'badge-upcoming' : 'badge-waiting'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>
                          {new Date(user.createdAt).toLocaleDateString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
