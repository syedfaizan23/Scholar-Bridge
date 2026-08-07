import React, { useEffect, useState } from 'react';
import { reviewAPI } from '../../api/reviews';
import { Review } from '../../types';
import { Spinner } from '../../components/ui/Spinner';
import { Stars } from '../../components/common/Stars';
import toast from 'react-hot-toast';

export const MyReview = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState<Review | null>(null);
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const load = () => {
    setLoading(true);
    reviewAPI.mine().then(({ data }) => {
      setExisting(data);
      if (data) { setRating(data.rating); setTitle(data.title); setBody(data.body); }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || body.trim().length < 10) {
      toast.error('Please add a title and a message of at least 10 characters.');
      return;
    }
    setSaving(true);
    try {
      if (existing) {
        await reviewAPI.update(existing.id, { rating, title, body });
        toast.success('Review updated — it will show publicly again once re-approved.');
      } else {
        await reviewAPI.submit({ rating, title, body });
        toast.success('Review submitted! It will appear publicly once approved.');
      }
      setEditing(false);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save review');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!existing || !window.confirm('Delete your review?')) return;
    try {
      await reviewAPI.remove(existing.id);
      toast.success('Review deleted');
      setExisting(null);
      setTitle(''); setBody(''); setRating(5);
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <Spinner text="Loading your review..." />;

  const showForm = editing || !existing;

  return (
    <div className="fade-in" style={{ maxWidth: 620 }}>
      <div className="page-header">
        <h1>⭐ My Review</h1>
        <p>Share your experience — approved reviews appear on our public Reviews page</p>
      </div>

      <div className="card">
        {!showForm && existing ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <Stars value={existing.rating} size={20} />
              <span className={`badge ${existing.is_approved ? 'badge-green' : 'badge-yellow'}`}>
                {existing.is_approved ? '✅ Published' : '⏳ Awaiting approval'}
              </span>
            </div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: 8 }}>{existing.title}</h3>
            <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.7, marginBottom: 20 }}>{existing.body}</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => setEditing(true)}>✏️ Edit</button>
              <button className="btn btn-danger" onClick={remove}>🗑 Delete</button>
            </div>
          </>
        ) : (
          <form onSubmit={submit}>
            <div className="form-group">
              <label className="label">Your Rating</label>
              <Stars value={rating} onChange={setRating} size={26} />
            </div>
            <div className="form-group">
              <label className="label">Title</label>
              <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Sum up your experience in a few words" />
            </div>
            <div className="form-group">
              <label className="label">Your Review</label>
              <textarea className="textarea" rows={5} value={body} onChange={e => setBody(e.target.value)}
                placeholder="What was your experience using ScholarBridge to find and apply for scholarships?" />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : existing ? 'Update Review' : 'Submit Review'}</button>
              {existing && <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
