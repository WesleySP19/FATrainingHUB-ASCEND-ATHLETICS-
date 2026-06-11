"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import html2canvas from 'html2canvas';
import TacticalDashboard from '@/components/TacticalDashboard';
import AthleteNavbar from '@/components/athlete/AthleteNavbar';

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
  const [highlightsUrls, setHighlightsUrls] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  // Team states
  const [team, setTeam] = useState(null);
  const [teamLoading, setTeamLoading] = useState(true);
  const [showTeamHistory, setShowTeamHistory] = useState(false);

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
      fetchTeamData();
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
        try {
          setHighlightsUrls(data.athlete.highlights ? JSON.parse(data.athlete.highlights).join('\n') : '');
        } catch(e) {
          setHighlightsUrls('');
        }
      } else {
        setError(data.error || 'Erro ao carregar dados do atleta.');
      }
    } catch (e) {
      setError('Sem conexão com o servidor.');
    }
    setLoading(false);
  };

  const fetchTeamData = async () => {
    try {
      setTeamLoading(true);
      const res = await fetch(`/api/athlete/${id}/team`);
      const data = await res.json();
      if (data.success) {
        setTeam(data.team);
      }
    } catch (e) {
      console.error('Erro ao buscar time:', e);
    } finally {
      setTeamLoading(false);
    }
  };

  const handleSaveCustomization = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess('');
    try {
      const payload = { 
        themeColor, 
        profilePhoto, 
        cardBorder, 
        highlights: JSON.stringify(highlightsUrls.split('\n').map(u => u.trim()).filter(u => u !== '')) 
      };

      const res = await fetch(`/api/athlete/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
    return <polygon key={`pentagon-${scale}`} points={pts} fill="none" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="1" />;
  };

  const drawAxis = (i, label) => {
    const angle = (i * 72 - 90) * Math.PI / 180;
    const outerX = 100 + 55 * Math.cos(angle);
    const outerY = 100 + 55 * Math.sin(angle);
    const labelX = 100 + 78 * Math.cos(angle);
    const labelY = 100 + 78 * Math.sin(angle);
    return (
      <g key={`axis-${i}`}>
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
    <div style={{ background: getThemeBackground(), minHeight: '100vh', transition: 'background 0.5s ease', paddingBottom: '80px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      
      <AthleteNavbar athleteId={id} />

      {/* Symmetrical Sided Team Logo Watermark (Personal per Team) */}
      {team && team.logoUrl && (
        <div style={{
          position: 'absolute',
          top: '10%',
          right: '-120px',
          width: '650px',
          height: '650px',
          backgroundImage: `url(${team.logoUrl})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.045,
          filter: 'blur(1px) grayscale(100%)',
          pointerEvents: 'none',
          zIndex: 1
        }} />
      )}

      {/* Symmetrical Left Bottom Watermark for visual balance */}
      {team && team.logoUrl && (
        <div style={{
          position: 'absolute',
          bottom: '5%',
          left: '-180px',
          width: '550px',
          height: '550px',
          backgroundImage: `url(${team.logoUrl})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.035,
          filter: 'blur(2px) grayscale(100%)',
          pointerEvents: 'none',
          zIndex: 1
        }} />
      )}

      {/* Dynamic Glowing Ambient Aura reflecting the athlete's card border custom tier */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '20%',
        width: '700px',
        height: '700px',
        borderRadius: '50%',
        background: cardBorder === 'GOLD' ? 'radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 70%)' :
                    cardBorder === 'HOLO' ? 'radial-gradient(circle, rgba(192,132,252,0.06) 0%, transparent 70%)' :
                    cardBorder === 'OBSIDIAN' ? 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)' :
                    cardBorder === 'EMERALD' ? 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)' :
                    cardBorder === 'HISTORIC' ? 'radial-gradient(circle, rgba(251,191,36,0.09) 0%, transparent 70%)' :
                    'radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none',
        zIndex: 1
      }} />

      {/* Secondary glowing ambient highlight */}
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '15%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: cardBorder === 'GOLD' ? 'radial-gradient(circle, rgba(251,191,36,0.04) 0%, transparent 70%)' :
                    cardBorder === 'HOLO' ? 'radial-gradient(circle, rgba(192,132,252,0.04) 0%, transparent 70%)' :
                    cardBorder === 'OBSIDIAN' ? 'radial-gradient(circle, rgba(249,115,22,0.04) 0%, transparent 70%)' :
                    cardBorder === 'EMERALD' ? 'radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)' :
                    cardBorder === 'HISTORIC' ? 'radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 70%)' :
                    'radial-gradient(circle, rgba(6,182,212,0.03) 0%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none',
        zIndex: 1
      }} />

      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 2 }}>
        


        {/* Banner MVP (Premium Ribbon) */}
        {mvp && mvp.id === athlete.id && (
          <div style={{
            marginBottom: '35px',
            padding: '24px 30px',
            borderRadius: '16px',
            background: 'linear-gradient(90deg, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.02) 100%)',
            borderLeft: '4px solid #fbbf24',
            borderRight: '1px solid rgba(251, 191, 36, 0.1)',
            borderTop: '1px solid rgba(251, 191, 36, 0.1)',
            borderBottom: '1px solid rgba(251, 191, 36, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <span style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.6))' }}>👑</span>
              <div>
                <h4 style={{ color: '#fbbf24', margin: 0, fontSize: '0.8rem', letterSpacing: '2px', fontWeight: '800' }}>STATUS PREMIUM</h4>
                <p style={{ margin: '5px 0 0 0', fontSize: '1.5rem', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase', color: '#fff' }}>
                  Eleito MVP do Roster Oficial
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: '#fbbf24', fontWeight: '900', fontSize: '1.8rem', textShadow: '0 0 15px rgba(251,191,36,0.4)' }}>{athlete.overall} OVR</span>
            </div>
          </div>
        )}

        {/* Hero Showcase Section */}
        <section className="athlete-hero-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '40px',
          marginBottom: '50px',
          alignItems: 'center',
          background: 'linear-gradient(180deg, rgba(15,21,36,0.3) 0%, rgba(7,10,19,0.5) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '24px',
          padding: '40px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle backdrop glowing line */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.5), transparent)'
          }} />

          {/* Left Column: Big typography & physical metrics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                <span style={{
                  background: 'rgba(6, 182, 212, 0.1)',
                  color: '#06b6d4',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  letterSpacing: '1.5px'
                }}>
                  {athlete.position?.toUpperCase()}
                </span>
                <span style={{
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  letterSpacing: '2px'
                }}>
                  ASCEND ATHLETICS
                </span>
              </div>

              {/* Huge Sports Presentation Name */}
              <div style={{ position: 'relative' }}>
                {/* Large outline backdrop word */}
                <h1 className="athlete-hero-name-lg" style={{
                  fontSize: '6.5rem',
                  lineHeight: '0.8',
                  margin: 0,
                  fontWeight: '950',
                  color: 'rgba(255, 255, 255, 0.02)',
                  textTransform: 'uppercase',
                  letterSpacing: '-2px',
                  userSelect: 'none',
                  WebkitTextStroke: '1px rgba(255, 255, 255, 0.05)',
                  marginBottom: '-15px'
                }}>
                  {athlete.name?.split(' ')[0]}
                </h1>
                <h1 className="athlete-hero-name-sm" style={{
                  fontSize: '3.5rem',
                  lineHeight: '1',
                  margin: 0,
                  fontWeight: '900',
                  color: '#fff',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  textShadow: '0 4px 20px rgba(0,0,0,0.6)'
                }}>
                  {athlete.name?.toUpperCase()}
                </h1>
              </div>
            </div>

            {/* Styled Physical Metrics Tiles */}
            <div>
              <h3 style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '15px' }}>MÉTRICAS FÍSICAS DE ELITE</h3>
              <div className="athlete-metrics-tiles" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '15px'
              }}>
                {[
                  { label: 'ALTURA', value: athlete.height || "6'2\"" },
                  { label: 'PESO', value: athlete.weight || "220 lbs" },
                  { label: 'ENVERGADURA', value: athlete.wingspan || "75\"" },
                  { label: 'MÃO', value: athlete.handSize || "9.5\"" }
                ].map((m, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '15px',
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '5px' }}>{m.label}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#fff' }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic floating Card */}
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <div 
              className="card-container" 
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={handleCardClick}
              style={{ 
                perspective: '1000px', 
                cursor: 'pointer',
                width: '300px',
                height: '440px',
                margin: 0,
                position: 'relative'
              }}
            >
              <div className="card-inner" style={{ transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)', transformStyle: 'preserve-3d', width: '100%', height: '100%' }}>
                {/* FRONT CARD (Refactored to Jinx / Lorcana style in Image 3) */}
                <div 
                  className={`card-front ${getCardBorderClass(cardBorder)}`} 
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
                    {profilePhoto ? (
                      <img 
                        src={profilePhoto} 
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

                {/* BACK CARD (Refactored to Ryu / Street Fighter style in Image 4) */}
                <div 
                  className={`card-back ${getCardBorderClass(cardBorder)}`} 
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
                        <span style={{ fontSize: '#0.65rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase' }}>CONSTÂNCIA</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#0f172a' }}>{athlete.attendanceCount || 0} treinos</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '#0.65rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase' }}>RECORDES PR</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#ef4444' }}>{prs.length}</span>
                      </div>
                      
                      {/* PRs detail previews */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
                        {prs.slice(0, 2).map((pr, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '0.62rem', fontWeight: '700', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{pr.exerciseName}</span>
                            <span style={{ fontSize: '0.65rem', fontWeight: '900', color: '#10b981' }}>{pr.maxLoad} KG</span>
                          </div>
                        ))}
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
          </div>
        </section>

        {/* Performance Dashboard Section */}
        <section className="athlete-perf-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1.3fr 0.7fr',
          gap: '30px',
          marginBottom: '50px',
          alignItems: 'start'
        }}>
          {/* Performance Timeline Main Block */}
          <div style={{
            background: 'rgba(8, 12, 24, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '24px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#fff', letterSpacing: '1px', margin: 0 }}>TIMELINE DE PERFORMANCE</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>MÉTRICAS ATIVAS EM TEMPO REAL</span>
              </div>
              
              {/* Timeline selector bar */}
              <div className="timeline-bar" style={{ margin: 0, display: 'flex', background: 'rgba(0,0,0,0.4)', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.06)', padding: '3px' }}>
                {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'].map(month => (
                  <button
                    key={month}
                    className={`timeline-btn ${selectedMonth === month ? 'active' : ''}`}
                    onClick={() => setSelectedMonth(month)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      color: selectedMonth === month ? '#000' : 'rgba(255,255,255,0.6)',
                      background: selectedMonth === month ? '#06b6d4' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Dynamic Month Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '15px', marginBottom: '30px' }}>
              {getMonthStats().map((sum, index) => (
                <div key={index} style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderLeft: '4px solid #06b6d4',
                  padding: '15px 20px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                    {sum.label}
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: '950', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    {sum.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Chart container */}
            <div style={{
              background: 'rgba(0,0,0,0.2)',
              padding: '20px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.04)'
            }}>
              <h4 style={{ fontSize: '0.8rem', color: '#06b6d4', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
                PROGRESSÃO DE VOLUME DE TREINAMENTO (SESSÕES)
              </h4>
              {renderTimelineChart()}
            </div>
          </div>

          {/* Sidebar Block: active training & PRs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Prescribed Training */}
            <div style={{
              background: 'rgba(8, 12, 24, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '24px',
              padding: '25px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
            }}>
              <h4 style={{ fontSize: '0.85rem', color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px', marginBottom: '15px', margin: 0 }}>
                TREINAMENTO ATIVO
              </h4>

              {workouts.length === 0 ? (
                <div style={{ padding: '20px 15px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.06)', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 15px 0' }}>Nenhum treino prescrito no momento.</p>
                  <Link href="/training" className="btn" style={{ fontSize: '0.75rem', padding: '8px 16px', borderRadius: '20px', width: '100%', display: 'inline-block', textAlign: 'center' }}>
                    Ir para Treinamento &rarr;
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {workouts.slice(0, 3).map(w => (
                    <div key={w.id} style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      padding: '15px',
                      borderRadius: '12px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: '#06b6d4' }}></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '0.8rem', display: 'block', color: '#fff', letterSpacing: '0.5px' }}>PLANILHA DE PERFORMANCE</strong>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>PIN: {w.pinCode}</span>
                        </div>
                        <Link href={`/training?pin=${w.pinCode}`} style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          background: '#06b6d4',
                          color: '#000',
                          fontWeight: 'bold',
                          textDecoration: 'none',
                          boxShadow: '0 4px 10px rgba(6,182,212,0.3)',
                          transition: 'transform 0.1s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          INICIAR ⚡
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PR Logger */}
            <div style={{
              background: 'rgba(8, 12, 24, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '24px',
              padding: '25px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
            }}>
              <h4 style={{ fontSize: '0.85rem', color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px', marginBottom: '15px', margin: 0 }}>
                REGISTRO PR (POWER RECORDS)
              </h4>

              <form onSubmit={handleAddPR} style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                <input
                  required
                  placeholder="Exercício"
                  value={prExerciseName}
                  onChange={e => setPrExerciseName(e.target.value)}
                  style={{
                    flex: 1.8,
                    padding: '10px 12px',
                    background: 'rgba(0,0,0,0.4)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    outline: 'none'
                  }}
                />
                <input
                  required
                  type="number"
                  placeholder="KG"
                  value={prMaxLoad}
                  onChange={e => setPrMaxLoad(e.target.value)}
                  style={{
                    flex: 1.1,
                    padding: '10px 8px',
                    background: 'rgba(0,0,0,0.4)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    textAlign: 'center',
                    outline: 'none'
                  }}
                />
                <button type="submit" disabled={addingPR} style={{
                  padding: '10px 14px',
                  background: 'rgba(6, 182, 212, 0.1)',
                  color: '#06b6d4',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#06b6d4'; e.currentTarget.style.color = '#000'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)'; e.currentTarget.style.color = '#06b6d4'; }}
                >
                  +
                </button>
              </form>

              {prError && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '-5px 0 10px 0' }}>{prError}</p>}

              <div style={{ maxHeight: '140px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {prs.map(pr => (
                  <div key={pr.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.03)',
                    padding: '10px 15px',
                    borderRadius: '8px',
                    borderLeft: '3px solid #06b6d4',
                    fontSize: '0.8rem'
                  }}>
                    <span style={{ fontWeight: 'bold', color: 'rgba(255,255,255,0.9)' }}>{pr.exerciseName}</span>
                    <span style={{ color: '#00ffff', fontWeight: 'bold', letterSpacing: '0.5px' }}>{pr.maxLoad} KG</span>
                  </div>
                ))}
                {prs.length === 0 && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textAlign: 'center', margin: '10px 0' }}>Nenhum recorde registrado.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Attributes & Customization Base Block */}
        <section className="athlete-attr-grid" style={{
          display: 'grid',
          gridTemplateColumns: '0.9fr 1.1fr',
          gap: '30px',
          alignItems: 'start'
        }}>
          
          {/* Radar Attributes Deck */}
          <div style={{
            background: 'rgba(8, 12, 24, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '24px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: '400px',
            justifyContent: 'center'
          }}>
            <h3 style={{ fontSize: '1rem', color: '#06b6d4', letterSpacing: '1.5px', marginBottom: '25px', alignSelf: 'flex-start', margin: '0 0 20px 0' }}>
              MATRIZ DE ATRIBUTOS TÁTICOS
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', width: '100%', maxWidth: '240px' }}>
              <svg viewBox="0 0 200 200" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
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
          </div>

          {/* Customizer Control Panel */}
          <div style={{
            background: 'rgba(8, 12, 24, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '24px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <h3 style={{ fontSize: '1rem', color: '#06b6d4', letterSpacing: '1.5px', margin: 0 }}>
              PAINEL DE PERSONALIZAÇÃO COSMÉTICA
            </h3>

            <form onSubmit={handleSaveCustomization} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                  TEMA DO DASHBOARD
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['midnight', 'cyberpunk', 'gold', 'emerald'].map(t => (
                    <button 
                      key={t}
                      type="button" 
                      onClick={() => setThemeColor(t)}
                      style={{ 
                        flexGrow: 1, 
                        padding: '8px 4px', 
                        background: t === 'midnight' ? '#0f172a' : t === 'cyberpunk' ? '#2e0854' : t === 'gold' ? '#1c1500' : '#001f13', 
                        border: themeColor === t ? '2px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '8px', 
                        cursor: 'pointer', 
                        color: '#fff', 
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        boxShadow: themeColor === t ? '0 0 10px rgba(6,182,212,0.3)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                  ESTILO DA BORDA DO CARD
                </label>
                <select 
                  value={cardBorder} 
                  onChange={e => setCardBorder(e.target.value)} 
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(0,0,0,0.4)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
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
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                  FOTO DE PERFIL (LINK OU UPLOAD LOCAL)
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    placeholder="https://exemplo.com/foto.jpg" 
                    value={profilePhoto && profilePhoto.startsWith('data:') ? 'Imagem Local (Base64)' : profilePhoto} 
                    onChange={e => setProfilePhoto(e.target.value)} 
                    style={{
                      flexGrow: 1,
                      padding: '12px',
                      background: 'rgba(0,0,0,0.4)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }} 
                  />
                  <label className="btn" style={{
                    padding: '12px 16px',
                    fontSize: '0.8rem',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    margin: 0,
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  >
                    📁 UPAR
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                  MEUS HIGHLIGHTS (URLs dos vídeos - 1 por linha)
                </label>
                <textarea 
                  placeholder="https://youtube.com/watch?v=...\nhttps://hudl.com/v/..." 
                  value={highlightsUrls} 
                  onChange={e => setHighlightsUrls(e.target.value)} 
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(0,0,0,0.4)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    outline: 'none',
                    minHeight: '80px',
                    resize: 'vertical'
                  }} 
                />
              </div>

              {saveSuccess && (
                <p style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '0.8rem', margin: '5px 0 0 0' }}>
                  {saveSuccess}
                </p>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="submit" disabled={saving} className="btn" style={{
                  flex: 1,
                  padding: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--primary-color)',
                  color: '#000',
                  cursor: 'pointer'
                }}>
                  {saving ? 'SALVANDO...' : 'SALVAR AJUSTES'}
                </button>
                
                <button type="button" onClick={downloadCard} style={{
                  flex: 1,
                  padding: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  border: '1px solid #06b6d4',
                  background: 'rgba(6, 182, 212, 0.1)',
                  color: '#06b6d4',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#06b6d4'; e.currentTarget.style.color = '#000'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)'; e.currentTarget.style.color = '#06b6d4'; }}
                >
                  📸 EXPORTAR PNG
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* TEAM HQ SECTION */}
        {!teamLoading && team && (
          <section style={{
            background: 'rgba(8, 12, 24, 0.95)',
            border: `1.5px solid ${team.primaryColor || '#06b6d4'}40`,
            borderRadius: '24px',
            padding: '30px',
            boxShadow: `0 15px 35px rgba(0,0,0,0.5), 0 0 20px ${team.primaryColor || '#06b6d4'}15`,
            marginTop: '40px',
            marginBottom: '40px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Ambient Background Glow */}
            <div style={{
              position: 'absolute',
              top: '-50px',
              left: '-50px',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: `${team.primaryColor || '#f97316'}15`,
              filter: 'blur(50px)',
              pointerEvents: 'none',
              zIndex: 1
            }} />

            <h3 style={{ 
              fontSize: '1rem', 
              color: team.primaryColor || '#06b6d4', 
              letterSpacing: '1.5px', 
              textTransform: 'uppercase', 
              margin: '0 0 25px 0',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              zIndex: 2,
              position: 'relative'
            }}>
              <span>🛡️</span> TEAM HQ // SEDE DO TIME
            </h3>

            {/* Asymmetric Split Layout */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '180px 1fr', 
              gap: '40px', 
              alignItems: 'center',
              zIndex: 2,
              position: 'relative'
            }}>
              {/* Left Column: Crest */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {team.logoUrl ? (
                  <img 
                    src={team.logoUrl} 
                    alt={team.name} 
                    style={{
                      width: '180px',
                      height: '180px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: `4px solid ${team.primaryColor || '#f97316'}`,
                      boxShadow: `0 0 25px ${team.primaryColor || '#f97316'}40`,
                      backgroundColor: '#0a0f1d'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '180px',
                    height: '180px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `4px solid ${team.primaryColor || '#f97316'}`,
                    boxShadow: `0 0 25px ${team.primaryColor || '#f97316'}40`,
                    background: 'radial-gradient(circle, #1e293b 0%, #0f172a 100%)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', padding: '15px' }}>
                      <defs>
                        <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={team.primaryColor || '#f97316'} />
                          <stop offset="100%" stopColor="#0a0a0a" />
                        </linearGradient>
                      </defs>
                      <path 
                        d="M50 10 L80 25 L80 60 C80 80 50 90 50 90 C50 90 20 80 20 60 L20 25 Z" 
                        fill="url(#shieldGrad)" 
                        stroke={team.primaryColor || '#f97316'} 
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
                        style={{ letterSpacing: '1px', textShadow: '0 4px 8px rgba(0,0,0,0.5)' }}
                      >
                        {team.abbreviation || team.name.substring(0, 2).toUpperCase()}
                      </text>
                    </svg>
                  </div>
                )}
              </div>

              {/* Right Column: Name, Stats, Button */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    <h2 style={{ 
                      fontSize: '2.5rem', 
                      fontFamily: 'var(--font-display)', 
                      margin: 0, 
                      textTransform: 'uppercase',
                      color: '#fff',
                      lineHeight: '1',
                      textShadow: `0 0 15px ${team.primaryColor || '#f97316'}20`
                    }}>
                      {team.name}
                    </h2>
                    <span style={{ 
                      background: `${team.primaryColor || '#f97316'}20`, 
                      border: `1px solid ${team.primaryColor || '#f97316'}`, 
                      color: team.primaryColor || '#f97316',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      fontFamily: 'var(--font-display)'
                    }}>
                      {team.abbreviation}
                    </span>
                    {team.founded && (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        EST. {team.founded}
                      </span>
                    )}
                  </div>
                </div>

                {/* Statistics Grid */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(4, 1fr)', 
                  gap: '15px', 
                  margin: '10px 0' 
                }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderLeft: '4px solid #22c55e',
                    padding: '15px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                  }}>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>
                      Vitórias
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: '950', color: '#fff' }}>
                      {team.wins}
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderLeft: '4px solid #ef4444',
                    padding: '15px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                  }}>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>
                      Derrotas
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: '950', color: '#fff' }}>
                      {team.losses}
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderLeft: '4px solid #94a3b8',
                    padding: '15px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                  }}>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>
                      Empates
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: '950', color: '#fff' }}>
                      {team.draws}
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderLeft: `4px solid ${team.primaryColor || '#f97316'}`,
                    padding: '15px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                  }}>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>
                      Aproveitamento
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: '950', color: '#fff' }}>
                      {Math.round((team.wins / (team.wins + team.losses + team.draws || 1)) * 100)}%
                    </div>
                  </div>
                </div>

                {/* Toggle Story Button */}
                {team.history && (
                  <div style={{ alignSelf: 'flex-start' }}>
                    <button 
                      type="button"
                      onClick={() => setShowTeamHistory(true)}
                      className="btn" 
                      style={{
                        padding: '10px 20px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        border: `1.5px solid ${team.primaryColor || '#f97316'}`,
                        background: 'transparent',
                        color: team.primaryColor || '#f97316',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = team.primaryColor || '#f97316';
                        e.currentTarget.style.color = '#000';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = team.primaryColor || '#f97316';
                      }}
                    >
                      📖 VER HISTÓRIA DO TIME
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Teammates section */}
            <div style={{ marginTop: '35px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
              <h4 style={{ 
                fontSize: '0.8rem', 
                color: 'var(--text-secondary)', 
                textTransform: 'uppercase', 
                letterSpacing: '1px', 
                margin: '0 0 15px 0' 
              }}>
                🛡️ Elenco Ativo / Colegas de Equipe ({team.athletes ? team.athletes.length : 0})
              </h4>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {team.athletes && team.athletes.map(ta => (
                  <Link 
                    href={`/athlete/${ta.id}`} 
                    key={ta.id}
                    style={{ textDecoration: 'none' }}
                  >
                    <div 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: ta.id === id ? `${team.primaryColor}20` : 'rgba(255,255,255,0.03)',
                        border: ta.id === id ? `1.5px solid ${team.primaryColor}` : '1.5px solid rgba(255,255,255,0.06)',
                        padding: '8px 14px',
                        borderRadius: '12px',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = ta.id === id ? `${team.primaryColor}20` : 'rgba(255,255,255,0.03)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {ta.profilePhoto ? (
                        <img 
                          src={ta.profilePhoto} 
                          alt={ta.name} 
                          style={{ 
                            width: '30px', 
                            height: '30px', 
                            borderRadius: '50%', 
                            objectFit: 'cover', 
                            border: ta.isMVP ? '2.5px solid #fbbf24' : `1.5px solid ${team.primaryColor}80` 
                          }}
                        />
                      ) : (
                        <div style={{ 
                          width: '30px', 
                          height: '30px', 
                          borderRadius: '50%', 
                          background: team.primaryColor || '#f97316', 
                          color: '#000', 
                          fontSize: '0.7rem', 
                          fontWeight: '950', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}>
                          {ta.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#fff' }}>
                          {ta.name} {ta.isMVP && '⭐'}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)' }}>
                          {ta.position} • OVR {ta.overall}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TEAM HISTORY MODAL */}
        {showTeamHistory && team && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(5, 8, 20, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              background: '#090e1a',
              border: `2px solid ${team.primaryColor || '#f97316'}`,
              borderRadius: '24px',
              width: '100%',
              maxWidth: '600px',
              boxShadow: `0 0 50px ${team.primaryColor || '#f97316'}30`,
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Header */}
              <div style={{
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                padding: '25px 30px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.5rem' }}>🛡️</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', textTransform: 'uppercase', color: '#fff' }}>
                      {team.name}
                    </h3>
                    <span style={{ fontSize: '0.7rem', color: team.primaryColor || '#f97316', fontWeight: 'bold', letterSpacing: '1px' }}>
                      HISTÓRIA & LEGENDA
                    </span>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowTeamHistory(false)}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: '30px', maxHeight: '400px', overflowY: 'auto' }}>
                <p style={{
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  margin: 0
                }}>
                  {team.history}
                </p>
              </div>

              {/* Footer */}
              <div style={{
                borderTop: '1px solid rgba(255,255,255,0.06)',
                padding: '20px 30px',
                display: 'flex',
                justifyContent: 'flex-end',
                background: 'rgba(0,0,0,0.2)'
              }}>
                <button
                  type="button"
                  onClick={() => setShowTeamHistory(false)}
                  className="btn"
                  style={{
                    padding: '8px 20px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    borderRadius: '8px',
                    background: team.primaryColor || '#f97316',
                    border: 'none',
                    color: '#000',
                    cursor: 'pointer'
                  }}
                >
                  FECHAR
                </button>
              </div>
            </div>
          </div>
        )}

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
