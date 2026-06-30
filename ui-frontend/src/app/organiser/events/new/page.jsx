'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import ErrorMessage from '@/components/ErrorMessage';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function CreateEventPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '', description: '', venue: '', eventDate: '', eventTime: '', posterUrl: '', status: 'UPCOMING',
  });
  const [categories, setCategories] = useState([{ name: 'Standard', price: 100, totalSeats: 50 }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCategoryChange = (index, field, value) => {
    const updated = [...categories];
    updated[index][field] = field === 'name' ? value : Number(value);
    setCategories(updated);
  };

  const addCategory = () => setCategories([...categories, { name: '', price: 0, totalSeats: 10 }]);
  const removeCategory = (index) => setCategories(categories.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create event
      const eventRes = await api.post('/events', form);
      const eventId = eventRes.data.data._id;

      // Create categories
      for (const cat of categories) {
        if (cat.name && cat.price > 0 && cat.totalSeats > 0) {
          await api.post(`/events/${eventId}/categories`, cat);
        }
      }

      // Generate seats
      await api.post(`/events/${eventId}/seats/generate`);

      router.push('/organiser/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute roles={['ORGANISER', 'ADMIN']}>
      <div className="page-container" style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div className="page-header">
          <h1>🎪 Create New Event</h1>
          <p>Step {step} of 2: {step === 1 ? 'Event Details' : 'Seat Categories'}</p>
        </div>

        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="card slide-up">
              <div className="form-group">
                <label>Event Title *</label>
                <input name="title" className="form-input" placeholder="e.g. Avengers: Secret Wars" value={form.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea name="description" className="form-input" placeholder="Describe your event..." value={form.description} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Venue *</label>
                <input name="venue" className="form-input" placeholder="e.g. IMAX Cinema Hall, Mumbai" value={form.venue} onChange={handleChange} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Event Date *</label>
                  <input name="eventDate" type="date" className="form-input" value={form.eventDate} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Event Time *</label>
                  <input name="eventTime" type="time" className="form-input" value={form.eventTime} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Poster URL (optional)</label>
                <input name="posterUrl" className="form-input" placeholder="https://..." value={form.posterUrl} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" className="form-input" value={form.status} onChange={handleChange}>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="ACTIVE">Active</option>
                </select>
              </div>
              <button type="button" onClick={() => setStep(2)} className="btn btn-primary btn-block btn-lg">
                Next: Seat Categories →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="card slide-up">
              <h3 style={{ fontWeight: 700, marginBottom: '20px' }}>💺 Seat Categories</h3>

              {categories.map((cat, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '1fr 100px 100px auto', gap: '12px',
                  alignItems: 'end', marginBottom: '12px',
                }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Name</label>
                    <input className="form-input" placeholder="e.g. Premium" value={cat.name}
                      onChange={(e) => handleCategoryChange(i, 'name', e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Price (₹)</label>
                    <input type="number" className="form-input" min="0" value={cat.price}
                      onChange={(e) => handleCategoryChange(i, 'price', e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Seats</label>
                    <input type="number" className="form-input" min="1" value={cat.totalSeats}
                      onChange={(e) => handleCategoryChange(i, 'totalSeats', e.target.value)} required />
                  </div>
                  {categories.length > 1 && (
                    <button type="button" onClick={() => removeCategory(i)} className="btn btn-danger btn-sm"
                      style={{ marginBottom: '2px' }}>✕</button>
                  )}
                </div>
              ))}

              <button type="button" onClick={addCategory} className="btn btn-outline btn-sm mb-3">
                + Add Category
              </button>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setStep(1)} className="btn btn-outline btn-lg" style={{ flex: 1 }}>
                  ← Back
                </button>
                <button type="submit" disabled={loading} className="btn btn-success btn-lg" style={{ flex: 2 }}>
                  {loading ? 'Creating...' : '✓ Create Event & Generate Seats'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </ProtectedRoute>
  );
}
