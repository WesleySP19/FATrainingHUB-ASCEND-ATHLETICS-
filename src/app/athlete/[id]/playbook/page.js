"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import PlaybookCanvas from '@/components/PlaybookCanvas';
import AthleteNavbar from '@/components/athlete/AthleteNavbar';

export default function AthletePlaybookPage() {
  const params = useParams();
  const id = params.id;

  const [plays, setPlays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlay, setSelectedPlay] = useState(null);
  const [playDataJSON, setPlayDataJSON] = useState({ players: [] });

  // Feedback states
  const [doubtText, setDoubtText] = useState('');
  const [showDoubtBox, setShowDoubtBox] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) loadAssignedPlays();
  }, [id]);

  const loadAssignedPlays = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/athlete/${id}/plays`);
      const data = await res.json();
      if (data.success) {
        setPlays(data.plays);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSelectPlay = (play) => {
    setSelectedPlay(play);
    setShowDoubtBox(false);
    setDoubtText('');
    try {
      const parsed = typeof play.dataJSON === 'string' ? JSON.parse(play.dataJSON) : play.dataJSON;
      setPlayDataJSON(parsed);
    } catch (e) {
      setPlayDataJSON({ players: [] });
    }
  };

  const submitFeedback = async (status) => {
    if (status === 'DOUBT' && !doubtText.trim()) {
      alert("Por favor, descreva sua dúvida para que o coach possa te ajudar.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/athlete/${id}/plays`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playId: selectedPlay.id,
          status,
          comment: status === 'DOUBT' ? doubtText : null
        })
      });
      const data = await res.json();
      if (data.success) {
        // Update local state
        setPlays(prev => prev.map(p => {
          if (p.id === selectedPlay.id) {
            return { ...p, feedback: data.feedback };
          }
          return p;
        }));
        setSelectedPlay({ ...selectedPlay, feedback: data.feedback });
        if (status === 'DOUBT') setShowDoubtBox(false);
      } else {
        alert(data.error || "Erro ao enviar feedback.");
      }
    } catch (e) {
      alert("Erro de conexão.");
    }
    setSubmitting(false);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: '#fff', fontSize: '1.2rem' }}>Carregando Sala Tática...</div>;

  return (
    <>
      <AthleteNavbar athleteId={id} />
      <div className="container" style={{ paddingBottom: '50px' }}>
      
      {/* Navigation */}
      <nav style={{ padding: 'var(--spacing-md) 0', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <div>
          <h2 style={{ color: '#06b6d4', margin: 0 }}>SALA TÁTICA</h2>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Estude as jogadas da semana
          </span>
        </div>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '25px' }}>
        
        {/* Left Column: List of assigned plays */}
        <section className="card-panel" style={{ border: '1px solid rgba(6, 182, 212, 0.2)' }}>
          <h3 style={{ marginBottom: '15px', color: '#06b6d4' }}>Meu Playbook</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {plays.map(play => {
              const isSelected = selectedPlay?.id === play.id;
              const feedbackStatus = play.feedback?.status;
              
              return (
                <div 
                  key={play.id}
                  onClick={() => handleSelectPlay(play)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isSelected ? '#06b6d4' : 'rgba(255,255,255,0.05)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{play.name}</strong>
                    {feedbackStatus === 'UNDERSTOOD' && <span style={{ color: '#22c55e', fontSize: '1rem' }} title="Compreendido">✅</span>}
                    {feedbackStatus === 'DOUBT' && <span style={{ color: '#ef4444', fontSize: '1rem' }} title="Dúvida Registrada">❓</span>}
                    {!feedbackStatus && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06b6d4', marginTop: '5px' }} title="Novo"></span>}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#a1a1aa' }}>{play.sport}</span>
                    {play.position && play.position !== 'ALL' && (
                      <span style={{ fontSize: '0.7rem', color: '#facc15', fontWeight: 'bold' }}>• Foco: {play.position}</span>
                    )}
                  </div>
                </div>
              );
            })}
            
            {plays.length === 0 && (
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>
                Nenhuma jogada atribuída a você no momento.
              </span>
            )}
          </div>
        </section>

        {/* Right Column: Canvas & Feedback */}
        <section className="card-panel" style={{ border: '1px solid #1e293b' }}>
          {selectedPlay ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Play Header info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '1.5rem' }}>{selectedPlay.name}</h3>
                  <p style={{ margin: '5px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Por Coach: {selectedPlay.coach?.name}
                  </p>
                </div>
                {selectedPlay.position && selectedPlay.position !== 'ALL' && (
                  <div style={{ background: 'rgba(250, 204, 21, 0.1)', border: '1px solid rgba(250, 204, 21, 0.3)', padding: '5px 12px', borderRadius: '20px', color: '#facc15', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    POSIÇÃO FOCO: {selectedPlay.position}
                  </div>
                )}
              </div>

              {selectedPlay.description && (
                <div style={{ background: 'rgba(255,255,255,0.02)', borderLeft: '3px solid #06b6d4', padding: '15px', borderRadius: '4px' }}>
                  <strong style={{ display: 'block', fontSize: '0.75rem', color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>Comentários do Treinador:</strong>
                  <p style={{ margin: 0, color: '#e2e8f0', fontSize: '0.95rem', lineHeight: '1.5' }}>
                    {selectedPlay.description}
                  </p>
                </div>
              )}

              {/* Viewer */}
              <div style={{ pointerEvents: 'none' }}> {/* Ensures no accidental edits on client side, though readOnly prop also handles it */}
                <PlaybookCanvas 
                  playData={{ ...selectedPlay, dataJSON: playDataJSON }}
                  onChange={() => {}}
                  readOnly={true}
                />
              </div>

              {/* Feedback System */}
              <div style={{ marginTop: '10px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <h4 style={{ marginBottom: '15px', color: '#fff' }}>Confirmação de Entendimento</h4>
                
                {!showDoubtBox ? (
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button 
                      onClick={() => submitFeedback('UNDERSTOOD')}
                      disabled={submitting}
                      style={{
                        flex: 1,
                        padding: '15px',
                        borderRadius: '8px',
                        background: selectedPlay.feedback?.status === 'UNDERSTOOD' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)',
                        border: `1px solid ${selectedPlay.feedback?.status === 'UNDERSTOOD' ? '#22c55e' : 'rgba(34, 197, 94, 0.3)'}`,
                        color: '#22c55e',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: selectedPlay.feedback?.status === 'UNDERSTOOD' ? '0 0 15px rgba(34,197,94,0.3)' : 'none'
                      }}
                    >
                      {selectedPlay.feedback?.status === 'UNDERSTOOD' ? '✅ COMPREENDIDO' : '✅ COMPREENDI A JOGADA'}
                    </button>
                    
                    <button 
                      onClick={() => setShowDoubtBox(true)}
                      style={{
                        flex: 1,
                        padding: '15px',
                        borderRadius: '8px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      ❓ TENHO DÚVIDA
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', background: 'rgba(239, 68, 68, 0.05)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <label style={{ color: '#fca5a5', fontSize: '0.9rem', fontWeight: 'bold' }}>Descreva qual foi sua dúvida na execução:</label>
                    <textarea 
                      rows="3"
                      placeholder="Ex: Não entendi se o corte no Y é antes ou depois do bloqueio..."
                      value={doubtText}
                      onChange={e => setDoubtText(e.target.value)}
                      style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '4px', resize: 'none' }}
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => submitFeedback('DOUBT')}
                        disabled={submitting}
                        style={{ flex: 1, padding: '12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        ENVIAR DÚVIDA AO TREINADOR
                      </button>
                      <button 
                        onClick={() => setShowDoubtBox(false)}
                        style={{ padding: '12px 20px', background: 'transparent', color: '#a1a1aa', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px', color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: '4rem', marginBottom: '20px', opacity: 0.2 }}>📋</span>
              <p>Selecione uma jogada no menu lateral para iniciar o estudo tático.</p>
            </div>
          )}
        </section>

      </div>
    </div>
    </>
  );
}
