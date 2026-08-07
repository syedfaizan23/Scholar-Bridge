import React, { useEffect, useState, useCallback } from 'react';
import { scholarshipAPI } from '../../api/scholarships';
import { Scholarship, PaginatedResponse } from '../../types';
import { Spinner } from '../../components/ui/Spinner';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';
import { flag, fmtDate, degreeLabel } from '../../utils/helpers';
import toast from 'react-hot-toast';

const COUNTRIES = ['Germany','UK','Netherlands','Sweden','Switzerland','Belgium','France','Denmark','Ireland','Norway','Austria','Finland','Italy','USA','Canada','Other'];
const empty = { title:'',university_name:'',country:'Germany',degree_level:'master',required_cgpa:'',required_percentage:'',ielts_required:'',scholarship_amount:'',application_deadline:'',seats_available:0,description:'',eligibility_criteria:'',application_link:'' };

export const AdminScholarships = () => {
  const [data, setData] = useState<PaginatedResponse<Scholarship>|null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Scholarship|null>(null);
  const [form, setForm] = useState<any>(empty);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    scholarshipAPI.list({page}).then(r=>setData(r.data)).finally(()=>setLoading(false));
  },[page]);
  useEffect(()=>{ load(); },[load]);

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (s: Scholarship) => {
    setEditing(s);
    setForm({...s, required_cgpa:s.required_cgpa||'', required_percentage:s.required_percentage||'', ielts_required:s.ielts_required||''});
    setOpen(true);
  };
  const sf = (k:string) => (e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
    setForm((f:any)=>({...f,[k]:e.target.value}));

  const save = async () => {
    if (!form.title||!form.university_name||!form.scholarship_amount||!form.application_deadline||!form.description||!form.eligibility_criteria||!form.application_link) {
      toast.error('Please fill all required fields'); return;
    }
    setSaving(true);
    try {
      if (editing) await scholarshipAPI.update(editing.id, form);
      else await scholarshipAPI.create(form);
      toast.success(editing?'Updated!':'Created!');
      setOpen(false); load();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const del = async (id:number) => {
    if (!window.confirm('Delete this scholarship?')) return;
    try { await scholarshipAPI.remove(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="fade-in">
      <div className="page-header page-header-row">
        <div><h1>🎓 Manage Scholarships</h1><p>{data?.count||0} scholarships in the system</p></div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Scholarship</button>
      </div>
      {loading ? <Spinner /> : (
        <>
          <div className="table-card">
            <div className="table-wrap">
              <table>
                <thead><tr><th>Title</th><th>University</th><th>Country</th><th>Degree</th><th>Deadline</th><th>Actions</th></tr></thead>
                <tbody>
                  {data?.results.map(s=>(
                    <tr key={s.id}>
                      <td style={{maxWidth:220}}><strong style={{fontSize:12.5}}>{s.title}</strong></td>
                      <td style={{fontSize:12}}>{s.university_name}</td>
                      <td>{flag(s.country)} {s.country}</td>
                      <td><span className="badge badge-gray">{degreeLabel(s.degree_level)}</span></td>
                      <td style={{fontSize:12}}>{fmtDate(s.application_deadline)}</td>
                      <td>
                        <div style={{display:'flex',gap:4}}>
                          <button className="btn btn-secondary btn-sm" onClick={()=>openEdit(s)}>✏️ Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={()=>del(s.id)}>🗑</button>
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
      <Modal open={open} onClose={()=>setOpen(false)} title={editing?'Edit Scholarship':'Add Scholarship'} maxWidth={680}>
        <div className="modal-body" style={{maxHeight:'65vh',overflowY:'auto'}}>
          <div className="form-group"><label className="label">Title *</label><input className="input" value={form.title} onChange={sf('title')} /></div>
          <div className="grid-2">
            <div className="form-group"><label className="label">University *</label><input className="input" value={form.university_name} onChange={sf('university_name')} /></div>
            <div className="form-group"><label className="label">Country</label>
              <select className="select" value={form.country} onChange={sf('country')}>{COUNTRIES.map(c=><option key={c}>{c}</option>)}</select>
            </div>
          </div>
          <div className="grid-3">
            <div className="form-group"><label className="label">Degree</label>
              <select className="select" value={form.degree_level} onChange={sf('degree_level')}>
                <option value="bachelor">Bachelor's</option><option value="master">Master's</option><option value="phd">PhD</option><option value="any">Any</option>
              </select>
            </div>
            <div className="form-group"><label className="label">Min %</label><input className="input" type="number" value={form.required_percentage} onChange={sf('required_percentage')} /></div>
            <div className="form-group"><label className="label">Min CGPA</label><input className="input" type="number" value={form.required_cgpa} onChange={sf('required_cgpa')} /></div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label className="label">IELTS</label><input className="input" type="number" value={form.ielts_required} onChange={sf('ielts_required')} /></div>
            <div className="form-group"><label className="label">Seats</label><input className="input" type="number" value={form.seats_available} onChange={sf('seats_available')} /></div>
          </div>
          <div className="form-group"><label className="label">Amount *</label><input className="input" value={form.scholarship_amount} onChange={sf('scholarship_amount')} placeholder="e.g. Full Tuition + €992/month" /></div>
          <div className="form-group"><label className="label">Deadline *</label><input className="input" type="date" value={form.application_deadline} onChange={sf('application_deadline')} /></div>
          <div className="form-group"><label className="label">Description *</label><textarea className="textarea" rows={3} value={form.description} onChange={sf('description')} /></div>
          <div className="form-group"><label className="label">Eligibility Criteria *</label><textarea className="textarea" rows={3} value={form.eligibility_criteria} onChange={sf('eligibility_criteria')} /></div>
          <div className="form-group"><label className="label">Official Link *</label><input className="input" value={form.application_link} onChange={sf('application_link')} /></div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={()=>setOpen(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?'Saving…':editing?'Update':'Create'}</button>
        </div>
      </Modal>
    </div>
  );
};
