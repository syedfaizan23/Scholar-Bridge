import React, { useEffect, useState, useCallback } from 'react';
import { inquiryAPI } from '../../api/inquiries';
import { ContactInquiry, PaginatedResponse } from '../../types';
import { Spinner } from '../../components/ui/Spinner';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { fmtDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'new', label: '🆕 New' },
  { value: 'in_progress', label: '🔄 In Progress' },
  { value: 'resolved', label: '✅ Resolved' },
  { value: 'closed', label: '🔒 Closed' },
];

const STATUS_BADGE: Record<string, string> = {
  new: 'badge-blue', in_progress: 'badge-yellow', resolved: 'badge-green', closed: 'badge-gray',
};

export const AdminInquiries = () => {
  const [data, setData] = useState<PaginatedResponse<ContactInquiry> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<ContactInquiry | null>(null);

  const debouncedSearch = useDebouncedValue(search, 350);

  const load = useCallback(() => {
    const isFirstLoad = data === null;
    isFirstLoad ? setLoading(true) : setRefreshing(true);
    const params: any = { page };
    if (debouncedSearch) params.search = debouncedSearch;
    if (status) params.status = status;
    inquiryAPI.list(params)
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load inquiries'))
      .finally(() => { setLoading(false); setRefreshing(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, status]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      await inquiryAPI.updateStatus(id, newStatus);
      toast.success('Status updated');
      if (detail?.id === id) setDetail(d => d ? { ...d, status: newStatus as any } : d);
      load();
    } catch { toast.error('Failed to update status'); }
  };

  const remove = async (id: number) => {
    if (!window.confirm('Delete this inquiry permanently?')) return;
    try {
      await inquiryAPI.remove(id);
      toast.success('Deleted');
      setDetail(null);
      load();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>✉️ Contact Inquiries</h1>
        <p>{data?.count || 0} total messages from the Contact Us page</p>
      </div>

      <div className="filters-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-input" aria-label="Search inquiries" placeholder="Search by name, email, or subject..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
          {refreshing && <span className="search-refreshing" aria-hidden="true" />}
        </div>
        {STATUS_FILTERS.map(f => (
          <button key={f.value} className={`filter-chip${status === f.value ? ' active' : ''}`}
            onClick={() => { setStatus(f.value); setPage(1); }}>{f.label}</button>
        ))}
      </div>

      {loading || !data ? <Spinner text="Loading inquiries..." /> :
       !data.results.length ? (
        <div className="empty"><div className="e-icon">📭</div><h3>No inquiries found</h3></div>
      ) : (
        <>
          <div className="table-card">
            <div className="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Subject</th><th>Country</th><th>Status</th><th>Received</th><th>Actions</th></tr></thead>
                <tbody>
                  {data.results.map(inq => (
                    <tr key={inq.id}>
                      <td>
                        <strong style={{ fontSize: 13 }}>{inq.name}</strong>
                        <br /><span style={{ fontSize: 11, color: '#9ca3af' }}>{inq.email}</span>
                      </td>
                      <td style={{ maxWidth: 220 }}>
                        <span style={{ fontSize: 12.5 }}>{inq.subject}</span>
                      </td>
                      <td style={{ fontSize: 12.5 }}>{inq.country || '—'}</td>
                      <td>
                        <select className={`badge ${STATUS_BADGE[inq.status]}`} style={{ border: 'none', cursor: 'pointer' }}
                          value={inq.status} onChange={e => updateStatus(inq.id, e.target.value)}>
                          {STATUS_FILTERS.filter(f => f.value).map(f => (
                            <option key={f.value} value={f.value}>{f.label}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ fontSize: 12 }}>{fmtDate(inq.created_at)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => setDetail(inq)}>👁</button>
                          <button className="btn btn-danger btn-sm" onClick={() => remove(inq.id)}>🗑</button>
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

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Inquiry Details" maxWidth={560}>
        {detail && (
          <>
            <div className="modal-body">
              <div className="grid-2" style={{ marginBottom: 14 }}>
                <div><div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>Name</div><div style={{ fontSize: 13, fontWeight: 600 }}>{detail.name}</div></div>
                <div><div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>Email</div><div style={{ fontSize: 13 }}>{detail.email}</div></div>
                <div><div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>Phone</div><div style={{ fontSize: 13 }}>{detail.phone || '—'}</div></div>
                <div><div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>Country</div><div style={{ fontSize: 13 }}>{detail.country || '—'}</div></div>
                <div style={{ gridColumn: '1/-1' }}><div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>Subject</div><div style={{ fontSize: 13, fontWeight: 600 }}>{detail.subject}</div></div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Message</div>
                <p style={{ fontSize: 13, background: '#f8fafc', padding: 12, borderRadius: 8, borderLeft: '3px solid #2563eb', lineHeight: 1.7 }}>{detail.message}</p>
              </div>
              <div className="form-group">
                <label className="label">Status</label>
                <select className="select" value={detail.status} onChange={e => updateStatus(detail.id, e.target.value)}>
                  {STATUS_FILTERS.filter(f => f.value).map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDetail(null)}>Close</button>
              <button className="btn btn-danger" onClick={() => remove(detail.id)}>🗑 Delete</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};
