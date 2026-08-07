import React, { useEffect, useState, useCallback } from 'react';
import { applicationAPI } from '../../api/applications';
import { Application, PaginatedResponse } from '../../types';
import { Spinner } from '../../components/ui/Spinner';
import { Pagination } from '../../components/ui/Pagination';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { fmtDate } from '../../utils/helpers';
import { useAuthenticatedFile } from '../../hooks/useAuthenticatedFile';
import toast from 'react-hot-toast';

const FILTERS = [
  {value:'',label:'All'},{value:'pending',label:'⏳ Challan Due'},
  {value:'challan_paid',label:'🧾 Awaiting Review'},{value:'approved',label:'✅ Approved'},
  {value:'rejected',label:'❌ Rejected'},{value:'cancelled',label:'🚫 Cancelled'},
];

export const AdminApplications = () => {
  const [data, setData] = useState<PaginatedResponse<Application>|null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<Application|null>(null);
  const [notes, setNotes] = useState('');
  const [imgUrl, setImgUrl] = useState<string|null>(null);
  const receipt = useAuthenticatedFile(imgUrl);

  const load = useCallback(() => {
    setLoading(true);
    const params: any = { page };
    if (status) params.status = status;
    applicationAPI.list(params).then(r=>setData(r.data)).finally(()=>setLoading(false));
  },[page,status]);
  useEffect(()=>{ load(); },[load]);

  const overdueCount = data?.results.filter(a=>a.status==='pending'&&a.is_challan_overdue).length||0;

  const approve = async (id:number, n?:string) => {
    try { await applicationAPI.approve(id,n); toast.success('Approved ✅'); setDetail(null); load(); }
    catch(e:any){ toast.error(e.response?.data?.error||'Failed'); }
  };
  const reject = async (id:number, n?:string) => {
    try { await applicationAPI.reject(id,n); toast.success('Rejected'); setDetail(null); load(); }
    catch{ toast.error('Failed'); }
  };
  const del = async (id:number) => {
    if (!window.confirm('Delete this application permanently?')) return;
    try { await applicationAPI.remove(id); toast.success('Deleted'); load(); }
    catch{ toast.error('Failed'); }
  };
  const expire = async () => {
    try { const {data:r}=await applicationAPI.expireOverdue(); toast.success(r.message||'Done'); load(); }
    catch{ toast.error('Failed'); }
  };

  return (
    <div className="fade-in">
      <div className="page-header page-header-row">
        <div><h1>📬 Applications</h1><p>{data?.count||0} total applications</p></div>
        <button className="btn btn-danger btn-sm" onClick={expire}>🗑 Remove Expired Challans</button>
      </div>
      {overdueCount>0 && (
        <div className="alert alert-error">
          ⚠️ <strong>{overdueCount}</strong> application(s) have passed their 20-day challan deadline.
        </div>
      )}
      <div className="filters-bar">
        {FILTERS.map(f=>(
          <button key={f.value} className={`filter-chip${status===f.value?' active':''}`}
            onClick={()=>{ setStatus(f.value); setPage(1); }}>{f.label}</button>
        ))}
      </div>
      {loading ? <Spinner /> : !data?.results.length ? (
        <div className="empty"><div className="e-icon">📬</div><h3>No applications found</h3></div>
      ) : (
        <>
          <div className="table-card">
            <div className="table-wrap">
              <table>
                <thead><tr><th>Student</th><th>Scholarship</th><th>Challan</th><th>Status</th><th>Applied</th><th>Actions</th></tr></thead>
                <tbody>
                  {data.results.map(a=>{
                    const overdue=a.status==='pending'&&a.is_challan_overdue;
                    return (
                      <tr key={a.id} style={{background:overdue?'#fff5f5':undefined}}>
                        <td>
                          <strong style={{fontSize:13}}>{a.student_name}</strong>
                          <br/><span style={{fontSize:11,color:'#9ca3af'}}>{a.student_email}</span>
                        </td>
                        <td style={{maxWidth:200}}>
                          <strong style={{fontSize:12}}>{(a.scholarship?.title||'').substring(0,40)}{(a.scholarship?.title||'').length>40?'…':''}</strong>
                          <br/><span style={{fontSize:11,color:'#9ca3af'}}>{a.scholarship?.university_name}</span>
                        </td>
                        <td>
                          {a.status==='pending'
                            ? overdue
                              ? <span className="badge badge-red">⛔ Overdue</span>
                              : <span className="badge badge-yellow">⏳ {a.challan_days_remaining}d</span>
                            : a.status==='challan_paid'
                            ? <span className="badge badge-green">🧾 Uploaded</span>
                            : <span style={{color:'#9ca3af',fontSize:12}}>—</span>}
                          <br/><span style={{fontSize:10,fontFamily:'monospace',color:'#475569'}}>{a.challan_number}</span>
                          {a.challan_image_url && (
                            <div><button className="btn btn-secondary btn-sm" style={{marginTop:4,fontSize:10}} onClick={()=>setImgUrl(a.challan_image_url)}>👁 Receipt</button></div>
                          )}
                        </td>
                        <td><StatusBadge status={a.status} /></td>
                        <td style={{fontSize:12}}>{fmtDate(a.applied_at)}</td>
                        <td>
                          <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                            <button className="btn btn-secondary btn-sm" onClick={()=>{ setDetail(a); setNotes(a.admin_notes||''); }}>👁</button>
                            {a.status==='challan_paid' && (
                              <>
                                <button className="btn btn-success btn-sm" onClick={()=>approve(a.id)}>✅</button>
                                <button className="btn btn-danger btn-sm"  onClick={()=>reject(a.id)}>❌</button>
                              </>
                            )}
                            <button className="btn btn-danger btn-sm" onClick={()=>del(a.id)}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} total={data.count} onChange={setPage} />
        </>
      )}

      {/* Detail Modal */}
      <Modal open={!!detail} onClose={()=>setDetail(null)} title="Application Details" maxWidth={600}>
        {detail && (
          <>
            <div className="modal-body">
              <div className="grid-2" style={{marginBottom:14}}>
                <div><div style={{fontSize:11,color:'#94a3b8',textTransform:'uppercase'}}>Student</div><div style={{fontSize:13,fontWeight:600}}>{detail.student_name}</div><div style={{fontSize:12,color:'#64748b'}}>{detail.student_email}</div></div>
                <div><div style={{fontSize:11,color:'#94a3b8',textTransform:'uppercase'}}>Status</div><div style={{marginTop:4}}><StatusBadge status={detail.status} /></div></div>
                <div style={{gridColumn:'1/-1'}}><div style={{fontSize:11,color:'#94a3b8',textTransform:'uppercase'}}>Scholarship</div><div style={{fontSize:13,fontWeight:600}}>{detail.scholarship?.title}</div><div style={{fontSize:12,color:'#64748b'}}>{detail.scholarship?.university_name}</div></div>
              </div>
              <div style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:10,padding:14,marginBottom:14}}>
                <div style={{fontSize:12,fontWeight:700,marginBottom:10}}>💳 Challan Details</div>
                <div className="grid-2" style={{fontSize:12.5}}>
                  <div><b>Ref:</b> <span style={{fontFamily:'monospace'}}>{detail.challan_number}</span></div>
                  <div><b>Amount:</b> PKR {(detail.challan_amount||2000).toLocaleString()}</div>
                  <div><b>Due:</b> {fmtDate(detail.challan_due_date)}</div>
                  <div><b>Paid:</b> {detail.challan_paid_at?fmtDate(detail.challan_paid_at):'—'}</div>
                </div>
                {detail.challan_image_url && (
                  <div style={{marginTop:10,display:'flex',gap:8}}>
                    <button className="btn btn-secondary btn-sm" onClick={()=>setImgUrl(detail.challan_image_url)}>👁 View / Download Receipt</button>
                  </div>
                )}
              </div>
              {detail.personal_statement && (
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:11,color:'#94a3b8',textTransform:'uppercase',marginBottom:4}}>Personal Statement</div>
                  <p style={{fontSize:13,fontStyle:'italic',background:'#f8fafc',padding:12,borderRadius:8,borderLeft:'3px solid #2563eb',lineHeight:1.7}}>"{detail.personal_statement}"</p>
                </div>
              )}
              {detail.status==='challan_paid' && (
                <div className="form-group">
                  <label className="label">Admin Notes (visible to student)</label>
                  <textarea className="textarea" rows={2} value={notes} onChange={e=>setNotes(e.target.value)} />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={()=>setDetail(null)}>Close</button>
              {detail.status==='challan_paid' && (
                <>
                  <button className="btn btn-success" onClick={()=>approve(detail.id,notes)}>✅ Approve</button>
                  <button className="btn btn-danger"  onClick={()=>reject(detail.id,notes)}>❌ Reject</button>
                </>
              )}
            </div>
          </>
        )}
      </Modal>

      {/* Image Viewer */}
      <Modal open={!!imgUrl} onClose={()=>setImgUrl(null)} title="🧾 Challan Receipt" maxWidth={640}>
        <div className="modal-body" style={{textAlign:'center'}}>
          {receipt.loading ? <Spinner text="Loading receipt..." />
            : receipt.error ? <p style={{color:'#ef4444'}}>Could not load the receipt.</p>
            : receipt.isPdf
            ? <a href={receipt.objectUrl||''} target="_blank" rel="noreferrer" className="btn btn-primary">Open PDF</a>
            : <img src={receipt.objectUrl||''} alt="Challan receipt" style={{maxWidth:'100%',borderRadius:8}} />}
        </div>
      </Modal>
    </div>
  );
};
