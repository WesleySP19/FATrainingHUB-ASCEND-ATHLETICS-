'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AthleteReportPage() {
  const params = useParams();
  const router = useRouter();
  const { athleteId } = params;

  const [loading, setLoading] = useState(true);
  const [athlete, setAthlete] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/coach/reports/${athleteId}`);
        const data = await res.json();
        if (data.success) {
          setAthlete(data.athlete);
          setWorkouts(data.workouts || []);
        } else {
          alert('Erro ao carregar relatório');
        }
      } catch (err) {
        console.error('Erro de rede', err);
      } finally {
        setLoading(false);
      }
    };
    if (athleteId) fetchReport();
  }, [athleteId]);

  if (loading) {
    return (
      <div style={{ background: '#0f172a', minHeight: '100vh', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h2>Carregando Ficha...</h2>
      </div>
    );
  }

  if (!athlete) {
    return (
      <div style={{ background: '#0f172a', minHeight: '100vh', color: '#fff', padding: '50px', textAlign: 'center' }}>
        <h2>Atleta não encontrado.</h2>
        <button onClick={() => router.push('/coach/roster')} style={{ marginTop: '20px', padding: '10px 20px', background: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          Voltar ao Roster
        </button>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '50px' }}>

      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: '30px' }}>
          <Link href="/coach/roster" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}>
            &larr; Voltar ao Roster
          </Link>
        </div>

        {/* Ficha Física */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '30px', marginBottom: '40px', display: 'flex', gap: '30px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '3rem', border: '3px solid var(--primary-color)' }}>
            {athlete.profilePhoto ? <img src={athlete.profilePhoto} alt={athlete.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : '👤'}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: '0 0 10px 0', fontFamily: 'var(--font-display)', color: '#fff' }}>{athlete.name}</h1>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '15px' }}>
              <span style={{ background: 'rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: '15px', fontSize: '0.85rem' }}>Posição: <strong>{athlete.position}</strong></span>
              <span style={{ background: 'rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: '15px', fontSize: '0.85rem' }}>OVR: <strong style={{ color: 'var(--primary-color)' }}>{athlete.overall}</strong></span>
              <span style={{ background: 'rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: '15px', fontSize: '0.85rem' }}>Treinos: <strong>{athlete.attendanceCount}</strong></span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div>Altura: <strong>{athlete.height || 'N/A'}</strong></div>
              <div>Peso: <strong>{athlete.weight || 'N/A'}</strong></div>
              <div>Força: <strong>{athlete.forceAttr || 70}</strong></div>
              <div>Velocidade: <strong>{athlete.speedAttr || 70}</strong></div>
            </div>
          </div>
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '20px' }}>
          Histórico de Treinos (Logs)
        </h2>

        {workouts.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '2rem' }}>📭</span>
            <p style={{ color: 'var(--text-secondary)' }}>Nenhum treino finalizado por este atleta ainda.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {workouts.map(workout => {
              const isExpanded = expandedWorkoutId === workout.id;
              
              return (
                <div key={workout.id} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
                  
                  {/* Workout Header (Clickable) */}
                  <div 
                    onClick={() => setExpandedWorkoutId(isExpanded ? null : workout.id)}
                    style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: isExpanded ? 'rgba(255,255,255,0.05)' : 'transparent', transition: 'background 0.2s' }}
                  >
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#fff' }}>Treino PIN: {workout.pinCode}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(workout.date).toLocaleString('pt-BR')}</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      {/* Wellness Indicators */}
                      {workout.rpeScore && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>RPE (Fadiga)</span>
                          <strong style={{ color: workout.rpeScore > 7 ? '#ef4444' : '#22c55e' }}>{workout.rpeScore}/10</strong>
                        </div>
                      )}
                      {workout.sleepScore && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Sono</span>
                          <strong style={{ color: workout.sleepScore < 6 ? '#ef4444' : '#22c55e' }}>{workout.sleepScore}h</strong>
                        </div>
                      )}
                      <span style={{ fontSize: '1.2rem', color: 'var(--primary-color)' }}>
                        {isExpanded ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Content: Sets details */}
                  {isExpanded && (
                    <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.5)' }}>
                      <h5 style={{ margin: '0 0 15px 0', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>Métricas de Execução</h5>
                      
                      {workout.sets && workout.sets.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {workout.sets.map(set => (
                            <div key={set.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px 15px', borderRadius: '8px', borderLeft: set.isCompleted ? '3px solid #22c55e' : '3px solid #ef4444' }}>
                              <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{set.exerciseName}</span>
                              
                              <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem' }}>
                                <div style={{ textAlign: 'center' }}>
                                  <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>PRESCRIÇÃO</span>
                                  <span>{set.targetSets}x{set.targetReps} {set.targetLoad ? `@ ${set.targetLoad}kg` : ''}</span>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                  <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>EXECUTADO</span>
                                  <strong style={{ color: set.actualLoad ? 'var(--primary-color)' : 'var(--text-secondary)' }}>
                                    {set.actualLoad ? `${set.actualLoad}kg` : 'N/A'}
                                  </strong>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Nenhum exercício registrado neste treino.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <h2 style={{ fontFamily: 'var(--font-display)', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginTop: '50px', marginBottom: '20px' }}>
          Personal Records (PRs)
        </h2>

        {athlete.personalRecords && athlete.personalRecords.length > 0 ? (
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            {athlete.personalRecords.map(pr => (
              <div key={pr.id} style={{ background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(202, 138, 4, 0.05) 100%)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: '12px', padding: '15px', width: '220px' }}>
                <span style={{ display: 'block', fontSize: '1.5rem', marginBottom: '10px' }}>🏆</span>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: '#facc15', marginBottom: '5px' }}>{pr.exerciseName}</strong>
                <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#fff', marginBottom: '5px' }}>{pr.maxLoad} kg</div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{new Date(pr.dateAchieved).toLocaleDateString('pt-BR')}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Nenhum Recorde Pessoal registrado ainda.</p>
        )}

      </div>
    </div>
  );
}
