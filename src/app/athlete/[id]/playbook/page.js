"use client";

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import PlaybookCanvas from '@/components/PlaybookCanvas';

export default function AthletePlaybookPage({ params }) {
  const resolvedParams = use(params);
  const athleteId = resolvedParams.id;

  const [athlete, setAthlete] = useState(null);
  const [assignedPlays, setAssignedPlays] = useState([]);
  const [selectedPlay, setSelectedPlay] = useState(null);
  const [loading, setLoading] = useState(true);

  // Feedback form states
  const [feedbackStatus, setFeedbackStatus] = useState(''); // 'UNDERSTOOD' ou 'DOUBT'
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Alert system
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    // 1. Verificar atleta autenticado
    const stored = localStorage.getItem('athlete');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.id === athleteId) {
        setAthlete(parsed);
      }
    }
    loadAssignedPlays();
  }, [athleteId]);

  const loadAssignedPlays = async () => {
    try {
      const res = await fetch(`/api/athlete/${athleteId}/plays`);
      const data = await res.json();
      if (data.success) {
        setAssignedPlays(data.plays);
        if (data.plays.length > 0) {
          // Seleciona a primeira por padrão
          handleSelectPlay(data.plays[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSelectPlay = (play) => {
    setSelectedPlay(play);
    if (play.feedback) {
      setFeedbackStatus(play.feedback.status);
      setFeedbackComment(play.feedback.comment || '');
    } else {
      setFeedbackStatus('');
      setFeedbackComment('');
    }
  };

  const showAlert = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg({ type: '', text: '' }), 5000);
  };

  // Envia feedback de compreensão
  const handleSubmitFeedback = async (status) => {
    setSubmittingFeedback(true);
    try {
      const res = await fetch(`/api/athlete/${athleteId}/plays`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playId: selectedPlay.id,
          status,
          comment: feedbackComment
        })
      });
      const data = await res.json();
      if (data.success) {
        showAlert('success', 'Seu feedback tático foi registrado com sucesso!');
        setFeedbackStatus(status);
        // Atualiza a lista local de jogadas para salvar o feedback
        setAssignedPlays(prev => prev.map(p => {
          if (p.id === selectedPlay.id) {
            return {
              ...p,
              feedback: {
                status,
                comment: feedbackComment,
                updatedAt: new Date().toISOString()
              }
            };
          }
          return p;
        }));
      } else {
        showAlert('error', data.error || 'Erro ao registrar feedback.');
      }
    } catch (e) {
      showAlert('error', 'Erro de conexão ao enviar feedback.');
    }
    setSubmittingFeedback(false);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: '#fff', fontSize: '1.2rem' }}>Carregando Playbook...</div>;

  return (
    <div className="container" style={{ paddingBottom: '50px' }}>
      
      {/* Header */}
      <nav style={{ padding: 'var(--spacing-md) 0', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <div>
          <h2 style={{ color: 'var(--primary-color)', margin: 0 }}>ESTUDO TÁTICO DE PLAYBOOK</h2>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            estude suas rotas em tempo real • destaque amarelo na sua camisa
          </span>
        </div>
        <Link href={`/athlete/${athleteId}`} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 'bold' }}>&larr; Voltar pro Locker Room</Link>
      </nav>

      {alertMsg.text && (
        <div style={{
          padding: '12px 15px',
          borderRadius: '4px',
          marginBottom: '20px',
          background: alertMsg.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${alertMsg.type === 'success' ? '#22c55e' : '#ef4444'}`,
          color: alertMsg.type === 'success' ? '#86efac' : '#fca5a5',
          fontWeight: 'bold',
          fontSize: '0.9rem'
        }}>
          {alertMsg.text}
        </div>
      )}

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '25px' }} id="athlete-playbook-grid">
        
        {/* Left Sidebar: Plays list */}
        <section className="card-panel" style={{ border: '1px solid #1e293b', height: 'fit-content' }}>
          <h3 style={{ marginBottom: '15px', color: 'var(--primary-color)' }}>Jogadas Atribuídas</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {assignedPlays.map(play => (
              <div
                key={play.id}
                onClick={() => handleSelectPlay(play)}
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  background: selectedPlay?.id === play.id ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${selectedPlay?.id === play.id ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)'}`,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block' }}>{play.name}</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    Por Coach: {play.coach?.name || 'Oficial'}
                  </span>
                </div>
                {play.feedback && (
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '3px 6px',
                    borderRadius: '10px',
                    background: play.feedback.status === 'UNDERSTOOD' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                    color: play.feedback.status === 'UNDERSTOOD' ? '#22c55e' : '#ef4444',
                    border: `1px solid ${play.feedback.status === 'UNDERSTOOD' ? '#22c55e' : '#ef4444'}`,
                    fontWeight: 'bold'
                  }}>
                    {play.feedback.status === 'UNDERSTOOD' ? 'Entendi' : 'Dúvida'}
                  </span>
                )}
              </div>
            ))}
            {assignedPlays.length === 0 && (
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>
                Nenhuma jogada tática atribuída a você no momento.
              </span>
            )}
          </div>
        </section>

        {/* Right Section: Canvas animation & Feedback forms */}
        {selectedPlay ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Visualizer Canvas Card */}
            <section className="card-panel" style={{ border: '1px solid #1e293b' }}>
              <h3 style={{ marginBottom: '5px', color: '#fff' }}>{selectedPlay.name}</h3>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block', marginBottom: '15px' }}>
                Modalidade: {selectedPlay.sport} | Criada em: {new Date(selectedPlay.assignedAt).toLocaleDateString()}
              </span>

              {/* Playbook Canvas with readOnly={true} */}
              <PlaybookCanvas
                playData={selectedPlay}
                highlightAthleteId={athleteId}
                readOnly={true}
              />
            </section>

            {/* Study Feedback panel */}
            <section className="card-panel" style={{ border: '1px solid #1e293b' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Registro de Compreensão Tática
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '15px' }}>
                Após analisar a simulação da rota e os deslocamentos, registre seu status de entendimento para reportar ao Coach:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Notas/Dúvidas para o Treinador (Opcional)
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Descreva se tem dúvidas em algum corte ou ponto de delay da rota..."
                    value={feedbackComment}
                    onChange={e => setFeedbackComment(e.target.value)}
                    style={{ width: '100%', padding: '10px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
                  <button
                    disabled={submittingFeedback}
                    onClick={() => handleSubmitFeedback('UNDERSTOOD')}
                    className="btn"
                    style={{
                      flexGrow: 1,
                      padding: '12px',
                      background: feedbackStatus === 'UNDERSTOOD' ? '#22c55e' : 'rgba(34, 197, 94, 0.1)',
                      color: feedbackStatus === 'UNDERSTOOD' ? '#000' : '#22c55e',
                      borderColor: '#22c55e',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}
                  >
                    ENTENDI A JOGADA 🟢
                  </button>

                  <button
                    disabled={submittingFeedback}
                    onClick={() => handleSubmitFeedback('DOUBT')}
                    className="btn"
                    style={{
                      flexGrow: 1,
                      padding: '12px',
                      background: feedbackStatus === 'DOUBT' ? '#ef4444' : 'rgba(239, 68, 68, 0.1)',
                      color: feedbackStatus === 'DOUBT' ? '#000' : '#ef4444',
                      borderColor: '#ef4444',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}
                  >
                    TENHO DÚVIDAS NESTA ROTA 🔴
                  </button>
                </div>

                {feedbackStatus && (
                  <div style={{
                    marginTop: '10px',
                    textAlign: 'center',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)'
                  }}>
                    Status atual: <strong style={{ color: feedbackStatus === 'UNDERSTOOD' ? '#22c55e' : '#ef4444' }}>
                      {feedbackStatus === 'UNDERSTOOD' ? 'COMPREENDIDO' : 'COM DÚVIDAS'}
                    </strong>
                  </div>
                )}
              </div>
            </section>

          </div>
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '300px',
            border: '1px dashed rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: 'var(--text-secondary)'
          }}>
            Nenhuma jogada tática disponível para visualização.
          </div>
        )}

      </div>

    </div>
  );
}
