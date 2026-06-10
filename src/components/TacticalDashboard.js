"use client";

import { useEffect, useState } from 'react';

export default function TacticalDashboard({ athleteId, initialData }) {
  const [data, setData] = useState(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!initialData && athleteId) {
      setLoading(true);
      fetch(`/api/athlete/${athleteId}/tactical`)
        .then(res => res.json())
        .then(resData => {
          if (resData.success) {
            setData(resData.stats);
          } else {
            setError(resData.error || 'Erro ao carregar dados táticos.');
          }
          setLoading(false);
        })
        .catch(() => {
          setError('Sem conexão com o servidor.');
          setLoading(false);
        });
    }
  }, [athleteId, initialData]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--primary-color)', fontWeight: 'bold' }}>
        Carregando Central de Inteligência Tática...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: '20px', color: 'var(--accent-red)', textAlign: 'center' }}>
        {error || 'Nenhum dado tático disponível.'}
      </div>
    );
  }

  // Neon color mapper based on sport
  const getSportColor = () => {
    if (data.sport === 'Powerlifting') return '#38bdf8'; // Neon Blue
    if (data.sport === 'Rugby') return '#34d399'; // Neon Emerald Green
    return '#a3e635'; // Neon Lime Green / Yellow
  };

  const sportColor = getSportColor();

  return (
    <div style={{
      background: '#09090b',
      color: '#fff',
      padding: '25px',
      borderRadius: '12px',
      border: `2px solid ${sportColor}`,
      boxShadow: `0 0 25px rgba(${data.sport === 'Powerlifting' ? '56,189,248' : data.sport === 'Rugby' ? '52,211,153' : '163,230,53'}, 0.15)`,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Chalkboard Grid Overlay */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        pointerEvents: 'none'
      }}></div>

      {/* Header */}
      <header style={{
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        paddingBottom: '15px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline'
      }}>
        <div>
          <h2 style={{
            margin: 0,
            fontSize: '1.25rem',
            color: sportColor,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            textShadow: `0 0 10px ${sportColor}33`
          }}>
            {data.teamName} / ATHLETE: {data.athleteName}
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#71717a', textTransform: 'uppercase' }}>
            Modalidade: {data.sport}
          </span>
        </div>
        <div>
          <span style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            color: '#a1a1aa'
          }}>
            STATUS: ACTIVE
          </span>
        </div>
      </header>

      {/* 4 Summary Blocks */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '15px',
        marginBottom: '25px'
      }}>
        {data.summary.map((sum, index) => (
          <div key={index} style={{
            background: '#18181b',
            borderLeft: `3px solid ${sportColor}`,
            padding: '12px 15px',
            borderRadius: '4px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
          }}>
            <div style={{ fontSize: '0.7rem', color: '#a1a1aa', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>
              {sum.label}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              {sum.value}
            </div>
          </div>
        ))}
      </section>

      {/* Main Diagram & Lists split */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '25px',
        position: 'relative'
      }}>
        
        {/* Left List: Mechanics */}
        <div style={{
          background: 'rgba(24, 24, 27, 0.9)',
          border: '1px solid rgba(255,255,255,0.05)',
          padding: '18px',
          borderRadius: '8px',
          zIndex: 2
        }}>
          <h4 style={{ margin: '0 0 15px 0', fontSize: '0.85rem', color: sportColor, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
            {data.mechanicsTitle}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.mechanics.map((mech, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                <span style={{ color: '#d4d4d8', fontSize: '0.9rem' }}>{mech.name}</span>
                <span style={{ fontWeight: 'bold', fontSize: '0.95rem', color: sportColor }}>{mech.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Center Section: Photo with tactical overlays or SVG silhouette fallback */}
        <div style={{
          height: '240px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          background: '#000',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1.5px solid rgba(255,255,255,0.08)'
        }}>
          {/* Tactical Grid Backdrop */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)',
            backgroundSize: '15px 15px',
            pointerEvents: 'none',
            zIndex: 1
          }}></div>

          {data.photo ? (
            /* ATLETA COM FOTO: Renderiza a foto do atleta com os overlays de vetores táticos no topo */
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src={data.photo} 
                alt={data.athleteName} 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover', 
                  opacity: 0.7,
                  filter: 'grayscale(40%) contrast(120%) brightness(85%)'
                }} 
              />
              {/* Inner Glowing Frame */}
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                border: `2px solid ${sportColor}55`,
                pointerEvents: 'none',
                boxShadow: `inset 0 0 30px ${sportColor}33`,
                zIndex: 2
              }}></div>

              {/* Dynamic SVG Tactical Overlays over photo */}
              <svg 
                viewBox="0 0 100 100" 
                style={{ 
                  position: 'absolute', 
                  top: 0, left: 0, 
                  width: '100%', height: '100%', 
                  pointerEvents: 'none',
                  zIndex: 3
                }}
              >
                {/* Target Joint Overlays / Force Vectors on top of the image */}
                {data.sport === 'Powerlifting' ? (
                  <>
                    <line x1="50" y1="50" x2="50" y2="20" stroke={sportColor} strokeWidth="1.8" />
                    <polygon points="50,20 47,26 53,26" fill={sportColor} />
                    <circle cx="50" cy="50" r="3.5" fill="#ef4444" />
                    <circle cx="50" cy="50" r="8" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="2 2" />
                    <text x="50" y="14" fill={sportColor} fontSize="4.5" fontWeight="bold" textAnchor="middle">APEX TORQUE</text>
                  </>
                ) : (
                  <>
                    <path d="M 20 70 Q 50 40 80 70" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeDasharray="3 3" />
                    <circle cx="50" cy="53" r="3.5" fill="#facc15" />
                    <circle cx="50" cy="53" r="8" fill="none" stroke="#facc15" strokeWidth="1.2" />
                    <text x="50" y="65" fill="#facc15" fontSize="4.5" fontWeight="bold" textAnchor="middle">CENTRO DE MASSA</text>
                  </>
                )}
              </svg>
            </div>
          ) : (
            /* ATLETA SEM FOTO: Fallback para o diagrama de linhas de vetor padrão (Stick Figure) */
            data.svgBody === 'powerlifting' ? (
              /* Barbell Squatter Link Diagram */
              <svg viewBox="0 0 100 100" style={{ width: '80%', height: '80%', zIndex: 2 }}>
                {/* Floor */}
                <line x1="10" y1="90" x2="90" y2="90" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                {/* Squatter Body */}
                <circle cx="50" cy="25" r="7" fill="none" stroke={sportColor} strokeWidth="1.5" />
                {/* Spine */}
                <line x1="50" y1="32" x2="42" y2="55" stroke={sportColor} strokeWidth="2.5" />
                {/* Femur */}
                <line x1="42" y1="55" x2="60" y2="70" stroke={sportColor} strokeWidth="2.5" />
                {/* Tibia */}
                <line x1="60" y1="70" x2="52" y2="90" stroke={sportColor} strokeWidth="2.5" />
                {/* Joint Dots */}
                <circle cx="42" cy="55" r="2.5" fill="#ef4444" />
                <circle cx="60" cy="70" r="2.5" fill="#facc15" />
                {/* Barbell */}
                <line x1="30" y1="35" x2="65" y2="35" stroke="#fff" strokeWidth="3.5" />
                <circle cx="30" cy="35" r="5" fill="#ef4444" />
                <circle cx="65" cy="35" r="5" fill="#ef4444" />
                {/* Force Vector */}
                <path d="M 50 35 L 50 10" fill="none" stroke="#22c55e" strokeWidth="2" markerEnd="url(#arrow)" />
                <polygon points="50,10 47,15 53,15" fill="#22c55e" />
                <text x="50" y="8" fill="#22c55e" fontSize="5" fontWeight="bold" textAnchor="middle">TORQUE VECTORS</text>
              </svg>
            ) : (
              /* Tactical Runner / Field Outline */
              <svg viewBox="0 0 100 100" style={{ width: '80%', height: '80%', zIndex: 2 }}>
                {/* Field Lines */}
                <rect x="5" y="5" width="90" height="90" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <line x1="5" y1="50" x2="95" y2="50" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
                <circle cx="50" cy="50" r="15" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                
                {/* Human Outline vector */}
                <circle cx="50" cy="20" r="10" fill="none" stroke={sportColor} strokeWidth="1.5" />
                {/* Torso */}
                <path d="M 40 35 L 60 35 L 56 75 L 44 75 Z" fill="none" stroke={sportColor} strokeWidth="1.5" />
                {/* Legs */}
                <line x1="44" y1="75" x2="40" y2="95" stroke={sportColor} strokeWidth="1.8" />
                <line x1="56" y1="75" x2="60" y2="95" stroke={sportColor} strokeWidth="1.8" />
                
                {/* Force Vectors */}
                <path d="M 35 45 Q 50 65 65 45" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2 2" />
                <circle cx="50" cy="55" r="3" fill="#facc15" />
                <text x="50" y="62" fill="#facc15" fontSize="4.5" fontWeight="bold" textAnchor="middle">CENTRO DE MASSA</text>
              </svg>
            )
          )}
        </div>

        {/* Right List: Spatial distribution */}
        <div style={{
          background: 'rgba(24, 24, 27, 0.9)',
          border: '1px solid rgba(255,255,255,0.05)',
          padding: '18px',
          borderRadius: '8px',
          zIndex: 2
        }}>
          <h4 style={{ margin: '0 0 15px 0', fontSize: '0.85rem', color: sportColor, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
            {data.fieldTitle}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.field.map((f, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
                <span style={{ color: '#d4d4d8', fontSize: '0.9rem' }}>{f.name}</span>
                <span style={{ fontWeight: 'bold', fontSize: '0.95rem', color: sportColor }}>{f.value}</span>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* Bottom Career Milestones Box */}
      <section style={{
        background: '#18181b',
        border: '1.5px solid #d97706', // Gold/Orange border
        boxShadow: '0 0 15px rgba(217, 119, 6, 0.1)',
        borderRadius: '8px',
        padding: '20px',
        position: 'relative'
      }}>
        <h4 style={{
          margin: '0 0 15px 0',
          fontSize: '0.8rem',
          color: '#f97316',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          fontWeight: 'bold'
        }}>
          🏆 CAREER MILESTONES (MARCOS DA CARREIRA)
        </h4>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: '15px',
          textAlign: 'center'
        }}>
          {data.milestones.map((mil, index) => (
            <div key={index} style={{
              background: '#09090b',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid rgba(255,255,255,0.03)'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#f97316', marginBottom: '4px' }}>
                {mil.value}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#a1a1aa', textTransform: 'capitalize' }}>
                {mil.name}
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
