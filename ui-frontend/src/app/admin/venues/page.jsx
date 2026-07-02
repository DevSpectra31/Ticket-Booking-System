'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [rowsCount, setRowsCount] = useState(5);
  const [seatsPerRow, setSeatsPerRow] = useState(10);
  const [categories, setCategories] = useState([
    { name: 'Premium', startRow: 'A', endRow: 'B' },
    { name: 'Standard', startRow: 'C', endRow: 'E' }
  ]);

  const fetchVenues = async () => {
    try {
      const res = await api.get('/venues');
      setVenues(res.data.data || []);
    } catch (err) {
      setError('Failed to fetch venues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !isAuthenticated || !isAdmin) return;
    fetchVenues();
  }, [authLoading, isAuthenticated, isAdmin]);

  const handleAddCategory = () => {
    setCategories([...categories, { name: '', startRow: '', endRow: '' }]);
  };

  const handleRemoveCategory = (index) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const handleCategoryChange = (index, field, value) => {
    const updated = [...categories];
    updated[index][field] = field === 'name' ? value : value.toUpperCase();
    setCategories(updated);
  };

  const resetForm = () => {
    setName('');
    setLocation('');
    setRowsCount(5);
    setSeatsPerRow(10);
    setCategories([
      { name: 'Premium', startRow: 'A', endRow: 'B' },
      { name: 'Standard', startRow: 'C', endRow: 'E' }
    ]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditClick = (venue) => {
    setEditingId(venue._id);
    setName(venue.name);
    setLocation(venue.location);
    setRowsCount(venue.rowsCount);
    setSeatsPerRow(venue.seatsPerRow);
    setCategories(venue.categories.map(c => ({
      name: c.name,
      startRow: c.startRow,
      endRow: c.endRow
    })));
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this venue? This action cannot be undone.')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/venues/${id}`);
      setSuccess('Venue deleted successfully');
      fetchVenues();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete venue');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validations
    if (categories.length === 0) {
      setError('At least one seat category range must be defined');
      return;
    }

    // Validate row labels against rowsCount
    const maxRowChar = String.fromCharCode(65 + rowsCount - 1);
    for (const cat of categories) {
      if (!cat.name || !cat.startRow || !cat.endRow) {
        setError('All category fields are required');
        return;
      }
      if (cat.startRow > cat.endRow) {
        setError(`Category "${cat.name}" has invalid range: Start Row must be before or equal to End Row`);
        return;
      }
      if (cat.endRow > maxRowChar) {
        setError(`Category "${cat.name}" end row ${cat.endRow} exceeds total rows count limit (Max: ${maxRowChar})`);
        return;
      }
    }

    const payload = { name, location, rowsCount, seatsPerRow, categories };

    try {
      if (editingId) {
        await api.put(`/venues/${editingId}`, payload);
        setSuccess('Venue updated successfully');
      } else {
        await api.post('/venues', payload);
        setSuccess('Venue created successfully');
      }
      resetForm();
      fetchVenues();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save venue');
    }
  };

  return (
    <ProtectedRoute roles={['ADMIN']}>
      <div className="page-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800 }}>🏟️ Venue & Layout Management</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Define venue structures, seating grids, and categories</p>
          </div>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="btn btn-primary">
              ＋ Add Venue Template
            </button>
          )}
        </div>

        <ErrorMessage message={error} />
        {success && <div className="card mb-3" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', border: '1px solid var(--accent-success)' }}>{success}</div>}

        {showForm && (
          <div className="card slide-up mb-4" style={{ maxWidth: '750px' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '20px' }}>
              {editingId ? '📝 Edit Venue Template' : '🎪 Create New Venue Template'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Venue Name *</label>
                  <input className="form-input" placeholder="e.g. Royal Opera House" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Location/City *</label>
                  <input className="form-input" placeholder="e.g. Mumbai" value={location} onChange={e => setLocation(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="mb-2">
                <div className="form-group">
                  <label>Total Rows Count *</label>
                  <input type="number" min="1" max="26" className="form-input" value={rowsCount} onChange={e => setRowsCount(Number(e.target.value))} required />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Defines row range (e.g. 5 rows = A to E)</span>
                </div>
                <div className="form-group">
                  <label>Seats Per Row *</label>
                  <input type="number" min="1" className="form-input" value={seatsPerRow} onChange={e => setSeatsPerRow(Number(e.target.value))} required />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Number of seat numbers in each row</span>
                </div>
              </div>

              <div className="mb-3">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ fontWeight: 600 }}>Seat Category Row Mappings *</label>
                  <button type="button" onClick={handleAddCategory} className="btn btn-outline btn-sm" style={{ padding: '4px 10px' }}>
                    ＋ Add Category Row Range
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {categories.map((cat, index) => (
                    <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 50px', gap: '12px', alignItems: 'center' }}>
                      <input className="form-input" placeholder="Category Name (e.g., Premium)" value={cat.name} onChange={e => handleCategoryChange(index, 'name', e.target.value)} required />
                      <input className="form-input text-center" maxLength="1" placeholder="Start Row (A)" value={cat.startRow} onChange={e => handleCategoryChange(index, 'startRow', e.target.value)} required />
                      <input className="form-input text-center" maxLength="1" placeholder="End Row (B)" value={cat.endRow} onChange={e => handleCategoryChange(index, 'endRow', e.target.value)} required />
                      <button type="button" onClick={() => handleRemoveCategory(index)} className="btn btn-outline btn-sm text-center" style={{ color: 'var(--accent-danger)', borderColor: 'rgba(239, 68, 68, 0.2)', padding: '8px' }}>
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" onClick={resetForm} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update Venue' : 'Create Venue'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <Loading />
        ) : venues.length > 0 ? (
          <div className="card">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Venue Name</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Location</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Rows × Seats</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Capacity</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Category Distributions</th>
                    <th style={{ textAlign: 'center', padding: '12px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', width: '150px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {venues.map((venue) => (
                    <tr key={venue._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{venue.name}</td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{venue.location}</td>
                      <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{venue.rowsCount} rows × {venue.seatsPerRow}</td>
                      <td style={{ padding: '12px', fontWeight: 700, color: 'var(--accent-primary)' }}>{venue.rowsCount * venue.seatsPerRow} seats</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {venue.categories.map((cat, i) => (
                            <span key={i} className="badge badge-waiting" style={{ fontSize: '11px', padding: '4px 8px' }}>
                              {cat.name} ({cat.startRow}-{cat.endRow})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button onClick={() => handleEditClick(venue)} className="btn btn-outline btn-sm" style={{ padding: '4px 10px' }}>
                            Edit
                          </button>
                          <button onClick={() => handleDelete(venue._id)} className="btn btn-outline btn-sm" style={{ color: 'var(--accent-danger)', borderColor: 'rgba(239, 68, 68, 0.2)', padding: '4px 10px' }}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="card text-center" style={{ padding: '60px 0', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>🏟️</span>
            <p>No venues templates have been configured yet.</p>
            <button onClick={() => setShowForm(true)} className="btn btn-primary mt-2">
              Add First Venue Template
            </button>
          </div>
        )}

        <div style={{ marginTop: '24px' }}>
          <Link href="/admin" className="btn btn-outline btn-sm">
            ← Back to System Stats
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}
