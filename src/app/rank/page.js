"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import TacticalDashboard from '@/components/TacticalDashboard';

export default function Leaderboard() {
  const [rank, setRank] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAthleteId, setSelectedAthleteId] = useState(null);

  useEffect(() => {
    fetch('/api/rank')
      .then(res => res.json())
      .then(data => {
        if (data.success) setRank(data.rank);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>
      <nav style={{ padding: 'var(--spacing-md) 0', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <h2 style={{ color: 'var(--primary-color)', margin: 0 }}>GLOBAL LEADERBOARD</h2>
        <Link href="/" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>&larr; Home</Link>
      </nav>

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Os monstros do pântano. O Hall da Fama.</p>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Clique em "Espiar 👁️" para visualizar a prancheta tática e dados de preparação física de qualquer jogador.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>Calculando Ratings e algoritmos...</div>
      ) : (
        <div className="card-panel" style={{ padding: '0', overflowX: 'auto', border: '1px solid #1e293b' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--primary-color)', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.5)' }}>
                <th style={{ padding: '20px' }}>RANK</th>
                <th style={{ padding: '20px' }}>NOME DO ATLETA</th>
                <th style={{ padding: '20px' }}>POSIÇÃO</th>
                <th style={{ padding: '20px' }}>FRANQUIA (TIME)</th>
                <th style={{ padding: '20px', textAlign: 'center' }}>OVR</th>
                <th style={{ padding: '20px', textAlign: 'center' }}>TACTICAL DETAILED</th>
              </tr>
            </thead>
            <tbody>
              {rank.map((athlete, index) => (
                <tr key={athlete.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '20px', fontWeight: 'bold', fontSize: '1.5rem', color: index < 3 ? 'var(--primary-color)' : '#fff' }}>
                    #{index + 1} {index === 0 && '👑'}
                  </td>
                  <td style={{ padding: '20px', fontWeight: 'bold', fontSize: '1.2rem' }}>{athlete.name}</td>
                  <td style={{ padding: '20px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{athlete.position}</td>
                  <td style={{ padding: '20px' }}>{athlete.coach?.teamName || 'Free Agent'}</td>
                  <td style={{ padding: '20px', textAlign: 'center', fontWeight: '900', color: 'var(--primary-color)', fontSize: '1.6rem', textShadow: '0 0 10px rgba(250,204,21,0.3)' }}>{athlete.overall}</td>
                  <td style={{ padding: '20px', textAlign: 'center' }}>
                    <button 
                      onClick={() => setSelectedAthleteId(athlete.id)}
                      className="btn"
                      style={{ padding: '8px 16px', fontSize: '0.8rem', background: 'rgba(250,204,21,0.1)', color: 'var(--primary-color)', border: '1px solid var(--primary-color)' }}
                    >
                      Espiar 👁️
                    </button>
                  </td>
                </tr>
              ))}
              {rank.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '50px', textAlign: 'center', color: 'var(--text-secondary)' }}>O panteão está vazio. Registre o primeiro atleta.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* POPUP MODAL: TACTICAL ESPIONAGE DASHBOARD */}
      {selectedAthleteId && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{ maxWidth: '750px', width: '100%', position: 'relative' }}>
            <button 
              onClick={() => setSelectedAthleteId(null)}
              style={{
                position: 'absolute',
                top: '-35px',
                right: '0',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '1.8rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                zIndex: 1010
              }}
            >
              ✖ fechar
            </button>
            <TacticalDashboard athleteId={selectedAthleteId} />
          </div>
        </div>
      )}

    </div>
  );
}
