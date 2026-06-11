"use client";

import { useState, useEffect } from 'react';

export default function RestTimer() {
  const [timerSeconds, setTimerSeconds] = useState(90);
  const [timerActive, setTimerActive] = useState(false);
  const [timerMax, setTimerMax] = useState(90);

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

  const triggerResetTimer = (seconds = 90) => {
    setTimerMax(seconds);
    setTimerSeconds(seconds);
    setTimerActive(true);
  };

  return (
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
  );
}
