import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { scholarshipAPI } from '../../api/scholarships';
import { Scholarship, PaginatedResponse } from '../../types';
import { Spinner } from '../../components/ui/Spinner';
import { Pagination } from '../../components/ui/Pagination';
import { flag, fmtDate, daysLeft, degreeLabel } from '../../utils/helpers';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import toast from 'react-hot-toast';

const degreeBadgeCls: Record<string,string> = { bachelor:'badge-blue', master:'badge-purple', phd:'badge-pink', any:'badge-gray' };

export const Scholarships = () => {
  const [data, setData] = useState<PaginatedResponse<Scholarship>|null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [degree, setDegree] = useState('');
  const [page, setPage] = useState(1);

  // Input updates instantly; the API call only fires once typing pauses.
  const debouncedSearch = useDebouncedValue(search, 350);

  const load = useCallback(() => {
    const isFirstLoad = data === null;
    isFirstLoad ? setLoading(true) : setRefreshing(true);
    const params: any = { page };
    if (debouncedSearch) params.search = debouncedSearch;
    if (country) params.country = country;
    if (degree) params.degree_level = degree;
    scholarshipAPI.list(params)
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load scholarships'))
      .finally(() => { setLoading(false); setRefreshing(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, country, degree]);

  useEffect(() => { load(); }, [load]);

  const toggleSave = async (s: Scholarship) => {
    try {
      if (s.is_saved) { await scholarshipAPI.unsave(s.id); toast.success('Removed from saved'); }
      else { await scholarshipAPI.save(s.id); toast.success('Saved! 🔖'); }
      load();
    } catch { toast.error('Action failed'); }
  };

  const countries = ['Germany','UK','Netherlands','Sweden','Switzerland','Belgium','France','Denmark','Ireland','Norway','Austria','Finland','Italy','USA','Canada','Other'];

  return (
    <div className="fade-in">
      <div className="page-header page-header-row">
        <div><h1>🎓 Browse Scholarships</h1><p>Discover scholarships matched to your profile</p></div>
      </div>
      <div className="filters-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-input" aria-label="Search scholarships" placeholder="Search by title or university..." value={search}
            onChange={e=>{ setSearch(e.target.value); setPage(1); }} />
          {refreshing && <span className="search-refreshing" aria-hidden="true" />}
        </div>
        <select className="input" style={{width:160}} value={country} onChange={e=>{ setCountry(e.target.value); setPage(1); }}>
          <option value="">All Countries</option>
          {countries.map(c=><option key={c}>{c}</option>)}
        </select>
        <select className="input" style={{width:150}} value={degree} onChange={e=>{ setDegree(e.target.value); setPage(1); }}>
          <option value="">All Degrees</option>
          <option value="bachelor">Bachelor's</option>
          <option value="master">Master's</option>
          <option value="phd">PhD</option>
        </select>
      </div>

      {loading || !data ? <Spinner text="Loading scholarships..." /> :
       !data.results.length ? (
        <div className="empty"><div className="e-icon">🔍</div><h3>No scholarships found</h3><p>Try adjusting your search or filters</p></div>
      ) : (
        <>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:18}}>
            {data.results.map(s => {
              const days = daysLeft(s.application_deadline);
              return (
                <div key={s.id} className="sch-card">
                  {days > 0 && days < 14 && <div className="sch-deadline-badge">⏰ {days}d left</div>}
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                    <div className="sch-badges">
                      <span className={`badge ${degreeBadgeCls[s.degree_level]||'badge-gray'}`}>{degreeLabel(s.degree_level)}</span>
                      <span className="badge badge-gray">{flag(s.country)} {s.country}</span>
                    </div>
                    <button className="save-btn" onClick={()=>toggleSave(s)} title={s.is_saved?'Remove from saved':'Save scholarship'}>
                      <span style={{fontSize:20,color:s.is_saved?'#ef4444':'#cbd5e1'}}>{s.is_saved?'❤️':'🤍'}</span>
                    </button>
                  </div>
                  <div className="sch-title">{s.title}</div>
                  <div className="sch-univ">🏛 {s.university_name}</div>
                  <div className="sch-meta">
                    <span>💰 {s.scholarship_amount}</span>
                    <span>📅 Deadline: {fmtDate(s.application_deadline)}</span>
                    {s.required_percentage && <span>📊 Min: {s.required_percentage}%</span>}
                  </div>
                  <Link to={`/student/scholarships/${s.id}`} style={{textDecoration:'none'}}>
                    <button className={`btn btn-sm ${s.is_applied?'btn-success':'btn-primary'}`} style={{width:'100%',justifyContent:'center'}}>
                      {s.is_applied ? '✓ Applied' : 'View Details & Apply'}
                    </button>
                  </Link>
                </div>
              );
            })}
          </div>
          <Pagination page={page} total={data.count} onChange={setPage} />
        </>
      )}
    </div>
  );
};
