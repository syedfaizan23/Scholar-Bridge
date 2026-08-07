import React from 'react';
interface Props { page:number; total:number; pageSize?:number; onChange:(p:number)=>void; }
export const Pagination = ({ page, total, pageSize=10, onChange }: Props) => {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;
  const nums = Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1);
  return (
    <div className="pagination">
      <button className="btn btn-secondary btn-sm" disabled={page===1} onClick={()=>onChange(page-1)}>← Prev</button>
      {nums.map(p => (
        <button key={p} className={`btn btn-sm ${p===page?'btn-primary':'btn-secondary'}`} onClick={()=>onChange(p)}>{p}</button>
      ))}
      <button className="btn btn-secondary btn-sm" disabled={page===pages} onClick={()=>onChange(page+1)}>Next →</button>
    </div>
  );
};
