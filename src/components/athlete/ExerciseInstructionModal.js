export default function ExerciseInstructionModal({ selectedEx, onClose }) {
  if (!selectedEx) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100vw', height: '100vh',
      background: 'rgba(8, 8, 8, 0.94)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="hud-panel-cut" style={{
        maxWidth: '520px',
        width: '100%',
        background: '#080c18',
        border: '2px solid #06b6d4',
        boxShadow: '0 0 35px rgba(6, 182, 212, 0.3)',
        position: 'relative',
        padding: '25px',
        clipPath: 'none'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '1.5rem',
            cursor: 'pointer'
          }}
        >
          ✖
        </button>

        <h3 style={{ color: '#06b6d4', marginBottom: '5px', fontSize: '1.8rem', letterSpacing: '1px', textShadow: '0 0 10px rgba(6,182,212,0.3)' }}>
          {selectedEx.name.toUpperCase()}
        </h3>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <span style={{ padding: '3px 8px', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid #06b6d4', color: '#06b6d4', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {selectedEx.type}
          </span>
          <span style={{ padding: '3px 8px', background: 'rgba(255,255,255,0.06)', color: '#a1a1aa', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
            LOCAL: {selectedEx.location}
          </span>
        </div>

        <div style={{ 
          position: 'relative', 
          width: '100%', 
          background: '#02040a', 
          borderRadius: '8px', 
          overflow: 'hidden', 
          border: '1px solid rgba(6, 182, 212, 0.3)',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Media Container */}
          {(selectedEx.imageUrl || selectedEx.gifUrl || selectedEx.mediaUrl) ? (
            <div style={{ width: '100%', maxHeight: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', padding: '10px' }}>
              <img 
                src={selectedEx.gifUrl || selectedEx.imageUrl || selectedEx.mediaUrl} 
                alt={selectedEx.name} 
                loading="lazy"
                decoding="async"
                style={{ maxWidth: '100%', maxHeight: '230px', objectFit: 'contain', borderRadius: '4px' }} 
              />
            </div>
          ) : (
            <div style={{ width: '100%', height: '140px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)',
                backgroundSize: '20px 20px', pointerEvents: 'none'
              }}></div>
              <span style={{ fontStyle: 'italic', color: '#475569', fontSize: '0.8rem', zIndex: 1 }}>[Prancheta Técnica Digital Sem Mídia]</span>
            </div>
          )}

          {/* Video Link */}
          {selectedEx.videoUrl && (
            <div style={{ width: '100%', padding: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(239, 68, 68, 0.05)', textAlign: 'center' }}>
              <a 
                href={selectedEx.videoUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ color: '#ef4444', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                ▶️ ASSISTIR VÍDEO EXPLICATIVO COMPLETO
              </a>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <h4 style={{ color: '#fff', marginBottom: '6px', fontSize: '0.95rem' }}>Instruções / Descrição</h4>
            <p style={{ color: '#a1a1aa', lineHeight: '1.6', fontSize: '0.85rem', margin: 0 }}>
              {selectedEx.description || 'Nenhuma instrução cadastrada.'}
            </p>
          </div>

          <div>
            <h4 style={{ color: '#06b6d4', marginBottom: '6px', fontSize: '0.95rem' }}>Mecânica de Execução (Detalhes)</h4>
            <p style={{ color: '#94a3b8', fontStyle: 'italic', lineHeight: '1.6', fontSize: '0.85rem', margin: 0 }}>
              {selectedEx.mechanics || 'Nenhuma mecânica técnica detalhada.'}
            </p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="btn" 
          style={{ width: '100%', marginTop: '22px', padding: '12px', fontWeight: 'bold', background: '#06b6d4', color: '#000' }}
        >
          ENTENDIDO, VOLTAR AO TREINO
        </button>
      </div>
    </div>
  );
}
