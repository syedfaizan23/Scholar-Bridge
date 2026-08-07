import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { scholarshipAPI } from '../../api/scholarships';
import { authAPI } from '../../api/auth';
import { applicationAPI } from '../../api/applications';
import { Scholarship, EligibilityResult, User } from '../../types';
import { Spinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import { ChallanDocument, ChallanProps } from '../../components/challan/ChallanDocument';
import { flag, fmtDate, daysLeft, degreeLabel, FIELD_RESTRICTIONS } from '../../utils/helpers';
import logo from '../../assets/logo-icon.png';
import toast from 'react-hot-toast';

const STEPS = ['Personal Info','Family & Address','Academic BG','Statement','Review & Submit'];

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="section-label" style={{marginTop:4}}>{children}</div>
);

const Row2 = ({ children }: { children: React.ReactNode }) => (
  <div className="grid-2">{children}</div>
);

const Field = ({ label, value, onChange, req, pre, type='text', badge, restrict }: any) => {
  const r = restrict ? FIELD_RESTRICTIONS[restrict] : null;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (r) e.target.value = r.sanitize(e.target.value);
    onChange(e);
  };
  return (
    <div className="form-group">
      <label className="label">
        {label} {req && <span className="req">*</span>}
        {badge && <span className="auto-badge">✓ Auto-filled</span>}
      </label>
      <input
        className={`input${pre?' prefilled':''}`} type={type} value={value} onChange={handleChange}
        maxLength={r?.maxLength} inputMode={r?.inputMode as any}
      />
    </div>
  );
};

const ErrMsg = ({ msg }: { msg?: string }) => msg ? <div className="err-msg">{msg}</div> : null;

