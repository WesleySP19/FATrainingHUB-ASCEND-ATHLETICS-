"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [session, setSession] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data.loggedIn) {
        setSession(data.user);
      } else {
        setSession(null);
      }
    } catch (e) {
      setSession(null);
    }
  };

  useEffect(() => {
    fetchSession();
    // Escuta eventos customizados para forçar atualização da sessão se necessário
    window.addEventListener('session-update', fetchSession);
    return () => window.removeEventListener('session-update', fetchSession);
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('athlete');
    localStorage.removeItem('coach');
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    setSession(null);
    window.location.href = '/';
  };

  const isAthlete = session?.role === 'ATHLETE';
  const isCoach = session?.role === 'COACH';

  return (
    <nav style={{
      background: 'rgba(8, 12, 24, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(6, 182, 212, 0.25)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 4px 25px rgba(6,182,212,0.1)',
      width: '100%',
      transition: 'all 0.3s'
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 12px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .nav-logo {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.35rem;
          letter-spacing: 2px;
          background: linear-gradient(135deg, #fff 40%, var(--primary-color) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .nav-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: color 0.2s, text-shadow 0.2s;
        }
        .nav-link:hover {
          color: #00ffff;
          text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
        }
        .nav-btn-logout {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid #ef4444;
          color: #ef4444;
          border-radius: 4px;
          padding: 6px 12px;
          font-size: 0.75rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
        }
        .nav-btn-logout:hover {
          background: #ef4444;
          color: #000;
        }
        .nav-mobile-toggle {
          display: none;
          background: transparent;
          border: none;
          color: #fff;
          font-size: 1.5rem;
          cursor: pointer;
        }
        .nav-profile-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 4px 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
        }
        .nav-mobile-menu {
          display: none;
          flex-direction: column;
          gap: 15px;
          background: rgba(8, 12, 24, 0.98);
          border-bottom: 1px solid rgba(6, 182, 212, 0.2);
          padding: 20px;
          width: 100%;
        }
        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }
          .nav-mobile-toggle {
            display: block;
          }
          .nav-mobile-menu.open {
            display: flex;
          }
        }
      `}} />

      <div className="nav-container">
        <Link href="/" className="nav-logo">
          <span>🛡️ ASCEND ATHLETICS</span>
        </Link>

        {/* Desktop Navigation links */}
        <div className="nav-links">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/rank" className="nav-link">Ranking</Link>

          {isAthlete && (
            <>
              <Link href={`/athlete/${session.id}`} className="nav-link">Locker Room</Link>
              <Link href="/training" className="nav-link">Training Hub</Link>
              <Link href={`/athlete/${session.id}/playbook`} className="nav-link">Playbook 📖</Link>
            </>
          )}

          {isCoach && (
            <>
              <Link href="/coach/roster" className="nav-link">Roster</Link>
              <Link href="/coach" className="nav-link">Montar Planilha</Link>
              <Link href="/coach/playbook" className="nav-link">Playbook 📖</Link>
            </>
          )}

          {!session && (
            <>
              <Link href="/athlete/login" className="nav-link">Login Atleta</Link>
              <Link href="/coach" className="nav-link">Portal Coach</Link>
            </>
          )}

          {session && (
            <div className="nav-profile-badge">
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#fff' }}>{session.name}</div>
                <div style={{ fontSize: '0.65rem', color: isCoach ? 'var(--primary-color)' : '#00ffff', fontWeight: 'bold' }}>
                  {isCoach ? session.teamName : `${session.position} | OVR ${session.overall || 70}`}
                </div>
              </div>
              <button onClick={handleLogout} className="nav-btn-logout">Sair</button>
            </div>
          )}
        </div>

        {/* Hamburger toggle button for mobile */}
        <button className="nav-mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? '✖' : '☰'}
        </button>
      </div>

      {/* Mobile Navigation Menu list */}
      <div className={`nav-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <Link href="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>
        <Link href="/rank" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Ranking</Link>

        {isAthlete && (
          <>
            <Link href={`/athlete/${session.id}`} className="nav-link" onClick={() => setMobileMenuOpen(false)}>Locker Room</Link>
            <Link href="/training" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Training Hub</Link>
            <Link href={`/athlete/${session.id}/playbook`} className="nav-link" onClick={() => setMobileMenuOpen(false)}>Playbook 📖</Link>
          </>
        )}

        {isCoach && (
          <>
            <Link href="/coach/roster" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Roster</Link>
            <Link href="/coach" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Montar Planilha</Link>
            <Link href="/coach/playbook" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Playbook 📖</Link>
          </>
        )}

        {!session && (
          <>
            <Link href="/athlete/login" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Login Atleta</Link>
            <Link href="/coach" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Portal Coach</Link>
          </>
        )}

        {session && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>{session.name}</div>
              <div style={{ fontSize: '0.65rem', color: isCoach ? 'var(--primary-color)' : '#00ffff', fontWeight: 'bold' }}>
                {isCoach ? session.teamName : `${session.position} | OVR ${session.overall || 70}`}
              </div>
            </div>
            <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="nav-btn-logout">Sair</button>
          </div>
        )}
      </div>
    </nav>
  );
}
