"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CoachDashboard() {
  // Session Control
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [coachData, setCoachData] = useState(null);

  // States
  const [library, setLibrary] = useState([]);
  const [sportsFilter, setSportsFilter] = useState('ALL'); // ALL, Futebol Americano, Powerlifting, Rugby
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [workoutPin, setWorkoutPin] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Roster and Assignment target
  const [athletes, setAthletes] = useState([]);
  const [targetType, setTargetType] = useState('ALL'); // ALL, GROUP, INDIVIDUAL
  const [targetPosition, setTargetPosition] = useState('OL');
  const [targetAthleteId, setTargetAthleteId] = useState('');
  const [mvpAthlete, setMvpAthlete] = useState(null);

  // Override Mode
  const [isOverrideMode, setIsOverrideMode] = useState(false);
  const [baseWorkoutId, setBaseWorkoutId] = useState('');
  const [recentWorkouts, setRecentWorkouts] = useState([]);

  // Active builder day selection for quick add
  const [activeDay, setActiveDay] = useState('monday');

  // Custom Exercise creation states
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [newExerciseForm, setNewExerciseForm] = useState({
    name: '',
    type: 'Futebol Americano',
    location: 'GYM',
    description: ''
  });
  const [exerciseFormError, setExerciseFormError] = useState('');
  const [creatingExercise, setCreatingExercise] = useState(false);

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
        setLibrary(prev => [data.exercise, ...prev]);
        setShowExerciseModal(false);
        setNewExerciseForm({
          name: '',
          type: 'Futebol Americano',
          location: 'GYM',
          description: ''
        });
      } else {
        setExerciseFormError(data.error || 'Erro ao salvar exercício.');
      }
    } catch (err) {
      setExerciseFormError('Falha de conexão com o servidor.');
    }
    setCreatingExercise(false);
  };

  const daysOfWeek = [
    { id: 'monday', name: '📅 SEGUNDA-FEIRA (Academia - Força)', color: '#38bdf8', focus: 'Academia (Powerlifting / LPO / Hipertrofia)' },
    { id: 'tuesday', name: '📅 TERÇA-FEIRA (Casa - Estudo/Recup.)', color: '#c084fc', focus: 'Casa (Recuperação / Mobilidade / Playbook)' },
    { id: 'wednesday', name: '📅 QUARTA-FEIRA (Academia - Força)', color: '#38bdf8', focus: 'Academia (Powerlifting / LPO / Hipertrofia)' },
    { id: 'thursday', name: '📅 QUINTA-FEIRA (Casa - Estudo/Recup.)', color: '#c084fc', focus: 'Casa (Recuperação / Mobilidade / Playbook)' },
    { id: 'friday', name: '📅 SEXTA-FEIRA (Academia - Força)', color: '#38bdf8', focus: 'Academia (Powerlifting / LPO / Hipertrofia)' },
    { id: 'saturday', name: '📅 SÁBADO (Campo - Técnico/Tático)', color: '#ef4444', focus: 'Campo (Técnico / Tático / Scrimmage)' }
  ];

  // Resolve Exercise Image from public folder
  const getExerciseImage = (name) => {
    const lowercase = (name || '').toLowerCase();
    if (lowercase.includes('squat')) return '/exercises/back_squat.png';
    if (lowercase.includes('bench') || lowercase.includes('press')) return '/exercises/bench_press.png';
    if (lowercase.includes('sprint') || lowercase.includes('clean') || lowercase.includes('pull')) return '/exercises/sprints.png';
    return null;
  };

  // Load Session and check for override redirection
  useEffect(() => {
    const storedCoach = localStorage.getItem('coach');
    if (storedCoach) {
      const parsedCoach = JSON.parse(storedCoach);
      setCoachData(parsedCoach);
      setIsAuthenticated(true);
    }

    const storedOverride = localStorage.getItem('overrideAthlete');
    if (storedOverride) {
      const athlete = JSON.parse(storedOverride);
      setTargetType('INDIVIDUAL');
      setTargetAthleteId(athlete.id);
      setIsOverrideMode(true);
      setBaseWorkoutId('override-direct'); // Direct custom template
      localStorage.removeItem('overrideAthlete');
    }
  }, []);

  // Fetch Exercises and Roster
  useEffect(() => {
    if (isAuthenticated && coachData) {
      fetch('/api/exercises')
        .then(res => res.json())
        .then(data => {
          if (data.success) setLibrary(data.exercises);
        });

      fetch(`/api/coach/roster?coachId=${coachData.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setAthletes(data.athletes);
            const mvp = data.athletes.find(a => a.isMVP);
            setMvpAthlete(mvp || null);
          }
        });
    }
  }, [isAuthenticated, coachData]);

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
        setCoachData(data.coach);
        localStorage.setItem('coach', JSON.stringify(data.coach));
        setIsAuthenticated(true);
        
        // Dispara evento customizado para notificar Navbar
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('session-update'));
        }
      } else {
        setLoginError(data.error);
      }
    } catch(err) {
      setLoginError("Erro ao se conectar com o servidor.");
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('coach');
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    setCoachData(null);
    setIsAuthenticated(false);
    
    // Notifica Navbar
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('session-update'));
    }
    window.location.reload();
  };

  const addExercise = (ex, dayId) => {
    const targetDay = dayId || activeDay;
    if (!selectedExercises.find(e => e.id === ex.id && e.dayOfWeek === targetDay)) {
      setSelectedExercises([...selectedExercises, { 
        ...ex, 
        dayOfWeek: targetDay, 
        targetSets: 3, 
        targetReps: 10, 
        targetLoad: '' 
      }]);
    }
  };

  const removeExercise = (indexToRemove) => {
    setSelectedExercises(selectedExercises.filter((_, idx) => idx !== indexToRemove));
  };

  const updateParam = (index, field, value) => {
    setSelectedExercises(selectedExercises.map((e, idx) => 
      idx === index ? { ...e, [field]: value } : e
    ));
  };

  const generateWorkout = async () => {
    if (selectedExercises.length === 0) return alert("Adicione exercícios da biblioteca!");
    setLoading(true);
    try {
      const payload = {
        exercises: selectedExercises,
        coachId: coachData.id,
        isOverride: isOverrideMode,
        baseWorkoutId: isOverrideMode ? baseWorkoutId : null
      };

      if (isOverrideMode) {
        payload.athleteId = targetAthleteId;
      } else {
        if (targetType === 'INDIVIDUAL') {
          payload.athleteId = targetAthleteId || null;
        } else if (targetType === 'GROUP') {
          payload.positionGroup = targetPosition;
        }
      }

      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setWorkoutPin(data.workout.pinCode);
        
        // Toca som premium de sucesso na compilação do treino
        if (typeof window !== 'undefined') {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) {
            const context = new AudioCtx();
            const notes = [261.63, 329.63, 392.00, 523.25];
            notes.forEach((freq, idx) => {
              const osc = context.createOscillator();
              const gain = context.createGain();
              osc.connect(gain);
              gain.connect(context.destination);
              osc.type = 'triangle';
              osc.frequency.setValueAtTime(freq, context.currentTime + idx * 0.1);
              gain.gain.setValueAtTime(0.06, context.currentTime + idx * 0.1);
              gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + idx * 0.1 + 0.3);
              osc.start(context.currentTime + idx * 0.1);
              osc.stop(context.currentTime + idx * 0.1 + 0.3);
            });
          }
        }

        // Reset state
        setIsOverrideMode(false);
        setBaseWorkoutId('');
      } else {
        alert("Erro ao gerar treino: " + data.error);
      }
    } catch (e) {
      alert("Falha na conexão.");
    }
    setLoading(false);
  };

  if (!isAuthenticated || !coachData) {
    return (
      <div className="container" style={{ maxWidth: '400px', marginTop: '10vh' }}>
        <div className="card-panel" style={{ textAlign: 'center', border: '1px solid #1e293b' }}>
          <h2 style={{ color: 'var(--primary-color)', marginBottom: '10px', textShadow: '0 0 10px rgba(250,204,21,0.2)' }}>PLAYBOOK LOGIN</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Portal do Corpo Técnico e Personal Trainers.</p>
          
          <form onSubmit={handleLogin}>
            <input 
              type="email" placeholder="E-mail" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '15px', fontSize: '1.1rem', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', marginBottom: '15px' }} 
            />
            <input 
              type="password" placeholder="Senha" required
              value={password} onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '15px', fontSize: '1.1rem', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', marginBottom: '20px' }} 
            />
            {loginError && <p style={{ color: 'var(--accent-red)', marginBottom: '20px', fontWeight: 'bold' }}>{loginError}</p>}
            
            <button type="submit" className="btn" style={{ width: '100%', padding: '15px', fontSize: '1.2rem' }}>
              ENTRAR
            </button>
          </form>
          
          <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link href="/coach/register" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}>Novo na liga? Cadastre-se aqui.</Link>
            <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>&larr; Voltar para Home</Link>
          </div>
        </div>
      </div>
    );
  }

  // Filter library by sport category
  const filteredLibrary = library.filter(ex => {
    if (sportsFilter === 'ALL') return true;
    return ex.type === sportsFilter;
  });

  return (
    <div className="container" style={{ paddingBottom: '70px' }}>
      
      {/* Custom Styles for Playbook Creator HUD */}
      <style dangerouslySetInnerHTML={{__html: `
        .ex-card-gamer {
          background: rgba(6, 10, 20, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 14px;
          overflow: hidden;
          display: grid;
          grid-template-columns: 105px 1fr;
          gap: 15px;
          padding: 15px;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          position: relative;
        }
        .ex-card-gamer:hover {
          transform: translateY(-4px);
          border-color: var(--primary-color);
          background: rgba(6, 10, 20, 0.92);
          box-shadow: 0 8px 25px rgba(249, 115, 22, 0.15);
        }
        .ex-badge-location {
          background: rgba(249, 115, 22, 0.12);
          color: var(--primary-color);
          border: 1px solid rgba(249, 115, 22, 0.25);
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.62rem;
          font-weight: 900;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .ex-btn-day {
          background: rgba(255, 255, 255, 0.03);
          color: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          padding: 4px 6px;
          font-size: 0.62rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          flex: 1;
          text-align: center;
        }
        .ex-btn-day:hover {
          color: #fff;
          border-color: var(--primary-color);
          background: rgba(249, 115, 22, 0.1);
          box-shadow: 0 0 8px rgba(249, 115, 22, 0.25);
        }
        
        .weekly-chalkboard-gamer {
          background: #04070e;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5), 0 0 30px rgba(249, 115, 22, 0.03);
          position: relative;
        }
        
        .day-container-gamer {
          background: rgba(6, 10, 20, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 15px;
          transition: all 0.3s;
        }
        .day-container-gamer:hover {
          border-color: rgba(255, 255, 255, 0.06);
          background: rgba(6, 10, 20, 0.6);
        }
        
        .exercise-row-gamer {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          background: rgba(2, 3, 6, 0.8);
          padding: 10px 14px;
          border-radius: 8px;
          gap: 10px;
          transition: all 0.2s;
        }
        .exercise-row-gamer:hover {
          background: rgba(2, 3, 6, 0.95);
          transform: translateX(2px);
        }
        
        .hud-input {
          width: 48px;
          padding: 6px 4px;
          background: #000;
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 6px;
          text-align: center;
          font-size: 0.82rem;
          font-family: var(--font-display), monospace;
          outline: none;
          transition: all 0.2s;
        }
        .hud-input:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 8px rgba(249, 115, 22, 0.3);
        }
      `}} />

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

      {/* Grid structure: Official Library Catalog (Inspired by programs layout in Image 2) */}
      <div style={{ marginBottom: '50px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, fontFamily: 'var(--font-display)', fontWeight: '800' }}>
            BIBLIOTECA OFICIAL
          </h3>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Sport Filters (todos, futebol americano, powerlifting, rugby) */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['ALL', 'Futebol Americano', 'Powerlifting', 'Rugby'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSportsFilter(cat)}
                  style={{
                    padding: '6px 14px',
                    background: sportsFilter === cat ? 'var(--primary-color)' : 'transparent',
                    color: sportsFilter === cat ? '#000' : 'var(--text-secondary)',
                    border: `1.5px solid ${sportsFilter === cat ? 'var(--primary-color)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {cat === 'ALL' ? 'TODOS' : cat}
                </button>
              ))}
            </div>

            {/* [+ CADASTRAR EXERCÍCIO] Dynamic add trigger button */}
            <button
              onClick={() => setShowExerciseModal(true)}
              style={{
                padding: '6px 16px',
                background: 'rgba(34, 197, 94, 0.12)',
                color: '#22c55e',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.72rem',
                fontWeight: '900',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#22c55e';
                e.currentTarget.style.color = '#000';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(34, 197, 94, 0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(34, 197, 94, 0.12)';
                e.currentTarget.style.color = '#22c55e';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              ➕ CADASTRAR EXERCÍCIO
            </button>
          </div>
        </div>

        {/* Exercises Catalog Horizontal Cards Grid */}
        <div className="ex-grid">
          {filteredLibrary.map(ex => {
            const imgSrc = getExerciseImage(ex.name);
            return (
              <div key={ex.id} className="ex-card-gamer">
                {/* Left side card image box */}
                <div className="ex-image-container">
                  {imgSrc ? (
                    <img src={imgSrc} alt={ex.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '2.2rem' }}>🏋️</span>
                  )}
                </div>

                {/* Right side card details column */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <strong style={{ fontSize: '0.95rem', color: '#fff', letterSpacing: '0.3px' }}>{ex.name}</strong>
                      <span className="ex-badge-location">
                        {ex.location}
                      </span>
                    </div>
                    <span style={{ display: 'block', fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', marginBottom: '5px', textTransform: 'uppercase' }}>
                      // MODALIDADE: {ex.type}
                    </span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '10px' }}>
                      {ex.description || 'Instruções técnicas para otimização da rota de força tática.'}
                    </p>
                  </div>

                  {/* Add buttons mapped at bottom of text */}
                  <div>
                    <span style={{ display: 'block', fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', fontWeight: '900', marginBottom: '5px', letterSpacing: '0.5px' }}>
                      // AGENDAR PARA DIA:
                    </span>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      <button onClick={() => addExercise(ex, 'monday')} className="ex-btn-day">SEG</button>
                      <button onClick={() => addExercise(ex, 'tuesday')} className="ex-btn-day">TER</button>
                      <button onClick={() => addExercise(ex, 'wednesday')} className="ex-btn-day">QUA</button>
                      <button onClick={() => addExercise(ex, 'thursday')} className="ex-btn-day">QUI</button>
                      <button onClick={() => addExercise(ex, 'friday')} className="ex-btn-day">SEX</button>
                      <button onClick={() => addExercise(ex, 'saturday')} className="ex-btn-day">SÁB</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredLibrary.length === 0 && (
            <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', border: '1.5px dashed rgba(255,255,255,0.05)', borderRadius: '14px' }}>
              Nenhum exercício encontrado nesta modalidade.
            </div>
          )}
        </div>
      </div>

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
          <div className="weekly-chalkboard-gamer">
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
                {selectedExercises.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-secondary)', border: '2px dashed rgba(255,255,255,0.04)', borderRadius: '12px' }}>
                    <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '10px' }}>📋</span>
                    <p style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: 0 }}>Chalkboard Semanal Vazio</p>
                    <p style={{ fontSize: '0.75rem', marginTop: '5px' }}>Adicione exercícios da biblioteca no topo para montar a grade semanal.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {daysOfWeek.map(day => {
                      const dayExs = selectedExercises.filter(e => e.dayOfWeek === day.id);
                      if (dayExs.length === 0) return null;

                      return (
                        <div key={day.id} className="day-container-gamer">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${day.color}`, paddingBottom: '6px', marginBottom: '12px' }}>
                            <span style={{ color: day.color, fontSize: '0.9rem', fontWeight: 'bold' }}>{day.name}</span>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{day.focus}</span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {selectedExercises.map((ex, idx) => {
                              if (ex.dayOfWeek !== day.id) return null;
                              return (
                                <div key={`${ex.id}-${idx}`} className="exercise-row-gamer" style={{ borderLeft: `3px solid ${day.color}` }}>
                                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff', flexGrow: 1, minWidth: '150px' }}>{ex.name}</span>
                                  
                                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                      <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>SÉRIES</span>
                                      <input type="number" value={ex.targetSets} onChange={e => updateParam(idx, 'targetSets', e.target.value)} className="hud-input" />
                                    </div>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', alignSelf: 'flex-end', paddingBottom: '5px' }}>x</span>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                      <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>REPS</span>
                                      <input type="number" value={ex.targetReps} onChange={e => updateParam(idx, 'targetReps', e.target.value)} className="hud-input" />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                      <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>CARGA (KG)</span>
                                      <input type="number" placeholder="Auto" value={ex.targetLoad} onChange={e => updateParam(idx, 'targetLoad', e.target.value)} className="hud-input" style={{ width: '55px' }} />
                                    </div>
                                    <button onClick={() => removeExercise(idx)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: '1rem', padding: '2px 5px', alignSelf: 'center', marginTop: '10px', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>✖</button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
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
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: REGISTRAR NOVO EXERCÍCIO */}
      {showExerciseModal && (
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
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Instruções / Descrição</label>
                <textarea 
                  placeholder="Descreva a execução técnica do exercício..."
                  rows="3"
                  value={newExerciseForm.description}
                  onChange={e => setNewExerciseForm({...newExerciseForm, description: e.target.value})}
                  style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', fontSize: '0.85rem', outline: 'none', resize: 'none', fontFamily: 'var(--font-base)' }}
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
      )}
    </div>
  );
}