export const ScholarshipDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [elig, setElig] = useState<EligibilityResult | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [challanData, setChallanData] = useState<ChallanProps | null>(null);
  const [errors, setErrors] = useState<Record<string,string>>({});
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: printRef, documentTitle: 'ScholarBridge_Challan' });

  const [form, setForm] = useState<any>({
    first_name:'',last_name:'',email:'',phone:'',nationality:'',dob:'',cnic:'',gender:'',
    father_name:'',father_phone:'',father_occ:'',mother_name:'',mother_phone:'',mother_occ:'',
    address:'',city:'',province:'',postal:'',ec_name:'',ec_phone:'',ec_rel:'',
    percentage:'',cgpa:'',ielts:'',degree:'',field:'',institution:'',last_degree:'',
    grad_year:'',extra:'',achievements:'',statement:'',referral:'',declaration:false,
  });

  const sf = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
    setForm((f: any) => ({ ...f, [k]: e.target.value }));

  const loadPage = () => {
    if (!id) return;
    setPageLoading(true);
    Promise.all([scholarshipAPI.get(+id), authAPI.getProfile()])
      .then(([sr, ur]) => {
        setScholarship(sr.data);
        setUser(ur.data);
      })
      .catch(() => toast.error('Failed to load scholarship'))
      .finally(() => setPageLoading(false));
    scholarshipAPI.eligibility(+id).then(r => setElig(r.data)).catch(() => {});
  };

  useEffect(loadPage, [id]);

  const openApply = () => {
    if (!user) return;
    const p: any = user.student_profile || {};
    setForm((f: any) => ({
      ...f,
      first_name: user.first_name||'', last_name: user.last_name||'',
      email: user.email||'', phone: p.phone||'', nationality: p.nationality||'',
      dob: p.date_of_birth||'', father_name: p.father_name||'',
      father_phone: p.father_contact||'', father_occ: p.father_occupation||'',
      mother_name: p.mother_name||'', mother_phone: p.mother_contact||'',
      mother_occ: p.mother_occupation||'', address: p.address||'',
      city: p.city||'', province: p.province||'', postal: p.postal_code||'',
      ec_name: p.emergency_contact_name||'', ec_phone: p.emergency_contact_phone||'',
      ec_rel: p.emergency_contact_relation||'', percentage: p.percentage||'',
      cgpa: p.cgpa||'', ielts: p.ielts_score||'', degree: p.desired_degree||'',
      field: p.field_of_study||'', institution: p.last_institution||'',
      last_degree: p.last_degree||'', grad_year: p.graduation_year||'',
      extra: p.extracurriculars||'', achievements: p.achievements||'',
    }));
    setStep(1); setChallanData(null); setErrors({});
    setApplyOpen(true);
  };

  const validate = (s: number): boolean => {
    const e: Record<string,string> = {};
    if (s===1) {
      if (!form.first_name) e.first_name='Required';
      if (!form.last_name)  e.last_name='Required';
      if (!form.email)      e.email='Required';
      if (!form.phone)      e.phone='Required';
      if (!form.nationality) e.nationality='Required';
      if (!form.cnic)       e.cnic='Required';
    }
    if (s===2) {
      if (!form.father_name)  e.father_name='Required';
      if (!form.father_phone) e.father_phone='Required';
      if (!form.mother_name)  e.mother_name='Required';
      if (!form.address)      e.address='Required';
      if (!form.city)         e.city='Required';
      if (!form.ec_name)      e.ec_name='Required';
      if (!form.ec_phone)     e.ec_phone='Required';
    }
    if (s===3) {
      if (!form.degree) e.degree='Required';
      if (!form.field)  e.field='Required';
    }
    if (s===4) {
      if (form.statement.trim().length < 50) e.statement='Write at least 50 characters';
    }
    if (s===5) {
      if (!form.declaration) e.declaration='Please accept the declaration';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = async () => {
    if (!validate(step)) return;
    if (step === 5) { await submitApp(); return; }
    setStep(s => s + 1);
  };

  const submitApp = async () => {
    if (!scholarship) return;
    setSubmitting(true);
    try {
      const { data } = await applicationAPI.create({
        scholarship_id: scholarship.id,
        personal_statement: form.statement,
      });
      const due = new Date(); due.setDate(due.getDate() + 20);
      setChallanData({
        refNo: data.challan_number || `SB-${new Date().getFullYear()}-${Math.floor(100000+Math.random()*900000)}`,
        studentName: `${form.first_name} ${form.last_name}`,
        studentEmail: form.email,
        university: scholarship.university_name,
        country: scholarship.country,
        scholarshipTitle: scholarship.title,
        amount: data.challan_amount || 2000,
        issueDate: fmtDate(new Date().toISOString()),
        dueDate: fmtDate(due.toISOString()),
      });
      toast.success('Application submitted! 🎉');
      loadPage();
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.non_field_errors?.[0] || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  const toggleSave = async () => {
    if (!scholarship) return;
    try {
      if (scholarship.is_saved) { await scholarshipAPI.unsave(scholarship.id); toast.success('Removed'); }
      else { await scholarshipAPI.save(scholarship.id); toast.success('Saved! 🔖'); }
      loadPage();
    } catch { toast.error('Failed'); }
  };

  if (pageLoading) return <Spinner text="Loading scholarship..." />;
  if (!scholarship) return <div className="empty"><div className="e-icon">❌</div><h3>Scholarship not found</h3><Link to="/student/scholarships"><button className="btn btn-primary" style={{marginTop:12}}>← Back</button></Link></div>;

  const days = daysLeft(scholarship.application_deadline);
  const s = scholarship;

  return (
    <div className="fade-in" style={{maxWidth:900,margin:'0 auto'}}>
      <Link to="/student/scholarships">
        <button className="btn btn-secondary btn-sm" style={{marginBottom:16}}>← Back to Scholarships</button>
      </Link>

      {/* Hero */}
      <div className="detail-hero">
        <div className="sch-badges">
          <span className="badge" style={{background:'rgba(255,255,255,.2)',color:'white',borderColor:'rgba(255,255,255,.3)'}}>{degreeLabel(s.degree_level)}</span>
          <span className="badge" style={{background:'rgba(255,255,255,.2)',color:'white',borderColor:'rgba(255,255,255,.3)'}}>{flag(s.country)} {s.country}</span>
        </div>
        <h1>{s.title}</h1>
        <div className="univ">🏛 {s.university_name}</div>
        <div className="info-grid">
          <div className="info-box"><div className="ib-label">Amount</div><div className="ib-value">💰 {s.scholarship_amount}</div></div>
          <div className="info-box"><div className="ib-label">Deadline</div><div className="ib-value">📅 {fmtDate(s.application_deadline)}</div></div>
          <div className="info-box"><div className="ib-label">Days Left</div><div className="ib-value" style={{color:days<14?'#fbbf24':'white'}}>{days>0?`${days} days`:'Expired'}</div></div>
          {s.required_percentage && <div className="info-box"><div className="ib-label">Min %</div><div className="ib-value">📊 {s.required_percentage}%</div></div>}
          {s.required_cgpa       && <div className="info-box"><div className="ib-label">Min CGPA</div><div className="ib-value">📈 {s.required_cgpa}/4.0</div></div>}
          {s.ielts_required      && <div className="info-box"><div className="ib-label">IELTS</div><div className="ib-value">🗣 {s.ielts_required}</div></div>}
        </div>
      </div>

      {/* Eligibility */}
      {elig && (
        <div className={`alert ${elig.is_eligible?'alert-success':'alert-error'}`} style={{marginBottom:16}}>
          {elig.is_eligible?'🎉':'❌'} <strong>{elig.is_eligible?'You are eligible!':'Not Eligible'}</strong> — {elig.message}
        </div>
      )}

      {/* Description */}
      <div className="card" style={{marginBottom:16}}>
        <h3 style={{marginBottom:10}}>📋 About This Scholarship</h3>
        <p style={{lineHeight:1.8,color:'#374151',fontSize:14}}>{s.description}</p>
      </div>
      <div className="card" style={{marginBottom:16}}>
        <h3 style={{marginBottom:10}}>✅ Eligibility Criteria</h3>
        <p style={{lineHeight:1.8,color:'#374151',fontSize:14}}>{s.eligibility_criteria}</p>
      </div>

      {/* Actions */}
      <div className="card" style={{display:'flex',gap:12,flexWrap:'wrap'}}>
        {s.is_applied
          ? <button className="btn btn-success btn-lg" style={{cursor:'default'}}>✓ Already Applied</button>
          : <button className="btn btn-primary btn-lg" onClick={openApply}>📬 Apply Now</button>}
        <button className="btn btn-secondary btn-lg" onClick={toggleSave}>
          {s.is_saved ? '🔖 Remove Saved' : '🔖 Save Scholarship'}
        </button>
        <a href={s.application_link} target="_blank" rel="noreferrer">
          <button className="btn btn-ghost btn-lg">🔗 Official Site ↗</button>
        </a>
      </div>

      {/* Apply Modal */}
      <Modal open={applyOpen} onClose={()=>setApplyOpen(false)} maxWidth={760}>
        {!challanData ? (
          <>
            {/* Collab Header */}
            <div className="apply-collab-hdr">
              <button className="modal-close" onClick={()=>setApplyOpen(false)} style={{position:'absolute',top:16,right:18,background:'rgba(255,255,255,.14)',color:'white'}}>✕</button>
              <div className="collab-logos">
                <div className="collab-logo-badge"><img src={logo} alt="" style={{width:16,height:16,marginRight:5,verticalAlign:'-3px'}} />Scholar<span style={{color:'#60a5fa'}}>Bridge</span></div>
                <div className="collab-x">in collab with<b>×</b></div>
                <div className="collab-logo-badge">{flag(s.country)} {s.university_name.substring(0,28)}{s.university_name.length>28?'…':''}</div>
              </div>
              <div style={{color:'white',fontSize:'1.05rem',fontWeight:700,marginBottom:3}}>{s.title}</div>
              <div style={{color:'#93c5fd',fontSize:'.8rem'}}>{s.university_name} · Deadline: {fmtDate(s.application_deadline)}</div>
            </div>

            {/* Step Bar */}
            <div className="step-bar">
              {STEPS.map((label, i) => {
                const n=i+1; const active=n===step; const done=n<step;
                return (
                  <React.Fragment key={label}>
                    <div className="step-item">
                      <div className={`step-circle${active?' active':done?' done':''}`}>{done?'✓':n}</div>
                      <span className={`step-label${active?' active':done?' done':''}`}>{label}</span>
                    </div>
                    {n<5 && <div className={`step-conn${done?' done':''}`}/>}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Step Bodies */}
            <div style={{padding:'20px 28px'}}>
              {step===1 && (
                <>
                  {/* Scholarship summary card */}
                  <div className="card" style={{background:'#f8fafc',marginBottom:18,display:'flex',gap:12}}>
                    <div style={{fontSize:24}}>🎓</div>
                    <div>
                      <div style={{fontWeight:700,fontSize:'.9rem'}}>{s.title}</div>
                      <div style={{fontSize:'.78rem',color:'#64748b',display:'flex',gap:10,flexWrap:'wrap'}}>
                        <span>🏛 {s.university_name}</span><span>💰 {s.scholarship_amount}</span>
                      </div>
                    </div>
                  </div>
                  <SectionTitle>Personal Information</SectionTitle>
                  <Row2>
                    <div><Field label="First Name" value={form.first_name} onChange={sf('first_name')} req pre badge /><ErrMsg msg={errors.first_name}/></div>
                    <div><Field label="Last Name"  value={form.last_name}  onChange={sf('last_name')}  req pre badge /><ErrMsg msg={errors.last_name}/></div>
                  </Row2>
                  <Row2>
                    <div><Field label="Email"   type="email" value={form.email}       onChange={sf('email')}       req pre badge /><ErrMsg msg={errors.email}/></div>
                    <div><Field label="Phone"   type="tel"   value={form.phone}       onChange={sf('phone')}       req pre badge restrict="phone" /><ErrMsg msg={errors.phone}/></div>
                  </Row2>
                  <Row2>
                    <div><Field label="Nationality" value={form.nationality} onChange={sf('nationality')} req pre badge /><ErrMsg msg={errors.nationality}/></div>
                    <Field label="Date of Birth" type="date" value={form.dob} onChange={sf('dob')} pre />
                  </Row2>
                  <Row2>
                    <div><Field label="CNIC / Passport No." value={form.cnic} onChange={sf('cnic')} req restrict="cnic" /><ErrMsg msg={errors.cnic}/></div>
                    <div className="form-group">
                      <label className="label">Gender</label>
                      <select className="select" value={form.gender} onChange={sf('gender')}>
                        <option value="">Select</option><option>Male</option><option>Female</option><option>Prefer not to say</option>
                      </select>
                    </div>
                  </Row2>
                </>
              )}
              {step===2 && (
                <>
                  <SectionTitle>Father's Information</SectionTitle>
                  <Row2>
                    <div><Field label="Father's Full Name" value={form.father_name}  onChange={sf('father_name')}  req pre badge /><ErrMsg msg={errors.father_name}/></div>
                    <div><Field label="Father's Contact"   value={form.father_phone} onChange={sf('father_phone')} req pre badge restrict="phone" /><ErrMsg msg={errors.father_phone}/></div>
                  </Row2>
                  <Field label="Father's Occupation" value={form.father_occ} onChange={sf('father_occ')} pre />
                  <SectionTitle>Mother's Information</SectionTitle>
                  <Row2>
                    <div><Field label="Mother's Full Name" value={form.mother_name}  onChange={sf('mother_name')}  req pre badge /><ErrMsg msg={errors.mother_name}/></div>
                    <Field label="Mother's Contact" value={form.mother_phone} onChange={sf('mother_phone')} pre restrict="phone" />
                  </Row2>
                  <Field label="Mother's Occupation" value={form.mother_occ} onChange={sf('mother_occ')} pre />
                  <SectionTitle>Home Address</SectionTitle>
                  <div><Field label="Full Address" value={form.address} onChange={sf('address')} req pre badge /><ErrMsg msg={errors.address}/></div>
                  <div className="grid-3">
                    <div><Field label="City" value={form.city} onChange={sf('city')} req pre badge /><ErrMsg msg={errors.city}/></div>
                    <Field label="Province"    value={form.province} onChange={sf('province')} pre />
                    <Field label="Postal Code" value={form.postal}   onChange={sf('postal')}   pre />
                  </div>
                  <SectionTitle>Emergency Contact</SectionTitle>
                  <div className="grid-3">
                    <div><Field label="Name"     value={form.ec_name}  onChange={sf('ec_name')}  req /><ErrMsg msg={errors.ec_name}/></div>
                    <div><Field label="Phone"    value={form.ec_phone} onChange={sf('ec_phone')} req restrict="phone" /><ErrMsg msg={errors.ec_phone}/></div>
                    <Field label="Relation" value={form.ec_rel}   onChange={sf('ec_rel')} />
                  </div>
                </>
              )}
              {step===3 && (
                <>
                  <SectionTitle>Current Academic Profile</SectionTitle>
                  <div className="grid-3">
                    <Field label="Percentage" type="number" value={form.percentage} onChange={sf('percentage')} pre badge />
                    <Field label="CGPA"       type="number" value={form.cgpa}       onChange={sf('cgpa')}       pre badge />
                    <Field label="IELTS"      type="number" value={form.ielts}      onChange={sf('ielts')}      pre badge />
                  </div>
                  <Row2>
                    <div>
                      <div className="form-group">
                        <label className="label">Desired Degree <span className="req">*</span></label>
                        <select className="select prefilled" value={form.degree} onChange={sf('degree')}>
                          <option value="">Select</option>
                          <option value="bachelor">Bachelor's</option>
                          <option value="master">Master's</option>
                          <option value="phd">PhD</option>
                        </select>
                      </div>
                      <ErrMsg msg={errors.degree}/>
                    </div>
                    <div><Field label="Field of Study" value={form.field} onChange={sf('field')} req pre badge /><ErrMsg msg={errors.field}/></div>
                  </Row2>
                  <SectionTitle>Previous Education</SectionTitle>
                  <Row2>
                    <Field label="Last Institution" value={form.institution}  onChange={sf('institution')}  pre />
                    <Field label="Last Degree"      value={form.last_degree}  onChange={sf('last_degree')}  pre />
                  </Row2>
                  <Row2>
                    <Field label="Graduation Year" type="number" value={form.grad_year} onChange={sf('grad_year')} pre />
                    <Field label="Transcript Link (optional)"   value={form.transcript}  onChange={sf('transcript')} />
                  </Row2>
                  <Field label="Extracurricular Activities" value={form.extra}        onChange={sf('extra')}        pre />
                  <Field label="Achievements & Awards"      value={form.achievements}  onChange={sf('achievements')} pre />
                </>
              )}
              {step===4 && (
                <>
                  <SectionTitle>Personal Statement</SectionTitle>
                  <div className="form-group">
                    <label className="label">Why do you deserve this scholarship? <span className="req">*</span></label>
                    <textarea className="textarea" rows={7} value={form.statement} onChange={sf('statement')}
                      placeholder="Describe your academic achievements, goals, and why you are the ideal candidate. Minimum 100 words recommended." />
                    <div className="hint">{form.statement.trim().split(/\s+/).filter(Boolean).length} words</div>
                    <ErrMsg msg={errors.statement}/>
                  </div>
                  <div className="form-group">
                    <label className="label">How did you hear about ScholarBridge?</label>
                    <select className="select" value={form.referral} onChange={sf('referral')}>
                      <option value="">Select</option>
                      <option>Social Media</option><option>Friend / Colleague</option>
                      <option>My University</option><option>Search Engine</option><option>Other</option>
                    </select>
                  </div>
                </>
              )}
              {step===5 && (
                <>
                  <SectionTitle>Review Your Application</SectionTitle>
                  <div className="card" style={{background:'#f8fafc',marginBottom:16}}>
                    {[
                      ['👤 Full Name',     `${form.first_name} ${form.last_name}`],
                      ['📧 Email',         form.email],['📱 Phone',form.phone],
                      ['🌍 Nationality',   form.nationality],['🪪 CNIC',form.cnic],
                      ['👨 Father',        `${form.father_name} · ${form.father_phone}`],
                      ['👩 Mother',        form.mother_name],
                      ['📍 City',          `${form.city}, ${form.province}`],
                      ['🎓 Scholarship',   s.title],['🏛 University',s.university_name],
                      ['📊 Percentage',    form.percentage?`${form.percentage}%`:'—'],
                      ['📈 CGPA',          form.cgpa?`${form.cgpa}/4.0`:'—'],
                      ['🎓 Degree',        form.degree],['📚 Field',form.field],
                      ['📝 Statement',     `${form.statement.trim().split(/\s+/).filter(Boolean).length} words`],
                    ].map(([l,v])=>(
                      <div key={l as string} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid #f1f5f9',fontSize:12.5}}>
                        <span style={{color:'#64748b',fontWeight:600}}>{l}</span>
                        <span style={{color:'#1e293b',textAlign:'right',maxWidth:'58%'}}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:9,padding:'13px 15px',marginBottom:16}}>
                    <label style={{display:'flex',gap:9,alignItems:'flex-start',cursor:'pointer',fontSize:12,lineHeight:1.6}}>
                      <input type="checkbox" checked={form.declaration} onChange={e=>setForm((f:any)=>({...f,declaration:e.target.checked}))} style={{marginTop:3,accentColor:'#2563eb',flexShrink:0}} />
                      <span>I, <strong>{form.first_name} {form.last_name}</strong>, declare that all information is true and accurate. I agree to ScholarBridge Terms of Service and the university's scholarship policies.</span>
                    </label>
                    <ErrMsg msg={errors.declaration}/>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div style={{padding:'14px 28px 22px',display:'flex',alignItems:'center',justifyContent:'space-between',borderTop:'1px solid #f1f5f9'}}>
              <button className="btn btn-secondary" onClick={()=>setStep(s=>Math.max(1,s-1))} style={{visibility:step===1?'hidden':'visible'}}>← Back</button>
              <span style={{fontSize:11,color:'#94a3b8'}}>Step {step} of 5</span>
              <button className={`btn ${step===5?'btn-success':'btn-primary'}`} onClick={goNext} disabled={submitting}>
                {submitting ? '⏳ Submitting…' : step===5 ? '✔ Submit Application' : 'Continue →'}
              </button>
            </div>
          </>
        ) : (
          /* Challan screen */
          <div>
            <ChallanDocument ref={printRef} {...challanData} />
            <div style={{display:'flex',gap:10,justifyContent:'center',padding:'16px 24px 24px',flexWrap:'wrap'}} className="no-print">
              <button className="btn btn-primary" onClick={()=>handlePrint()}>🖨 Print Challan</button>
              <button className="btn btn-secondary" onClick={()=>{ setApplyOpen(false); navigate('/student/applications'); }}>📬 My Applications</button>
              <button className="btn btn-secondary" onClick={()=>setApplyOpen(false)}>✕ Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
