"use client";

export default function ExerciseModal({ 
  showExerciseModal, 
  setShowExerciseModal, 
  newExerciseForm, 
  setNewExerciseForm, 
  handleCreateExercise, 
  exerciseFormError, 
  creatingExercise 
}) {
  if (!showExerciseModal) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100vw', height: '100vh',
      background: 'rgba(2, 3, 6, 0.9)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        background: '#04070e',
        border: '1.5px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        padding: '30px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(34, 197, 94, 0.1)',
        position: 'relative'
      }}>
        <button 
          onClick={() => setShowExerciseModal(false)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '1.3rem',
            cursor: 'pointer',
            transition: 'color 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
        >
          ✖
        </button>

        <h3 style={{ 
          fontSize: '1.25rem', 
          color: '#fff', 
          marginBottom: '10px', 
          fontFamily: 'var(--font-display)', 
          fontWeight: '900', 
          letterSpacing: '0.5px' 
        }}>
          ➕ NOVO EXERCÍCIO / ATIVIDADE
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '22px', lineHeight: '1.4' }}>
          Cadastre uma nova atividade personalizada na biblioteca oficial para prescrevê-la imediatamente ao time.
        </p>

        <form onSubmit={handleCreateExercise} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nome do Exercício *</label>
            <input 
              type="text" 
              required 
              placeholder="Ex: Supino Inclinado Articulado"
              value={newExerciseForm.name}
              onChange={e => setNewExerciseForm({...newExerciseForm, name: e.target.value})}
              style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Modalidade *</label>
              <select
                value={newExerciseForm.type}
                onChange={e => setNewExerciseForm({...newExerciseForm, type: e.target.value})}
                style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }}
              >
                <option value="Futebol Americano">Futebol Americano</option>
                <option value="Powerlifting">Powerlifting</option>
                <option value="Rugby">Rugby</option>
                <option value="Geral">Força / Geral</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ambiente *</label>
              <select
                value={newExerciseForm.location}
                onChange={e => setNewExerciseForm({...newExerciseForm, location: e.target.value})}
                style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }}
              >
                <option value="GYM">Academia (GYM)</option>
                <option value="HOME">Casa (HOME)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Instruções / Descrição Passo a Passo</label>
            <textarea 
              placeholder="Descreva a execução passo a passo..."
              rows="3"
              value={newExerciseForm.description}
              onChange={e => setNewExerciseForm({...newExerciseForm, description: e.target.value})}
              style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', fontSize: '0.85rem', outline: 'none', resize: 'none', fontFamily: 'var(--font-base)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mecânica do Exercício (Detalhes Técnicos)</label>
            <textarea 
              placeholder="Explique os pontos de performance, ângulos e detalhes biomecânicos..."
              rows="3"
              value={newExerciseForm.mechanics}
              onChange={e => setNewExerciseForm({...newExerciseForm, mechanics: e.target.value})}
              style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', fontSize: '0.85rem', outline: 'none', resize: 'none', fontFamily: 'var(--font-base)' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>URL da Imagem 📸</label>
              <input 
                type="url" 
                placeholder="https://.../img.jpg"
                value={newExerciseForm.imageUrl || ''}
                onChange={e => setNewExerciseForm({...newExerciseForm, imageUrl: e.target.value})}
                style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>URL do GIF 🏃‍♂️</label>
              <input 
                type="url" 
                placeholder="https://.../anim.gif"
                value={newExerciseForm.gifUrl || ''}
                onChange={e => setNewExerciseForm({...newExerciseForm, gifUrl: e.target.value})}
                style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>URL do Vídeo Explicativo (YouTube/Vimeo) 🎥</label>
            <input 
              type="url" 
              placeholder="https://youtube.com/watch?v=..."
              value={newExerciseForm.videoUrl || ''}
              onChange={e => setNewExerciseForm({...newExerciseForm, videoUrl: e.target.value})}
              style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>

          {exerciseFormError && (
            <p style={{ color: 'var(--accent-red)', fontSize: '0.8rem', fontWeight: 'bold', margin: 0 }}>
              ⚠️ {exerciseFormError}
            </p>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button 
              type="button" 
              onClick={() => setShowExerciseModal(false)}
              style={{
                flex: 1,
                padding: '12px',
                background: 'rgba(255,255,255,0.03)',
                color: 'var(--text-secondary)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            >
              CANCELAR
            </button>
            <button 
              type="submit" 
              disabled={creatingExercise}
              style={{
                flex: 2,
                padding: '12px',
                background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
                color: '#000',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: '900',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(34, 197, 94, 0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.2)';
              }}
            >
              {creatingExercise ? 'SALVANDO...' : 'CADASTRAR ATIVIDADE ⚡'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
