import React, { useEffect, useState, useCallback } from 'react';
import { authAPI } from '../../api/auth';
import { Spinner } from '../../components/ui/Spinner';
import { Pagination } from '../../components/ui/Pagination';
import { fmtDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

export const AdminStudents = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    authAPI.getStudents(page).then(r=>setData(r.data)).finally(()=>setLoading(false));
  },[page]);
  useEffect(()=>{ load(); },[load]);

  const toggle = async (id:number) => {
    try { await authAPI.toggleStudent(id); toast.success('Updated'); load(); }
    catch { toast.error('Failed'); }
  };
  const del = async (id:number) => {
    if (!window.confirm('Delete this student account?')) return;
    try { await authAPI.deleteStudent(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="fade-in">
      <div className="page-header"><h1>👥 Students</h1><p>{data?.count||0} registered students</p></div>
      {loading ? <Spinner /> : (
        <>
          <div className="table-card">
            <div className="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
                <tbody>
                  {data?.results.map((u:any)=>(
                    <tr key={u.id}>
                      <td><strong>{u.first_name} {u.last_name}</strong></td>
                      <td style={{fontSize:12.5}}>{u.email}</td>
                      <td>
                        <span className={`badge ${u.is_active?'badge-green':'badge-red'}`}>
                          {u.is_active?'Active':'Inactive'}
                        </span>
                      </td>
                      <td style={{fontSize:12}}>{fmtDate(u.created_at)}</td>
                      <td>
                        <div style={{display:'flex',gap:4}}>
                          <button className="btn btn-secondary btn-sm" onClick={()=>toggle(u.id)}>{u.is_active?'🚫 Deactivate':'✅ Activate'}</button>
                          <button className="btn btn-danger btn-sm" onClick={()=>del(u.id)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} total={data?.count||0} onChange={setPage} />
        </>
      )}
    </div>
  );
};
