"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCoach } from '@/contexts/CoachContext';

export default function CoachNavbar() {
  const pathname = usePathname();
  const { logoutCoach } = useCoach();

  const handleLogout = () => {
    logoutCoach();
  };

  const navLinks = [
    { href: '/coach', label: '🏠 MONTAR TREINO', exact: true },
    { href: '/coach/roster', label: '👥 ROSTER' },
    { href: '/coach/library', label: '📚 BIBLIOTECA' },
    { href: '/coach/playbook', label: '📋 PLAYBOOK' }
  ];

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
          color: 'var(--primary-color)', 
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
                  background: isActive ? 'rgba(249, 115, 22, 0.2)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(249, 115, 22, 0.4)' : 'transparent'}`,
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
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          SAIR
        </button>
      </div>
    </nav>
  );
}
