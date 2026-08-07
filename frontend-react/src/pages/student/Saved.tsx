import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { scholarshipAPI } from '../../api/scholarships';
import { Spinner } from '../../components/ui/Spinner';
import { flag, fmtDate, degreeLabel } from '../../utils/helpers';
import toast from 'react-hot-toast';

export const Saved = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    scholarshipAPI.getSaved().then(r => setItems(r.data.results || r.data)).catch(()=>toast.error('Failed to load')).finally(()=>setLoading(false));
  };
  useEffect(load, []);

  const remove = async (id: number) => {
    try { await scholarshipAPI.unsave(id); toast.success('Removed'); load(); }
    catch { toast.error('Failed'); }
  };

  if (loading) return <Spinner text="Loading saved scholarships..." />;

  return (
    <div className="fade-in">
      <div className="page-header"><h1>🔖 Saved Scholarships</h1><p>Scholarships you've bookmarked for later</p></div>
      {!items.length ? (
        <div className="empty"><div className="e-icon">🔖</div><h3>No saved scholarships</h3><p>Save scholarships you're interested in to find them here</p></div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:18}}>
          {items.map((item: any) => {
            const s = item.scholarship || item;
            return (
              <div key={item.id} className="sch-card">
                <div className="sch-badges" style={{marginBottom:8}}>
                  <span className="badge badge-gray">{flag(s.country)} {s.country}</span>
                  <span className="badge badge-gray">{degreeLabel(s.degree_level)}</span>
                </div>
                <div className="sch-title">{s.title}</div>
                <div className="sch-univ">🏛 {s.university_name}</div>
                <div className="sch-meta" style={{marginBottom:12}}>
                  <span>💰 {s.scholarship_amount}</span>
                  <span>📅 {fmtDate(s.application_deadline)}</span>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <Link to={`/student/scholarships/${s.id}`} style={{flex:1,textDecoration:'none'}}>
                    <button className="btn btn-primary btn-sm" style={{width:'100%',justifyContent:'center'}}>View Details</button>
                  </Link>
                  <button className="btn btn-secondary btn-sm" onClick={()=>remove(s.id)}>🗑</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
