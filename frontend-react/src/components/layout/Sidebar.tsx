import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavItem { to:string; icon:string; label:string; }
interface SidebarProps { items: NavItem[]; open?: boolean; onClose?: () => void; }

export const Sidebar = ({ items, open, onClose }: SidebarProps) => (
  <>
    {open && <div className="sidebar-backdrop" onClick={onClose} />}
    <aside className={`sidebar${open ? ' sidebar-open' : ''}`}>
      {items.map(item => (
        <NavLink key={item.to} to={item.to} onClick={onClose}
          className={({isActive}) => `nav-link${isActive?' active':''}`}>
          <span className="nav-icon">{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </aside>
  </>
);
