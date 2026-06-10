"use client";

import { useState } from 'react';
import { getAttributes, getCoordinates, getPointsString, getHigherColor, cx, cy, r } from '@/lib/domain/Comparator';

// Subcomponente: Card 3D do Atleta com efeitos tilt/glint
function ComparatorCard({ athlete }) {
  const [tiltStyle, setTiltStyle] = useState({ transform: 'rotateY(0deg) rotateX(0deg)' });
  const [glintStyle, setGlintStyle] = useState({ '--mouse-x': '50%', '--mouse-y': '50%' });

  if (!athlete) {
    return (
      <div style={{
        width: '210px',
        height: '320px',
        border: '1px dashed rgba(255,255,255,0.1)',
        borderRadius: '12px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#71717a',
        fontSize: '0.85rem',
        background: 'rgba(255,255,255,0.01)'
      }}>
        Selecione um Atleta
      </div>
    );
  }

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPct = (x / rect.width) * 100;
    const yPct = (y / rect.height) * 100;

    setGlintStyle({ '--mouse-x': `${xPct}%`, '--mouse-y': `${yPct}%` });

    const xRotate = ((x - rect.width / 2) / (rect.width / 2)) * 10;
    const yRotate = -((y - rect.height / 2) / (rect.height / 2)) * 10;

    setTiltStyle({ transform: `rotateY(${xRotate}deg) rotateX(${yRotate}deg)` });
  };

  const handleMouseLeave = () => {
    setGlintStyle({ '--mouse-x': '50%', '--mouse-y': '50%' });
    setTiltStyle({ transform: 'rotateY(0deg) rotateX(0deg)' });
  };

  const themeColor = athlete.themeColor || '#06b6d4';
  const borderGradient = athlete.cardBorder === 'GOLD' 
    ? 'linear-gradient(135deg, #f59e0b, #d97706)'
    : athlete.cardBorder === 'HOLO'
    ? 'linear-gradient(135deg, #ec4899, #3b82f6, #10b981)'
    : athlete.cardBorder === 'OBSIDIAN'
    ? 'linear-gradient(135deg, #111827, #374151, #030712)'
    : `linear-gradient(135deg, ${themeColor}, rgba(255,255,255,0.1))`;

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '1000px',
        width: '210px',
        height: '320px',
        cursor: 'pointer'
      }}
    >
      <div 
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '12px',
          background: 'rgba(8, 12, 24, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1.5px solid transparent',
          backgroundImage: borderGradient,
          backgroundOrigin: 'border-box',
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.4), 0 0 15px ${themeColor}22`,
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.1s ease',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '15px',
          ...tiltStyle
        }}
      >
        {/* Holographic Glint Spotlight Overlay */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.12) 0%, transparent 60%)`,
          pointerEvents: 'none',
          zIndex: 2,
          ...glintStyle
        }}></div>

        {/* Card Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 3 }}>
          <span style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '0.65rem',
            fontWeight: 'bold',
            color: themeColor
          }}>
            {athlete.position}
          </span>
          <span style={{
            fontSize: '1.2rem',
            fontWeight: '900',
            color: '#fff',
            textShadow: `0 0 8px ${themeColor}`
          }}>
            {athlete.overall}
          </span>
        </div>

        {/* Profile Picture Placeholder */}
        <div style={{
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          border: `2px solid ${themeColor}`,
          boxShadow: `0 0 12px ${themeColor}44`,
          margin: '0 auto',
          overflow: 'hidden',
          background: '#090d16',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 3
        }}>
          {athlete.profilePhoto ? (
            <img src={athlete.profilePhoto} alt={athlete.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '2rem' }}>🛡️</span>
          )}
        </div>

        {/* Card Footer Info */}
        <div style={{ textAlign: 'center', zIndex: 3 }}>
          <h4 style={{
            margin: '0 0 4px 0',
            fontSize: '0.9rem',
            fontWeight: '900',
            color: '#fff',
            letterSpacing: '0.5px'
          }}>
            {athlete.name}
          </h4>
          <span style={{
            fontSize: '0.65rem',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            fontWeight: 'bold'
          }}>
            OVR RATING
          </span>
        </div>
      </div>
    </div>
  );
}

