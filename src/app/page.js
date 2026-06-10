"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import TacticalDashboard from '@/components/TacticalDashboard';

// Ascend Athletics Inline SVG Shield and Ram Logo
const AscendLogo = ({ size = 90 }) => (
  <svg viewBox="0 0 100 110" width={size} height={size} style={{ filter: 'drop-shadow(0 0 12px rgba(249, 115, 22, 0.35))' }}>
    {/* Outer Shield Border */}
    <path 
      d="M 50 5 L 90 22 L 90 60 C 90 85 50 105 50 105 C 50 105 10 85 10 60 L 10 22 Z" 
      fill="#090d16" 
      stroke="var(--primary-color)" 
      strokeWidth="4" 
      strokeLinejoin="round" 
    />
    
    {/* Inner Shield Gold Border */}
    <path 
      d="M 50 12 L 82 26 L 82 58 C 82 78 50 96 50 96 C 50 96 18 78 18 58 L 18 26 Z" 
      fill="#0c111d" 
      stroke="var(--accent-gold)" 
      strokeWidth="1.5" 
      strokeLinejoin="round" 
    />
    
    {/* Mountain Peaks (Background) */}
    <polygon points="50,32 75,65 25,65" fill="#1e293b" opacity="0.8" />
    <polygon points="50,32 50,65 25,65" fill="#334155" />
    <polygon points="65,42 80,65 50,65" fill="#1e293b" opacity="0.5" />
    
    {/* Stylized Ram Head */}
    {/* Right Horn */}
    <path 
      d="M 50 50 Q 75 42 68 60 Q 62 72 54 62" 
      fill="none" 
      stroke="var(--accent-gold)" 
      strokeWidth="4" 
      strokeLinecap="round" 
    />
    {/* Left Horn */}
    <path 
      d="M 50 50 Q 25 42 32 60 Q 38 72 46 62" 
      fill="none" 
      stroke="var(--accent-gold)" 
      strokeWidth="4" 
      strokeLinecap="round" 
    />
    
    {/* Ram Face */}
    <polygon points="50,78 40,56 60,56" fill="#cbd5e1" stroke="#000" strokeWidth="0.5" />
    {/* Forehead / Nose Bridge */}
    <polygon points="50,78 45,56 55,56" fill="#f8fafc" />
    {/* Eyes */}
    <polygon points="43,62 47,63 45,60" fill="var(--primary-color)" />
    <polygon points="57,62 53,63 55,60" fill="var(--primary-color)" />
    {/* Snout */}
    <polygon points="50,78 48,72 52,72" fill="#475569" />
  </svg>
);

