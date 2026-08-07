import React, { useEffect, ReactNode } from 'react';
interface Props { open:boolean; onClose:()=>void; title?:string; children:ReactNode; maxWidth?:number; }
export const Modal = ({ open, onClose, title, children, maxWidth=680 }: Props) => {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth }}>
        {title && (
          <div className="modal-header">
            <h3>{title}</h3>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};