export default function HolographicComparator({ athletes = [] }) {
  const [athleteAId, setAthleteAId] = useState(athletes[0]?.id || '');
  const [athleteBId, setAthleteBId] = useState(athletes[1]?.id || '');

  const athleteA = athletes.find(a => a.id === athleteAId);
  const athleteB = athletes.find(a => a.id === athleteBId);

  const attrsA = getAttributes(athleteA);
  const attrsB = getAttributes(athleteB);

  const ptsA = getCoordinates(attrsA);
  const ptsB = getCoordinates(attrsB);

  return (
    <div style={{
      background: 'rgba(8, 12, 24, 0.9)',
      border: '1px solid rgba(6, 182, 212, 0.25)',
      boxShadow: '0 8px 32px rgba(6, 182, 212, 0.1)',
      borderRadius: '12px',
      padding: '25px',
      width: '100%',
      fontFamily: 'system-ui, sans-serif'
    }}>
      
      {/* Seletores Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        paddingBottom: '20px',
        marginBottom: '25px',
        flexWrap: 'wrap',
        gap: '15px'
      }} id="comparator-header">
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#fff', letterSpacing: '1px', textTransform: 'uppercase' }}>
            ⚔️ COMPARADOR HOLOGRÁFICO
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Compare atletas do Roster lado a lado
          </span>
        </div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#06b6d4', fontWeight: 'bold', marginBottom: '4px' }}>ATLETA A</label>
            <select 
              value={athleteAId} 
              onChange={e => setAthleteAId(e.target.value)}
              style={{ padding: '8px 12px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', fontSize: '0.85rem' }}
            >
              <option value="">Selecione...</option>
              {athletes.map(a => (
                <option key={a.id} value={a.id} disabled={a.id === athleteBId}>{a.name}</option>
              ))}
            </select>
          </div>

          <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 'bold', marginTop: '15px' }}>VS</div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#f97316', fontWeight: 'bold', marginBottom: '4px' }}>ATLETA B</label>
            <select 
              value={athleteBId} 
              onChange={e => setAthleteBId(e.target.value)}
              style={{ padding: '8px 12px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', fontSize: '0.85rem' }}
            >
              <option value="">Selecione...</option>
              {athletes.map(a => (
                <option key={a.id} value={a.id} disabled={a.id === athleteAId}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid Comparativo */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.1fr 1.8fr 1.1fr',
        gap: '20px',
        alignItems: 'center',
        justifyItems: 'center'
      }} id="comparator-grid">
        
        {/* Lado Esquerdo: Card Atleta A */}
        <ComparatorCard athlete={athleteA} />

        {/* Centro: Gráfico de Radar + Tabela */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          width: '100%'
        }}>
          {athleteA && athleteB ? (
            <>
              {/* Overlaid Double Radar Chart */}
              <svg viewBox="0 0 260 260" style={{ width: '220px', height: '220px', background: '#090a0f', borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.04)' }}>
                {/* Concentric rings */}
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((level, i) => (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r={r * level}
                    fill="none"
                    stroke="rgba(255,255,255,0.03)"
                    strokeWidth="1"
                  />
                ))}
                
                {/* Vertex lines */}
                {['FOR', 'HAB', 'VEL', 'POW', 'EVO'].map((label, i) => {
                  const angle = -Math.PI / 2 + (i * 2 * Math.PI / 5);
                  return (
                    <g key={i}>
                      <line
                        x1={cx}
                        y1={cy}
                        x2={cx + r * Math.cos(angle)}
                        y2={cy + r * Math.sin(angle)}
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="1"
                      />
                      <text
                        x={cx + (r + 15) * Math.cos(angle)}
                        y={cy + (r + 10) * Math.sin(angle) + 4}
                        fill="#94a3b8"
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {label}
                      </text>
                    </g>
                  );
                })}

                {/* Athlete A Polygon (Cyan) */}
                <polygon
                  points={getPointsString(ptsA)}
                  fill="rgba(6, 182, 212, 0.2)"
                  stroke="#06b6d4"
                  strokeWidth="2"
                />

                {/* Athlete B Polygon (Orange) */}
                <polygon
                  points={getPointsString(ptsB)}
                  fill="rgba(249, 115, 22, 0.2)"
                  stroke="#f97316"
                  strokeWidth="2"
                />

                {/* Data dots */}
                {ptsA.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#06b6d4" />)}
                {ptsB.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#f97316" />)}
              </svg>

              {/* Tabela de Atributos */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['FOR', 'HAB', 'VEL', 'POW', 'EVO', 'OVR'].map(attr => {
                  const valA = attrsA[attr];
                  const valB = attrsB[attr];
                  const isOvr = attr === 'OVR';

                  return (
                    <div 
                      key={attr}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 12px',
                        background: isOvr ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                        border: isOvr ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.03)',
                        borderRadius: '4px'
                      }}
                    >
                      {/* Atleta A */}
                      <span style={{
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        color: getHigherColor(valA, valB, 'A'),
                        width: '35px',
                        textAlign: 'left'
                      }}>
                        {valA}
                      </span>

                      {/* Nome do Atributo */}
                      <span style={{
                        fontSize: '0.8rem',
                        color: isOvr ? '#fff' : 'var(--text-secondary)',
                        fontWeight: 'bold',
                        letterSpacing: '1px'
                      }}>
                        {isOvr ? 'CLASSIFICAÇÃO GERAL' : attr}
                      </span>

                      {/* Atleta B */}
                      <span style={{
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        color: getHigherColor(valA, valB, 'B'),
                        width: '35px',
                        textAlign: 'right'
                      }}>
                        {valB}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '50px' }}>
              Selecione dois atletas diferentes acima para gerar os gráficos holográficos de combate tático.
            </div>
          )}
        </div>

        {/* Lado Direito: Card Atleta B */}
        <ComparatorCard athlete={athleteB} />

      </div>

    </div>
  );
}
