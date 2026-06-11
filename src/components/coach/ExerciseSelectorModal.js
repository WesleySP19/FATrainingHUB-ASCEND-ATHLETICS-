import { useState } from 'react';

export default function ExerciseSelectorModal({ 
  showModal, 
  setShowModal, 
  library, 
  onSelectExercise 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, Futebol Americano, Powerlifting, Rugby

  if (!showModal) return null;

  const filteredExercises = library.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || ex.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{ padding: '25px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, color: 'var(--primary-color)', fontFamily: 'var(--font-display)', letterSpacing: '1px' }}>
              Selecionar Exercício
            </h2>
            <p style={{ margin: '5px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Puxe um exercício já cadastrado na sua Biblioteca
            </p>
          </div>
          <button 
            onClick={() => setShowModal(false)}
            style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>

        {/* Search & Filters */}
        <div style={{ padding: '20px 25px', display: 'flex', gap: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <input 
            type="text" 
            placeholder="Buscar por nome..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 15px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(0,0,0,0.3)',
              color: '#fff',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: '12px 15px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(0,0,0,0.3)',
              color: '#fff',
              fontSize: '0.9rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">Todas Categorias</option>
            <option value="Futebol Americano">Futebol Americano</option>
            <option value="Powerlifting">Powerlifting</option>
            <option value="Rugby">Rugby</option>
          </select>
        </div>

        {/* List of Exercises */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 25px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px' }}>
          {filteredExercises.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              Nenhum exercício encontrado.
            </div>
          ) : (
            filteredExercises.map(ex => (
              <div 
                key={ex.id}
                onClick={() => {
                  onSelectExercise(ex);
                  setShowModal(false);
                }}
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '16px',
                  padding: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--primary-color)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {ex.imageUrl && (
                  <img src={ex.imageUrl} alt={ex.name} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} />
                )}
                <h4 style={{ margin: '0 0 5px 0', color: '#fff', fontSize: '1rem' }}>{ex.name}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span>{ex.type}</span>
                  <span style={{ 
                    background: ex.location === 'GYM' ? 'rgba(234, 88, 12, 0.2)' : 'rgba(16, 185, 129, 0.2)', 
                    color: ex.location === 'GYM' ? '#ea580c' : '#10b981',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {ex.location}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
