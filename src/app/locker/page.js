"use client";

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import html2canvas from 'html2canvas';

function ConfettiEffect() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const colors = ['#06b6d4', '#00ffff', '#fbbf24', '#f97316', '#22c55e', '#ec4899'];
    const particles = [];
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 4 + 2,
        d: Math.random() * canvas.height,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.07 + 0.02,
        tiltAngle: 0
      });
    }
    
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;
      
      particles.forEach((p) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
        p.x += Math.sin(p.tiltAngle);
        p.tilt = Math.sin(p.tiltAngle - p.r / 2) * 5;
        
        if (p.y < canvas.height) {
          active = true;
        }
        
        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();
      });
      
      if (active) {
        animationId = requestAnimationFrame(draw);
      }
    };
    
    draw();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999
      }}
    />
  );
}

function LockerContent() {
  const searchParams = useSearchParams();
  const pin = searchParams.get('pin');
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [athleteData, setAthleteData] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const cardRef = useRef(null);

  const playLevelUpSound = () => {
    if (typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
      const now = audioCtx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.15, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.45);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.5);
      });
    } catch (e) {
      console.warn("AudioContext level up chime failed:", e);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('athlete');
    if (stored) {
      setAthleteData(JSON.parse(stored));
    }
    if (pin) {
      setShowConfetti(true);
      playLevelUpSound();
      fetch(`/api/workouts/${pin}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setWorkout(data.workout);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [pin]);

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xPct = (x / rect.width) * 100;
    const yPct = (y / rect.height) * 100;
    
    card.style.setProperty('--mouse-x', `${xPct}%`);
    card.style.setProperty('--mouse-y', `${yPct}%`);

    // Rotação 3D sutil no hover
    const xRotate = ((x / rect.width) - 0.5) * 25; // -12.5 a 12.5 deg
    const yRotate = -((y / rect.height) - 0.5) * 25; // -12.5 a 12.5 deg
    
    const cardInner = card.querySelector('.card-inner');
    if (cardInner) {
      const isFlipped = card.classList.contains('flipped');
      if (isFlipped) {
        cardInner.style.transform = `rotateY(${180 + xRotate}deg) rotateX(${yRotate}deg)`;
      } else {
        cardInner.style.transform = `rotateY(${xRotate}deg) rotateX(${yRotate}deg)`;
      }
    }
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.setProperty('--mouse-x', '50%');
    card.style.setProperty('--mouse-y', '50%');
    
    const cardInner = card.querySelector('.card-inner');
    if (cardInner) {
      const isFlipped = card.classList.contains('flipped');
      cardInner.style.transform = isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
    }
  };

  const handleCardClick = (e) => {
    const card = e.currentTarget;
    card.classList.toggle('flipped');
    
    const cardInner = card.querySelector('.card-inner');
    if (cardInner) {
      const isFlipped = card.classList.contains('flipped');
      cardInner.style.transform = isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
    }
  };

  const getCardBorderClass = (border) => {
    switch (border) {
      case 'GOLD': return 'border-gold';
      case 'HOLO': return 'border-holo';
      case 'OBSIDIAN': return 'border-obsidian';
      case 'EMERALD': return 'border-emerald';
      case 'HISTORIC': return 'border-historic';
      default: return '';
    }
  };

  const athlete = workout?.athlete || athleteData || {
    name: 'Atleta',
    position: 'DL',
    overall: 70,
    attendanceCount: 0,
    personalRecords: [],
    themeColor: 'midnight',
    cardBorder: 'DEFAULT',
    profilePhoto: ''
  };

  const getCardBorderStyle = () => {
    const border = athlete?.cardBorder || 'DEFAULT';
    switch (border) {
      case 'GOLD': return { border: '4px solid #eab308', boxShadow: '0 0 20px rgba(234,179,8,0.4)' };
      case 'HOLO': return { border: '4px solid #c084fc', boxShadow: '0 0 20px rgba(192,132,252,0.4)' };
      case 'OBSIDIAN': return { border: '4px solid #f97316', boxShadow: '0 0 20px rgba(249,115,22,0.4)' };
      case 'EMERALD': return { border: '4px solid #10b981', boxShadow: '0 0 20px rgba(16,185,129,0.4)' };
      case 'HISTORIC': return { border: '5px double #facc15', boxShadow: '0 0 35px rgba(250,204,21,0.6)', background: 'linear-gradient(135deg, #000 0%, #1a1505 100%)' };
      default: return { border: '2px solid rgba(255,255,255,0.1)' };
    }
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, { 
        backgroundColor: null, 
        scale: 2, 
        useCORS: true,
        allowTaint: true
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `fa-training-hub-card.png`;
      link.click();
    } catch (e) {
      alert("Erro ao exportar o Card holográfico.");
      console.error(e);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Carregando seu Card holográfico da nuvem...</div>;

  return (
    <div className="container" style={{ textAlign: 'center', paddingTop: 'var(--spacing-lg)' }}>
      {showConfetti && <ConfettiEffect />}
      <header style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h1>Vestiário Digital</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Passe o mouse ou clique no card para girar em 3D e revelar os relatórios do Coach.</p>
      </header>

      {workout ? (
        <>
          <div 
            className="card-container" 
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleCardClick}
            style={{ 
              perspective: '1000px', 
              cursor: 'pointer',
              width: '300px',
              height: '440px',
              margin: '0 auto',
              position: 'relative'
            }}
          >
            <div className="card-inner" style={{ transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)', transformStyle: 'preserve-3d', width: '100%', height: '100%' }}>
              
              {/* FRONT CARD (Jinx / Lorcana style in Image 3) */}
              <div 
                className={`card-front ${getCardBorderClass(athlete.cardBorder)}`} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between', 
                  height: '100%', 
                  position: 'absolute', 
                  width: '100%', 
                  backfaceVisibility: 'hidden', 
                  overflow: 'hidden',
                  ...getCardBorderStyle() 
                }}
              >
                {/* Full-bleed Portrait Background */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, overflow: 'hidden' }}>
                  {athlete.profilePhoto ? (
                    <img 
                      src={athlete.profilePhoto} 
                      alt={athlete.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '3rem', opacity: 0.15 }}>🛡️</span>
                    </div>
                  )}
                  {/* Shadow overlay gradient to enhance readability */}
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'linear-gradient(to top, rgba(2, 6, 23, 0.95) 0%, rgba(2, 6, 23, 0.4) 40%, rgba(2, 6, 23, 0.25) 100%)',
                    zIndex: 2
                  }} />
                </div>

                {/* Inner Gold Frame Border */}
                <div style={{
                  position: 'absolute',
                  top: '12px', left: '12px', right: '12px', bottom: '12px',
                  border: '2px solid rgba(251, 191, 36, 0.45)',
                  borderRadius: '12px',
                  zIndex: 2,
                  pointerEvents: 'none'
                }} />

                {/* Left-top vertical circle badges */}
                <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 5 }}>
                  {/* Circle 1: Position Badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#ef4444',
                    color: '#fff',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    fontSize: '0.7rem',
                    fontWeight: '950',
                    border: '1.5px solid #fff',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                  }}>
                    {athlete.position || 'DL'}
                  </div>

                  {/* Circle 2: Sport Category Icon */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#8b5cf6',
                    color: '#fff',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    fontSize: '0.65rem',
                    fontWeight: '900',
                    border: '1.5px solid #fff',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                  }}>
                    {athlete.position === 'Força Base' ? 'PL' : (athlete.position === 'Forwards' || athlete.position === 'Backs' ? 'RG' : 'FA')}
                  </div>
                </div>

                {/* Top-right overall rating */}
                <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 5 }}>
                  <span style={{
                    fontSize: '1.7rem',
                    fontWeight: '950',
                    color: '#fff',
                    textShadow: '0 0 10px rgba(255,255,255,0.4), 0 0 20px rgba(6,182,212,0.3)'
                  }}>
                    {athlete.overall}
                  </span>
                </div>

                {/* Player Name Tag (Positioned right above the main title band) */}
                <div style={{
                  position: 'absolute',
                  top: '235px',
                  left: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  zIndex: 5
                }}>
                  <span style={{
                    background: '#fbbf24',
                    color: '#000',
                    fontSize: '0.55rem',
                    fontWeight: '900',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                  }}>
                    {athlete.overall >= 90 ? 'MYTHIC' : athlete.overall >= 80 ? 'EPIC' : 'LEGEND'}
                  </span>
                  <span style={{
                    color: '#fff',
                    fontSize: '0.95rem',
                    fontWeight: '900',
                    textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                    letterSpacing: '0.5px'
                  }}>
                    {athlete.name?.toUpperCase()}
                  </span>
                </div>

                {/* Classification Title Band */}
                <div style={{
                  position: 'absolute',
                  top: '260px',
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.9) 0%, rgba(109, 40, 217, 0.75) 100%)',
                  borderTop: '1px solid rgba(255,255,255,0.15)',
                  borderBottom: '1px solid rgba(255,255,255,0.15)',
                  padding: '5px 20px',
                  zIndex: 4,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: '900',
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                  }}>
                    {athlete.position === 'DL' ? 'Muralha de Trincheira' : athlete.position === 'QB' ? 'Lançador de Elite' : 'Estilo Lendário'}
                  </span>
                </div>

                {/* Lore Description Box at bottom */}
                <div style={{
                  position: 'absolute',
                  top: '300px',
                  left: '20px',
                  right: '20px',
                  bottom: '20px',
                  background: 'rgba(2, 6, 23, 0.75)',
                  backdropFilter: 'blur(4px)',
                  border: '1.5px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  zIndex: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center'
                }}>
                  <p style={{
                    margin: 0,
                    color: 'rgba(255,255,255,0.85)',
                    fontSize: '0.7rem',
                    lineHeight: '1.3',
                    fontStyle: 'italic',
                    fontFamily: 'var(--font-base)'
                  }}>
                    {athlete.position === 'DL' ? '"Força explosiva na trincheira. Ao iniciar o Scrimmage, ganha +15 de potência concêntrica de quadril."' : 
                     athlete.position === 'QB' ? '"Precisão milimétrica e leitura rápida de rotas. Lança passes perfeitos superando a cobertura."' :
                     '"Atleta de alto rendimento treinado nos programas de elite da Ascend Athletics."'}
                  </p>
                </div>

                {/* Center Gem on frame border */}
                <div style={{
                  position: 'absolute',
                  bottom: '6px',
                  left: '50%',
                  width: '8px',
                  height: '8px',
                  background: '#a855f7',
                  border: '1px solid #fff',
                  transform: 'translateX(-50%) rotate(45deg)',
                  boxShadow: '0 0 6px #a855f7',
                  zIndex: 10
                }} />

                {/* Bottom info tags */}
                <div style={{ position: 'absolute', bottom: '4px', left: '16px', fontSize: '0.5rem', color: 'rgba(255,255,255,0.35)', zIndex: 10 }}>
                  ASC - {athlete.overall}/99
                </div>
                <div style={{ position: 'absolute', bottom: '4px', right: '16px', fontSize: '0.5rem', color: 'rgba(255,255,255,0.35)', zIndex: 10 }}>
                  ⚡ 2026 ASCEND
                </div>
              </div>

              {/* BACK CARD (Ryu / Street Fighter style in Image 4) */}
              <div 
                className={`card-back ${getCardBorderClass(athlete.cardBorder)}`} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between', 
                  height: '100%', 
                  position: 'absolute', 
                  width: '100%', 
                  backfaceVisibility: 'hidden', 
                  transform: 'rotateY(180deg)',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  backgroundImage: 'radial-gradient(circle at center, transparent 30%, rgba(148, 163, 184, 0.08) 31%), repeating-conic-gradient(from 0deg, transparent 0deg 10deg, rgba(148, 163, 184, 0.05) 10deg 20deg)',
                  border: '4px solid #475569',
                  borderRadius: '15px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                }}
              >
                {/* Top Left OVR badge */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: '#1e293b',
                  color: '#fff',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-display)',
                  fontWeight: '950',
                  fontSize: '1.15rem',
                  border: '1.5px solid #fff',
                  boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
                  zIndex: 5
                }}>
                  {athlete.overall}
                </div>

                {/* Top Right Header Nameplate */}
                <div style={{ position: 'absolute', top: '12px', right: '16px', textAlign: 'right', zIndex: 5 }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '950', color: '#0f172a', textTransform: 'uppercase', lineHeight: '1', fontFamily: 'var(--font-display)' }}>
                    {athlete.name?.split(' ')[0]}
                  </div>
                  <div style={{ fontSize: '0.55rem', fontWeight: '800', color: '#64748b', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '2px' }}>
                    ASCEND ATHLETICS
                  </div>
                </div>

                {/* Middle Area bordered polygon segment */}
                <div style={{
                  position: 'absolute',
                  top: '52px',
                  left: '16px',
                  right: '16px',
                  height: '315px',
                  background: '#ffffff',
                  border: '2.5px solid #0f172a',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.04)',
                  zIndex: 4
                }}>
                  {/* Bio Text */}
                  <p style={{
                    margin: 0,
                    color: '#334155',
                    fontSize: '0.68rem',
                    lineHeight: '1.35',
                    fontWeight: '700',
                    textAlign: 'justify',
                    fontFamily: 'sans-serif'
                  }}>
                    Nascido para dominar as trincheiras físicas e táticas do time, {athlete.name?.split(' ')[0]} realiza uma periodização constante sob a liderança de seu Coach para elevar o nível de OVR. Atleta de alto rendimento focado em consistência e PRs.
                  </p>

                  {/* Stats details list inside the polygon */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    borderTop: '1.5px dashed #cbd5e1',
                    paddingTop: '10px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase' }}>TREINO DO DIA</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#0f172a' }}>MVP</span>
                    </div>

                    {/* Workout sets preview */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px', maxHeight: '160px', overflowY: 'auto' }}>
                      {workout.sets.map((set, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '0.62rem', fontWeight: '700', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{set.exerciseName}</span>
                          <span style={{ fontSize: '0.65rem', fontWeight: '900', color: '#10b981' }}>{set.targetSets}x{set.targetReps}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0fdf4', padding: '4px 8px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                        <span style={{ fontSize: '0.62rem', fontWeight: '700', color: '#166534' }}>Missão</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: '900', color: '#15803d' }}>CONCLUÍDA</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Banner GAMES */}
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '1.25rem',
                  fontWeight: '950',
                  color: '#0f172a',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-display)',
                  zIndex: 5
                }}>
                  GAMES
                </div>

                {/* Corner aesthetic logos */}
                <div style={{ position: 'absolute', bottom: '10px', left: '16px', width: '24px', height: '24px', borderRadius: '50%', border: '1.5px solid #cbd5e1', background: 'rgba(0,0,0,0.02)', zIndex: 5 }} />
                <div style={{ position: 'absolute', bottom: '10px', right: '16px', width: '24px', height: '24px', borderRadius: '50%', border: '1.5px solid #cbd5e1', background: 'rgba(0,0,0,0.02)', zIndex: 5 }} />
              </div>

            </div>
          </div>

          <div style={{ marginTop: '30px' }}>
            <button onClick={downloadCard} className="btn" style={{ background: '#22c55e', color: '#000', padding: '15px 30px', fontSize: '1.2rem', boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)' }}>
              📸 BAIXAR CARD PARA INSTAGRAM
            </button>
          </div>
        </>
      ) : (
        <div className="card-panel" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <h2 style={{ color: 'var(--accent-red)' }}>Nenhum Card Encontrado</h2>
          <p style={{ color: 'var(--text-secondary)' }}>PIN inválido ou treino não finalizado.</p>
        </div>
      )}

      <div style={{ marginTop: '40px' }}>
        <Link href="/training" className="btn" style={{ textDecoration: 'none', padding: '15px 30px', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
          &larr; Voltar para Treinamento
        </Link>
      </div>
    </div>
  );
}

export default function LockerRoom() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px' }}>Iniciando Vestiário...</div>}>
      <LockerContent />
    </Suspense>
  );
}
