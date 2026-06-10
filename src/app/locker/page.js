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
            style={{ perspective: '1000px', cursor: 'pointer' }}
          >
            <div className="card-inner">
              
              {/* FRENTE */}
              <div className={`card-front ${getCardBorderClass(athleteData?.cardBorder)}`}>
                <div className="ovr-badge">{athleteData?.overall || '94'}</div>
                <div className="front-header">
                  <div className="front-title">{athleteData?.name?.toUpperCase() || 'RAFAEL S.'}</div>
                </div>
                <div className="front-body">
                  <div className="side-text">{athleteData?.position || 'OFFENSIVE LINEMAN'}</div>
                  {athleteData?.profilePhoto ? (
                    <img 
                      src={athleteData.profilePhoto} 
                      alt={athleteData.name} 
                      style={{ width: '180px', height: '180px', borderRadius: '10px', objectFit: 'cover', border: '3px solid var(--primary-color)', boxShadow: '0 10px 20px rgba(0,0,0,0.5)', zIndex: 2 }} 
                    />
                  ) : (
                    <div className="player-image-placeholder"></div>
                  )}
                </div>
                <div className="front-footer">
                  <div className="nameplate"><span>THE WALL</span></div>
                  <div className="team-logo">{athleteData?.position || 'OL'}</div>
                </div>
              </div>

              {/* VERSO CONECTADO AO BANCO */}
              <div className={`card-back ${getCardBorderClass(athleteData?.cardBorder)}`}>
                <div className="back-header">
                  <div className="back-subtitle">Training Prescription</div>
                  <div className="back-title">WORKOUT MVP</div>
                </div>
                <div className="workout-stats">
                  {workout.sets.map(set => (
                    <div className="stat-row" key={set.id}>
                      <span className="stat-name">{set.exerciseName}</span>
                      <span className="stat-value">{set.targetSets}x{set.targetReps}</span>
                    </div>
                  ))}
                  <div className="stat-row" style={{ borderLeftColor: '#22c55e' }}>
                    <span className="stat-name">Missão</span>
                    <span className="stat-value" style={{ color: '#22c55e' }}>CONCLUÍDA</span>
                  </div>
                </div>
                <div className="back-footer">COACH: {workout.coach?.name || 'APPROVED'}</div>
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
