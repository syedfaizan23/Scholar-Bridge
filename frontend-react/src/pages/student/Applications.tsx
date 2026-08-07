import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { applicationAPI } from '../../api/applications';
import API from '../../api/axios';
import { Application, PaginatedResponse } from '../../types';
import { Spinner } from '../../components/ui/Spinner';
import { Pagination } from '../../components/ui/Pagination';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { ChallanDocument, ChallanProps } from '../../components/challan/ChallanDocument';
import { fmtDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const FILTERS = [
  { value:'', label:'All' },
  { value:'pending', label:'⏳ Challan Due' },
  { value:'challan_paid', label:'🧾 Under Review' },
  { value:'approved', label:'✅ Approved' },
  { value:'rejected', label:'❌ Rejected' },
  { value:'cancelled', label:'🚫 Cancelled' },
];

export const Applications = () => {
  const [data, setData] = useState<PaginatedResponse<Application>|null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [challanView, setChallanView] = useState<ChallanProps|null>(null);
  const [uploadApp, setUploadApp] = useState<Application|null>(null);
  const [file, setFile] = useState<File|null>(null);
  const [uploading, setUploading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: printRef, documentTitle: 'ScholarBridge_Challan' });

  const load = useCallback(() => {
    setLoading(true);
    const params: any = { page };
    if (status) params.status = status;
    applicationAPI.list(params)
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load applications'))
      .finally(() => setLoading(false));
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  const cancel = async (id: number) => {
    if (!window.confirm('Cancel this application?')) return;
    try {
      await applicationAPI.remove(id);
      toast.success('Application cancelled');
      load();
    } catch { toast.error('Failed to cancel'); }
  };

  // Fetches with auth (a plain <a href> can't send the Authorization header).
  const viewReceipt = async (url: string) => {
    try {
      const path = url.replace(/^.*\/api/, '');
      const res = await API.get(path, { responseType: 'blob' });
      const blobUrl = URL.createObjectURL(res.data);
      window.open(blobUrl, '_blank');
    } catch {
      toast.error('Could not load the receipt');
    }
  };

  const submitUpload = async () => {
    if (!uploadApp || !file) return;
    setUploading(true);
    try {
      await applicationAPI.uploadChallan(uploadApp.id, file);
      toast.success('Challan uploaded! Under review now. ✅');
      setUploadApp(null); setFile(null); load();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally { setUploading(false); }
  };

  const openChallan = (a: Application) => {
    const due = new Date(); due.setDate(due.getDate() + 20);
    setChallanView({
      refNo: a.challan_number,
      studentName: a.student_name,
      studentEmail: a.student_email,
      university: a.scholarship?.university_name || '',
      country: a.scholarship?.country || '',
      scholarshipTitle: a.scholarship?.title || '',
      amount: a.challan_amount || 2000,
      issueDate: fmtDate(a.applied_at),
      dueDate: fmtDate(a.challan_due_date),
    });
  };

  return (
    <div className="fade-in">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
        <div className="page-header" style={{marginBottom:0}}>
          <h1>📬 My Applications</h1>
          <p>Track your applications and challan payments</p>
        </div>
      </div>

      <div className="filters-bar" style={{marginTop:16}}>
        {FILTERS.map(f => (
          <button key={f.value}
            className={`filter-chip${status===f.value?' active':''}`}
            onClick={() => { setStatus(f.value); setPage(1); }}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? <Spinner text="Loading applications..." /> :
       !data?.results.length ? (
        <div className="empty">
          <div className="e-icon">📬</div>
          <h3>No applications found</h3>
          <p>{status ? `No ${status.replace('_',' ')} applications` : "You haven't applied yet"}</p>
        </div>
      ) : (
        <>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {data.results.map(a => (
              <div key={a.id} className="card">
                <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                  <div style={{ flex:1, minWidth:280 }}>
                    <div style={{ display:'flex', gap:6, marginBottom:8, flexWrap:'wrap' }}>
                      <StatusBadge status={a.status} />
                      {a.scholarship_tier > 0 && (
                        <span className="badge badge-yellow">🏆 {a.scholarship_tier}% Tier</span>
                      )}
                    </div>
                    <div style={{ fontWeight:700, fontSize:'1rem' }}>{a.scholarship?.title}</div>
                    <div style={{ color:'#2563eb', fontWeight:600, fontSize:13, marginTop:2 }}>{a.scholarship?.university_name}</div>
                    <div style={{ display:'flex', gap:14, fontSize:12, color:'#64748b', marginTop:8 }}>
                      <span>📅 Applied: {fmtDate(a.applied_at)}</span>
                      {a.applied_percentage && <span>📊 {a.applied_percentage}%</span>}
                      {a.applied_cgpa && <span>📈 {a.applied_cgpa} CGPA</span>}
                    </div>
                    {a.admin_notes && (
                      <div className="alert alert-info" style={{ marginTop:10, marginBottom:0 }}>
                        💬 Admin: {a.admin_notes}
                      </div>
                    )}
                    {a.status === 'approved' && (
                      <div className="alert alert-success" style={{ marginTop:10, marginBottom:0 }}>
                        🎉 Congratulations! Your application has been approved.
                      </div>
                    )}
                    {a.status === 'rejected' && (
                      <div className="alert alert-error" style={{ marginTop:10, marginBottom:0 }}>
                        ❌ Application was not successful this time.
                      </div>
                    )}

                    {/* Challan section - pending */}
                    {a.status === 'pending' && (
                      <div className={`challan-card${a.is_challan_overdue?' overdue':' pending'}`}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8, marginBottom:8 }}>
                          <strong style={{ fontSize:13, color: a.is_challan_overdue?'#991b1b':'#92400e' }}>
                            {a.is_challan_overdue ? '⛔ Challan Deadline Passed' : '💳 Processing Challan Due'}
                          </strong>
                          <span style={{ fontFamily:'monospace', fontSize:11, background:'rgba(0,0,0,.06)', padding:'2px 8px', borderRadius:4 }}>
                            {a.challan_number}
                          </span>
                        </div>
                        <div style={{ fontSize:12, color:'#6b7280', display:'flex', gap:14, flexWrap:'wrap', marginBottom:8 }}>
                          <span>Amount: <strong>PKR {(a.challan_amount||2000).toLocaleString()}</strong></span>
                          <span>Due: <strong>{fmtDate(a.challan_due_date)}</strong></span>
                          {!a.is_challan_overdue && (
                            <span className="badge badge-yellow">⏰ {a.challan_days_remaining}d remaining</span>
                          )}
                        </div>
                        {!a.is_challan_overdue && (
                          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                            <button className="btn btn-primary btn-sm" onClick={()=>openChallan(a)}>🖨 View / Print Challan</button>
                            <button className="btn btn-secondary btn-sm" onClick={()=>setUploadApp(a)}>📤 Upload Paid Receipt</button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Challan section - paid */}
                    {a.status === 'challan_paid' && (
                      <div className="challan-card paid">
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8, marginBottom:8 }}>
                          <strong style={{ fontSize:13, color:'#065f46' }}>🧾 Challan Uploaded — Under Admin Review</strong>
                          <span style={{ fontFamily:'monospace', fontSize:11, background:'rgba(0,0,0,.06)', padding:'2px 8px', borderRadius:4 }}>
                            {a.challan_number}
                          </span>
                        </div>
                        <div style={{ fontSize:12, color:'#6b7280', marginBottom:8 }}>
                          Uploaded: {a.challan_paid_at ? fmtDate(a.challan_paid_at) : '—'}
                        </div>
                        {a.challan_image_url && (
                          <button className="btn btn-secondary btn-sm" onClick={()=>viewReceipt(a.challan_image_url!)}>👁 View Uploaded Receipt</button>
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end' }}>
                    {a.status === 'pending' && !a.is_challan_overdue && (
                      <button className="btn btn-danger btn-sm" onClick={()=>cancel(a.id)}>🗑 Cancel</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} total={data.count} onChange={setPage} />
        </>
      )}

      {/* Challan Print Modal */}
      <Modal open={!!challanView} onClose={()=>setChallanView(null)} maxWidth={760}>
        {challanView && (
          <div>
            <ChallanDocument ref={printRef} {...challanView} />
            <div style={{ display:'flex', gap:10, justifyContent:'center', padding:'16px 24px 24px' }} className="no-print">
              <button className="btn btn-primary" onClick={()=>handlePrint()}>🖨 Print Challan</button>
              <button className="btn btn-secondary" onClick={()=>setChallanView(null)}>✕ Close</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Upload Challan Modal */}
      <Modal open={!!uploadApp} onClose={()=>{ setUploadApp(null); setFile(null); }} title="📤 Upload Paid Challan Receipt" maxWidth={460}>
        <div className="modal-body">
          <p style={{ fontSize:13, color:'#374151', marginBottom:14, lineHeight:1.6 }}>
            Upload a clear photo or scan of your <strong>paid & bank-stamped</strong> challan.
            Accepted: JPG, PNG, WEBP, PDF — max 5 MB.
          </p>
          <label style={{
            border:'2px dashed #cbd5e1', borderRadius:10, padding:'32px 20px',
            textAlign:'center', cursor:'pointer', display:'block', background:'#f8fafc',
            transition:'all .2s'
          }}>
            <input type="file" accept="image/*,.pdf" style={{ display:'none' }}
              onChange={e => setFile(e.target.files?.[0] || null)} />
            <div style={{ fontSize:36, marginBottom:8 }}>📎</div>
            <div style={{ fontWeight:600, fontSize:14 }}>
              {file ? file.name : 'Click to choose file'}
            </div>
            {file && <div style={{ fontSize:11, color:'#6b7280', marginTop:4 }}>{(file.size/1024).toFixed(1)} KB</div>}
          </label>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={()=>{ setUploadApp(null); setFile(null); }}>Cancel</button>
          <button className="btn btn-primary" disabled={!file||uploading} onClick={submitUpload}>
            {uploading ? '⏳ Uploading…' : '📤 Upload Receipt'}
          </button>
        </div>
      </Modal>
    </div>
  );
};
