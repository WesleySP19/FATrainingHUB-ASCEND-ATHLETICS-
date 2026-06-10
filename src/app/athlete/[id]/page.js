"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import html2canvas from 'html2canvas';
import TacticalDashboard from '@/components/TacticalDashboard';

export default function AthleteDashboard() {
  const params = useParams();
  const id = params.id;
  const searchParams = useSearchParams();
  const forceHistory = searchParams.get('history') === 'true';

  const [athlete, setAthlete] = useState(null);
  const [mvp, setMvp] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [radarTooltip, setRadarTooltip] = useState(null);

  // Personalization States
  const [themeColor, setThemeColor] = useState('midnight'); // midnight, cyberpunk, gold, emerald
  const [profilePhoto, setProfilePhoto] = useState('');
  const [cardBorder, setCardBorder] = useState('DEFAULT'); // DEFAULT, GOLD, HOLO, OBSIDIAN, EMERALD, HISTORIC
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

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
    const xRotate = ((x / rect.width) - 0.5) * 20; // -10 a 10 deg
    const yRotate = -((y / rect.height) - 0.5) * 20; // -10 a 10 deg
    
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

  // Conquistador / PR States
  const [prExerciseName, setPrExerciseName] = useState('');
  const [prMaxLoad, setPrMaxLoad] = useState('');
  const [addingPR, setAddingPR] = useState(false);
  const [prError, setPrError] = useState('');

  const [selectedMonth, setSelectedMonth] = useState('JUN');
  const downloadSheetRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    if (id) {
      fetchAthleteData();
    }
  }, [id]);

  const fetchAthleteData = async () => {
    try {
      const res = await fetch(`/api/athlete/${id}`);
      const data = await res.json();
      if (data.success) {
        setAthlete(data.athlete);
        setMvp(data.mvp);
        setWorkouts(data.workouts);
        setThemeColor(data.athlete.themeColor || 'midnight');
        setProfilePhoto(data.athlete.profilePhoto || '');
        setCardBorder(data.athlete.cardBorder || 'DEFAULT');
      } else {
        setError(data.error || 'Erro ao carregar dados do atleta.');
      }
    } catch (e) {
      setError('Sem conexão com o servidor.');
    }
    setLoading(false);
  };

  const handleSaveCustomization = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess('');
    try {
      const res = await fetch(`/api/athlete/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeColor, profilePhoto, cardBorder })
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess('Personalização salva com sucesso!');
        setAthlete(data.athlete);
        localStorage.setItem('athlete', JSON.stringify(data.athlete));
      } else {
        alert("Erro ao salvar customização: " + data.error);
      }
    } catch (e) {
      alert("Erro na conexão.");
    }
    setSaving(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPR = async (e) => {
    e.preventDefault();
    setPrError('');
    if (!prExerciseName || !prMaxLoad) return;
    setAddingPR(true);
    try {
      const res = await fetch(`/api/athlete/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'addPR', 
          exerciseName: prExerciseName, 
          maxLoad: parseFloat(prMaxLoad) 
        })
      });
      const data = await res.json();
      if (data.success) {
        setAthlete(data.athlete);
        setPrExerciseName('');
        setPrMaxLoad('');
        // Recarrega dados para atualizar lista local
        fetchAthleteData();
      } else {
        setPrError(data.error || 'Erro ao registrar recorde.');
      }
    } catch (err) {
      setPrError('Erro na conexão com o servidor.');
    }
    setAddingPR(false);
  };

  const downloadCard = async () => {
    if (!downloadSheetRef.current) return;
    try {
      const canvas = await html2canvas(downloadSheetRef.current, { 
        backgroundColor: '#050814', 
        scale: 2, 
        useCORS: true,
        allowTaint: true
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `${athlete.name.replace(/\s+/g, '_')}_card_pack.png`;
      link.click();
    } catch (e) {
      alert("Erro ao exportar o Card side-by-side.");
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: '#fff', fontSize: '1.2rem' }}>Carregando seu Locker Room...</div>;
  if (error) {
    return (
      <div className="container" style={{ maxWidth: '500px', marginTop: '15vh', textAlign: 'center' }}>
        <div className="card-panel">
          <h2 style={{ color: 'var(--accent-red)' }}>Aviso</h2>
          <p style={{ margin: '20px 0', color: 'var(--text-secondary)' }}>{error}</p>
          <Link href="/" className="btn">Voltar para Home</Link>
        </div>
      </div>
    );
  }

  // Check if historical card criteria is met
  const prs = athlete.personalRecords || [];
  const isHistoricalQualified = prs.length >= 3 || forceHistory;

  const forceVal = athlete.forceAttr ?? 70;
  const skillVal = athlete.skillAttr ?? 70;
  const speedVal = athlete.speedAttr ?? 70;
  const powerVal = athlete.powerAttr ?? 70;
  const evolutionVal = athlete.evolutionAttr ?? 70;

  const getRadarCoord = (i, value) => {
    const angle = (i * 72 - 90) * Math.PI / 180;
    const r = 55 * (value / 100);
    const x = 100 + r * Math.cos(angle);
    const y = 100 + r * Math.sin(angle);
    return { x, y };
  };

  const p0 = getRadarCoord(0, forceVal);
  const p1 = getRadarCoord(1, skillVal);
  const p2 = getRadarCoord(2, speedVal);
  const p3 = getRadarCoord(3, powerVal);
  const p4 = getRadarCoord(4, evolutionVal);
  const polygonPoints = `${p0.x},${p0.y} ${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`;

  const drawPentagon = (scale) => {
    const pts = [0, 1, 2, 3, 4].map(i => {
      const angle = (i * 72 - 90) * Math.PI / 180;
      const r = 55 * scale;
      const x = 100 + r * Math.cos(angle);
      const y = 100 + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
    return <polygon key={scale} points={pts} fill="none" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="1" />;
  };

  const drawAxis = (i, label) => {
    const angle = (i * 72 - 90) * Math.PI / 180;
    const outerX = 100 + 55 * Math.cos(angle);
    const outerY = 100 + 55 * Math.sin(angle);
    const labelX = 100 + 78 * Math.cos(angle);
    const labelY = 100 + 78 * Math.sin(angle);
    return (
      <g key={i}>
        <line x1="100" y1="100" x2={outerX} y2={outerY} stroke="rgba(6, 182, 212, 0.25)" strokeWidth="1" />
        <text x={labelX} y={labelY} fill="#06b6d4" fontSize="8" fontWeight="bold" textAnchor="middle" alignmentBaseline="middle">{label}</text>
      </g>
    );
  };

  const getMonthStats = () => {
    const position = (athlete.position || '').toUpperCase();
    const baseGames = workouts.length || 3;
    const baseOvr = athlete.overall || 70;
    const basePrs = prs.length;

    let multiplier = 1;
    if (selectedMonth === 'JAN') multiplier = 0.2;
    else if (selectedMonth === 'FEB') multiplier = 0.4;
    else if (selectedMonth === 'MAR') multiplier = 0.6;
    else if (selectedMonth === 'APR') multiplier = 0.8;
    else if (selectedMonth === 'MAY') multiplier = 0.9;
    else multiplier = 1.0;

    const games = Math.max(1, Math.round(baseGames * multiplier));
    const prsCount = Math.round(basePrs * multiplier);

    if (position === 'QB') {
      return [
        { label: 'PASS TOUCHDOWNS', value: Math.round(games * 1.5 + prsCount * 0.5) },
        { label: 'GAMES PLAYED', value: games },
        { label: 'PASS YARDS', value: `${games * 220 + prsCount * 15} YDS` },
        { label: 'PASSER RATING', value: (85 + (baseOvr - 70) * 0.6 * multiplier).toFixed(1) }
      ];
    } else if (position === 'OL') {
      return [
        { label: 'PANCAKES', value: Math.round(games * 2.2 + prsCount * 0.6) },
        { label: 'GAMES PLAYED', value: games },
        { label: 'SNAPS PLAYED', value: games * 55 },
        { label: 'SACKS ALLOWED', value: Math.max(0, Math.round(games * 0.15 - prsCount * 0.05)) }
      ];
    } else if (position === 'DL') {
      return [
        { label: 'SACKS', value: Math.round(games * 0.4 + prsCount * 0.2) },
        { label: 'GAMES PLAYED', value: games },
        { label: 'PRESSURES', value: Math.round(games * 2.5 + prsCount * 0.5) },
        { label: 'TOTAL TACKLES', value: Math.round(games * 3.2 + prsCount * 0.8) }
      ];
    } else if (position === 'FORÇA BASE') {
      const topPR = prs.length > 0 ? Math.max(...prs.map(p => p.maxLoad)) : Math.round(baseOvr * 2.5);
      const scaledPR = Math.round(topPR * (0.8 + 0.2 * multiplier));
      return [
        { label: 'SQUAT PR', value: `${scaledPR} KG` },
        { label: 'SESSÕES TOTAIS', value: games },
        { label: 'REPS NA FAIXA ALVO', value: games * 30 },
        { label: 'EVOLUÇÃO SEMANAL', value: `+${(baseOvr * 0.15 * multiplier).toFixed(1)}%` }
      ];
    } else {
      return [
        { label: 'TOUCHDOWNS', value: Math.round(games * 0.8 + prsCount * 0.2) },
        { label: 'GAMES PLAYED', value: games },
        { label: 'RUSHES', value: games * 10 },
        { label: 'TD/GAME', value: games > 0 ? (Math.round(games * 0.8 + prsCount * 0.2) / games).toFixed(2) : '0.00' }
      ];
    }
  };

  const getThemeBackground = () => {
    switch (themeColor) {
      case 'cyberpunk': return 'linear-gradient(135deg, #2e0854 0%, #0c0214 100%)';
      case 'gold': return 'linear-gradient(135deg, #1c1500 0%, #020200 100%)';
      case 'emerald': return 'linear-gradient(135deg, #001f13 0%, #000201 100%)';
      case 'midnight':
      default: return 'linear-gradient(135deg, #0f172a 0%, #020617 100%)';
    }
  };

  const renderTimelineChart = () => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'];
    const data = months.map((m, idx) => {
      let mult = 1;
      if (m === 'JAN') mult = 0.2;
      else if (m === 'FEB') mult = 0.4;
      else if (m === 'MAR') mult = 0.6;
      else if (m === 'APR') mult = 0.8;
      else if (m === 'MAY') mult = 0.9;
      else mult = 1.0;
      
      const volume = Math.round((workouts?.length || 3) * 15 * mult);
      return { month: m, volume };
    });

    const maxVal = Math.max(...data.map(d => d.volume), 20);
    const height = 100;
    const width = 400;
    const padding = 20;

    const points = data.map((d, i) => {
      const x = padding + (i * (width - 2 * padding) / (data.length - 1));
      const y = height - padding - (d.volume / maxVal) * (height - 2 * padding);
      return { x, y, ...d };
    });

    let pathD = '';
    if (points.length > 0) {
      pathD = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const pStart = points[i];
        const pEnd = points[i + 1];
        const cp1x = pStart.x + (pEnd.x - pStart.x) / 3;
        const cp1y = pStart.y;
        const cp2x = pEnd.x - (pEnd.x - pStart.x) / 3;
        const cp2y = pEnd.y;
        pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pEnd.x} ${pEnd.y}`;
      }
    }
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3 3" />
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3 3" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(6, 182, 212, 0.2)" strokeWidth="1" />

        <path d={areaD} fill="url(#chartGrad)" />
        <path d={pathD} fill="none" stroke="#06b6d4" strokeWidth="2.5" style={{ filter: 'drop-shadow(0 0 4px rgba(6,182,212,0.5))' }} />

        {points.map((p, idx) => {
          const isSelected = p.month === selectedMonth;
          return (
            <g key={idx}>
              {isSelected && (
                <line x1={p.x} y1={padding} x2={p.x} y2={height - padding} stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1.5" strokeDasharray="2 2" />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={isSelected ? 5.5 : 3.5}
                fill={isSelected ? '#00ffff' : '#050814'}
                stroke={isSelected ? '#fff' : '#06b6d4'}
                strokeWidth={isSelected ? 2 : 1.5}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedMonth(p.month)}
              />
              <text
                x={p.x}
                y={p.y - 8}
                fill={isSelected ? '#00ffff' : 'rgba(255,255,255,0.6)'}
                fontSize={isSelected ? '9' : '7.5'}
                fontWeight={isSelected ? 'bold' : 'normal'}
                textAnchor="middle"
              >
                {p.volume}
              </text>
              <text
                x={p.x}
                y={height - 4}
                fill={isSelected ? '#06b6d4' : 'var(--text-secondary)'}
                fontSize="8"
                fontWeight={isSelected ? 'bold' : 'normal'}
                textAnchor="middle"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedMonth(p.month)}
              >
                {p.month}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  // Border formatting inline style
  const getCardBorderStyle = () => {
    switch (cardBorder) {
      case 'GOLD': return { border: '4px solid #eab308', boxShadow: '0 0 20px rgba(234,179,8,0.4)' };
      case 'HOLO': return { border: '4px solid #c084fc', boxShadow: '0 0 20px rgba(192,132,252,0.4)' };
      case 'OBSIDIAN': return { border: '4px solid #f97316', boxShadow: '0 0 20px rgba(249,115,22,0.4)' };
      case 'EMERALD': return { border: '4px solid #10b981', boxShadow: '0 0 20px rgba(16,185,129,0.4)' };
      case 'HISTORIC': return { border: '5px double #facc15', boxShadow: '0 0 35px rgba(250,204,21,0.6)', background: 'linear-gradient(135deg, #000 0%, #1a1505 100%)' };
      default: return { border: '2px solid rgba(255,255,255,0.1)' };
    }
  };

  return (
    <div style={{ background: getThemeBackground(), minHeight: '100vh', transition: 'background 0.5s ease', paddingBottom: '80px', color: '#fff' }}>
      <div className="container">
        
        {/* Navbar */}
        <nav style={{ padding: '20px 0', borderBottom: '1px solid rgba(6, 182, 212, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ color: '#06b6d4', margin: 0, textShadow: '0 0 10px rgba(6,182,212,0.3)' }}>LOCKER ROOM HUD</h2>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Modalidade: {athlete.position === 'Força Base' ? 'Powerlifting' : (athlete.position === 'Forwards' || athlete.position === 'Backs' ? 'Rugby' : 'Futebol Americano')}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 'bold' }} onMouseEnter={e => e.target.style.color = '#06b6d4'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>&larr; Voltar para Home</Link>
            <button 
              onClick={async () => {
                localStorage.removeItem('athlete');
                try {
                  await fetch('/api/auth/logout', { method: 'POST' });
                } catch (e) {}
                window.location.href = '/athlete/login';
              }} 
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', textDecoration: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', padding: 0 }}
            >
              Sair
            </button>
          </div>
        </nav>

        {/* Banner MVP */}
        {mvp && mvp.id === athlete.id && (
          <div style={{
            marginTop: '25px',
            padding: '20px',
            borderRadius: '8px',
            background: 'linear-gradient(90deg, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0.03) 100%)',
            border: '1px solid #06b6d4',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 0 20px rgba(6,182,212,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '2rem' }}>👑</span>
              <div>
                <h4 style={{ color: '#06b6d4', margin: 0, fontSize: '0.8rem', letterSpacing: '1.5px', textShadow: '0 0 8px #06b6d4' }}>VOCÊ FOI ELEITO PELO COACH</h4>
                <p style={{ margin: '5px 0 0 0', fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '1px' }}>MVP DO SEU ROSTER!</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: '#06b6d4', fontWeight: 'bold', fontSize: '1.4rem', textShadow: '0 0 10px #06b6d4' }}>{athlete.overall} OVR</span>
            </div>
          </div>
        )}

        {/* 3-Column Grid HUD */}
        <div className="hud-container">
          
          {/* Column 1 (Left): Hero Profile */}
          <aside className="hud-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1rem', color: '#06b6d4', borderBottom: '1px solid rgba(6,182,212,0.15)', paddingBottom: '8px', margin: 0 }}>PERFIL DO ATLETA</h3>
            
            <div 
              className="card-container" 
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={handleCardClick}
              style={{ 
                perspective: '1000px', 
                cursor: 'pointer',
                width: '100%',
                height: '400px',
                margin: '10px 0',
                position: 'relative'
              }}
            >
              <div className="card-inner" style={{ transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)', transformStyle: 'preserve-3d', width: '100%', height: '100%' }}>
                {/* FRONT CARD */}
                <div className={`card-front ${getCardBorderClass(cardBorder)}`} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', position: 'absolute', width: '100%', backfaceVisibility: 'hidden' }}>
                  <div className="ovr-badge" style={{ fontSize: '2.5rem', top: '10px', right: '15px' }}>{athlete.overall}</div>
                  <div className="front-header" style={{ padding: '10px 5px' }}>
                    <div className="front-title" style={{ fontSize: '1.5rem' }}>{athlete.name?.toUpperCase()}</div>
                  </div>
                  <div className="front-body" style={{ flexGrow: 1, padding: '10px' }}>
                    <div className="side-text" style={{ fontSize: '0.55rem', left: '5px' }}>{athlete.position}</div>
                    {profilePhoto ? (
                      <img src={profilePhoto} alt={athlete.name} style={{ width: '140px', height: '140px', borderRadius: '10px', objectFit: 'cover', border: '3px solid #06b6d4', boxShadow: '0 10px 20px rgba(0,0,0,0.5)', zIndex: 2 }} />
                    ) : (
                      <div className="player-image-placeholder" style={{ width: '140px', height: '140px', borderRadius: '10px', border: '3px solid #06b6d4', backgroundColor: '#333' }}></div>
                    )}
                  </div>
                  <div className="front-footer" style={{ padding: '10px' }}>
                    <div className="nameplate" style={{ fontSize: '1rem', padding: '3px 10px' }}>
                      <span>ASCEND ATHLETICS</span>
                    </div>
                    <div className="team-logo" style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}>
                      {athlete.position?.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* BACK CARD */}
                <div className={`card-back ${getCardBorderClass(cardBorder)}`} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', position: 'absolute', width: '100%', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                  <div className="back-header" style={{ padding: '10px' }}>
                    <div className="back-subtitle" style={{ fontSize: '0.65rem' }}>Training Prescription</div>
                    <div className="back-title" style={{ fontSize: '1.6rem' }}>RECORD BOOK</div>
                  </div>
                  <div className="workout-stats" style={{ padding: '10px', gap: '5px', overflowY: 'auto' }}>
                    <div className="stat-row" style={{ padding: '6px 10px' }}>
                      <span className="stat-name" style={{ fontSize: '0.85rem' }}>Constância</span>
                      <span className="stat-value" style={{ fontSize: '1rem' }}>{athlete.attendanceCount || 0} treinos</span>
                    </div>
                    <div className="stat-row" style={{ padding: '6px 10px' }}>
                      <span className="stat-name" style={{ fontSize: '0.85rem' }}>Recordes PR</span>
                      <span className="stat-value" style={{ fontSize: '1rem' }}>{prs.length}</span>
                    </div>
                    {prs.slice(0, 2).map((pr, idx) => (
                      <div className="stat-row" key={idx} style={{ padding: '6px 10px' }}>
                        <span className="stat-name" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>{pr.exerciseName}</span>
                        <span className="stat-value" style={{ fontSize: '1rem', color: '#22c55e' }}>{pr.maxLoad} KG</span>
                      </div>
                    ))}
                  </div>
                  <div className="back-footer" style={{ padding: '10px', fontSize: '0.75rem' }}>COACH APPROVED</div>
                </div>
              </div>
            </div>

            {/* Physical metrics list */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#06b6d4', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '5px' }}>Métricas Físicas</h4>
              <dl style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '8px', margin: 0 }}>
                <dt style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Altura:</dt>
                <dd style={{ margin: 0, fontWeight: 'bold', fontSize: '0.85rem', color: '#fff', textAlign: 'right' }}>{athlete.height || "6'2\""}</dd>
                
                <dt style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Peso:</dt>
                <dd style={{ margin: 0, fontWeight: 'bold', fontSize: '0.85rem', color: '#fff', textAlign: 'right' }}>{athlete.weight || "220 lbs"}</dd>
                
                <dt style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Envergadura:</dt>
                <dd style={{ margin: 0, fontWeight: 'bold', fontSize: '0.85rem', color: '#fff', textAlign: 'right' }}>{athlete.wingspan || "75\""}</dd>
                
                <dt style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Tamanho da Mão:</dt>
                <dd style={{ margin: 0, fontWeight: 'bold', fontSize: '0.85rem', color: '#fff', textAlign: 'right' }}>{athlete.handSize || "9.5\""}</dd>
              </dl>
            </div>
          </aside>

          {/* Column 2 (Center): Evolution timeline and training details */}
          <main className="hud-panel-cut" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Timeline selector bar */}
            <div>
              <h3 style={{ fontSize: '1rem', color: '#06b6d4', marginBottom: '12px', borderBottom: '1px solid rgba(6,182,212,0.15)', paddingBottom: '6px' }}>PERFORMANCE TIMELINE</h3>
              <div className="timeline-bar">
                {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'].map(month => (
                  <button
                    key={month}
                    className={`timeline-btn ${selectedMonth === month ? 'active' : ''}`}
                    onClick={() => setSelectedMonth(month)}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </div>

            {/* Big Numbers metrics derived from month */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '15px' }}>
              {getMonthStats().map((sum, index) => (
                <div key={index} style={{ background: '#0b111e', borderLeft: '3px solid #06b6d4', padding: '12px 15px', borderRadius: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                    {sum.label}
                  </div>
                  <div style={{ fontSize: '1.45rem', fontWeight: '900', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    {sum.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Inline SVG Charts */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#06b6d4', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Progressão de Volume de Treino</h4>
              <div style={{ marginTop: '10px' }}>
                {renderTimelineChart()}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '20px' }}>
              
              {/* Prescribed Training sessions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px', margin: 0 }}>TREINAMENTO ATIVO</h4>
                
                {workouts.length === 0 ? (
                  <div style={{ padding: '15px 10px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', border: '1px dashed rgba(255,255,255,0.06)', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 10px 0' }}>Nenhum treino específico atribuído.</p>
                    <Link href="/training" className="btn" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>Ir para Treinamento</Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {workouts.slice(0, 2).map(w => (
                      <div key={w.id} style={{ background: '#0b111e', border: '1px solid rgba(255,255,255,0.06)', padding: '12px', borderRadius: '6px', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '3px', background: '#06b6d4' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong style={{ fontSize: '0.85rem', display: 'block', color: '#fff' }}>PLANILHA DE TREINO</strong>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>PIN: {w.pinCode}</span>
                          </div>
                          <Link href={`/training?pin=${w.pinCode}`} className="btn" style={{ padding: '6px 10px', fontSize: '0.75rem', background: '#06b6d4', color: '#000', fontWeight: 'bold' }}>
                            INICIAR ⚡
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Conquistador PR Records Panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px', margin: 0 }}>REGISTRO PR</h4>
                
                <form onSubmit={handleAddPR} style={{ display: 'flex', gap: '5px', marginBottom: '8px' }}>
                  <input required placeholder="Exercício" value={prExerciseName} onChange={e => setPrExerciseName(e.target.value)} style={{ flex: 1.8, padding: '6px 10px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', fontSize: '0.8rem' }} />
                  <input required type="number" placeholder="Peso (kg)" value={prMaxLoad} onChange={e => setPrMaxLoad(e.target.value)} style={{ flex: 1.2, padding: '6px 5px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', fontSize: '0.8rem', textAlign: 'center' }} />
                  <button type="submit" disabled={addingPR} className="btn" style={{ padding: '6px 8px', fontSize: '0.8rem', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', border: '1px solid #06b6d4' }}>
                    +
                  </button>
                </form>

                {prError && <p style={{ color: 'var(--accent-red)', fontSize: '0.75rem', margin: '0 0 5px 0' }}>{prError}</p>}

                <div style={{ maxHeight: '90px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {prs.map(pr => (
                    <div key={pr.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: '4px', borderLeft: '2.5px solid #06b6d4', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: 'bold' }}>{pr.exerciseName}</span>
                      <span style={{ color: '#00ffff', fontWeight: 'bold' }}>{pr.maxLoad} KG</span>
                    </div>
                  ))}
                  {prs.length === 0 && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textAlign: 'center', margin: '5px 0' }}>Nenhum recorde registrado.</p>
                  )}
                </div>
              </div>

            </div>

          </main>

          {/* Column 3 (Right): Attributes Radar Chart and Customize */}
          <aside className="hud-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1rem', color: '#06b6d4', borderBottom: '1px solid rgba(6,182,212,0.15)', paddingBottom: '8px', margin: 0 }}>ATRIBUTOS & TECH</h3>

            {/* Glowing SVG Radar Chart */}
            <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', width: '100%' }}>
              <svg viewBox="0 0 200 200" style={{ width: '180px', height: '180px', overflow: 'visible' }}>
                {/* Background hexagons grid lines */}
                {drawPentagon(0.2)}
                {drawPentagon(0.4)}
                {drawPentagon(0.6)}
                {drawPentagon(0.8)}
                {drawPentagon(1.0)}

                {/* Axes labels and lines */}
                {drawAxis(0, `FOR (${forceVal})`)}
                {drawAxis(1, `HAB (${skillVal})`)}
                {drawAxis(2, `VEL (${speedVal})`)}
                {drawAxis(3, `POW (${powerVal})`)}
                {drawAxis(4, `EVO (${evolutionVal})`)}

                {/* Radar attribute mapping polygon shape */}
                <polygon 
                  points={polygonPoints} 
                  fill="rgba(6, 182, 212, 0.2)" 
                  stroke="#00ffff" 
                  strokeWidth="2.5"
                  style={{ filter: 'drop-shadow(0 0 6px #06b6d4)' }}
                />

                {/* Pulsing neon dots and interactive vertices */}
                {[
                  { key: 'FOR', name: 'Força', val: forceVal, coord: p0 },
                  { key: 'HAB', name: 'Habilidade', val: skillVal, coord: p1 },
                  { key: 'VEL', name: 'Velocidade', val: speedVal, coord: p2 },
                  { key: 'POW', name: 'Potência', val: powerVal, coord: p3 },
                  { key: 'EVO', name: 'Evolução', val: evolutionVal, coord: p4 },
                ].map((vertex) => (
                  <g key={vertex.key}>
                    {/* Glowing static center dot */}
                    <circle cx={vertex.coord.x} cy={vertex.coord.y} r="4" fill="#00ffff" style={{ filter: 'drop-shadow(0 0 3px #00ffff)' }} />
                    {/* Pulsing outer dot */}
                    <circle cx={vertex.coord.x} cy={vertex.coord.y} r="8" className="radar-pulse-dot" />
                    {/* Invisible larger hover zone */}
                    <circle 
                      cx={vertex.coord.x} 
                      cy={vertex.coord.y} 
                      r="16" 
                      fill="transparent" 
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => {
                        setRadarTooltip({
                          x: vertex.coord.x,
                          y: vertex.coord.y,
                          label: vertex.name,
                          value: vertex.val
                        });
                      }}
                      onMouseLeave={() => setRadarTooltip(null)}
                    />
                  </g>
                ))}
              </svg>
              {/* Tooltip Overlay */}
              {radarTooltip && (
                <div style={{
                  position: 'absolute',
                  top: `${(radarTooltip.y / 200) * 100}%`,
                  left: `${(radarTooltip.x / 200) * 100}%`,
                  transform: 'translate(-50%, -130%)',
                  background: 'rgba(5, 8, 20, 0.95)',
                  border: '1.5px solid #00ffff',
                  boxShadow: '0 0 12px rgba(0, 255, 255, 0.5)',
                  borderRadius: '4px',
                  padding: '5px 9px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  color: '#fff',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  zIndex: 10
                }}>
                  {radarTooltip.label}: {radarTooltip.value}
                </div>
              )}
            </div>

            {/* Theme & custom forms */}
            <form onSubmit={handleSaveCustomization} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Tema Dashboard</label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['midnight', 'cyberpunk', 'gold', 'emerald'].map(t => (
                    <button 
                      key={t}
                      type="button" 
                      onClick={() => setThemeColor(t)}
                      style={{ 
                        flexGrow: 1, 
                        padding: '6px 2px', 
                        background: t === 'midnight' ? '#0f172a' : t === 'cyberpunk' ? '#2e0854' : t === 'gold' ? '#1c1500' : '#001f13', 
                        border: themeColor === t ? '1.5px solid #06b6d4' : '1px solid #334155', 
                        borderRadius: '4px', 
                        cursor: 'pointer', 
                        color: '#fff', 
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Borda do Card</label>
                <select 
                  value={cardBorder} 
                  onChange={e => setCardBorder(e.target.value)} 
                  style={{ width: '100%', padding: '8px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', fontSize: '0.8rem' }}
                >
                  <option value="DEFAULT">Padrão</option>
                  <option value="GOLD">Gold Border (Ouro)</option>
                  <option value="HOLO">Holo Neon (Roxo)</option>
                  <option value="OBSIDIAN">Obsidian Fire (Laranja)</option>
                  <option value="EMERALD">Emerald Shield (Verde)</option>
                  <option value="HISTORIC" disabled={!isHistoricalQualified}>
                    🏆 Histórico (3+ PRs) {!isHistoricalQualified ? '🔒' : '✅'}
                  </option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Foto (Link ou Upload)</label>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    placeholder="https://exemplo.com/foto.jpg" 
                    value={profilePhoto && profilePhoto.startsWith('data:') ? 'Imagem Local (Base64)' : profilePhoto} 
                    onChange={e => setProfilePhoto(e.target.value)} 
                    style={{ flexGrow: 1, padding: '8px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', fontSize: '0.8rem' }} 
                  />
                  <label className="btn" style={{
                    padding: '8px 10px',
                    fontSize: '0.75rem',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    margin: 0
                  }}>
                    📁 Upar
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>
              </div>

              {saveSuccess && <p style={{ color: 'var(--accent-green)', fontWeight: 'bold', fontSize: '0.8rem', margin: 0 }}>{saveSuccess}</p>}

              <button type="submit" disabled={saving} className="btn" style={{ padding: '10px', width: '100%', fontSize: '0.9rem', fontWeight: 'bold' }}>
                {saving ? 'SALVANDO...' : 'SALVAR CUSTOMIZAÇÃO'}
              </button>
            </form>

            <button onClick={downloadCard} className="btn" style={{ background: '#06b6d4', color: '#000', fontWeight: 'bold', fontSize: '0.95rem', width: '100%', padding: '12px' }}>
              📸 EXPORTAR CARD DUPLO PNG
            </button>
          </aside>

        </div>

      </div>

      {/* Side-by-Side capture sheet container (rendered off-screen) */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div 
          ref={downloadSheetRef} 
          style={{ 
            display: 'flex', 
            gap: '40px', 
            padding: '50px 60px', 
            background: '#050814', 
            border: '4px solid #06b6d4', 
            borderRadius: '24px', 
            boxShadow: '0 0 50px rgba(6,182,212,0.3)',
            width: '820px'
          }}
        >
          {/* FRONT CARD */}
          <div style={{ ...getCardBorderStyle(), width: '350px', height: '520px', borderRadius: '15px', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'linear-gradient(145deg, #1a1a1a 0%, #000000 100%)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '15px', right: '15px', fontFamily: 'var(--font-display)', fontSize: '3rem', color: '#fff', textShadow: cardBorder === 'HISTORIC' ? 'none' : '0 0 10px #06b6d4, 2px 2px 0px #000', zIndex: 5 }}>
              {athlete.overall}
            </div>
            <div style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid rgba(6, 182, 212, 0.3)', background: 'linear-gradient(to right, transparent, rgba(6, 182, 212, 0.1), transparent)' }}>
              <div style={{ fontFamily: 'var(--font-display)', color: cardBorder === 'HISTORIC' ? '#facc15' : '#fff', fontSize: '2.2rem', letterSpacing: '2px', textTransform: 'uppercase', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                {athlete.name.toUpperCase()}
              </div>
            </div>
            <div style={{ position: 'relative', flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundImage: `radial-gradient(circle at center, rgba(6, 182, 212, 0.15) 0%, transparent 70%)` }}>
              <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%) rotate(-90deg)', transformOrigin: 'left center', fontFamily: 'var(--font-base)', fontSize: '0.65rem', letterSpacing: '4px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                {athlete.position}
              </div>
              {profilePhoto ? (
                <img src={profilePhoto} alt={athlete.name} style={{ width: '180px', height: '180px', borderRadius: '10px', objectFit: 'cover', border: cardBorder === 'HISTORIC' ? '3px solid #facc15' : '3px solid #06b6d4', boxShadow: '0 10px 20px rgba(0,0,0,0.6)', zIndex: 2 }} />
              ) : (
                <div style={{ width: '180px', height: '180px', borderRadius: '10px', border: `3px solid ${cardBorder === 'HISTORIC' ? '#facc15' : '#06b6d4'}`, zIndex: 2, background: '#111' }}></div>
              )}
            </div>
            <div style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
              <div style={{ background: cardBorder === 'HISTORIC' ? '#facc15' : '#06b6d4', color: '#000', fontFamily: 'var(--font-display)', fontSize: '1.5rem', padding: '5px 15px', transform: 'skewX(-15deg)', border: '2px solid #fff' }}>
                <span style={{ display: 'block', transform: 'skewX(15deg)', fontWeight: 'bold' }}>
                  {cardBorder === 'HISTORIC' ? '🏆 LEGACY HALL' : 'ASCEND ATHLETICS'}
                </span>
              </div>
              <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'var(--font-display)', color: '#fff', fontSize: '2rem', border: cardBorder === 'HISTORIC' ? '2px solid #facc15' : '2px solid #06b6d4' }}>
                {athlete.position.substring(0, 2)}
              </div>
            </div>
          </div>

          {/* BACK CARD */}
          <div style={{ width: '350px', height: '520px', borderRadius: '15px', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #090e1a 0%, #02050b 100%)', border: cardBorder === 'HISTORIC' ? '4px solid #facc15' : '2px solid #06b6d4', position: 'relative' }}>
            <div style={{ textAlign: 'center', padding: '20px 10px', background: 'rgba(0,0,0,0.5)', borderBottom: `3px solid ${cardBorder === 'HISTORIC' ? '#facc15' : '#06b6d4'}` }}>
              <div style={{ fontFamily: 'var(--font-base)', color: '#fff', fontSize: '0.8rem', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '5px' }}>ASCEND ATHLETICS</div>
              <div style={{ fontFamily: 'var(--font-display)', color: cardBorder === 'HISTORIC' ? '#facc15' : '#06b6d4', fontSize: '2.5rem', lineHigh: 1, textTransform: 'uppercase', textShadow: '2px 2px 0px #000, 0 0 20px rgba(6,182,212,0.3)' }}>RECORD BOOK</div>
            </div>
            <div style={{ flexGrow: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px 15px', borderRadius: '8px', borderLeft: `4px solid ${cardBorder === 'HISTORIC' ? '#facc15' : '#06b6d4'}` }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: '#fff', textTransform: 'uppercase' }}>Constância</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: cardBorder === 'HISTORIC' ? '#facc15' : '#06b6d4' }}>{athlete.attendanceCount} treinos</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px 15px', borderRadius: '8px', borderLeft: `4px solid ${cardBorder === 'HISTORIC' ? '#facc15' : '#06b6d4'}` }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: '#fff', textTransform: 'uppercase' }}>Recordes PR</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: cardBorder === 'HISTORIC' ? '#facc15' : '#06b6d4' }}>{prs.length}</span>
              </div>
              {prs.slice(0, 2).map((pr, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px 15px', borderRadius: '8px', borderLeft: `4px solid ${cardBorder === 'HISTORIC' ? '#facc15' : '#06b6d4'}` }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: '#fff', textTransform: 'uppercase' }}>{pr.exerciseName}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: '#22c55e' }}>{pr.maxLoad} KG</span>
                </div>
              ))}
            </div>
            <div style={{ padding: '15px', textAlign: 'center', background: '#000', borderTop: '1px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-display)', color: '#fff', letterSpacing: '2px' }}>COACH APPROVED</div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