export default function Home() {
  const [athlete, setAthlete] = useState(null);
  const [athleteData, setAthleteData] = useState(null);
  const [coach, setCoach] = useState(null);
  const [isCoachView, setIsCoachView] = useState(false); // Default to Athlete view
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingRank, setLoadingRank] = useState(true);
  const [selectedAthleteId, setSelectedAthleteId] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAthlete = localStorage.getItem('athlete');
      const storedCoach = localStorage.getItem('coach');
      
      if (storedAthlete) {
        const parsed = JSON.parse(storedAthlete);
        setAthlete(parsed);
        // Fetch detailed profile data for OVR cards & PRs
        fetch(`/api/athlete/${parsed.id}`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setAthleteData(data.athlete);
            }
          })
          .catch(e => console.error("Erro ao sincronizar atleta:", e));
      }
      
      if (storedCoach) {
        setCoach(JSON.parse(storedCoach));
        setIsCoachView(true); // Auto switch to Coach view if logged in as coach
      }
    }

    // Load leaderboard rank data
    fetch('/api/rank')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLeaderboard(data.rank.slice(0, 5));
        }
        setLoadingRank(false);
      })
      .catch(e => {
        console.error(e);
        setLoadingRank(false);
      });
  }, []);

  const handleCoachLogout = async () => {
    localStorage.removeItem('coach');
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    setCoach(null);
    window.location.reload();
  };

  const handleAthleteLogout = async () => {
    localStorage.removeItem('athlete');
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    setAthlete(null);
    setAthleteData(null);
    window.location.reload();
  };

  // Card Borders formatting
  const getCardBorderStyle = (border) => {
    switch (border) {
      case 'GOLD': return { border: '4px solid var(--accent-gold)', boxShadow: '0 0 20px rgba(251,191,36,0.4)' };
      case 'HOLO': return { border: '4px solid #c084fc', boxShadow: '0 0 20px rgba(192,132,252,0.4)' };
      case 'OBSIDIAN': return { border: '4px solid var(--primary-color)', boxShadow: '0 0 20px rgba(249,115,22,0.4)' };
      case 'EMERALD': return { border: '4px solid #10b981', boxShadow: '0 0 20px rgba(16,185,129,0.4)' };
      case 'HISTORIC': return { border: '5px double var(--accent-gold)', boxShadow: '0 0 35px rgba(251,191,36,0.6)', background: 'linear-gradient(135deg, #000 0%, #1a1403 100%)' };
      default: return { border: '2px solid rgba(255,255,255,0.1)' };
    }
  };

  // Resolving Card Data
  const cardName = athleteData?.name || athlete?.name || 'RAFAEL S.';
  const cardOVR = athleteData?.overall || athlete?.overall || 94;
  const cardPosition = athleteData?.position || athlete?.position || 'OL';
  const cardBorder = athleteData?.cardBorder || athlete?.cardBorder || 'DEFAULT';
  const cardPhoto = athleteData?.profilePhoto || athlete?.profilePhoto || null;
  const prs = athleteData?.personalRecords || [];

  return (
    <div className="container" style={{ paddingBottom: '80px', minHeight: '90vh' }}>
      
      {/* Branding Header */}
      <header style={{ textAlign: 'center', marginBottom: '35px', marginTop: '30px', position: 'relative' }}>
        <div style={{ display: 'inline-block', marginBottom: '10px' }}>
          <AscendLogo size={95} />
        </div>
        <h1 style={{ 
          fontSize: '3.6rem', 
          margin: '10px 0 5px 0', 
          fontFamily: 'var(--font-display)',
          background: 'linear-gradient(135deg, #fff 40%, var(--primary-color) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '3px',
          textShadow: '0 4px 15px rgba(0,0,0,0.5)'
        }}>
          ASCEND ATHLETICS
        </h1>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '0.95rem', 
          letterSpacing: '4px', 
          textTransform: 'uppercase',
          fontWeight: 'bold'
        }}>
          SISTEMA DE PREPARAÇÃO FÍSICA E TÁTICA DE ELITE
        </p>
      </header>

      {/* Interactive Toggle Switch */}
      <div className="switch-container" style={{ marginBottom: '40px' }}>
        <div className="switch-slider" style={{
          left: isCoachView ? '4px' : 'calc(50% + 2px)',
          width: 'calc(50% - 6px)'
        }}></div>
        
        <button 
          className={`switch-button ${isCoachView ? 'active' : ''}`}
          onClick={() => setIsCoachView(true)}
          style={{ color: isCoachView ? '#000' : 'var(--text-secondary)' }}
        >
          📋 PORTAL COACH
        </button>
        
        <button 
          className={`switch-button ${!isCoachView ? 'active' : ''}`}
          onClick={() => setIsCoachView(false)}
          style={{ color: !isCoachView ? '#000' : 'var(--text-secondary)' }}
        >
          🛡️ LOCKER ROOM
        </button>
      </div>

      {/* Main Grid Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', maxWidth: '850px', margin: '0 auto', gap: '25px', marginTop: 'var(--spacing-lg)' }}>
        
        {/* Left Column: Context Action Panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          {isCoachView ? (
            /* COACH DASHBOARD VIEW */
            <div className="glow-card" style={{ animation: 'fadeIn 0.4s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '15px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.6rem', color: 'var(--primary-color)', margin: 0 }}>
                  COMISSÃO TÉCNICA
                </h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>
                  ADMINISTRATIVE ACCESS
                </span>
              </div>
              
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '25px' }}>
                Monitore o desgaste fisiológico da sua equipe e planeje periodizações táticas. Monte rotinas de treinos coletivos ou individuais de alta performance.
              </p>

              <div className="portal-sub-grid">
                {/* Playbook Card */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', color: '#fff' }}>📋 Playbook Builder</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '15px' }}>
                      Monte planilhas de exercícios para posições ou envie overrides customizados para atletas específicos.
                    </p>
                  </div>
                  <Link href="/coach" className="btn" style={{ fontSize: '0.85rem', padding: '10px', textAlign: 'center', textDecoration: 'none', display: 'block' }}>
                    Criar Treino
                  </Link>
                </div>

                {/* Roster Card */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', color: '#fff' }}>👥 Roster & Carga ACWR</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '15px' }}>
                      Monitore a relação de carga aguda/crônica, previna lesões, edite perfis e defina o MVP oficial.
                    </p>
                  </div>
                  <Link href="/coach/roster" className="btn" style={{ fontSize: '0.85rem', padding: '10px', textAlign: 'center', textDecoration: 'none', display: 'block', background: 'transparent', border: '1.5px solid var(--primary-color)', color: 'var(--primary-color)' }}>
                    Ver Roster
                  </Link>
                </div>
              </div>

              {coach ? (
                <div style={{ 
                  marginTop: '30px', 
                  padding: '15px', 
                  background: 'rgba(249, 115, 22, 0.05)', 
                  border: '1.5px solid rgba(249, 115, 22, 0.15)', 
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>TREINADOR ATIVO</span>
                    <strong style={{ color: '#fff', fontSize: '1.05rem' }}>{coach.name} ({coach.teamName || 'Comissão Técnica'})</strong>
                  </div>
                  <button onClick={handleCoachLogout} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1.5px solid #ef4444', borderRadius: '4px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>
                    LOGOUT
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                  <Link href="/coach" style={{ color: 'var(--primary-color)', fontSize: '0.9rem', fontWeight: 'bold', textDecoration: 'none' }}>
                    &rarr; Realizar Login de Comissão Técnica
                  </Link>
                </div>
              )}
            </div>
          ) : (
            /* ATHLETE LOCKER ROOM VIEW */
            <div className="glow-card" style={{ animation: 'fadeIn 0.4s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '15px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.6rem', color: 'var(--primary-color)', margin: 0 }}>
                  VESTIÁRIO DE PERFORMANCE
                </h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>
                  ATHLETE ACCESS
                </span>
              </div>
              
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '25px' }}>
                Visualize seus treinos direcionados pelo Coach, envie suas cargas reais em tempo real, gerencie seus recordes de força PR e evolua o status do seu card colecionável.
              </p>

              <div className="portal-sub-grid">
                {/* Locker Card */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', color: '#fff' }}>🛡️ Meu Locker Room</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '15px' }}>
                      Acesse sua galeria de PRs, personalize as cores do seu card e exporte para compartilhar.
                    </p>
                  </div>
                  {athlete ? (
                    <Link href={`/athlete/${athlete.id}`} className="btn" style={{ fontSize: '0.85rem', padding: '10px', textAlign: 'center', textDecoration: 'none', display: 'block', background: 'var(--accent-green)' }}>
                      Meu Locker Room
                    </Link>
                  ) : (
                    <Link href="/athlete/login" className="btn" style={{ fontSize: '0.85rem', padding: '10px', textAlign: 'center', textDecoration: 'none', display: 'block' }}>
                      Login do Atleta
                    </Link>
                  )}
                </div>

                {/* Training Card */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', color: '#fff' }}>⚡ Training</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '15px' }}>
                      Abra a folha de treino ativo, veja os vetores de força e preencha as cargas executadas.
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Link href="/training" className="btn" style={{ fontSize: '0.85rem', padding: '10px', textAlign: 'center', textDecoration: 'none', display: 'block', background: 'transparent', border: '1.5px solid var(--primary-color)', color: 'var(--primary-color)' }}>
                      Iniciar Treinamento
                    </Link>
                  </div>
                </div>
              </div>

              {athlete ? (
                <div style={{ 
                  marginTop: '30px', 
                  padding: '15px', 
                  background: 'rgba(34, 197, 94, 0.05)', 
                  border: '1.5px solid rgba(34, 197, 94, 0.15)', 
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>ATLETA ATIVO</span>
                    <strong style={{ color: '#fff', fontSize: '1.05rem' }}>{athlete.name} ({athlete.position})</strong>
                  </div>
                  <button onClick={handleAthleteLogout} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1.5px solid #ef4444', borderRadius: '4px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>
                    LOGOUT
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Não possui login cadastrado? O Coach pode registrá-lo no Roster Admin.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Leaderboard Table widget */}
          <div className="glow-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '15px' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#fff', margin: 0 }}>🏆 TOP PERFORMANCE RANKING</h3>
              <Link href="/rank" style={{ color: 'var(--primary-color)', fontSize: '0.8rem', fontWeight: 'bold', textDecoration: 'none' }}>
                Ver Tudo &rarr;
              </Link>
            </div>
            
            {loadingRank ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>Carregando dados da liga...</p>
            ) : (
              <table className="leaderboard-compact">
                <thead>
                  <tr>
                    <th>RANK</th>
                    <th>ATLETA</th>
                    <th>POS</th>
                    <th style={{ textAlign: 'right' }}>OVR</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((ath, idx) => (
                    <tr key={ath.id} style={{ background: ath.id === athlete?.id ? 'rgba(249,115,22,0.04)' : 'transparent' }}>
                      <td style={{ fontWeight: 'bold', color: idx === 0 ? 'var(--accent-gold)' : '#fff' }}>
                        {idx + 1}
                      </td>
                      <td style={{ fontWeight: '600' }}>
                        <button 
                          onClick={() => setSelectedAthleteId(ath.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            cursor: 'pointer',
                            padding: 0,
                            textAlign: 'left',
                            fontSize: 'inherit',
                            fontWeight: 'inherit',
                            fontFamily: 'inherit',
                            textDecoration: 'underline',
                            transition: 'color 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.color = 'var(--primary-color)'}
                          onMouseLeave={(e) => e.target.style.color = '#fff'}
                          title="Clique para Espiar Dados Táticos"
                        >
                          {ath.name} {ath.isMVP ? '👑' : ''}
                        </button>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{ath.position}</td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                        {ath.overall}
                      </td>
                    </tr>
                  ))}
                  {leaderboard.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Nenhum atleta listado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

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
