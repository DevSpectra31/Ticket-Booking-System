'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function EventReportPage() {
  const { eventId } = useParams();
  const { isAuthenticated, isOrganiser, isAdmin, loading: authLoading } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading || !isAuthenticated || (!isOrganiser && !isAdmin)) return;
    const fetchReport = async () => {
      try {
        const res = await api.get(`/reports/events/${eventId}`);
        setReport(res.data.data);
      } catch (err) {
        setError('Failed to load report');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [eventId, authLoading, isAuthenticated, isOrganiser, isAdmin]);

  if (loading) return <div className="page-container"><Loading /></div>;
  if (error) return <div className="page-container"><ErrorMessage message={error} /></div>;
  if (!report) return null;

  return (
    <ProtectedRoute roles={['ORGANISER', 'ADMIN']}>
      <div className="page-container">
        <div className="page-header">
          <h1>📊 Event Report</h1>
          <p>{report.event?.title} — {report.event?.venue}</p>
        </div>

        {/* Stats */}
        <div className="grid-4 mb-3">
          {[
            { value: report.totalBookings, label: 'Confirmed Bookings' },
            { value: `₹${report.totalRevenue?.toLocaleString() || 0}`, label: 'Revenue' },
            { value: report.bookedSeats, label: 'Booked Seats' },
            { value: report.availableSeats, label: 'Available Seats' },
            { value: report.heldSeats, label: 'Held Seats' },
            { value: report.cancelledBookings, label: 'Cancelled' },
            { value: report.totalSeats, label: 'Total Seats' },
            { value: report.waitlistCount, label: 'Waitlisted' },
          ].map((stat, i) => (
            <div key={i} className="card stat-card fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Categories breakdown */}
        {report.categories && report.categories.length > 0 && (
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>💺 Category Breakdown</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Category</th>
                    <th style={{ textAlign: 'right', padding: '12px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Price</th>
                    <th style={{ textAlign: 'right', padding: '12px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Total</th>
                    <th style={{ textAlign: 'right', padding: '12px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Available</th>
                    <th style={{ textAlign: 'right', padding: '12px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Occupancy</th>
                  </tr>
                </thead>
                <tbody>
                  {report.categories.map((cat, i) => {
                    const occupancy = cat.totalSeats > 0 ? Math.round(((cat.totalSeats - cat.availableSeats) / cat.totalSeats) * 100) : 0;
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{cat.name}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>₹{cat.price}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>{cat.totalSeats}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>{cat.availableSeats}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                            <div style={{
                              width: '60px', height: '6px', background: 'var(--bg-input)',
                              borderRadius: '3px', overflow: 'hidden',
                            }}>
                              <div style={{
                                width: `${occupancy}%`, height: '100%',
                                background: occupancy > 80 ? 'var(--accent-danger)' : 'var(--accent-primary)',
                                borderRadius: '3px',
                              }} />
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: 600 }}>{occupancy}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
