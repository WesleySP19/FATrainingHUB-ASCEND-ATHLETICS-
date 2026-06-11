"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AthleteNavbar({ athleteId }) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    window.location.href = '/athlete/login';
  };

  const navLinks = [
    { href: `/athlete/${athleteId}`, label: '🏈 LOCKER ROOM', exact: true },
    { href: `/athlete/${athleteId}/playbook`, label: '📋 SALA TÁTICA' }
  ];

  if (!athleteId) return null;

  return (
    <nav style={{ 
      background: 'rgba(15, 23, 42, 0.85)', 
      backdropFilter: 'blur(10px)', 
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      padding: '15px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <h1 style={{ 
          color: '#06b6d4', 
          margin: 0, 
          fontSize: '1.2rem',
          letterSpacing: '1px' 
        }}>
          ASCEND<span style={{ color: '#fff' }}>ATHLETICS</span>
        </h1>

        <div style={{ display: 'flex', gap: '10px', marginLeft: '30px' }}>
          {navLinks.map(link => {
            const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link 
                key={link.href}
                href={link.href}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                  background: isActive ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(6, 182, 212, 0.4)' : 'transparent'}`,
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  transition: 'all 0.2s',
                  letterSpacing: '0.5px'
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <button 
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#a1a1aa',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'; }}
        >
          SAIR
        </button>
      </div>
    </nav>
  );
}
