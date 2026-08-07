import React, { useEffect, useState, useCallback } from 'react';
import { reviewAPI } from '../../api/reviews';
import { Review, PaginatedResponse } from '../../types';
import { Spinner } from '../../components/ui/Spinner';
import { Pagination } from '../../components/ui/Pagination';
import { Stars } from '../../components/common/Stars';
import { fmtDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'true', label: '✅ Approved' },
  { value: 'false', label: '⏳ Pending' },
];

export const AdminReviews = () => {
  const [data, setData] = useState<PaginatedResponse<Review> | null>(null);
  const [loading, setLoading] = useState(true);
  const [approved, setApproved] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    const params: any = { page };
    if (approved) params.is_approved = approved;
    reviewAPI.listAdmin(params).then(r => setData(r.data)).finally(() => setLoading(false));
  }, [page, approved]);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (id: number, val: boolean) => {
    try {
      await reviewAPI.setApproved(id, val);
      toast.success(val ? 'Review approved' : 'Review unapproved');
      load();
    } catch { toast.error('Failed to update'); }
  };

  const remove = async (id: number) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      await reviewAPI.remove(id);
      toast.success('Deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>⭐ Reviews</h1>
        <p>{data?.count || 0} student reviews</p>
      </div>

      <div className="filters-bar">
        {FILTERS.map(f => (
          <button key={f.value} className={`filter-chip${approved === f.value ? ' active' : ''}`}
            onClick={() => { setApproved(f.value); setPage(1); }}>{f.label}</button>
        ))}
      </div>

      {loading || !data ? <Spinner text="Loading reviews..." /> :
       !data.results.length ? (
        <div className="empty"><div className="e-icon">⭐</div><h3>No reviews found</h3></div>
      ) : (
        <>
          <div className="table-card">
            <div className="table-wrap">
              <table>
                <thead><tr><th>Student</th><th>Rating</th><th>Title & Body</th><th>Status</th><th>Submitted</th><th>Actions</th></tr></thead>
                <tbody>
                  {data.results.map(r => (
                    <tr key={r.id}>
                      <td>
                        <strong style={{ fontSize: 13 }}>{r.student_name}</strong>
                        <br /><span style={{ fontSize: 11, color: '#9ca3af' }}>{r.student_email}</span>
                      </td>
                      <td><Stars value={r.rating} /></td>
                      <td style={{ maxWidth: 280 }}>
                        <strong style={{ fontSize: 12.5 }}>{r.title}</strong>
                        <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>
                          {r.body.length > 100 ? r.body.slice(0, 100) + '…' : r.body}
                        </p>
                      </td>
                      <td>
                        <span className={`badge ${r.is_approved ? 'badge-green' : 'badge-yellow'}`}>
                          {r.is_approved ? '✅ Approved' : '⏳ Pending'}
                        </span>
                      </td>
                      <td style={{ fontSize: 12 }}>{fmtDate(r.created_at)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {r.is_approved
                            ? <button className="btn btn-secondary btn-sm" onClick={() => setStatus(r.id, false)}>Unapprove</button>
                            : <button className="btn btn-success btn-sm" onClick={() => setStatus(r.id, true)}>✅ Approve</button>}
                          <button className="btn btn-danger btn-sm" onClick={() => remove(r.id)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} total={data.count} onChange={setPage} />
        </>
      )}
    </div>
  );
};
