"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Training() {
  const [pin, setPin] = useState('');
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Microcycle day management
  const [selectedDay, setSelectedDay] = useState('monday');
  const [todayDayName, setTodayDayName] = useState('monday');

  // Strength Rest Timer States
  const [timerSeconds, setTimerSeconds] = useState(90);
  const [timerActive, setTimerActive] = useState(false);
  const [timerMax, setTimerMax] = useState(90);

  // Wellness Form States (Tue/Thu)
  const [sleepScore, setSleepScore] = useState(4);
  const [painScore, setPainScore] = useState(2);
  const [wellnessSaved, setWellnessSaved] = useState(false);

  // Field RPE States (Sat)
  const [rpeScore, setRpeScore] = useState(7);
  const [fieldCompleted, setFieldCompleted] = useState(false);

  // Gym actual loads
  const [actualLoads, setActualLoads] = useState({});
  const [finished, setFinished] = useState(false);

  // Instruction Modal states
  const [selectedEx, setSelectedEx] = useState(null);
  const [loadingEx, setLoadingEx] = useState(false);
  
  // Interactive recovery video and animated playbook states
  const [playRecoveryVideo, setPlayRecoveryVideo] = useState(false);
  const [animatePlaybook, setAnimatePlaybook] = useState(false);

  const getActiveMuscles = () => {
    const active = { chest: false, back: false, shoulders: false, arms: false, legs: false, core: false };
    if (!workout) return active;
    
    const daySets = workout.sets.filter(s => s.dayOfWeek === selectedDay);
    daySets.forEach(set => {
      const name = set.exerciseName.toLowerCase();
      if (name.includes('supino') || name.includes('bench') || name.includes('chest') || name.includes('peito') || name.includes('crucifixo') || name.includes('flexão') || name.includes('push')) {
        active.chest = true;
      }
      if (name.includes('agachamento') || name.includes('squat') || name.includes('leg') || name.includes('quad') || name.includes('panturrilha') || name.includes('calf') || name.includes('afundo') || name.includes('lunge') || name.includes('terra') || name.includes('deadlift') || name.includes('stiff')) {
        active.legs = true;
      }
      if (name.includes('remada') || name.includes('row') || name.includes('pull') || name.includes('costas') || name.includes('lat') || name.includes('chin') || name.includes('terra') || name.includes('deadlift')) {
        active.back = true;
      }
      if (name.includes('desenvolvimento') || name.includes('shoulder') || name.includes('press') || name.includes('elevação') || name.includes('ombro') || name.includes('deltoid')) {
        active.shoulders = true;
      }
      if (name.includes('rosca') || name.includes('curl') || name.includes('triceps') || name.includes('biceps') || name.includes('braço') || name.includes('arm') || name.includes('testa')) {
        active.arms = true;
      }
      if (name.includes('abdominal') || name.includes('crunch') || name.includes('prancha') || name.includes('plank') || name.includes('core') || name.includes('ab')) {
        active.core = true;
      }
    });
    return active;
  };
  const activeMuscles = getActiveMuscles();

  const daysOfWeek = [
    { id: 'monday', label: 'SEG', name: 'Segunda-Feira', type: 'GYM', theme: 'Força & Carga' },
    { id: 'tuesday', label: 'TER', name: 'Terça-Feira', type: 'HOME', theme: 'Recuperação & Playbook' },
    { id: 'wednesday', label: 'QUA', name: 'Quarta-Feira', type: 'GYM', theme: 'Força & Carga' },
    { id: 'thursday', label: 'QUI', name: 'Quinta-Feira', type: 'HOME', theme: 'Recuperação & Playbook' },
    { id: 'friday', label: 'SEX', name: 'Sexta-Feira', type: 'GYM', theme: 'Força & Carga' },
    { id: 'saturday', label: 'SAB', name: 'Sábado', type: 'FIELD', theme: 'Campo (Chalkboard)' },
    { id: 'sunday', label: 'DOM', name: 'Domingo', type: 'REST', theme: 'Descanso Ativo' }
  ];

  const syncOfflineQueue = async () => {
    if (typeof window === 'undefined' || !navigator.onLine) return;
    const queue = JSON.parse(localStorage.getItem('ascend_offline_queue') || '[]');
    if (queue.length === 0) return;

    console.log(`Sincronizando ${queue.length} treino(s) pendente(s) offline...`);
    const successfulIndexes = [];

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      try {
        const res = await fetch(item.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.body)
        });
        const data = await res.json();
        if (data.success) {
          successfulIndexes.push(i);
        }
      } catch (e) {
        console.error("Falha ao sincronizar item offline:", e);
      }
    }

    const remainingQueue = queue.filter((_, idx) => !successfulIndexes.includes(idx));
    localStorage.setItem('ascend_offline_queue', JSON.stringify(remainingQueue));
    if (successfulIndexes.length > 0) {
      alert(`${successfulIndexes.length} treino(s) de performance salvo(s) offline foi/foram sincronizado(s) com sucesso!`);
    }
  };

  // Auto-load PIN from URL and set today's day of week
  useEffect(() => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDayName = days[new Date().getDay()];
    setTodayDayName(currentDayName);
    setSelectedDay(currentDayName);

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const pinParam = urlParams.get('pin');
      if (pinParam && pinParam.length >= 6) {
        setPin(pinParam.toUpperCase());
        autoLoadWorkout(pinParam.toUpperCase());
      }
      
      syncOfflineQueue();
      window.addEventListener('online', syncOfflineQueue);
      return () => window.removeEventListener('online', syncOfflineQueue);
    }
  }, []);

  // Rest Timer countdown logic
  useEffect(() => {
    let interval = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
      if (typeof window !== 'undefined' && window.navigator?.vibrate) {
        window.navigator.vibrate([200, 100, 200]);
      }
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const autoLoadWorkout = async (pinCode) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/workouts/${pinCode}`);
      const data = await res.json();
      if (data.success) {
        setWorkout(data.workout);
      } else {
        setError(data.message || "Erro ao buscar o microciclo semanal.");
      }
    } catch (e) {
      setError("Sem conexão com o servidor.");
    }
    setLoading(false);
  };

  const loadWorkout = async () => {
    if (pin.length < 6) return setError("O ID do treino possui no mínimo 6 caracteres.");
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/workouts/${pin.toUpperCase()}`);
      const data = await res.json();
      if (data.success) {
        setWorkout(data.workout);
      } else {
        setError(data.message || "Erro ao buscar o microciclo semanal.");
      }
    } catch (e) {
      setError("Sem conexão com o servidor.");
    }
    setLoading(false);
  };

  const handleLoadChange = (setId, val) => {
    setActualLoads(prev => ({
      ...prev,
      [setId]: val
    }));
  };

  const triggerResetTimer = (seconds = 90) => {
    setTimerMax(seconds);
    setTimerSeconds(seconds);
    setTimerActive(true);
  };

  // Submit Gym session
  const finishGymWorkout = async () => {
    const athleteStorage = localStorage.getItem('athlete');
    let athleteId = null;
    if (athleteStorage) {
      const athleteData = JSON.parse(athleteStorage);
      athleteId = athleteData.id;
    }

    const payload = { athleteId, actualLoads };
    const url = `/api/workouts/${pin.toUpperCase()}/finish`;

    if (typeof window !== 'undefined' && !navigator.onLine) {
      const queue = JSON.parse(localStorage.getItem('ascend_offline_queue') || '[]');
      queue.push({ url, body: payload });
      localStorage.setItem('ascend_offline_queue', JSON.stringify(queue));
      alert("Treino salvo offline no dispositivo! Será sincronizado automaticamente assim que recuperar a conexão.");
      setFinished(true);
      return;
    }

    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch(e) {
      console.error(e);
      const queue = JSON.parse(localStorage.getItem('ascend_offline_queue') || '[]');
      queue.push({ url, body: payload });
      localStorage.setItem('ascend_offline_queue', JSON.stringify(queue));
      alert("Treino salvo offline devido a falha de conexão.");
    }
    setFinished(true);
  };

  // Submit Wellness Form
  const saveWellnessScore = () => {
    setWellnessSaved(true);
    alert(`Métricas de Bem-estar salvas!\nSono: ${sleepScore}/5 | Fadiga/Dor: ${painScore}/5`);
  };

  // Submit Saturday Field Workout
  const finishFieldWorkout = async () => {
    setFieldCompleted(true);
    const athleteStorage = localStorage.getItem('athlete');
    let athleteId = null;
    if (athleteStorage) {
      const athleteData = JSON.parse(athleteStorage);
      athleteId = athleteData.id;
    }

    const payload = { 
      athleteId, 
      actualLoads: {}, 
      wellnessFeedback: { sleepScore, painScore },
      fieldRPE: rpeScore 
    };
    const url = `/api/workouts/${pin.toUpperCase()}/finish`;

    if (typeof window !== 'undefined' && !navigator.onLine) {
      const queue = JSON.parse(localStorage.getItem('ascend_offline_queue') || '[]');
      queue.push({ url, body: payload });
      localStorage.setItem('ascend_offline_queue', JSON.stringify(queue));
      alert("Treino de campo salvo offline! Será sincronizado automaticamente assim que recuperar a conexão.");
      setFinished(true);
      return;
    }

    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch(e) {
      console.error(e);
      const queue = JSON.parse(localStorage.getItem('ascend_offline_queue') || '[]');
      queue.push({ url, body: payload });
      localStorage.setItem('ascend_offline_queue', JSON.stringify(queue));
      alert("Treino de campo salvo offline devido a falha de conexão.");
    }
    alert(`Treino de Campo concluído! RPE da Sessão: ${rpeScore}/10`);
    setFinished(true);
  };

  const openExerciseModal = async (exerciseId) => {
    setLoadingEx(true);
    try {
      const res = await fetch(`/api/exercises/${exerciseId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedEx(data.exercise);
      } else {
        alert("Erro ao buscar instruções: " + data.error);
      }
    } catch (e) {
      alert("Erro ao conectar com a biblioteca.");
    }
    setLoadingEx(false);
  };

  const handleReschedule = async (newDay) => {
    if (!workout || !selectedDay) return;
    if (newDay === selectedDay) return;

    const fromLabel = daysOfWeek.find(d => d.id === selectedDay)?.label || selectedDay;
    const toLabel = daysOfWeek.find(d => d.id === newDay)?.label || newDay;

    if (!confirm(`Deseja mover todos os treinos de ${fromLabel} para ${toLabel}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/workouts/${workout.pinCode.toUpperCase()}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromDay: selectedDay, toDay: newDay })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        autoLoadWorkout(workout.pinCode);
        setSelectedDay(newDay);
      } else {
        alert("Erro ao reagendar: " + data.error);
      }
    } catch (e) {
      alert("Erro de conexão ao reagendar.");
    }
  };

  if (finished) {
    if (typeof window !== 'undefined') {
      window.location.href = `/locker?pin=${pin.toUpperCase()}`;
    }
    return <div style={{ textAlign: 'center', padding: '100px', color: '#fff', fontSize: '1.2rem' }}>Carregando Vestiário de Performance...</div>;
  }

  // Filter sets for current day of week
  const currentDaySets = workout ? workout.sets.filter(s => s.dayOfWeek === selectedDay) : [];

  const currentDayInfo = daysOfWeek.find(d => d.id === selectedDay);

  return (
    <div className="container" style={{ maxWidth: '650px', paddingBottom: '80px', minHeight: '95vh' }}>
      
      {/* Navbar */}
      <nav style={{ padding: '20px 0', borderBottom: '1px solid rgba(6, 182, 212, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h2 style={{ color: '#06b6d4', margin: 0, fontSize: '1.3rem', letterSpacing: '1.5px', textShadow: '0 0 10px rgba(6,182,212,0.3)' }}>ASCEND TRAINING HUB</h2>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Microciclo Semanal Plan</span>
        </div>
        <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 'bold' }} onMouseEnter={e => e.target.style.color = '#06b6d4'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>&larr; Voltar para Home</Link>
      </nav>

      {!workout ? (
        <section className="hud-panel-cut" style={{ textAlign: 'center', background: 'rgba(8,12,24,0.95)', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
          <h1 style={{ marginBottom: '10px', color: '#06b6d4', textShadow: '0 0 8px rgba(6,182,212,0.2)', fontFamily: 'var(--font-display)', letterSpacing: '1.5px' }}>DESTRAVAR MICROCICLO</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '0.85rem' }}>Insira o hash semanal gerado pelo Coach (ex: TX-892B) para carregar sua grade de treinos.</p>
          
          <input 
            type="text" 
            placeholder="TX-XXXX" 
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={{ 
              width: '100%', padding: '20px', fontSize: '2.5rem', 
              textAlign: 'center', letterSpacing: '5px', 
              background: '#000', color: '#06b6d4', 
              border: '2px solid #06b6d4', borderRadius: '8px',
              fontFamily: 'var(--font-display)', marginBottom: '20px',
              textTransform: 'uppercase',
              boxShadow: '0 0 20px rgba(6,182,212,0.15)'
            }} 
            maxLength={8}
          />
          
          {error && <p style={{ color: 'var(--accent-red)', marginBottom: '20px', fontWeight: 'bold', fontSize: '0.95rem' }}>{error}</p>}
          
          <button onClick={loadWorkout} disabled={loading} className="btn" style={{ width: '100%', padding: '18px', fontSize: '1.25rem', fontWeight: 'bold', background: '#06b6d4', color: '#000' }}>
            {loading ? 'SINCRONIZANDO GRADE SEMANAl...' : 'DESTRAVAR PLANILHA ⚡'}
          </button>
        </section>
      ) : (
        <section style={{ animation: 'fadeIn 0.3s ease' }}>
          
          {/* Microcycle Header Panel */}
          <header style={{ background: '#0b111e', border: '1.5px solid #06b6d4', color: '#fff', padding: '18px 20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 0 20px rgba(6,182,212,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '900', color: '#06b6d4', letterSpacing: '1px' }}>{workout.coach?.teamName || "ELITE PLANNER"}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Microciclo: #{workout.pinCode} | Coach: {workout.coach?.name}</span>
              </div>
              <div style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid #06b6d4', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', color: '#00ffff' }}>
                SEMANAL
              </div>
            </div>
          </header>

          {/* Fixed Weekly Schedule Tabs Selector */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '25px' }}>
            {daysOfWeek.map(day => {
              const isSelected = selectedDay === day.id;
              const isToday = todayDayName === day.id;
              return (
                <button
                  key={day.id}
                  onClick={() => setSelectedDay(day.id)}
                  style={{
                    padding: '10px 4px',
                    background: isSelected ? '#06b6d4' : 'rgba(11, 17, 30, 0.75)',
                    color: isSelected ? '#000' : '#fff',
                    border: isToday ? '1.5px solid #00ffff' : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease',
                    boxShadow: isToday ? '0 0 10px rgba(6,182,212,0.2)' : 'none'
                  }}
                >
                  <span style={{ fontSize: '0.9rem', fontWeight: '950' }}>{day.label}</span>
                  <span style={{ fontSize: '0.55rem', opacity: isSelected ? 0.9 : 0.65, fontWeight: 'bold' }}>
                    {day.type}
                  </span>
                  {isToday && (
                    <span style={{ fontSize: '0.5rem', background: '#00ffff', color: '#000', padding: '1px 3px', borderRadius: '3px', fontWeight: 'bold', transform: 'scale(0.95)' }}>
                      HOJE
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Day Meta Focus */}
          <div style={{ background: '#0d1326', borderLeft: '3px solid #06b6d4', padding: '12px 18px', borderRadius: '4px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Foco do Dia</span>
              <h4 style={{ margin: '2px 0 0 0', color: '#fff', fontSize: '1.05rem', fontWeight: 'bold' }}>{currentDayInfo.name.toUpperCase()} &mdash; {currentDayInfo.theme}</h4>
            </div>

            {/* Reagendador de Grade Semanal */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '0.5px' }}>📅 REAGENDAR ESTE DIA</span>
              <select
                value=""
                onChange={(e) => handleReschedule(e.target.value)}
                style={{
                  background: '#070a13',
                  color: '#06b6d4',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  borderRadius: '4px',
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
              >
                <option value="" disabled>Selecionar novo dia...</option>
                {daysOfWeek.map(d => d.id !== selectedDay && (
                  <option key={d.id} value={d.id}>Mover para {d.label}</option>
                ))}
              </select>
            </div>

            <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.03)', padding: '5px 10px', borderRadius: '4px', color: '#06b6d4', fontWeight: 'bold' }}>{currentDayInfo.type} MODE</span>
          </div>

          {/* RENDER TEMPLATE 1: GYM DAYS (Monday, Wednesday, Friday) */}
          {currentDayInfo.type === 'GYM' && (
            <div style={{ animation: 'fadeIn 0.2s ease', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Body Map Panel */}
              <div style={{
                background: 'rgba(8, 12, 24, 0.9)',
                border: '1.5px solid rgba(6, 182, 212, 0.25)',
                borderRadius: '8px',
                padding: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '15px'
              }}>
                <div style={{ flex: 1.2 }}>
                  <h4 style={{ color: '#06b6d4', margin: '0 0 5px 0', fontSize: '0.9rem', letterSpacing: '1px' }}>⚡ MAPA DE ATIVAÇÃO MUSCULAR</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0 }}>
                    Os grupos musculares destacados em ciano serão recrutados nos exercícios prescritos para hoje.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                    {Object.entries(activeMuscles).map(([muscle, isActive]) => (
                      <span key={muscle} style={{
                        fontSize: '0.65rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: isActive ? 'rgba(0, 255, 255, 0.15)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isActive ? '#00ffff' : 'rgba(255,255,255,0.05)'}`,
                        color: isActive ? '#00ffff' : 'var(--text-secondary)',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}>
                        {muscle === 'chest' ? 'Peito' : 
                         muscle === 'legs' ? 'Pernas' : 
                         muscle === 'back' ? 'Costas' : 
                         muscle === 'shoulders' ? 'Ombros' : 
                         muscle === 'arms' ? 'Braços' : 'Core'}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div style={{ flex: 0.8, display: 'flex', justifyContent: 'center' }}>
                  <svg viewBox="0 0 130 140" style={{ width: '120px', height: '130px', overflow: 'visible' }}>
                    {/* FRONT BODY */}
                    <g>
                      <circle cx="35" cy="15" r="7" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                      <line x1="35" y1="22" x2="35" y2="27" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                      <path d="M 20 28 L 50 28 L 46 70 L 24 70 Z" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                      
                      <path 
                        d="M 22 30 L 48 30 L 46 45 L 24 45 Z" 
                        fill={activeMuscles.chest ? "rgba(0, 255, 255, 0.75)" : "rgba(255,255,255,0.03)"} 
                        stroke={activeMuscles.chest ? "#00ffff" : "rgba(255,255,255,0.08)"} 
                        strokeWidth="1"
                        style={{ transition: 'all 0.3s ease', filter: activeMuscles.chest ? 'drop-shadow(0 0 4px #00ffff)' : 'none' }}
                      />
                      <rect 
                        x="25" y="48" width="20" height="18" rx="2"
                        fill={activeMuscles.core ? "rgba(0, 255, 255, 0.75)" : "rgba(255,255,255,0.03)"} 
                        stroke={activeMuscles.core ? "#00ffff" : "rgba(255,255,255,0.08)"} 
                        strokeWidth="1"
                        style={{ transition: 'all 0.3s ease', filter: activeMuscles.core ? 'drop-shadow(0 0 4px #00ffff)' : 'none' }}
                      />
                      <path 
                        d="M 18 30 L 13 65" 
                        stroke={activeMuscles.arms ? "#00ffff" : "rgba(255,255,255,0.15)"} 
                        strokeWidth="3" 
                        strokeLinecap="round"
                        style={{ transition: 'all 0.3s ease', filter: activeMuscles.arms ? 'drop-shadow(0 0 4px #00ffff)' : 'none' }}
                      />
                      <path 
                        d="M 52 30 L 57 65" 
                        stroke={activeMuscles.arms ? "#00ffff" : "rgba(255,255,255,0.15)"} 
                        strokeWidth="3" 
                        strokeLinecap="round"
                        style={{ transition: 'all 0.3s ease', filter: activeMuscles.arms ? 'drop-shadow(0 0 4px #00ffff)' : 'none' }}
                      />
                      <path 
                        d="M 28 73 L 28 130" 
                        stroke={activeMuscles.legs ? "#00ffff" : "rgba(255,255,255,0.15)"} 
                        strokeWidth="4" 
                        strokeLinecap="round"
                        style={{ transition: 'all 0.3s ease', filter: activeMuscles.legs ? 'drop-shadow(0 0 4px #00ffff)' : 'none' }}
                      />
                      <path 
                        d="M 42 73 L 42 130" 
                        stroke={activeMuscles.legs ? "#00ffff" : "rgba(255,255,255,0.15)"} 
                        strokeWidth="4" 
                        strokeLinecap="round"
                        style={{ transition: 'all 0.3s ease', filter: activeMuscles.legs ? 'drop-shadow(0 0 4px #00ffff)' : 'none' }}
                      />
                      <text x="35" y="138" fill="rgba(255,255,255,0.3)" fontSize="7" textAnchor="middle">FRENTE</text>
                    </g>

                    {/* BACK BODY */}
                    <g>
                      <circle cx="95" cy="15" r="7" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                      <line x1="95" y1="22" x2="95" y2="27" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                      <path d="M 80 28 L 110 28 L 106 70 L 84 70 Z" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                      
                      <path 
                        d="M 82 30 L 108 30 L 105 52 L 85 52 Z" 
                        fill={activeMuscles.back ? "rgba(0, 255, 255, 0.75)" : "rgba(255,255,255,0.03)"} 
                        stroke={activeMuscles.back ? "#00ffff" : "rgba(255,255,255,0.08)"} 
                        strokeWidth="1"
                        style={{ transition: 'all 0.3s ease', filter: activeMuscles.back ? 'drop-shadow(0 0 4px #00ffff)' : 'none' }}
                      />
                      <path 
                        d="M 85 55 L 105 55 L 104 68 L 86 68 Z" 
                        fill={activeMuscles.legs || activeMuscles.back ? "rgba(0, 255, 255, 0.75)" : "rgba(255,255,255,0.03)"} 
                        stroke={activeMuscles.legs || activeMuscles.back ? "#00ffff" : "rgba(255,255,255,0.08)"} 
                        strokeWidth="1"
                        style={{ transition: 'all 0.3s ease', filter: activeMuscles.legs || activeMuscles.back ? 'drop-shadow(0 0 4px #00ffff)' : 'none' }}
                      />
                      <path 
                        d="M 78 28 Q 95 24 112 28 L 108 34 L 82 34 Z" 
                        fill={activeMuscles.shoulders ? "rgba(0, 255, 255, 0.75)" : "rgba(255,255,255,0.03)"} 
                        stroke={activeMuscles.shoulders ? "#00ffff" : "rgba(255,255,255,0.08)"} 
                        strokeWidth="1"
                        style={{ transition: 'all 0.3s ease', filter: activeMuscles.shoulders ? 'drop-shadow(0 0 4px #00ffff)' : 'none' }}
                      />
                      <path 
                        d="M 78 30 L 73 65" 
                        stroke={activeMuscles.arms ? "#00ffff" : "rgba(255,255,255,0.15)"} 
                        strokeWidth="3" 
                        strokeLinecap="round"
                        style={{ transition: 'all 0.3s ease', filter: activeMuscles.arms ? 'drop-shadow(0 0 4px #00ffff)' : 'none' }}
                      />
                      <path 
                        d="M 112 30 L 117 65" 
                        stroke={activeMuscles.arms ? "#00ffff" : "rgba(255,255,255,0.15)"} 
                        strokeWidth="3" 
                        strokeLinecap="round"
                        style={{ transition: 'all 0.3s ease', filter: activeMuscles.arms ? 'drop-shadow(0 0 4px #00ffff)' : 'none' }}
                      />
                      <path 
                        d="M 88 73 L 88 130" 
                        stroke={activeMuscles.legs ? "#00ffff" : "rgba(255,255,255,0.15)"} 
                        strokeWidth="4" 
                        strokeLinecap="round"
                        style={{ transition: 'all 0.3s ease', filter: activeMuscles.legs ? 'drop-shadow(0 0 4px #00ffff)' : 'none' }}
                      />
                      <path 
                        d="M 102 73 L 102 130" 
                        stroke={activeMuscles.legs ? "#00ffff" : "rgba(255,255,255,0.15)"} 
                        strokeWidth="4" 
                        strokeLinecap="round"
                        style={{ transition: 'all 0.3s ease', filter: activeMuscles.legs ? 'drop-shadow(0 0 4px #00ffff)' : 'none' }}
                      />
                      <text x="95" y="138" fill="rgba(255,255,255,0.3)" fontSize="7" textAnchor="middle">VERSO</text>
                    </g>
                  </svg>
                </div>
              </div>

              {/* Gym Floating Rest Stopwatch with SVG Circular Progress */}
              <div style={{
                background: '#070a13',
                border: '1.5px solid #06b6d4',
                padding: '15px 20px',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                gap: '15px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  {/* Circular Progress Ring */}
                  <div style={{ position: 'relative', width: '64px', height: '64px' }}>
                    <svg viewBox="0 0 60 60" style={{ width: '64px', height: '64px', overflow: 'visible' }}>
                      <circle cx="30" cy="30" r="25" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                      <circle 
                        cx="30" 
                        cy="30" 
                        r="25" 
                        fill="none" 
                        stroke={timerSeconds <= 10 ? '#ef4444' : '#00ffff'} 
                        strokeWidth="4"
                        strokeDasharray="157.08"
                        strokeDashoffset={157.08 * (1 - (timerSeconds / (timerMax || 90)))}
                        strokeLinecap="round"
                        transform="rotate(-90 30 30)"
                        style={{ 
                          transition: timerActive ? 'stroke-dashoffset 1s linear, stroke 0.3s ease' : 'stroke-dashoffset 0.3s ease, stroke 0.3s ease',
                          filter: `drop-shadow(0 0 4px ${timerSeconds <= 10 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(0, 255, 255, 0.4)'})` 
                        }}
                      />
                    </svg>
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '1rem',
                      fontFamily: 'var(--font-display)',
                      color: timerSeconds <= 10 ? '#ef4444' : '#00ffff',
                      fontWeight: 'bold',
                      textShadow: `0 0 5px ${timerSeconds <= 10 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(0, 255, 255, 0.3)'}`
                    }}>
                      {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                  <div>
                    <h5 style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>INTERVALO</h5>
                    <span style={{ fontSize: '0.7rem', color: timerActive ? 'var(--accent-green)' : 'var(--text-secondary)', fontWeight: 'bold' }}>
                      {timerActive ? 'ATIVO' : 'PAUSADO'}
                    </span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => setTimerActive(!timerActive)} 
                    style={{
                      background: timerActive ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                      color: timerActive ? '#ef4444' : '#22c55e',
                      border: `1.5px solid ${timerActive ? '#ef4444' : '#22c55e'}`,
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {timerActive ? 'PAUSAR' : 'INICIAR'}
                  </button>
                  <button 
                    onClick={() => triggerResetTimer(90)}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    90s
                  </button>
                  <button onClick={() => triggerResetTimer(60)} style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', padding: '8px 10px', fontSize: '0.8rem', cursor: 'pointer' }}>60s</button>
                  <button onClick={() => triggerResetTimer(120)} style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', padding: '8px 10px', fontSize: '0.8rem', cursor: 'pointer' }}>120s</button>
                </div>
              </div>

              {/* Exercises List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {currentDaySets.map((set, index) => (
                  <div key={set.id} className="hud-panel" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: '#06b6d4' }}></div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '5px', color: '#fff' }}>{index + 1}. {set.exerciseName}</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '15px', fontSize: '0.9rem' }}>
                          Meta: {set.targetSets} Séries x {set.targetReps} Repetições {set.targetLoad ? `| Alvo: ${set.targetLoad}kg` : ''}
                        </p>
                      </div>
                      <button 
                        onClick={() => openExerciseModal(set.exerciseId)}
                        style={{
                          background: 'rgba(6,182,212,0.1)',
                          color: '#06b6d4',
                          border: '1px solid #06b6d4',
                          borderRadius: '50%',
                          width: '38px',
                          height: '38px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Ver Prancheta Tática"
                      >
                        📋
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(0,0,0,0.5)', padding: '12px 15px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                      <label style={{ color: '#06b6d4', fontWeight: 'bold', fontSize: '0.9rem' }}>Carga Real (KG)</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1 }}>
                        <button 
                          type="button"
                          onClick={() => {
                            const val = Math.max(0, (parseFloat(actualLoads[set.id]) || 0) - 5);
                            handleLoadChange(set.id, val.toString());
                          }}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '4px', width: '30px', height: '30px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem' }}
                        >
                          -5
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            const val = Math.max(0, (parseFloat(actualLoads[set.id]) || 0) - 2.5);
                            handleLoadChange(set.id, val.toString());
                          }}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '4px', width: '38px', height: '30px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem' }}
                        >
                          -2.5
                        </button>
                        <input 
                          type="number" 
                          placeholder={set.targetLoad ? `${set.targetLoad}` : "Ex: 85"}
                          value={actualLoads[set.id] || ''}
                          onChange={(e) => handleLoadChange(set.id, e.target.value)}
                          style={{ 
                            flexGrow: 1, padding: '8px', fontSize: '1.15rem', 
                            background: '#000', color: '#fff', border: '1px solid #334155', 
                            borderRadius: '6px', textAlign: 'center', fontWeight: 'bold', width: '60px'
                          }} 
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            const val = (parseFloat(actualLoads[set.id]) || 0) + 2.5;
                            handleLoadChange(set.id, val.toString());
                          }}
                          style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', color: '#22c55e', borderRadius: '4px', width: '38px', height: '30px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem' }}
                        >
                          +2.5
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            const val = (parseFloat(actualLoads[set.id]) || 0) + 5;
                            handleLoadChange(set.id, val.toString());
                          }}
                          style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', color: '#22c55e', borderRadius: '4px', width: '30px', height: '30px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem' }}
                        >
                          +5
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {currentDaySets.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(0,0,0,0.2)', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>Nenhum exercício de força prescrito para este dia.</p>
                  </div>
                )}
              </div>

              {currentDaySets.length > 0 && (
                <button onClick={finishGymWorkout} className="btn" style={{ width: '100%', padding: '20px', fontSize: '1.3rem', marginTop: '10px', fontWeight: 'bold', background: '#06b6d4', color: '#000', boxShadow: '0 0 25px rgba(6,182,212,0.25)' }}>
                  ENCERRAR SESSÃO DE ACADEMIA ⚡
                </button>
              )}
            </div>
          )}

          {/* RENDER TEMPLATE 2: HOME DAYS (Tuesday, Thursday) */}
          {currentDayInfo.type === 'HOME' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', animation: 'fadeIn 0.2s ease' }}>
              
              {/* Recovery Video Frame (Auditorium Mode) */}
              <div className="hud-panel" style={{ padding: '20px' }}>
                <h4 style={{ color: '#06b6d4', margin: '0 0 15px 0', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>🎥 AUDITÓRIO: VÍDEOS DE RECUPERAÇÃO</h4>
                
                {playRecoveryVideo ? (
                  <div style={{ position: 'relative', width: '100%', height: '260px', borderRadius: '8px', overflow: 'hidden', border: '1.5px solid #06b6d4' }}>
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src="https://www.youtube.com/embed/8K4S0eL2g8A?autoplay=1" 
                      title="Recovery Mobility and Stretching Guide" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                      allowFullScreen
                      style={{ border: 'none' }}
                    ></iframe>
                  </div>
                ) : (
                  <div 
                    onClick={() => setPlayRecoveryVideo(true)}
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '260px',
                      background: '#020205',
                      borderRadius: '8px',
                      border: '1.5px solid rgba(6,182,212,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      cursor: 'pointer'
                    }}
                  >
                    {/* Play overlay graphic */}
                    <div style={{
                      position: 'absolute',
                      width: '65px',
                      height: '65px',
                      background: 'rgba(6, 182, 212, 0.2)',
                      border: '3px solid #06b6d4',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 3,
                      boxShadow: '0 0 15px #06b6d455'
                    }}>
                      <span style={{ fontSize: '1.8rem', color: '#00ffff', marginLeft: '4px' }}>▶</span>
                    </div>

                    <div style={{
                      position: 'absolute',
                      bottom: 0, left: 0, right: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.95), transparent)',
                      padding: '25px 20px 15px 20px',
                      zIndex: 2,
                      textAlign: 'left'
                    }}>
                      <span style={{ fontSize: '0.7rem', color: '#06b6d4', fontWeight: 'bold', letterSpacing: '1px' }}>LIBERAÇÃO MIOFASCIAL & MOBILIDADE ATIVA</span>
                      <h5 style={{ margin: '5px 0 0 0', color: '#fff', fontSize: '1rem', fontWeight: 'bold' }}>Periodização de Regeneração - Microciclo Fisiológico</h5>
                    </div>
                    
                    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', opacity: 0.15, pointerEvents: 'none' }}>
                      <path d="M 10 50 Q 50 20 90 50" fill="none" stroke="#06b6d4" strokeWidth="2" />
                      <circle cx="50" cy="40" r="10" fill="none" stroke="#06b6d4" strokeWidth="1" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Playbook Route Drawing */}
              <div className="hud-panel" style={{ padding: '20px' }}>
                <style dangerouslySetInnerHTML={{ __html: `
                  @keyframes drawRoute {
                    from { stroke-dashoffset: 150; }
                    to { stroke-dashoffset: 0; }
                  }
                  @keyframes movePlayer {
                    0% { transform: translate(0px, 0px); }
                    50% { transform: translate(0px, -35px); }
                    100% { transform: translate(50px, -50px); }
                  }
                  @keyframes passBall {
                    0% { cx: 40; cy: 75; opacity: 0; }
                    40% { cx: 40; cy: 75; opacity: 1; }
                    95% { cx: 70; cy: 25; opacity: 1; }
                    100% { cx: 70; cy: 25; opacity: 0; }
                  }
                  .route-path-animated {
                    stroke-dasharray: 6 3;
                    stroke-dashoffset: 150;
                    animation: drawRoute 3s linear forwards;
                  }
                  .player-receiver-animated {
                    animation: movePlayer 3s linear forwards;
                  }
                  .ball-pass-animated {
                    animation: passBall 3s ease-out forwards;
                  }
                `}} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h4 style={{ color: '#06b6d4', margin: 0, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>🏈 PLAYBOOK TÁTICO DA SEMANA</h4>
                  <button 
                    onClick={() => {
                      setAnimatePlaybook(false);
                      setTimeout(() => setAnimatePlaybook(true), 50);
                    }}
                    style={{
                      background: 'rgba(6, 182, 212, 0.15)',
                      color: '#00ffff',
                      border: '1.5px solid #06b6d4',
                      borderRadius: '4px',
                      padding: '6px 14px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: '0 0 10px rgba(6,182,212,0.25)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => { e.target.style.background = '#06b6d4'; e.target.style.color = '#000'; }}
                    onMouseLeave={(e) => { e.target.style.background = 'rgba(6, 182, 212, 0.15)'; e.target.style.color = '#00ffff'; }}
                  >
                    EXECUTAR JOGADA ⚡
                  </button>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '15px' }}>Revise as rotas oficiais e estratégias desenhadas pela comissão técnica.</p>
                
                <div style={{ background: '#03050c', border: '1.5px dashed rgba(255,255,255,0.06)', borderRadius: '8px', padding: '15px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {/* Grid background */}
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)',
                    backgroundSize: '15px 15px',
                    pointerEvents: 'none'
                  }}></div>
                  
                  <svg viewBox="0 0 120 100" style={{ width: '90%', height: '90%', zIndex: 2 }}>
                    {/* Linha de scrimmage */}
                    <line x1="10" y1="75" x2="110" y2="75" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="6" y="77" fill="rgba(255,255,255,0.4)" fontSize="4" fontWeight="bold">LOS</text>
                    
                    {/* Players dots */}
                    {/* Offense */}
                    <circle cx="60" cy="75" r="3" fill="none" stroke="#fff" strokeWidth="1" />
                    <text x="60" y="76" fill="#fff" fontSize="3" fontWeight="bold" textAnchor="middle">C</text>
                    
                    <circle cx="50" cy="75" r="3" fill="none" stroke="#fff" strokeWidth="1" />
                    <circle cx="70" cy="75" r="3" fill="none" stroke="#fff" strokeWidth="1" />
                    
                    <circle cx="40" cy="75" r="3" fill="none" stroke="#06b6d4" strokeWidth="1.2" />
                    <text x="40" y="76" fill="#06b6d4" fontSize="3.5" fontWeight="bold" textAnchor="middle">QB</text>

                    {/* WR Route Path */}
                    <path 
                      d="M 20 75 L 20 40 Q 20 25 70 25" 
                      fill="none" 
                      stroke="#eab308" 
                      strokeWidth="1.8" 
                      className={animatePlaybook ? 'route-path-animated' : ''}
                      style={{ strokeDasharray: animatePlaybook ? undefined : '2 2' }} 
                    />
                    <polygon points="70,25 64,22 64,28" fill="#eab308" />
                    <text x="70" y="20" fill="#eab308" fontSize="4.5" fontWeight="bold" textAnchor="middle">Z-POST ROUTE</text>

                    {/* WR Receiver Dot */}
                    <circle 
                      cx="20" 
                      cy="75" 
                      r="2.5" 
                      fill="#eab308" 
                      className={animatePlaybook ? 'player-receiver-animated' : ''} 
                    />

                    {/* Football Ball Pass */}
                    {animatePlaybook && (
                      <circle cx="40" cy="75" r="2" fill="#ff7a00" className="ball-pass-animated" />
                    )}

                    {/* Defense */}
                    <text x="60" y="60" fill="#ef4444" fontSize="4.5" fontWeight="bold" textAnchor="middle">FS</text>
                    <text x="30" y="62" fill="#ef4444" fontSize="4.5" fontWeight="bold" textAnchor="middle">CB</text>
                  </svg>
                </div>
              </div>

              {/* Wellness Form */}
              <div className="hud-panel" style={{ padding: '20px' }}>
                <h4 style={{ color: '#06b6d4', margin: '0 0 15px 0', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>📝 QUESTIONÁRIO DE BEM-ESTAR (WELLNESS)</h4>
                
                {wellnessSaved ? (
                  <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(34, 197, 94, 0.05)', border: '1.5px solid #22c55e', borderRadius: '6px' }}>
                    <span style={{ color: '#22c55e', fontWeight: 'bold' }}>✓ Formulário de saúde diária enviado com sucesso!</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', color: '#fff', fontSize: '0.9rem', marginBottom: '8px' }}>
                        Qualidade do Sono: <strong style={{ color: '#06b6d4' }}>{sleepScore} / 5</strong>
                      </label>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                        {[
                          { val: 1, emoji: '😴', label: 'Horrível' },
                          { val: 2, emoji: '🥱', label: 'Ruim' },
                          { val: 3, emoji: '😐', label: 'Normal' },
                          { val: 4, emoji: '🙂', label: 'Bom' },
                          { val: 5, emoji: '🤩', label: 'Excelente' }
                        ].map(s => (
                          <button
                            key={s.val}
                            type="button"
                            onClick={() => setSleepScore(s.val)}
                            style={{
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              padding: '8px 4px',
                              background: sleepScore === s.val ? 'rgba(0, 255, 255, 0.15)' : 'rgba(255,255,255,0.02)',
                              border: `1.5px solid ${sleepScore === s.val ? '#00ffff' : 'rgba(255,255,255,0.08)'}`,
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              boxShadow: sleepScore === s.val ? '0 0 10px rgba(0,255,255,0.2)' : 'none'
                            }}
                          >
                            <span style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{s.emoji}</span>
                            <span style={{ fontSize: '0.6rem', color: sleepScore === s.val ? '#00ffff' : 'var(--text-secondary)' }}>{s.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#fff', fontSize: '0.9rem', marginBottom: '8px' }}>
                        Nível de Fadiga/Dor Muscular: <strong style={{ color: '#06b6d4' }}>{painScore} / 5</strong>
                      </label>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                        {[
                          { val: 1, emoji: '🟢', label: 'Sem Dor' },
                          { val: 2, emoji: '🟡', label: 'Leve' },
                          { val: 3, emoji: '🟠', label: 'Moderada' },
                          { val: 4, emoji: '🔴', label: 'Forte' },
                          { val: 5, emoji: '💀', label: 'Extrema' }
                        ].map(p => (
                          <button
                            key={p.val}
                            type="button"
                            onClick={() => setPainScore(p.val)}
                            style={{
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              padding: '8px 4px',
                              background: painScore === p.val ? 'rgba(0, 255, 255, 0.15)' : 'rgba(255,255,255,0.02)',
                              border: `1.5px solid ${painScore === p.val ? '#00ffff' : 'rgba(255,255,255,0.08)'}`,
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              boxShadow: painScore === p.val ? '0 0 10px rgba(0,255,255,0.2)' : 'none'
                            }}
                          >
                            <span style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{p.emoji}</span>
                            <span style={{ fontSize: '0.6rem', color: painScore === p.val ? '#00ffff' : 'var(--text-secondary)' }}>{p.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button onClick={saveWellnessScore} className="btn" style={{ width: '100%', padding: '12px', fontSize: '0.95rem', fontWeight: 'bold' }}>
                      REGISTRAR BEM-ESTAR DIÁRIO
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RENDER TEMPLATE 3: FIELD DAYS (Saturday) */}
          {currentDayInfo.type === 'FIELD' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', animation: 'fadeIn 0.2s ease' }}>
              
              {/* Agility Drills Tactical Map (Chalkboard Mode) */}
              <div style={{
                background: '#041f16', // Dark Chalkboard Green
                border: '4px solid #b45309', // Wooden frame
                borderRadius: '8px',
                padding: '20px',
                position: 'relative',
                boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
                color: '#fff'
              }}>
                {/* Chalk board lines background */}
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.02) 0%, transparent 80%)',
                  pointerEvents: 'none'
                }}></div>

                <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#86efac', letterSpacing: '1px', textTransform: 'uppercase', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  📋 PRANCHETA TÁTICA: DRILLS DE CAMPO
                </h4>
                <span style={{ fontSize: '0.8rem', color: '#a7f3d0', display: 'block', marginBottom: '20px' }}>
                  Foco: Treino de Agilidade com Cones (L-Drill / Pro Agility 5-10-5)
                </span>

                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 120 80" style={{ width: '85%', height: '85%' }}>
                    {/* Chalkboard lines drawing */}
                    <circle cx="30" cy="40" r="3" fill="none" stroke="#fff" strokeWidth="1" />
                    <text x="30" y="44" fill="#fff" fontSize="4" textAnchor="middle" fontWeight="bold">CONE A</text>

                    <circle cx="60" cy="40" r="3" fill="none" stroke="#fff" strokeWidth="1" />
                    <text x="60" y="44" fill="#fff" fontSize="4" textAnchor="middle" fontWeight="bold">CONE B</text>

                    <circle cx="60" cy="15" r="3" fill="none" stroke="#fff" strokeWidth="1" />
                    <text x="60" y="11" fill="#fff" fontSize="4" textAnchor="middle" fontWeight="bold">CONE C</text>

                    {/* Agility Vector route */}
                    <path d="M 30 40 L 60 40 L 60 15 L 60 40 M 60 40 L 30 40" fill="none" stroke="#86efac" strokeWidth="1.8" strokeDasharray="3 3" />
                    
                    {/* Direction arrows */}
                    <polygon points="45,38 49,40 45,42" fill="#86efac" />
                    <polygon points="62,28 60,24 58,28" fill="#86efac" />
                    <polygon points="58,32 60,36 62,32" fill="#86efac" />
                    <polygon points="45,42 41,40 45,38" fill="#86efac" />

                    <text x="95" y="42" fill="#86efac" fontSize="4" fontWeight="bold">L-DRILL ROTATION</text>
                  </svg>
                </div>
              </div>

              {/* RPE & Completion Form */}
              <div className="hud-panel" style={{ padding: '20px' }}>
                <h4 style={{ color: '#06b6d4', margin: '0 0 15px 0', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>⚡ PERCEPÇÃO DE ESFORÇO (RPE DIÁRIO)</h4>
                
                {fieldCompleted ? (
                  <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(34, 197, 94, 0.05)', border: '1.5px solid #22c55e', borderRadius: '6px' }}>
                    <span style={{ color: '#22c55e', fontWeight: 'bold' }}>✓ Treino de campo concluído e gravado no histórico!</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Classifique a intensidade do esforço físico geral exigido na sessão de hoje.</p>
                    
                    <div>
                      <label style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '0.95rem', marginBottom: '8px' }}>
                        <span>Nota RPE (Borg Scale):</span>
                        <strong style={{ color: '#06b6d4', fontSize: '1.15rem' }}>{rpeScore} / 10</strong>
                      </label>
                      <input 
                        type="range" min="1" max="10" 
                        value={rpeScore} 
                        onChange={e => setRpeScore(parseInt(e.target.value))} 
                        style={{ width: '100%', accentColor: '#06b6d4' }} 
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        <span>1 (Muito Leve)</span>
                        <span>5 (Moderado)</span>
                        <span>10 (Exaustão Máxima)</span>
                      </div>
                    </div>

                    <button onClick={finishFieldWorkout} className="btn" style={{ width: '100%', padding: '18px', fontSize: '1.2rem', fontWeight: 'bold', background: '#06b6d4', color: '#000', boxShadow: '0 0 25px rgba(6,182,212,0.2)' }}>
                      CONCLUIR TREINO DE CAMPO 🏁
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RENDER TEMPLATE 4: DOMINGO / REST DAY */}
          {currentDayInfo.type === 'REST' && (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(8,12,24,0.6)', border: '1.5px dashed rgba(6, 182, 212, 0.2)', borderRadius: '12px', animation: 'fadeIn 0.2s ease' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '15px' }}>🛌</span>
              <h3 style={{ color: '#06b6d4', fontSize: '1.4rem', fontFamily: 'var(--font-display)', margin: '0 0 10px 0', letterSpacing: '1px' }}>REST DAY (DESCANSO ATIVO)</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '450px', margin: '0 auto 30px auto', lineHeight: '1.6' }}>
                "O descanso é onde a fibra reconstrói e a mente armazena a tática. Aproveite hoje para se hidratar, estudar o playbook e recuperar as articulações."
              </p>

              <div style={{ background: '#070a13', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '20px', display: 'inline-block' }}>
                <span style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: 'bold', display: 'block', marginBottom: '5px', letterSpacing: '1px' }}>PRONTO PARA A PRÓXIMA SEMANA?</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Visualize seu card oficial de performance no seu Locker Room.</span>
              </div>
            </div>
          )}

        </section>
      )}

      {/* POPUP MODAL: CHALKBOARD DIGITAL MODE */}
      {selectedEx && (
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
              onClick={() => setSelectedEx(null)}
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
              height: '240px', 
              background: '#02040a', 
              borderRadius: '8px', 
              overflow: 'hidden', 
              border: '2px dashed rgba(6, 182, 212, 0.3)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                pointerEvents: 'none'
              }}></div>

              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <div style={{
                  width: '100%', height: '100%',
                  background: 'radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 60%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#475569',
                  fontSize: '0.8rem'
                }}>
                  <span style={{ fontStyle: 'italic' }}>[Prancheta Técnica Digital]</span>
                </div>
              </div>
            </div>

            <h4 style={{ color: '#fff', marginBottom: '6px', fontSize: '0.95rem' }}>Mecânica de Execução (Cues)</h4>
            <p style={{ 
              color: '#a1a1aa', 
              lineHeight: '1.6', 
              fontSize: '0.85rem',
              maxHeight: '130px',
              overflowY: 'auto',
              paddingRight: '5px',
              margin: 0
            }}>
              {selectedEx.description || 'Nenhuma mecânica cadastrada para este exercício.'}
            </p>

            <button 
              onClick={() => setSelectedEx(null)}
              className="btn" 
              style={{ width: '100%', marginTop: '22px', padding: '12px', fontWeight: 'bold', background: '#06b6d4', color: '#000' }}
            >
              ENTENDIDO, VOLTAR AO TREINO
            </button>
          </div>
        </div>
      )}
      
      {/* Floating Action Button (FAB) for ending active workout */}
      {workout && !finished && (currentDayInfo?.type === 'GYM' || currentDayInfo?.type === 'FIELD') && (
        <button
          onClick={() => {
            if (currentDayInfo.type === 'GYM') {
              if (confirm("Deseja encerrar e registrar seu treino de academia?")) {
                finishGymWorkout();
              }
            } else if (currentDayInfo.type === 'FIELD') {
              if (confirm("Deseja finalizar e salvar o treino de campo?")) {
                finishFieldWorkout();
              }
            }
          }}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00ffff 0%, #06b6d4 100%)',
            color: '#000',
            border: '2px solid #fff',
            boxShadow: '0 4px 20px rgba(0, 255, 255, 0.4)',
            cursor: 'pointer',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            fontWeight: 'bold',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.5))'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          title="Encerrar Treino Ativo"
        >
          ⚡
        </button>
      )}
    </div>
  );
}
