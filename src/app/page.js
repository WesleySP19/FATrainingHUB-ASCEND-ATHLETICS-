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
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);

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

    // Load registered teams dynamic strip
    fetch('/api/coach/team')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.teams) {
          setTeams(data.teams);
        }
      })
      .catch(e => console.error("Erro ao carregar times:", e));
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
      case 'GOLD': return { border: '3px solid var(--accent-gold)', boxShadow: '0 0 15px rgba(251,191,36,0.35)' };
      case 'HOLO': return { border: '3px solid #c084fc', boxShadow: '0 0 15px rgba(192,132,252,0.35)' };
      case 'OBSIDIAN': return { border: '3px solid var(--primary-color)', boxShadow: '0 0 15px rgba(249,115,22,0.35)' };
      case 'EMERALD': return { border: '3px solid #10b981', boxShadow: '0 0 15px rgba(16,185,129,0.35)' };
      case 'HISTORIC': return { border: '4px double var(--accent-gold)', boxShadow: '0 0 25px rgba(251,191,36,0.5)', background: 'linear-gradient(135deg, #000 0%, #1a1403 100%)' };
      default: return { border: '1.5px solid rgba(255,255,255,0.1)' };
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '80px', minHeight: '90vh' }}>
      
      {/* Hero Banner Section (Inspired by Image 2 curved style + Image 1 palette) */}
      <div className="hero-banner" style={{ marginTop: '20px' }}>
        
        {/* Left Column: Dynamics Context Details & Actions */}
        <div style={{ zIndex: 5 }}>
          {isCoachView ? (
            /* COACH DASHBOARD PANEL SECTION */
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <AscendLogo size={35} />
                <span style={{ 
                  background: 'rgba(249, 115, 22, 0.1)', 
                  color: 'var(--primary-color)', 
                  padding: '4px 10px', 
                  borderRadius: '20px', 
                  fontSize: '0.75rem', 
                  fontWeight: 'bold', 
                  letterSpacing: '1px',
                  border: '1px solid rgba(249, 115, 22, 0.25)',
                  display: 'inline-block'
                }}>
                  #1 PORTAL COACH DA COMISSÃO TÉCNICA
                </span>
              </div>
              
              <h2 style={{ 
                fontSize: '2.8rem', 
                color: '#fff', 
                lineHeight: '1.1', 
                marginBottom: '20px', 
                fontFamily: 'var(--font-display)',
                textTransform: 'none'
              }}>
                Gestão e Táticas de Elite para o Time
              </h2>
              
              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '0.95rem', 
                lineHeight: '1.6', 
                marginBottom: '30px' 
              }}>
                Monitore a carga fisiológica aguda/crônica (ACWR) da sua equipe, desenhe jogadas estratégicas de rotas no Playbook e periodize novos treinos com precisão milimétrica.
              </p>

              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '25px' }}>
                <Link href="/coach/roster" className="btn" style={{ fontSize: '0.85rem', padding: '12px 24px', textDecoration: 'none' }}>
                  Gerenciar Roster &rarr;
                </Link>
                <Link href="/coach" className="btn" style={{ fontSize: '0.85rem', padding: '12px 24px', textDecoration: 'none', background: 'transparent', border: '1.5px solid var(--primary-color)', color: 'var(--primary-color)' }}>
                  Criar Novo Treino &rarr;
                </Link>
              </div>

              {/* Coach Login Session Info block */}
              {coach ? (
                <div style={{ 
                  display: 'inline-flex', 
                  gap: '12px', 
                  alignItems: 'center', 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: '6px 14px',
                  borderRadius: '30px'
                }}>
                  <span style={{ fontSize: '0.75rem', color: '#fff' }}>Coach: <strong>{coach.name} ({coach.teamName})</strong></span>
                  <button onClick={handleCoachLogout} style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', textDecoration: 'underline' }}>Sair</button>
                </div>
              ) : (
                <div>
                  <Link href="/coach" style={{ color: 'var(--primary-color)', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 'bold' }}>
                    &rarr; Realizar Login de Comissão Técnica
                  </Link>
                </div>
              )}

              {/* View Switch Link */}
              <div style={{ marginTop: '25px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '15px' }}>
                <button onClick={() => setIsCoachView(false)} style={{ background: 'transparent', border: 'none', color: '#00ffff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  Mudar para Vestiário do Atleta (Locker Room) &rarr;
                </button>
              </div>
            </div>
          ) : (
            /* ATHLETE DASHBOARD PANEL SECTION */
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <AscendLogo size={35} />
                <span style={{ 
                  background: 'rgba(6, 182, 212, 0.1)', 
                  color: '#06b6d4', 
                  padding: '4px 10px', 
                  borderRadius: '20px', 
                  fontSize: '0.75rem', 
                  fontWeight: 'bold', 
                  letterSpacing: '1px',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  display: 'inline-block'
                }}>
                  #1 LOCKER ROOM DE ALTO DESEMPENHO
                </span>
              </div>
              
              <h2 style={{ 
                fontSize: '2.8rem', 
                color: '#fff', 
                lineHeight: '1.1', 
                marginBottom: '20px', 
                fontFamily: 'var(--font-display)',
                textTransform: 'none'
              }}>
                Meu Vestiário de Performance
              </h2>
              
              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '0.95rem', 
                lineHeight: '1.6', 
                marginBottom: '30px' 
              }}>
                Monitore suas cargas reais no diário de exercícios, acompanhe seus recordes pessoais (PRs) e evolua os níveis e bordas colecionáveis do seu card 3D Holográfico.
              </p>

              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '25px' }}>
                {athlete ? (
                  <Link href={`/athlete/${athlete.id}`} className="btn" style={{ fontSize: '0.85rem', padding: '12px 24px', textDecoration: 'none', background: 'var(--accent-green)' }}>
                    Meu Locker Room &rarr;
                  </Link>
                ) : (
                  <Link href="/athlete/login" className="btn" style={{ fontSize: '0.85rem', padding: '12px 24px', textDecoration: 'none' }}>
                    Entrar no Locker Room &rarr;
                  </Link>
                )}
                <Link href="/training" className="btn" style={{ fontSize: '0.85rem', padding: '12px 24px', textDecoration: 'none', background: 'transparent', border: '1.5px solid var(--primary-color)', color: 'var(--primary-color)' }}>
                  Treinar Agora &rarr;
                </Link>
              </div>

              {/* Athlete Login Session Info block */}
              {athlete ? (
                <div style={{ 
                  display: 'inline-flex', 
                  gap: '12px', 
                  alignItems: 'center', 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: '6px 14px',
                  borderRadius: '30px'
                }}>
                  <span style={{ fontSize: '0.75rem', color: '#fff' }}>Atleta: <strong>{athlete.name} ({athlete.position})</strong></span>
                  <button onClick={handleAthleteLogout} style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', textDecoration: 'underline' }}>Sair</button>
                </div>
              ) : (
                <div style={{ padding: '4px 0' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Cadastros de novos atletas são feitos pelo Coach no painel de Roster.</span>
                </div>
              )}

              {/* View Switch Link */}
              <div style={{ marginTop: '25px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '15px' }}>
                <button onClick={() => setIsCoachView(true)} style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  Acessar Área do Coach (Comissão Técnica) &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Floating Collectible 3D Glassmorphic Card (Refactored to Image 2 eSports/Moment HUD style) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 4 }}>
          <div className="animate-float" style={{
            width: '240px',
            height: '350px',
            borderRadius: '24px',
            background: '#020617',
            border: '2px solid rgba(34, 197, 94, 0.7)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(34, 197, 94, 0.25)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '20px',
            transition: 'all 0.3s ease'
          }}>
            {/* Full-bleed Portrait Background (Inspired by Image 2 Ali Card) */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 1,
              overflow: 'hidden'
            }}>
              {athleteData?.profilePhoto || athlete?.profilePhoto ? (
                <img 
                  src={athleteData?.profilePhoto || athlete?.profilePhoto} 
                  alt={athleteData?.name || athlete?.name}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    filter: 'grayscale(100%) contrast(125%) brightness(95%)'
                  }} 
                />
              ) : (
                /* Premium background placeholder with grid */
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '3.5rem', opacity: 0.15 }}>🛡️</span>
                </div>
              )}
              
              {/* Dynamic Green/Dark Gradient Overlay matching Image 2 style */}
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(to top, rgba(2, 6, 23, 1) 0%, rgba(2, 6, 23, 0.75) 15%, rgba(34, 197, 94, 0.12) 50%, rgba(2, 6, 23, 0.3) 100%)',
                zIndex: 2
              }} />
              
              {/* Neon accent corner spray */}
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'radial-gradient(circle at 90% 90%, rgba(34, 197, 94, 0.22) 0%, transparent 60%)',
                zIndex: 3,
                pointerEvents: 'none'
              }} />
            </div>

            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 5, width: '100%' }}>
              {/* Circular Position Badge (Style of 1/1 Moment Badge in Image 2) */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#22c55e',
                color: '#000',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                fontSize: '0.75rem',
                fontWeight: '950',
                border: '1.5px solid #fff',
                boxShadow: '0 0 10px rgba(34, 197, 94, 0.6)'
              }}>
                {athleteData?.position || athlete?.position || 'DL'}
              </div>
              
              <span style={{
                fontSize: '0.6rem',
                fontWeight: '900',
                color: '#22c55e',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                textShadow: '0 0 5px rgba(34, 197, 94, 0.5)'
              }}>
                ⚡ MOMENT
              </span>
              
              <span style={{
                fontSize: '1.6rem',
                fontWeight: '950',
                color: '#fff',
                textShadow: '0 0 8px rgba(255,255,255,0.6), 0 0 15px rgba(34, 197, 94, 0.4)'
              }}>
                {athleteData?.overall || athlete?.overall || 70}
              </span>
            </div>

            {/* Footer details (Skewed eSports Typography overlaying image at bottom) */}
            <div style={{ textAlign: 'center', zIndex: 5, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{
                fontSize: '0.55rem',
                color: '#22c55e',
                textTransform: 'uppercase',
                fontWeight: '900',
                letterSpacing: '1.5px',
                marginBottom: '4px',
                textShadow: '0 0 5px rgba(34, 197, 94, 0.4)'
              }}>
                ESTATUTO LENDÁRIO
              </span>
              <h4 style={{
                margin: '0',
                fontSize: '1.65rem',
                fontWeight: '950',
                color: '#fff',
                textTransform: 'uppercase',
                letterSpacing: '-0.5px',
                lineHeight: '0.9',
                fontFamily: 'var(--font-display), "Impact", "Arial Black", sans-serif',
                textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 8px rgba(34, 197, 94, 0.3)',
                transform: 'skewX(-6deg) rotate(-1.5deg)'
              }}>
                {athleteData?.name || athlete?.name || 'WESLEY S.'}
              </h4>
              <span style={{
                fontSize: '0.55rem',
                color: 'rgba(255, 255, 255, 0.45)',
                textTransform: 'uppercase',
                fontWeight: 'bold',
                letterSpacing: '1px',
                marginTop: '4px'
              }}>
                THE GREAT
              </span>
            </div>
          </div>
          
          <span style={{ 
            fontSize: '0.75rem', 
            color: 'var(--text-secondary)', 
            marginTop: '15px', 
            fontWeight: 'bold',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            CARD COLECIONÁVEL DE ELITE
          </span>
        </div>

      </div>

      {/* Stats Overlay Cutout Row (Inspired by Stats panel layout in Image 2) */}
      <div className="stats-overlay">
        <div className="stat-item">
          <div className="stat-val">99 OVR</div>
          <div className="stat-label">Classificação Peak</div>
        </div>
        <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.08)' }}></div>
        <div className="stat-item">
          <div className="stat-val">150+</div>
          <div className="stat-label">Treinos Concluídos</div>
        </div>
        <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.08)' }}></div>
        <div className="stat-item">
          <div className="stat-val">1.3 ACWR</div>
          <div className="stat-label">Carga Ideal do Time</div>
        </div>
      </div>
      
      {/* Clear floating element positioning */}
      <div style={{ clear: 'both' }}></div>

      {/* Sub-Hero Segment (2 Column Text block matching Image 2 style) */}
      <div className="subhero-grid">
        <div>
          <h2 style={{ 
            fontSize: '2.4rem', 
            color: '#fff', 
            lineHeight: '1.2', 
            textTransform: 'none', 
            fontFamily: 'var(--font-display)',
            fontWeight: '800'
          }}>
            Focando em performance e saúde, construímos atletas indestrutíveis.
          </h2>
        </div>
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.75' }}>
            A Ascend Athletics unifica a preparação física de elite e a lousa tática em um ecossistema integrado. 
            Coaches gerenciam o risco de lesões monitorando métricas fisiológicas agudas e crônicas, enquanto atletas 
            desenvolvem força e memorizam playbook de forma gamificada no vestiário de elite.
          </p>
        </div>
      </div>

      {/* Featured Athletes Showcase (Chelsea / Image 2 Style) */}
      <div style={{ 
        borderTop: '1px solid rgba(255,255,255,0.06)', 
        paddingTop: '60px', 
        marginTop: '60px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(249, 115, 22, 0.08)',
            border: '1px solid rgba(249, 115, 22, 0.2)',
            borderRadius: '30px',
            padding: '6px 20px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            color: 'var(--primary-color)',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '15px'
          }}>
            ROSTER OFICIAL
          </span>
          <h2 style={{
            fontSize: '3rem',
            color: '#fff',
            fontFamily: 'var(--font-display)',
            fontWeight: '900',
            lineHeight: '1.1',
            marginTop: '10px',
            textTransform: 'none'
          }}>
            Atletas em <span style={{ color: 'var(--primary-color)' }}>Destaque</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '500px', margin: '10px auto 0' }}>
            Clique em um atleta para abrir o painel de análise tática completa
          </p>
        </div>
        
        {loadingRank ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Buscando atletas do roster...</span>
          </div>
        ) : leaderboard.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Nenhum atleta registrado ainda.</span>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: '20px',
            flexWrap: 'wrap',
            position: 'relative',
            minHeight: '420px',
            padding: '0 20px'
          }}>
            {/* Background gradient spotlight for hero */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(249, 115, 22, 0.08) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />

            {leaderboard.map((ath, idx) => {
              const isHero = idx === 0; // First athlete (highest OVR) is the center hero
              const borderStyles = getCardBorderStyle(ath.cardBorder);

              if (isHero) {
                // HERO CENTER ATHLETE (large presentation)
                return (
                  <div
                    key={ath.id}
                    onClick={() => setSelectedAthleteId(ath.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                      zIndex: 5,
                      order: 2, // Center in flex
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    title="Clique para Análise Tática"
                  >
                    {/* OVR floating badge */}
                    <div style={{
                      position: 'absolute',
                      top: '-10px',
                      right: '-10px',
                      background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--accent-gold) 100%)',
                      color: '#000',
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.8rem',
                      fontWeight: '950',
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      border: '3px solid #fff',
                      boxShadow: '0 8px 20px rgba(249, 115, 22, 0.5)',
                      zIndex: 10
                    }}>
                      {ath.overall}
                    </div>

                    {/* Hero photo container */}
                    <div style={{
                      width: '200px',
                      height: '260px',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      background: 'linear-gradient(180deg, rgba(15,21,36,0.9) 0%, rgba(7,10,19,0.95) 100%)',
                      border: '2px solid rgba(249, 115, 22, 0.4)',
                      boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(249, 115, 22, 0.15)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative',
                      ...borderStyles
                    }}>
                      {ath.profilePhoto ? (
                        <img src={ath.profilePhoto} alt={ath.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                          <AscendLogo size={70} />
                        </div>
                      )}
                      {/* Gradient overlay at bottom */}
                      <div style={{
                        position: 'absolute',
                        bottom: 0, left: 0, right: 0,
                        height: '80px',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                        pointerEvents: 'none'
                      }} />
                      {/* MVP Crown */}
                      {ath.isMVP && (
                        <span style={{
                          position: 'absolute',
                          top: '10px',
                          left: '10px',
                          fontSize: '1.5rem',
                          filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.6))'
                        }}>👑</span>
                      )}
                    </div>

                    {/* Hero Name Typography */}
                    <div style={{ textAlign: 'center', marginTop: '20px', position: 'relative' }}>
                      {/* Ghost backdrop name */}
                      <div style={{
                        fontSize: '4.5rem',
                        fontFamily: 'var(--font-display)',
                        fontWeight: '950',
                        color: 'rgba(255,255,255,0.03)',
                        lineHeight: '0.75',
                        textTransform: 'uppercase',
                        letterSpacing: '-1px',
                        userSelect: 'none',
                        WebkitTextStroke: '1px rgba(255,255,255,0.04)',
                        marginBottom: '-20px'
                      }}>
                        {ath.name?.split(' ')[0]}
                      </div>
                      <h3 style={{
                        fontSize: '1.8rem',
                        fontFamily: 'var(--font-display)',
                        fontWeight: '900',
                        color: '#fff',
                        margin: 0,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        textShadow: '0 4px 15px rgba(0,0,0,0.5)'
                      }}>
                        {ath.name}
                      </h3>
                      <span style={{
                        fontSize: '0.75rem',
                        color: 'var(--primary-color)',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '2px'
                      }}>
                        {ath.position} {ath.isMVP ? '• MVP' : ''}
                      </span>
                    </div>
                  </div>
                );
              }

              // SIDE ATHLETE CARDS (smaller vertical cards flanking the hero)
              const sideOrder = idx <= 2 ? idx : idx + 2; // Place cards around hero
              return (
                <div
                  key={ath.id}
                  onClick={() => setSelectedAthleteId(ath.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    zIndex: 3,
                    order: sideOrder,
                    opacity: 0.85,
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'scale(1.08) translateY(-8px)';
                    e.currentTarget.style.opacity = '1';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'scale(1) translateY(0)';
                    e.currentTarget.style.opacity = '0.85';
                  }}
                  title="Clique para Análise Tática"
                >
                  {/* Side card container */}
                  <div style={{
                    width: '130px',
                    height: '190px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background: 'linear-gradient(180deg, rgba(15,21,36,0.85) 0%, rgba(7,10,19,0.95) 100%)',
                    border: '1.5px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    ...borderStyles
                  }}>
                    {ath.profilePhoto ? (
                      <img src={ath.profilePhoto} alt={ath.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <AscendLogo size={45} />
                    )}
                    {/* OVR mini badge */}
                    <span style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'var(--primary-color)',
                      color: '#000',
                      fontSize: '0.7rem',
                      fontWeight: '900',
                      borderRadius: '6px',
                      padding: '2px 6px',
                      border: '1px solid rgba(0,0,0,0.3)'
                    }}>
                      {ath.overall}
                    </span>
                    {/* Bottom gradient */}
                    <div style={{
                      position: 'absolute',
                      bottom: 0, left: 0, right: 0,
                      height: '50px',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
                      pointerEvents: 'none'
                    }} />
                    {/* Name on card */}
                    <div style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '10px',
                      right: '10px'
                    }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#fff', lineHeight: '1.2' }}>
                        {ath.name}
                      </div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {ath.position}
                      </div>
                    </div>
                    {ath.isMVP && (
                      <span style={{ position: 'absolute', top: '6px', left: '6px', fontSize: '0.9rem' }}>👑</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Teams Logo Strip (Inspired by Image 3 partner logos) */}
      <div style={{
        marginTop: '70px',
        padding: '40px 0',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center'
      }}>
        <span style={{
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          fontWeight: 'bold',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          marginBottom: '30px',
          display: 'block'
        }}>
          EQUIPES PARCEIRAS
        </span>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '30px',
          flexWrap: 'wrap',
          marginTop: '25px',
          padding: '0 20px'
        }}>
          {teams.map((team, i) => {
            const teamColor = team.primaryColor || '#f97316';
            const teamBg = `${teamColor}15`;
            return (
              <div
                key={team.id || i}
                onClick={() => setSelectedTeam(team)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {/* Team logo shield */}
                <div style={{
                  width: '55px',
                  height: '55px',
                  borderRadius: '50%',
                  background: 'rgba(8, 12, 24, 0.9)',
                  border: `2px solid ${teamColor}`,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: `0 4px 15px ${teamBg}`,
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {team.logoUrl ? (
                    <img 
                      src={team.logoUrl} 
                      alt={team.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', padding: '6px' }}>
                      <defs>
                        <linearGradient id={`shieldGrad-${team.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={teamColor} />
                          <stop offset="100%" stopColor="#0a0a0a" />
                        </linearGradient>
                      </defs>
                      <path 
                        d="M50 10 L80 25 L80 60 C80 80 50 90 50 90 C50 90 20 80 20 60 L20 25 Z" 
                        fill={`url(#shieldGrad-${team.id})`} 
                        stroke={teamColor} 
                        strokeWidth="2"
                      />
                      <text 
                        x="50" 
                        y="58" 
                        fontFamily="var(--font-display)" 
                        fontSize="24" 
                        fontWeight="900" 
                        fill="#ffffff" 
                        textAnchor="middle"
                      >
                        {team.abbreviation || team.name.substring(0, 2).toUpperCase()}
                      </text>
                    </svg>
                  )}
                </div>
                <span style={{
                  fontSize: '0.6rem',
                  color: 'var(--text-secondary)',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  textAlign: 'center',
                  maxWidth: '80px',
                  lineHeight: '1.2'
                }}>
                  {team.name}
                </span>
              </div>
            );
          })}
          {teams.length === 0 && (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', padding: '10px 0' }}>
              Nenhum time cadastrado no momento.
            </div>
          )}
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

      {/* POPUP MODAL: TEAM HQ DETAIL (Inspired by Image 2 Esports Selection HUD) */}
      {selectedTeam && (() => {
        const teamColor = selectedTeam.primaryColor || '#f97316';
        const totalGames = selectedTeam.wins + selectedTeam.losses + selectedTeam.draws;
        const winProb = totalGames > 0 ? Math.round((selectedTeam.wins / totalGames) * 100) : 0;
        
        return (
          <div style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100vw', height: '100vh',
            background: 'rgba(2, 3, 6, 0.94)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            {/* Injected custom styles for scrollbar & hover animations */}
            <style dangerouslySetInnerHTML={{__html: `
              .popup-scroll::-webkit-scrollbar {
                width: 4px;
                height: 4px;
              }
              .popup-scroll::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.4);
                border-radius: 10px;
              }
              .popup-scroll::-webkit-scrollbar-thumb {
                background: ${teamColor}50;
                border-radius: 10px;
              }
              .popup-scroll::-webkit-scrollbar-thumb:hover {
                background: ${teamColor};
                box-shadow: 0 0 10px ${teamColor};
              }
              
              /* Roster Athlete Character-Selection Slot styling */
              .athlete-select-slot {
                background: rgba(6, 10, 20, 0.75);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-left: 3px solid rgba(255, 255, 255, 0.12);
                padding: 10px 14px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                cursor: pointer;
                position: relative;
                overflow: hidden;
              }
              .athlete-select-slot::before {
                content: '';
                position: absolute;
                top: 0; left: 0; bottom: 0;
                width: 0;
                background: ${teamColor};
                transition: width 0.3s ease;
                z-index: 0;
                opacity: 0.05;
              }
              .athlete-select-slot:hover {
                transform: translateX(-6px);
                border-color: ${teamColor}40;
                border-left-color: ${teamColor};
                background: rgba(6, 10, 20, 0.9);
                box-shadow: 0 4px 20px ${teamColor}15;
              }
              .athlete-select-slot:hover::before {
                width: 100%;
              }
              .athlete-avatar-frame {
                width: 40px;
                height: 40px;
                border-radius: 6px;
                background: rgba(0, 0, 0, 0.6);
                border: 1.5px solid rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: center;
                align-items: center;
                overflow: hidden;
                position: relative;
                z-index: 1;
                transition: all 0.3s;
              }
              .athlete-select-slot:hover .athlete-avatar-frame {
                border-color: ${teamColor};
                box-shadow: 0 0 8px ${teamColor}40;
              }
              .athlete-slot-info {
                z-index: 1;
              }
              .athlete-slot-ovr {
                z-index: 1;
                width: 32px;
                height: 32px;
                display: flex;
                justify-content: center;
                align-items: center;
                border-radius: 6px;
                background: rgba(2, 3, 6, 0.9);
                border: 1.5px solid ${teamColor}cc;
                color: ${teamColor};
                font-family: var(--font-display), Impact, sans-serif;
                font-weight: 900;
                font-size: 0.85rem;
                box-shadow: 0 0 10px ${teamColor}20;
                transition: all 0.3s;
              }
              .athlete-select-slot:hover .athlete-slot-ovr {
                border-color: ${teamColor};
                color: #fff;
                background: ${teamColor};
                box-shadow: 0 0 12px ${teamColor}50;
              }
              
              .close-btn-glowing {
                color: rgba(255, 255, 255, 0.4);
                transition: all 0.2s;
              }
              .close-btn-glowing:hover {
                color: #fff;
                text-shadow: 0 0 8px #fff;
                transform: scale(1.15) rotate(90deg);
              }
              
              .team-stat-tile {
                background: rgba(6, 10, 20, 0.65);
                border: 1px solid rgba(255, 255, 255, 0.04);
                border-left: 3px solid ${teamColor}aa;
                padding: 12px 14px;
                border-radius: 8px;
                transition: all 0.3s;
              }
              .team-stat-tile:hover {
                background: rgba(6, 10, 20, 0.9);
                border-color: rgba(255, 255, 255, 0.08);
                border-left-color: ${teamColor};
                box-shadow: 0 4px 15px ${teamColor}10;
                transform: translateY(-2px);
              }
            `}} />
 
            <div style={{
              maxWidth: '1100px',
              width: '100%',
              background: '#04070f',
              border: `1px solid rgba(255, 255, 255, 0.07)`,
              borderRadius: '24px',
              boxShadow: `0 35px 80px rgba(0,0,0,0.9), 0 0 50px ${teamColor}12`,
              position: 'relative',
              display: 'grid',
              gridTemplateColumns: '1.25fr 0.75fr',
              gap: '35px',
              padding: '40px',
              maxHeight: '92vh',
              overflowY: 'auto',
              overflowX: 'hidden'
            }} className="popup-scroll">
              
              {/* Dynamic diagonal slash background (inspired by red diagonal ribbon in Image 2) */}
              <div style={{
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '100%',
                background: `linear-gradient(135deg, ${teamColor}10 0%, ${teamColor}02 60%, transparent 100%)`,
                pointerEvents: 'none',
                zIndex: 0
              }} />
              <div style={{
                position: 'absolute',
                top: 0, left: 0, width: '65%', height: '100%',
                background: `linear-gradient(135deg, ${teamColor}22 0%, ${teamColor}08 50%, transparent 100%)`,
                clipPath: 'polygon(0 0, 100% 0, 72% 100%, 0% 100%)',
                pointerEvents: 'none',
                zIndex: 0
              }} />
              <div style={{
                position: 'absolute',
                top: 0, left: '10%', width: '4px', height: '100%',
                background: `linear-gradient(to bottom, ${teamColor}aa, transparent)`,
                transform: 'skewX(-25deg)',
                opacity: 0.25,
                pointerEvents: 'none',
                zIndex: 0
              }} />
 
              {/* Watermarked Big Giant Abbreviation behind in low opacity (Image 2 style) */}
              <div style={{
                position: 'absolute',
                top: '2%',
                left: '2%',
                fontSize: '18rem',
                fontWeight: '950',
                color: 'rgba(255, 255, 255, 0.015)',
                fontFamily: 'var(--font-display), Impact, sans-serif',
                letterSpacing: '-10px',
                zIndex: 0,
                pointerEvents: 'none',
                userSelect: 'none',
                lineHeight: '1',
                fontStyle: 'italic'
              }}>
                {selectedTeam.abbreviation || selectedTeam.name.substring(0, 2).toUpperCase()}
              </div>
 
              {/* Close Button */}
              <button 
                onClick={() => setSelectedTeam(null)}
                style={{
                  position: 'absolute',
                  top: '25px',
                  right: '25px',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.6rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  zIndex: 1010
                }}
                className="close-btn-glowing"
              >
                ✖
              </button>
 
              {/* Left Column: Team Details & Stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '26px', zIndex: 2, position: 'relative' }}>
                
                {/* Hero Showcase (Shield logo + Name and dynamic tags) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '26px' }}>
                  {/* Large Crest with glowing double rings */}
                  <div style={{
                    width: '130px',
                    height: '130px',
                    borderRadius: '16px',
                    background: 'rgba(2, 3, 6, 0.9)',
                    border: `2.5px solid ${teamColor}`,
                    boxShadow: `0 10px 30px ${teamColor}35, inset 0 0 15px ${teamColor}20`,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                    position: 'relative',
                    transform: 'skewX(-6deg)'
                  }}>
                    <div style={{ transform: 'skewX(6deg)', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {selectedTeam.logoUrl ? (
                        <img 
                          src={selectedTeam.logoUrl} 
                          alt="Logo" 
                          style={{ width: '90%', height: '90%', objectFit: 'contain' }} 
                        />
                      ) : (
                        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', padding: '10px' }}>
                          <defs>
                            <linearGradient id="shieldGradModal" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor={teamColor} />
                              <stop offset="100%" stopColor="#0a0a0a" />
                            </linearGradient>
                          </defs>
                          <path 
                            d="M50 10 L82 25 L82 60 C82 80 50 90 50 90 C50 90 18 80 18 60 L18 25 Z" 
                            fill="url(#shieldGradModal)" 
                            stroke={teamColor} 
                            strokeWidth="2"
                          />
                          <text 
                            x="50" 
                            y="58" 
                            fontFamily="var(--font-display)" 
                            fontSize="24" 
                            fontWeight="900" 
                            fill="#ffffff" 
                            textAnchor="middle"
                          >
                            {selectedTeam.abbreviation || selectedTeam.name.substring(0, 2).toUpperCase()}
                          </text>
                        </svg>
                      )}
                    </div>
                  </div>
 
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ 
                        background: teamColor, 
                        color: '#000',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: '900',
                        letterSpacing: '1px',
                        textTransform: 'uppercase'
                      }}>
                        {selectedTeam.abbreviation || 'HQ'}
                      </span>
                      <span style={{ 
                        color: 'rgba(255, 255, 255, 0.4)', 
                        fontSize: '0.7rem', 
                        fontWeight: '800', 
                        letterSpacing: '1px' 
                      }}>
                        // PORTAL OFICIAL // EST. {selectedTeam.founded || '2019'}
                      </span>
                    </div>
                    
                    <h2 style={{ 
                      fontSize: '3.0rem', 
                      fontFamily: 'var(--font-display), Impact, sans-serif', 
                      fontWeight: '950',
                      letterSpacing: '-2.2px',
                      lineHeight: '0.9',
                      margin: 0, 
                      textTransform: 'uppercase', 
                      color: '#fff',
                      textShadow: `0 0 25px ${teamColor}25`
                    }}>
                      {selectedTeam.name}
                    </h2>
                    
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '2px' }}>
                      Roster Oficial de Competição & Estatísticas do QG
                    </span>
                  </div>
                </div>
 
                {/* Lore Panel (Storytelling - inspired by character introduction paragraph in Image 2) */}
                <div style={{
                  background: 'rgba(6, 10, 20, 0.55)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderLeft: `4px solid ${teamColor}`,
                  padding: '22px',
                  borderRadius: '12px',
                  maxHeight: '150px',
                  overflowY: 'auto'
                }} className="popup-scroll">
                  <strong style={{ fontSize: '0.65rem', color: teamColor, display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '900' }}>
                    // TRAJETÓRIA E LORE DA ORGANIZAÇÃO
                  </strong>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.85)', margin: 0, lineHeight: '1.7', whiteSpace: 'pre-line', fontFamily: 'var(--font-base)', fontWeight: '400' }}>
                    {selectedTeam.history || "Nenhuma história cadastrada para esta equipe no momento."}
                  </p>
                </div>
 
                {/* Activity Stats & Season Record (HUD attributes) */}
                <div>
                  <h3 style={{ 
                    fontSize: '0.75rem', 
                    color: '#fff', 
                    letterSpacing: '1.5px', 
                    textTransform: 'uppercase', 
                    margin: '0 0 14px 0', 
                    fontWeight: '900',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ width: '8px', height: '8px', background: teamColor, display: 'inline-block', transform: 'rotate(45deg)' }} />
                    PARAMETROS DA EQUIPE (HUD)
                  </h3>
                  
                  {/* Grid of parameters */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                    <div className="team-stat-tile">
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px' }}>Frequência de Treino</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#fff', marginTop: '5px', fontFamily: 'var(--font-display), sans-serif' }}>
                        {selectedTeam.trainingFrequency || '3x / semana'}
                      </div>
                    </div>
                    <div className="team-stat-tile">
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px' }}>Atletas Ativos</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#fff', marginTop: '5px', fontFamily: 'var(--font-display), sans-serif' }}>
                        {selectedTeam.athletes?.length || 0}
                      </div>
                    </div>
                    <div className="team-stat-tile">
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px' }}>Títulos Conquistados</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: '900', color: teamColor, marginTop: '5px', fontFamily: 'var(--font-display), sans-serif' }}>
                        🏆 {selectedTeam.championships || 0}
                      </div>
                    </div>
                  </div>
 
                  {/* Season Record blocks */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    <div style={{ 
                      background: 'rgba(34, 197, 94, 0.02)', 
                      border: '1px solid rgba(34,197,94,0.08)', 
                      borderBottom: '3px solid #22c55e',
                      padding: '12px', 
                      borderRadius: '8px', 
                      textAlign: 'center' 
                    }}>
                      <div style={{ fontSize: '0.55rem', color: '#22c55e', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.5px' }}>Vitórias</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#fff', marginTop: '4px', fontFamily: 'var(--font-display), sans-serif' }}>{selectedTeam.wins}</div>
                    </div>
                    <div style={{ 
                      background: 'rgba(239, 68, 68, 0.02)', 
                      border: '1px solid rgba(239,68,68,0.08)', 
                      borderBottom: '3px solid #ef4444',
                      padding: '12px', 
                      borderRadius: '8px', 
                      textAlign: 'center' 
                    }}>
                      <div style={{ fontSize: '0.55rem', color: '#ef4444', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.5px' }}>Derrotas</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#fff', marginTop: '4px', fontFamily: 'var(--font-display), sans-serif' }}>{selectedTeam.losses}</div>
                    </div>
                    <div style={{ 
                      background: 'rgba(148, 163, 184, 0.02)', 
                      border: '1px solid rgba(148,163,184,0.08)', 
                      borderBottom: '3px solid #94a3b8',
                      padding: '12px', 
                      borderRadius: '8px', 
                      textAlign: 'center' 
                    }}>
                      <div style={{ fontSize: '0.55rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.5px' }}>Empates</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#fff', marginTop: '4px', fontFamily: 'var(--font-display), sans-serif' }}>{selectedTeam.draws}</div>
                    </div>
                  </div>
                </div>
              </div>
 
              {/* Right Column: Character Selection Style Roster (Inspired by character cards list on Image 2) */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '24px', 
                borderLeft: '1px solid rgba(255,255,255,0.05)', 
                paddingLeft: '35px', 
                zIndex: 2, 
                position: 'relative' 
              }}>
                {/* Active Athletes List */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '0.85rem', color: '#fff', margin: 0, fontWeight: '900', letterSpacing: '1px' }}>
                      // ELENCO ATIVO
                    </h3>
                    <span style={{ 
                      fontSize: '0.65rem', 
                      color: teamColor, 
                      fontWeight: '900', 
                      background: `${teamColor}15`, 
                      border: `1px solid ${teamColor}30`,
                      padding: '2px 8px', 
                      borderRadius: '4px' 
                    }}>
                      {selectedTeam.athletes?.length || 0} ATLETAS
                    </span>
                  </div>
 
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '10px', 
                    maxHeight: '260px', 
                    overflowY: 'auto',
                    paddingRight: '6px'
                  }} className="popup-scroll">
                    {selectedTeam.athletes && selectedTeam.athletes.map(ath => (
                      <div 
                        key={ath.id}
                        className="athlete-select-slot"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', zIndex: 1 }}>
                          {/* Avatar Frame (similar to thumbnail profile in Image 2) */}
                          <div className="athlete-avatar-frame">
                            {ath.profilePhoto ? (
                              <img src={ath.profilePhoto} alt={ath.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span style={{ fontSize: '0.8rem', fontWeight: '900', color: 'rgba(255,255,255,0.7)' }}>
                                {ath.name.substring(0, 2).toUpperCase()}
                              </span>
                            )}
                            {ath.isMVP && (
                              <span style={{ 
                                position: 'absolute', 
                                top: 0, right: 0, 
                                fontSize: '0.5rem', 
                                background: '#facc15', 
                                color: '#000', 
                                padding: '1px 3px', 
                                borderRadius: '0 0 0 4px', 
                                fontWeight: 'bold' 
                              }}>👑</span>
                            )}
                          </div>
                          <div className="athlete-slot-info">
                            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#fff', display: 'block', letterSpacing: '0.3px' }}>{ath.name}</span>
                            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{ath.position}</span>
                          </div>
                        </div>
                        
                        {/* OVR Rating Badge */}
                        <div className="athlete-slot-ovr">
                          {ath.overall}
                        </div>
                      </div>
                    ))}
                    {(!selectedTeam.athletes || selectedTeam.athletes.length === 0) && (
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'center', padding: '30px 0', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '8px' }}>
                        Nenhum atleta ativo cadastrado.
                      </div>
                    )}
                  </div>
                </div>
 
                {/* Win Probability & Performance Trend (Tactical Graph) */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#fff', letterSpacing: '1px' }}>PROBABILIDADE DE VITÓRIA</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: '950', color: teamColor, textShadow: `0 0 8px ${teamColor}30` }}>{winProb}%</span>
                  </div>
 
                  {/* Grid background + curving neon lines mockup in SVG (Like Image 2 chart) */}
                  <div style={{ 
                    height: '95px', 
                    background: '#020306', 
                    border: '1px solid rgba(255,255,255,0.05)', 
                    borderRadius: '12px',
                    position: 'relative',
                    overflow: 'hidden',
                    padding: '8px',
                    boxShadow: 'inset 0 0 15px rgba(0,0,0,0.8)'
                  }}>
                    {/* SVG grid background */}
                    <div style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
                      backgroundSize: '12px 12px',
                      pointerEvents: 'none'
                    }} />
 
                    <svg viewBox="0 0 100 30" width="100%" height="100%" style={{ overflow: 'visible', position: 'relative', zIndex: 1 }}>
                      {/* Grid Lines */}
                      <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
                      <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
                      
                      {/* Curve 1: Blue Neon */}
                      <path 
                        d="M -5 22 Q 15 3, 35 24 T 75 10 T 105 18" 
                        fill="none" 
                        stroke="#06b6d4" 
                        strokeWidth="1.8" 
                        style={{ filter: 'drop-shadow(0 0 6px #06b6d4)' }}
                      />
                      
                      {/* Curve 2: Team Color Neon */}
                      <path 
                        d="M -5 15 Q 20 28, 45 10 T 85 24 T 105 5" 
                        fill="none" 
                        stroke={teamColor} 
                        strokeWidth="1.8" 
                        style={{ filter: `drop-shadow(0 0 6px ${teamColor})` }}
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
      
    </div>
  );
}
