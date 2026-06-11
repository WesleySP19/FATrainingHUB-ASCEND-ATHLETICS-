"use client";

import { useState } from 'react';
import Link from 'next/link';
import styles from './coach.module.css';
import CoachLoginForm from '@/components/coach/CoachLoginForm';
import ExerciseSelectorModal from '@/components/coach/ExerciseSelectorModal';
import { useCoach } from '@/contexts/CoachContext';
import useWorkoutBuilder from '@/hooks/useWorkoutBuilder';

export default function CoachDashboard() {
  const { coach, loadingCoach, loginCoach } = useCoach();

  // Login Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const builder = useWorkoutBuilder(coach);
  const {
    library,
    sportsFilter, setSportsFilter,
    selectedExercises, setSelectedExercises,
    workoutPin,
    loading,
    athletes,
    targetType, setTargetType,
    targetPosition, setTargetPosition,
    targetAthleteId, setTargetAthleteId,
    mvpAthlete,
    isOverrideMode, setIsOverrideMode,
    baseWorkoutId, setBaseWorkoutId,
    activeDay, setActiveDay,
    showSelectorModal, setShowSelectorModal,
    getExerciseImage,
    addExercise,
    removeExercise,
    updateParam,
    generateWorkout
  } = builder;

  const daysOfWeek = [
    { id: 'monday', name: '📅 SEGUNDA-FEIRA (Academia - Força)', color: '#38bdf8', focus: 'Academia (Powerlifting / LPO / Hipertrofia)' },
    { id: 'tuesday', name: '📅 TERÇA-FEIRA (Casa - Estudo/Recup.)', color: '#c084fc', focus: 'Casa (Recuperação / Mobilidade / Playbook)' },
    { id: 'wednesday', name: '📅 QUARTA-FEIRA (Academia - Força)', color: '#38bdf8', focus: 'Academia (Powerlifting / LPO / Hipertrofia)' },
    { id: 'thursday', name: '📅 QUINTA-FEIRA (Casa - Estudo/Recup.)', color: '#c084fc', focus: 'Casa (Recuperação / Mobilidade / Playbook)' },
    { id: 'friday', name: '📅 SEXTA-FEIRA (Academia - Força)', color: '#38bdf8', focus: 'Academia (Powerlifting / LPO / Hipertrofia)' },
    { id: 'saturday', name: '📅 SÁBADO (Campo - Técnico/Tático)', color: '#ef4444', focus: 'Campo (Técnico / Tático / Scrimmage)' }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/coach/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        loginCoach(data.coach);
      } else {
        setLoginError(data.error);
      }
    } catch(err) {
      setLoginError("Erro ao se conectar com o servidor.");
    }
  };

  if (loadingCoach) {
    return <div style={{ textAlign: 'center', padding: '100px', color: '#fff' }}>Verificando Sessão...</div>;
  }

  if (!coach) {
    return (
      <CoachLoginForm 
        email={email} setEmail={setEmail}
        password={password} setPassword={setPassword}
        handleLogin={handleLogin} loginError={loginError} 
      />
    );
  }

  // Filter library by sport category
  const filteredLibrary = library.filter(ex => {
    if (sportsFilter === 'ALL') return true;
    return ex.type === sportsFilter;
  });

  return (
    <>
      <div className="container" style={{ paddingBottom: '100px' }}>
      
      {/* Custom Styles for Playbook Creator HUD moved to coach.module.css */}

      {/* Top Header Segment (Inspired by Image 2 banner intro) */}
      <header style={{ textAlign: 'center', marginTop: '30px', marginBottom: '40px' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          color: '#fff', 
          fontFamily: 'var(--font-display)', 
          lineHeight: '1.2',
          textTransform: 'none',
          fontWeight: '900',
          marginBottom: '10px'
        }}>
          Prescrição de Performance Tática e Física
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', letterSpacing: '0.5px' }}>
          Selecione exercícios da biblioteca de elite e prescreva planilhas personalizadas para grupos ou atletas individuais.
        </p>
      </header>

      {/* Override Alert Notification */}
      {isOverrideMode && (
        <div style={{ marginBottom: '25px', padding: '12px 20px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.85rem' }}>
            ⚠️ MODO SOBRESCRITA (OVERRIDE) ATIVO: Você está configurando um treino individual customizado.
          </span>
          <button onClick={() => { setIsOverrideMode(false); setBaseWorkoutId(''); setSelectedExercises([]); }} style={{ background: 'transparent', color: '#fff', border: '1.5px solid #fff', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>
            Cancelar Override
          </button>
        </div>
      )}

      {/* Split Section: Target settings vs Weekly chalkboard (Inspired by Image 2 bottom section) */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '50px' }}>
        
        {/* Intro to Prescription section */}
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: '900', textTransform: 'none', marginBottom: '8px' }}>
            Periodização e Ajuste de Carga Semanal
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Selecione o destino do treino, verifique os atletas alvos e configure as séries e repetições da grade.
          </p>
        </div>

        {/* Split Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.9fr', gap: '35px', alignItems: 'start' }}>
          
          {/* Left Column: Target selectors list (Inspired by features list in Image 2) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {!isOverrideMode ? (
              <div className="feature-list-item">
                <div className="feature-badge-circle" style={{ borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}>🎯</div>
                <div style={{ flexGrow: 1 }}>
                  <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '5px' }}>Direcionamento do Treino</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '12px' }}>
                    Defina se a planilha será aplicada coletivamente ou para um atleta específico.
                  </p>
                  
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {['ALL', 'GROUP', 'INDIVIDUAL'].map(t => (
                      <button
                        key={t}
                        onClick={() => setTargetType(t)}
                        style={{
                          background: targetType === t ? 'var(--primary-color)' : 'transparent',
                          color: targetType === t ? '#000' : 'var(--text-secondary)',
                          border: `1px solid ${targetType === t ? 'var(--primary-color)' : 'rgba(255,255,255,0.08)'}`,
                          borderRadius: '6px',
                          padding: '8px 14px',
                          fontSize: '0.72rem',
                          fontWeight: '900',
                          cursor: 'pointer',
                          letterSpacing: '0.5px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {t === 'ALL' ? 'GERAL' : t === 'GROUP' ? 'POSIÇÃO' : 'INDIVIDUAL'}
                      </button>
                    ))}
                  </div>

                  {targetType === 'GROUP' && (
                    <div style={{ marginTop: '12px' }}>
                      <select value={targetPosition} onChange={e => setTargetPosition(e.target.value)} style={{ width: '100%', padding: '10px', background: '#000', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '0.8rem', outline: 'none' }}>
                        <option value="QB">Quarterbacks (QB)</option>
                        <option value="OL">Offensive Linemen (OL)</option>
                        <option value="DL">Defensive Linemen (DL)</option>
                        <option value="Skills">Skills (WR / DB / RB)</option>
                        <option value="Forwards">Rugby Forwards</option>
                        <option value="Backs">Rugby Backs</option>
                        <option value="Força Base">Powerlifters</option>
                      </select>
                    </div>
                  )}

                  {targetType === 'INDIVIDUAL' && (
                    <div style={{ marginTop: '12px' }}>
                      <select value={targetAthleteId} onChange={e => setTargetAthleteId(e.target.value)} style={{ width: '100%', padding: '10px', background: '#000', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '0.8rem', outline: 'none' }}>
                        <option value="">-- Escolha o Atleta --</option>
                        {athletes.map(a => (
                          <option key={a.id} value={a.id}>{a.name} ({a.position})</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="feature-list-item" style={{ border: '1.5px solid #ef4444', background: 'rgba(239, 68, 68, 0.02)' }}>
                <div className="feature-badge-circle" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1.5px solid #ef4444', color: '#ef4444' }}>⚠️</div>
                <div>
                  <h4 style={{ color: '#ef4444', fontSize: '0.95rem', marginBottom: '5px' }}>Modo Override Ativo</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '10px' }}>
                    Esta prescrição irá sobrescrever o treino baseline do seguinte atleta:
                  </p>
                  <strong style={{ color: '#fff', fontSize: '0.85rem' }}>
                    {athletes.find(a => a.id === targetAthleteId)?.name} ({athletes.find(a => a.id === targetAthleteId)?.position})
                  </strong>
                </div>
              </div>
            )}

            <div className="feature-list-item">
              <div className="feature-badge-circle">👑</div>
              <div>
                <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '5px' }}>Destaque MVP da Liga</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                  {mvpAthlete ? `MVP Ativo: ${mvpAthlete.name} (${mvpAthlete.position})` : 'Nenhum MVP eleito no roster atualmente.'}
                </p>
              </div>
            </div>

            <div className="feature-list-item">
              <div className="feature-badge-circle">📈</div>
              <div>
                <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '5px' }}>Monitoramento ACWR</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                  A relação de esforço agudo/crônico é calculada no vestiário de cada atleta para prevenir fadiga e lesões.
                </p>
              </div>
            </div>

            <div className="feature-list-item">
              <div className="feature-badge-circle">🔑</div>
              <div>
                <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '5px' }}>Sincronização na Nuvem</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                  Ao publicar, os atletas do roster correspondente receberão o treino em tempo real com código PIN.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Prescribed Exercises weekly board (Inspired by image frame on Image 2 right side) */}
          <div className={styles.weeklyChalkboardGamer}>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '22px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px', fontFamily: 'var(--font-display)', fontWeight: '900', letterSpacing: '0.5px' }}>
              📋 GRADE DE EXERCÍCIOS PRESCRIÇÃO
            </h3>

            {workoutPin ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>PIN CODE DO TREINO GERADO</span>
                <div style={{ fontSize: '3.6rem', color: 'var(--accent-gold)', fontWeight: '900', letterSpacing: '4px', fontFamily: 'var(--font-display)', textShadow: '0 0 20px rgba(251,191,36,0.3)', marginBottom: '15px' }}>
                  {workoutPin}
                </div>
                <p style={{ color: 'var(--accent-green)', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '25px' }}>Publicado com sucesso no ecossistema do atleta!</p>
                <button onClick={() => { setWorkoutPin(null); setSelectedExercises([]); }} className="btn" style={{ padding: '8px 20px', fontSize: '0.8rem' }}>NOVA PRESCRIÇÃO</button>
              </div>
            ) : (
              <>
                {selectedExercises.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)', border: '2px dashed rgba(255,255,255,0.04)', borderRadius: '12px', marginBottom: '20px' }}>
                    <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '10px' }}>📋</span>
                    <p style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: 0 }}>Chalkboard Semanal Vazio</p>
                    <p style={{ fontSize: '0.75rem', marginTop: '5px' }}>Adicione exercícios clicando nos dias abaixo.</p>
                  </div>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {daysOfWeek.map(day => {
                    const dayExs = selectedExercises.filter(e => e.dayOfWeek === day.id);
                    // Agora sempre mostramos o dia, para permitir adicionar exercícios

                    return (
                        <div key={day.id} className={styles.dayContainerGamer}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${day.color}`, paddingBottom: '6px', marginBottom: '12px' }}>
                            <span style={{ color: day.color, fontSize: '0.9rem', fontWeight: 'bold' }}>{day.name}</span>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{day.focus}</span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {selectedExercises.map((ex, idx) => {
                              if (ex.dayOfWeek !== day.id) return null;
                              return (
                                <div key={`${ex.id}-${idx}`} className={styles.exerciseRowGamer} style={{ borderLeft: `3px solid ${day.color}` }}>
                                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff', flexGrow: 1, minWidth: '150px' }}>{ex.name}</span>
                                  
                                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                      <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>SÉRIES</span>
                                      <input type="number" value={ex.targetSets} onChange={e => updateParam(idx, 'targetSets', e.target.value)} className={styles.hudInput} />
                                    </div>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', alignSelf: 'flex-end', paddingBottom: '5px' }}>x</span>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                      <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>REPS</span>
                                      <input type="number" value={ex.targetReps} onChange={e => updateParam(idx, 'targetReps', e.target.value)} className={styles.hudInput} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                      <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>CARGA (KG)</span>
                                      <input type="number" placeholder="Auto" value={ex.targetLoad} onChange={e => updateParam(idx, 'targetLoad', e.target.value)} className={styles.hudInput} style={{ width: '55px' }} />
                                    </div>
                                    <button onClick={() => removeExercise(idx)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: '1rem', padding: '2px 5px', alignSelf: 'center', marginTop: '10px', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>✖</button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          <button 
                            onClick={() => {
                              setActiveDay(day.id);
                              setShowSelectorModal(true);
                            }}
                            style={{
                              marginTop: '10px',
                              width: '100%',
                              padding: '8px',
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px dashed rgba(255,255,255,0.1)',
                              color: 'var(--text-secondary)',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              transition: 'all 0.2s',
                              textTransform: 'uppercase'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = day.color;
                              e.currentTarget.style.color = day.color;
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                              e.currentTarget.style.color = 'var(--text-secondary)';
                            }}
                          >
                            + ADICIONAR EXERCÍCIO
                          </button>
                        </div>
                      );
                    })}

                    {/* Publish/Assign button */}
                    <button 
                      onClick={generateWorkout} 
                      disabled={loading}
                      className="btn" 
                      style={{ 
                        marginTop: '15px', 
                        width: '100%', 
                        fontSize: '1rem', 
                        padding: '15px', 
                        fontWeight: 'bold',
                        borderRadius: '30px', 
                        letterSpacing: '1px',
                        background: 'var(--accent-green)',
                        color: '#000',
                        boxShadow: '0 5px 15px rgba(34, 197, 94, 0.3)'
                      }}
                    >
                      {loading ? 'PUBLICANDO PLANILHA...' : (isOverrideMode ? 'SALVAR SOBRESCRITA (OVERRIDE) ⚡' : 'PUBLICAR PLANILHA OFICIAL ⚡')}
                    </button>
                  </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: SELETOR DE EXERCÍCIOS DA BIBLIOTECA */}
      <ExerciseSelectorModal
        showModal={showSelectorModal}
        setShowModal={setShowSelectorModal}
        library={library}
        onSelectExercise={(ex) => addExercise(ex, activeDay)}
      />
    </div>
    </>
  );
}
