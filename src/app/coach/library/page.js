"use client";

import { useState } from 'react';
import Link from 'next/link';
import ExerciseModal from '@/components/coach/ExerciseModal';
import { useCoach } from '@/contexts/CoachContext';
import useSWR from 'swr';

const fetcher = url => fetch(url).then(r => r.json());

export default function CoachLibraryPage() {
  const { coach, loadingCoach } = useCoach();
  const { data, error, isLoading, mutate } = useSWR(coach ? '/api/exercises' : null, fetcher);
  const exercises = data?.exercises || [];
  const loadingExercises = loadingCoach || isLoading;
  
  // Reuse ExerciseModal State
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [newExerciseForm, setNewExerciseForm] = useState({
    name: '',
    type: 'Futebol Americano',
    location: 'GYM',
    description: '',
    mechanics: '',
    imageUrl: '',
    gifUrl: '',
    videoUrl: ''
  });
  const [exerciseFormError, setExerciseFormError] = useState('');
  const [creatingExercise, setCreatingExercise] = useState(false);

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este exercício da biblioteca?")) return;
    
    try {
      const res = await fetch(`/api/exercises/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        mutate(); // Re-fetch data from SWR cache after delete
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert("Erro de conexão.");
    }
  };

  const handleCreateExercise = async (e) => {
    e.preventDefault();
    if (!newExerciseForm.name || !newExerciseForm.type || !newExerciseForm.location) {
      setExerciseFormError('Nome, Modalidade e Ambiente são obrigatórios.');
      return;
    }
    setCreatingExercise(true);
    setExerciseFormError('');
    try {
      const res = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExerciseForm)
      });
      const data = await res.json();
      if (data.success) {
        mutate(); // Refresh the list
        setShowExerciseModal(false);
        setNewExerciseForm({
          name: '',
          type: 'Futebol Americano',
          location: 'GYM',
          description: '',
          mechanics: '',
          imageUrl: '',
          gifUrl: '',
          videoUrl: ''
        });
      } else {
        setExerciseFormError(data.error || 'Erro ao salvar exercício.');
      }
    } catch (err) {
      setExerciseFormError('Falha de conexão com o servidor.');
    }
    setCreatingExercise(false);
  };

  if (loadingCoach || loadingExercises) return <div style={{ textAlign: 'center', padding: '100px', color: '#fff', fontSize: '1.2rem' }}>Carregando Biblioteca...</div>;

  if (!coach) {
    return (
      <div className="container" style={{ maxWidth: '500px', marginTop: '15vh', textAlign: 'center' }}>
        <div className="card-panel">
          <h2 style={{ color: 'var(--accent-red)' }}>Acesso Negado</h2>
          <p style={{ margin: '20px 0', color: 'var(--text-secondary)' }}>Você precisa estar logado como Coach para acessar esta página.</p>
          <Link href="/coach" className="btn">Ir para Login de Coach</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container" style={{ paddingBottom: '50px' }}>
      <nav style={{ padding: 'var(--spacing-md) 0', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <div>
          <h2 style={{ color: 'var(--primary-color)', margin: 0 }}>BIBLIOTECA DE EXERCÍCIOS</h2>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Gerencie o catálogo de exercícios para GYM e HOME
          </span>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <Link href="/coach" style={{
            background: 'transparent',
            border: '2px solid #06b6d4',
            color: '#06b6d4',
            padding: '8px 20px',
            borderRadius: '8px',
            fontWeight: 'bold',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.9rem',
            transition: 'all 0.2s',
            boxShadow: '0 0 10px rgba(6,182,212,0.2)'
          }}>
            📋 MONTAR TREINO
          </Link>
          <button onClick={() => setShowExerciseModal(true)} className="btn">
            + NOVO EXERCÍCIO
          </button>
        </div>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {exercises.map(ex => (
            <div key={ex.id} className="card-panel" style={{ border: '1px solid #1e293b', display: 'flex', flexDirection: 'column' }}>
              
              {/* Media Preview */}
              {(ex.imageUrl || ex.gifUrl || ex.mediaUrl) && (
                <div style={{ 
                  height: '150px', 
                  width: '100%', 
                  marginBottom: '15px', 
                  borderRadius: '8px', 
                  overflow: 'hidden',
                  background: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src={ex.gifUrl || ex.imageUrl || ex.mediaUrl} 
                    alt={ex.name} 
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.2rem' }}>{ex.name}</h3>
                  <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', color: '#fff', marginRight: '5px' }}>{ex.location}</span>
                  <span style={{ fontSize: '0.7rem', background: 'rgba(6, 182, 212, 0.1)', padding: '2px 6px', borderRadius: '4px', color: '#06b6d4' }}>{ex.type}</span>
                </div>
              </div>

              {ex.description && (
                <div style={{ flexGrow: 1, marginBottom: '5px' }}>
                  <strong style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Instruções:</strong>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '5px 0 0 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {ex.description}
                  </p>
                </div>
              )}

              {ex.mechanics && (
                <div style={{ flexGrow: 1, marginBottom: '15px' }}>
                  <strong style={{ fontSize: '0.75rem', color: 'rgba(6, 182, 212, 0.8)', textTransform: 'uppercase' }}>Mecânica:</strong>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', margin: '5px 0 0 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {ex.mechanics}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
                {ex.videoUrl && (
                  <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '6px', borderRadius: '4px', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 'bold' }}>
                    VER VÍDEO 🎥
                  </a>
                )}
                <button 
                  onClick={() => handleDelete(ex.id)}
                  style={{ flex: ex.videoUrl ? '0 0 auto' : 1, padding: '6px 12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#a1a1aa', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.target.style.color = '#ef4444'; e.target.style.borderColor = '#ef4444'; }}
                  onMouseLeave={e => { e.target.style.color = '#a1a1aa'; e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                >
                  Excluir
                </button>
              </div>

            </div>
          ))}

          {exercises.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
              Nenhum exercício encontrado. Clique em "Novo Exercício" para começar a montar a biblioteca.
            </div>
          )}
        </div>

      {showExerciseModal && (
        <ExerciseModal
          showExerciseModal={showExerciseModal}
          setShowExerciseModal={setShowExerciseModal}
          newExerciseForm={newExerciseForm}
          setNewExerciseForm={setNewExerciseForm}
          handleCreateExercise={handleCreateExercise}
          exerciseFormError={exerciseFormError}
          creatingExercise={creatingExercise}
        />
      )}
    </div>
    </>
  );
}
