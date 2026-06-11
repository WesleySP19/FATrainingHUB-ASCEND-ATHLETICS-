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
      <div style={{ textAlign: 'center', padding: '60px', color: '#fff', fontWeight: 'bold' }}>
        Carregando Destaque do Atleta...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: '40px', color: '#ef4444', textAlign: 'center', fontWeight: 'bold' }}>
        {error || 'Nenhum dado tático disponível.'}
      </div>
    );
  }

  const getSportColor = () => {
    if (data.sport === 'Powerlifting') return '#dc2626'; // Deep Red
    if (data.sport === 'Rugby') return '#059669'; // Emerald
    return '#dc2626'; // Default to deep red (like Pogba image)
  };

  const primaryColor = getSportColor();
  const hasHighlights = data.highlights && data.highlights.length > 0;

  // Extrair YouTube Video ID se possível para thumbnail
  const getYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div style={{
      background: '#0a0a0f', // Very dark blue/black
      color: '#fff',
      borderRadius: '16px', // Rounded corners for modal popup
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 'auto',
    }}>
      
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.02) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.02) 75%, rgba(255,255,255,0.02)), linear-gradient(45deg, rgba(255,255,255,0.02) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.02) 75%, rgba(255,255,255,0.02))',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 10px 10px',
        pointerEvents: 'none',
        opacity: 0.5
      }}></div>

      {/* HUGE CIRCLE BEHIND PLAYER */}
      <div style={{
        position: 'absolute',
        top: '5%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '500px',
        height: '500px',
        maxHeight: '80vw',
        maxWidth: '80vw',
        background: primaryColor,
        borderRadius: '50%',
        zIndex: 1,
        boxShadow: `0 0 100px ${primaryColor}66`
      }}></div>

      {/* TOP/HERO SECTION */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        position: 'relative',
        zIndex: 2,
        padding: '40px 50px',
        gap: '40px',
        flexWrap: 'wrap'
      }}>
        
        {/* LEFT COLUMN: Titles and Summary */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', alignItems: 'center' }}>
            {data.summary.slice(0, 2).map((sum, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#18181b', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {sum.value}
                </div>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#a1a1aa', fontWeight: 'bold' }}>
                  {sum.label}
                </div>
              </div>
            ))}
          </div>

          <h1 style={{ 
            fontSize: '3.5rem', 
            fontWeight: '900', 
            lineHeight: '1.1',
            margin: '0 0 20px 0',
            letterSpacing: '-1px'
          }}>
            «The Franchise»<br />
            {data.athleteName}'s<br />
            Stats Are Simply<br />
            Stunning
          </h1>

          <p style={{ color: '#a1a1aa', fontSize: '1rem', lineHeight: '1.6', maxWidth: '400px' }}>
            {data.athleteName} is dominating the competition in {data.sport}. Representing {data.teamName}, these metrics showcase peak performance.
          </p>

          <div style={{ marginTop: '30px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: `2px solid ${primaryColor}`, paddingBottom: '5px', cursor: 'pointer' }}>
              VIEW FULL PROFILE →
            </span>
          </div>

        </div>

        {/* CENTER COLUMN: The Player Image */}
        <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', minHeight: '500px', position: 'relative' }}>
          {data.photo ? (
            <img 
              src={data.photo} 
              alt={data.athleteName} 
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '500px',
                objectFit: 'contain',
                filter: 'drop-shadow(0px 20px 30px rgba(0,0,0,0.8)) saturate(1.2) contrast(1.1)',
                zIndex: 10
              }}
            />
          ) : (
            <div style={{
              width: '300px', height: '500px', 
              background: 'linear-gradient(to top, #18181b, transparent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.2)', fontSize: '1.5rem', fontWeight: 'bold',
              border: '2px dashed rgba(255,255,255,0.1)'
            }}>
              NO PHOTO
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Tactical Breakdown */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 10 }}>
          
          <div style={{ background: '#111116', padding: '25px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {data.mechanicsTitle}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {data.mechanics.map((mech, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: index === 0 ? '#fbbf24' : '#fff' }}></div>
                    <span style={{ color: '#d4d4d8', fontSize: '0.85rem' }}>{mech.name}</span>
                  </div>
                  <span style={{ fontWeight: 'bold', fontSize: '1rem', color: '#fff' }}>{mech.value}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#71717a', cursor: 'pointer' }}>VIEW ALL STATS →</span>
            </div>
          </div>

          <div style={{ background: '#111116', padding: '25px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {data.fieldTitle}
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ color: '#71717a', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ textAlign: 'left', paddingBottom: '10px' }}>Pos</th>
                  <th style={{ textAlign: 'left', paddingBottom: '10px' }}>Metric</th>
                  <th style={{ textAlign: 'right', paddingBottom: '10px' }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {data.field.map((f, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '12px 0' }}>
                      <span style={{ color: index === 0 ? primaryColor : '#fff', fontWeight: 'bold' }}>{index + 1}</span>
                    </td>
                    <td style={{ padding: '12px 0', color: '#d4d4d8' }}>{f.name}</td>
                    <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 'bold' }}>{f.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* BOTTOM SECTION: Highlights & Milestones */}
      <div style={{
        background: '#111116',
        padding: '30px 50px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        zIndex: 2,
        marginTop: 'auto'
      }}>
        
        {hasHighlights ? (
          <div>
            <h4 style={{ color: '#fff', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
              🎬 Athlete Highlights
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {data.highlights.map((url, i) => {
                const ytId = getYoutubeId(url);
                return (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ background: '#18181b', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform='translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
                      {ytId ? (
                        <img src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`} alt="Highlight" style={{ width: '100%', height: '160px', objectFit: 'cover' }} onError={(e) => { e.target.src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`; }} />
                      ) : (
                        <div style={{ width: '100%', height: '160px', background: 'linear-gradient(45deg, #18181b, #27272a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '2rem' }}>▶️</span>
                        </div>
                      )}
                      <div style={{ padding: '15px' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff', marginBottom: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          Highlight Video {i+1}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#71717a', textTransform: 'uppercase' }}>
                          Assistir Completo →
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            {data.milestones.map((mil, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#18181b', padding: '15px 25px', borderRadius: '8px', flex: '1 1 200px' }}>
                <div style={{ fontSize: '2rem', fontWeight: '900', color: primaryColor }}>
                  {mil.value}
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#fff' }}>{mil.name}</div>
                  <div style={{ fontSize: '0.65rem', color: '#71717a', textTransform: 'uppercase' }}>Career Milestone</div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
