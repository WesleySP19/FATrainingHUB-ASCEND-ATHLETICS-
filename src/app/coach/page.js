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

  const daysOfWeek = [
    { id: 'monday', name: '📅 SEGUNDA-FEIRA (Academia - Força)', color: '#38bdf8', focus: 'Academia (Powerlifting / LPO / Hipertrofia)' },
    { id: 'tuesday', name: '📅 TERÇA-FEIRA (Casa - Estudo/Recup.)', color: '#c084fc', focus: 'Casa (Recuperação / Mobilidade / Playbook)' },
    { id: 'wednesday', name: '📅 QUARTA-FEIRA (Academia - Força)', color: '#38bdf8', focus: 'Academia (Powerlifting / LPO / Hipertrofia)' },
    { id: 'thursday', name: '📅 QUINTA-FEIRA (Casa - Estudo/Recup.)', color: '#c084fc', focus: 'Casa (Recuperação / Mobilidade / Playbook)' },
    { id: 'friday', name: '📅 SEXTA-FEIRA (Academia - Força)', color: '#38bdf8', focus: 'Academia (Powerlifting / LPO / Hipertrofia)' },
    { id: 'saturday', name: '📅 SÁBADO (Campo - Técnico/Tático)', color: '#ef4444', focus: 'Campo (Técnico / Tático / Scrimmage)' }
  ];

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

      fetchRecentWorkouts();
    }
  }, [isAuthenticated, coachData]);

  const fetchRecentWorkouts = async () => {
    try {
      const res = await fetch('/api/workouts?limit=5'); // Fetch general recent list or check DB workouts
      // For simplicity, we can fetch all workouts and filter or display
    } catch(e) {}
  };

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

  const handleStartOverride = (workout) => {
    setIsOverrideMode(true);
    setBaseWorkoutId(workout.id);
    setTargetAthleteId(workout.athleteId || '');
    // Pre-populate exercises
    const mapped = workout.sets.map(s => ({
      id: s.exerciseId,
      name: s.exerciseName,
      dayOfWeek: s.dayOfWeek || 'monday',
      targetSets: s.targetSets,
      targetReps: s.targetReps,
      targetLoad: s.targetLoad || ''
    }));
    setSelectedExercises(mapped);
    setWorkoutPin(null);
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
    <div className="container" style={{ paddingBottom: '50px' }}>
      
      {/* Navbar */}
      <nav style={{ padding: 'var(--spacing-md) 0', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ color: 'var(--primary-color)', margin: 0 }}>FA COACH PLAYBOOK</h2>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {coachData.teamName ? `${coachData.teamName} - ` : ''}HC: {coachData.name}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link href="/coach/roster" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}>ROSTER & CARGA ACWR 📋</Link>
          <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1rem' }}>
            &larr; Sair
          </button>
        </div>
      </nav>

      {/* Override Alert Notification */}
      {isOverrideMode && (
        <div style={{ marginTop: '15px', padding: '12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#ef4444', fontWeight: 'bold' }}>
            ⚠️ Modo de Sobrescrita Individual (Override) ativo para o atleta selecionado.
          </span>
          <button onClick={() => { setIsOverrideMode(false); setBaseWorkoutId(''); setSelectedExercises([]); }} style={{ background: 'transparent', color: '#fff', border: '1px solid #fff', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}>
            Cancelar Override
          </button>
        </div>
      )}

      {/* Main Grid */}
      <main style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '25px', marginTop: 'var(--spacing-lg)' }}>
        
        {/* Left Column: Exercises Library */}
        <section className="card-panel" style={{ height: 'fit-content', border: '1px solid #1e293b' }}>
          <h3 style={{ marginBottom: '10px' }}>Biblioteca Oficial</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '15px' }}>
            Selecione a categoria e clique nos blocos de treino para empilhar.
          </p>

          {/* Sport Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
            {['ALL', 'Futebol Americano', 'Powerlifting', 'Rugby'].map(cat => (
              <button
                key={cat}
                onClick={() => setSportsFilter(cat)}
                style={{
                  padding: '8px 12px',
                  background: sportsFilter === cat ? 'var(--primary-color)' : '#000',
                  color: sportsFilter === cat ? '#000' : '#fff',
                  border: '1px solid var(--primary-color)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}
              >
                {cat === 'ALL' ? 'TODOS' : cat.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Active Target Day Selector */}
          <div style={{ background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #334155' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px', fontWeight: 'bold' }}>
              DIA DE DESTINO ATIVO:
            </label>
            <select
              value={activeDay}
              onChange={(e) => setActiveDay(e.target.value)}
              style={{ width: '100%', padding: '8px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', fontSize: '0.9rem' }}
            >
              {daysOfWeek.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Exercises Catalog */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '500px', overflowY: 'auto', paddingRight: '5px' }}>
            {filteredLibrary.map(ex => (
              <div
                key={ex.id}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  padding: '12px',
                  borderRadius: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '0.95rem' }}>{ex.name}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                    {ex.location}
                  </span>
                </div>
                
                {/* Dynamic Day Add Buttons */}
                <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                  <button onClick={() => addExercise(ex, 'monday')} className="btn" style={{ padding: '4px 6px', fontSize: '0.65rem', background: '#0284c7', color: '#fff' }}>+ Seg</button>
                  <button onClick={() => addExercise(ex, 'tuesday')} className="btn" style={{ padding: '4px 6px', fontSize: '0.65rem', background: '#7c3aed', color: '#fff' }}>+ Ter</button>
                  <button onClick={() => addExercise(ex, 'wednesday')} className="btn" style={{ padding: '4px 6px', fontSize: '0.65rem', background: '#0284c7', color: '#fff' }}>+ Qua</button>
                  <button onClick={() => addExercise(ex, 'thursday')} className="btn" style={{ padding: '4px 6px', fontSize: '0.65rem', background: '#7c3aed', color: '#fff' }}>+ Qui</button>
                  <button onClick={() => addExercise(ex, 'friday')} className="btn" style={{ padding: '4px 6px', fontSize: '0.65rem', background: '#0284c7', color: '#fff' }}>+ Sex</button>
                  <button onClick={() => addExercise(ex, 'saturday')} className="btn" style={{ padding: '4px 6px', fontSize: '0.65rem', background: '#dc2626', color: '#fff' }}>+ Sáb</button>
                </div>
              </div>
            ))}
            {filteredLibrary.length === 0 && <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Nenhum exercício encontrado...</p>}
          </div>
        </section>

        {/* Right Column: Modular Prescription Panel */}
        <section className="card-panel" style={{ border: '1px solid #1e293b' }}>
          <h3 style={{ marginBottom: '15px' }}>Prescrição Modulada</h3>
          
          {workoutPin ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <h4 style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>ID DO TREINO GERADO (HASH)</h4>
              <div style={{ fontSize: '4rem', color: 'var(--primary-color)', letterSpacing: '5px', fontFamily: 'var(--font-display)', textShadow: '0 0 20px rgba(250,204,21,0.5)' }}>
                {workoutPin}
              </div>
              <p style={{ marginTop: '20px', color: 'var(--accent-green)', fontWeight: 'bold' }}>Treino sincronizado na nuvem com sucesso!</p>
              <button onClick={() => { setWorkoutPin(null); setSelectedExercises([]); }} className="btn" style={{ marginTop: '30px', padding: '10px 20px' }}>NOVA PRESCRIÇÃO</button>
            </div>
          ) : (
            <>
              {/* Target/Assignment Settings */}
              {!isOverrideMode && (
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '15px', borderRadius: '8px', border: '1px solid #334155', marginBottom: '20px' }}>
                  <label style={{ display: 'block', color: 'var(--primary-color)', fontWeight: 'bold', marginBottom: '8px', fontSize: '0.85rem' }}>
                    DIRECIONAMENTO DO TREINO (COLETIVO VS INDIVIDUAL)
                  </label>
                  
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setTargetType('ALL')}
                      style={{ flexGrow: 1, padding: '10px', fontSize: '0.8rem', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', background: targetType === 'ALL' ? '#334155' : '#000', color: '#fff', border: '1px solid #475569' }}
                    >GERAL</button>
                    <button
                      type="button"
                      onClick={() => setTargetType('GROUP')}
                      style={{ flexGrow: 1, padding: '10px', fontSize: '0.8rem', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', background: targetType === 'GROUP' ? '#334155' : '#000', color: '#fff', border: '1px solid #475569' }}
                    >GRUPO DE POSIÇÃO</button>
                    <button
                      type="button"
                      onClick={() => setTargetType('INDIVIDUAL')}
                      style={{ flexGrow: 1, padding: '10px', fontSize: '0.8rem', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', background: targetType === 'INDIVIDUAL' ? '#334155' : '#000', color: '#fff', border: '1px solid #475569' }}
                    >ATLETA INDIVIDUAL</button>
                  </div>

                  {targetType === 'GROUP' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '5px' }}>Selecionar Posição:</label>
                      <select value={targetPosition} onChange={e => setTargetPosition(e.target.value)} style={{ width: '100%', padding: '10px', background: '#000', color: '#fff', border: '1px solid #475569', borderRadius: '4px' }}>
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
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '5px' }}>Selecionar Atleta:</label>
                      <select value={targetAthleteId} onChange={e => setTargetAthleteId(e.target.value)} style={{ width: '100%', padding: '10px', background: '#000', color: '#fff', border: '1px solid #475569', borderRadius: '4px' }}>
                        <option value="">-- Escolha o Atleta --</option>
                        {athletes.map(a => (
                          <option key={a.id} value={a.id}>{a.name} ({a.position})</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Overrides Target Detail */}
              {isOverrideMode && (
                <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '15px', borderRadius: '8px', border: '1px solid #ef4444', marginBottom: '20px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                    SOBRESCREVENDO PARA:
                  </span>
                  <select disabled value={targetAthleteId} style={{ width: '100%', padding: '10px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', opacity: 0.7 }}>
                    {athletes.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.position})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Render Selected Exercises by Day */}
              {selectedExercises.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)', border: '2px dashed rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                  <p style={{ fontSize: '1.2rem', margin: 0 }}>Nenhum exercício adicionado.</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '10px' }}>Selecione o dia na esquerda e adicione exercícios para compor a grade semanal.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {daysOfWeek.map(day => {
                    const dayExs = selectedExercises.filter(e => e.dayOfWeek === day.id);
                    if (dayExs.length === 0) return null;

                    return (
                      <div key={day.id} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `2px solid ${day.color}`, paddingBottom: '5px', marginBottom: '12px' }}>
                          <h4 style={{ color: day.color, marginTop: 0, marginBottom: 0, fontSize: '1.05rem', letterSpacing: '1px' }}>
                            {day.name}
                          </h4>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{day.focus}</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {selectedExercises.map((ex, index) => {
                            if (ex.dayOfWeek !== day.id) return null;

                            return (
                              <div
                                key={`${ex.id}-${index}`}
                                style={{
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  background: 'rgba(0,0,0,0.3)',
                                  padding: '12px',
                                  borderRadius: '6px',
                                  borderLeft: `3px solid ${day.color}`,
                                  gap: '10px'
                                }}
                              >
                                <span style={{ fontSize: '0.95rem', fontWeight: 'bold', flex: 1, minWidth: '150px' }}>
                                  {ex.name}
                                </span>

                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  {/* Sets */}
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>Sets</span>
                                    <input 
                                      type="number" 
                                      value={ex.targetSets} 
                                      onChange={(e) => updateParam(index, 'targetSets', e.target.value)} 
                                      style={{ width: '45px', padding: '6px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', textAlign: 'center' }} 
                                    />
                                  </div>

                                  <span style={{ color: 'var(--text-secondary)', alignSelf: 'flex-end', paddingBottom: '8px' }}>x</span>

                                  {/* Reps */}
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>Reps</span>
                                    <input 
                                      type="number" 
                                      value={ex.targetReps} 
                                      onChange={(e) => updateParam(index, 'targetReps', e.target.value)} 
                                      style={{ width: '45px', padding: '6px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', textAlign: 'center' }} 
                                    />
                                  </div>

                                  {/* Load */}
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>Carga (kg)</span>
                                    <input 
                                      type="number" 
                                      placeholder="Auto"
                                      value={ex.targetLoad} 
                                      onChange={(e) => updateParam(index, 'targetLoad', e.target.value)} 
                                      style={{ width: '60px', padding: '6px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', textAlign: 'center' }} 
                                    />
                                  </div>

                                  <button 
                                    onClick={() => removeExercise(index)} 
                                    style={{ background: 'transparent', color: 'var(--accent-red)', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '5px 10px', marginTop: '15px' }}
                                    title="Remover"
                                  >
                                    ✖
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  <button 
                    onClick={generateWorkout} 
                    disabled={loading} 
                    className="btn" 
                    style={{ marginTop: '10px', width: '100%', fontSize: '1.2rem', padding: '16px', fontWeight: 'bold' }}
                  >
                    {loading ? 'SINCRONIZANDO COM A NUVEM...' : (isOverrideMode ? 'SALVAR SOBRESCRITA (OVERRIDE)' : 'GERAR ID DO TREINO')}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
