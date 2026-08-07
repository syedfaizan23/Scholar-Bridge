import React, { useEffect, useState } from 'react';
import { authAPI } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { Spinner } from '../../components/ui/Spinner';
import { FIELD_RESTRICTIONS } from '../../utils/helpers';
import toast from 'react-hot-toast';

const Section = ({ children }: { children: React.ReactNode }) => (
  <div className="section-label">{children}</div>
);

const Field = ({ label, type='text', ph='', value, onChange, restrict, ...rest }: any) => {
  const r = restrict ? FIELD_RESTRICTIONS[restrict] : null;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (r) e.target.value = r.sanitize(e.target.value);
    onChange(e);
  };
  return (
    <div className="form-group">
      <label className="label">{label}</label>
      <input
        className="input" type={type} value={value||''} onChange={handleChange} placeholder={ph}
        maxLength={r?.maxLength} inputMode={r?.inputMode as any} {...rest}
      />
    </div>
  );
};

export const Profile = () => {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    authAPI.getProfile().then(({ data }) => {
      const p: any = data.student_profile || {};
      setForm({
        nationality: p.nationality||'', phone: p.phone||'',
        date_of_birth: p.date_of_birth||'', percentage: p.percentage||'',
        cgpa: p.cgpa||'', ielts_score: p.ielts_score||'',
        desired_degree: p.desired_degree||'', bio: p.bio||'',
        address: p.address||'', city: p.city||'', province: p.province||'',
        father_name: p.father_name||'', father_contact: p.father_contact||'',
        mother_name: p.mother_name||'', mother_contact: p.mother_contact||'',
        last_institution: p.last_institution||'', last_degree: p.last_degree||'',
        field_of_study: p.field_of_study||'',
        extracurriculars: p.extracurriculars||'', achievements: p.achievements||'',
      });
      setUser(data);
    }).finally(() => setLoading(false));
  }, [setUser]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
    setForm((f: any) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      await authAPI.updateProfile(form);
      const { data } = await authAPI.getProfile();
      setUser(data);
      toast.success('Profile updated! ✅');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <Spinner text="Loading profile..." />;

  return (
    <div className="fade-in" style={{maxWidth:720}}>
      <div className="page-header"><h1>👤 My Profile</h1><p>Keep your profile updated for accurate scholarship matching</p></div>
      <div className="card" style={{marginBottom:16}}>
        <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:20,paddingBottom:16,borderBottom:'1px solid #f1f5f9'}}>
          <div className="avatar" style={{width:56,height:56,fontSize:22,background:'#2563eb'}}>
            {(user?.first_name?.[0]||user?.username?.[0]||'U').toUpperCase()}
          </div>
          <div>
            <div style={{fontWeight:700,fontSize:'1.1rem'}}>{user?.first_name} {user?.last_name}</div>
            <div style={{color:'#64748b',fontSize:13}}>{user?.email}</div>
          </div>
        </div>

        <Section>Academic Profile</Section>
        <div className="grid-3">
          <Field label="Percentage (%)" value={form.percentage} onChange={set('percentage')} type="number" ph="e.g. 85.5" min={0} max={100} step="0.01" />
          <Field label="CGPA"           value={form.cgpa} onChange={set('cgpa')}       type="number" ph="e.g. 3.5"  min={0} max={4} step="0.01" />
          <Field label="IELTS Score"    value={form.ielts_score} onChange={set('ielts_score')} type="number" ph="e.g. 6.5" min={0} max={9} step="0.5" />
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label className="label">Desired Degree</label>
            <select className="select" value={form.desired_degree} onChange={set('desired_degree')}>
              <option value="">Select</option>
              <option value="bachelor">Bachelor's</option>
              <option value="master">Master's</option>
              <option value="phd">PhD</option>
            </select>
          </div>
          <Field label="Field of Study" value={form.field_of_study} onChange={set('field_of_study')} ph="e.g. Computer Science" />
        </div>

        <Section>Personal Information</Section>
        <div className="grid-2">
          <Field label="Nationality" value={form.nationality} onChange={set('nationality')} ph="e.g. Nigerian, Filipino, Indian..." />
          <Field label="Phone"       value={form.phone} onChange={set('phone')}       ph="Include country code, e.g. +1 234 567 8900" restrict="phone" />
        </div>
        <div className="grid-2">
          <Field label="Date of Birth" value={form.date_of_birth} onChange={set('date_of_birth')} type="date" />
          <Field label="City"           value={form.city} onChange={set('city')}          ph="e.g. Lagos, Manila, Karachi..." />
        </div>
        <Field label="Address" value={form.address} onChange={set('address')} ph="Street address, area" />

        <Section>Family Information</Section>
        <div className="grid-2">
          <Field label="Father's Name"    value={form.father_name} onChange={set('father_name')}    />
          <Field label="Father's Contact" value={form.father_contact} onChange={set('father_contact')} ph="Include country code" restrict="phone" />
        </div>
        <div className="grid-2">
          <Field label="Mother's Name"    value={form.mother_name} onChange={set('mother_name')}    />
          <Field label="Mother's Contact" value={form.mother_contact} onChange={set('mother_contact')} ph="Include country code" restrict="phone" />
        </div>

        <Section>Background</Section>
        <div className="grid-2">
          <Field label="Last Institution" value={form.last_institution} onChange={set('last_institution')} />
          <Field label="Last Degree"      value={form.last_degree} onChange={set('last_degree')} />
        </div>
        <div className="form-group"><label className="label">Extracurricular Activities</label><textarea className="textarea" rows={2} value={form.extracurriculars||''} onChange={set('extracurriculars')} /></div>
        <div className="form-group"><label className="label">Achievements & Awards</label><textarea className="textarea" rows={2} value={form.achievements||''} onChange={set('achievements')} /></div>

        <button className="btn btn-primary" onClick={save} disabled={saving} style={{marginTop:8}}>
          {saving ? '⏳ Saving...' : '💾 Save Profile'}
        </button>
      </div>
    </div>
  );
};
