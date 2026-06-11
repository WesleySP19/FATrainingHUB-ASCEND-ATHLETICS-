"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import TacticalDashboard from '@/components/TacticalDashboard';
import PhysioDashboard from '@/components/PhysioDashboard';
import HolographicComparator from '@/components/HolographicComparator';
import { useCoach } from '@/contexts/CoachContext';
import useSWR from 'swr';

const fetcher = url => fetch(url).then(r => r.json());

export default function RosterAdmin() {
  const { coach, loadingCoach } = useCoach();
  const { data: rosterData, error: rosterError, isLoading: loadingRoster, mutate: mutateRoster } = useSWR(coach ? `/api/coach/roster?coachId=${coach.id}` : null, fetcher);
  const { data: teamFetchData, mutate: mutateTeam } = useSWR(coach ? `/api/coach/team?coachId=${coach.id}` : null, fetcher);
  
  const athletes = rosterData?.athletes || [];
  const loadingAthletes = loadingCoach || loadingRoster;
  const teamData = teamFetchData?.team || null;
  const loadingTeam = !teamData && !teamFetchData;

  const [selectedAthleteId, setSelectedAthleteId] = useState(null);
  const [selectedPhysioAthleteId, setSelectedPhysioAthleteId] = useState(null);
  
  // Form to register new athlete
  const [newAthlete, setNewAthlete] = useState({
    name: '',
    position: 'QB',
    email: '',
    password: '',
    overall: '70',
    height: "6'2\"",
    weight: "220 lbs",
    wingspan: "75\"",
    handSize: "9.5\"",
    forceAttr: '70',
    skillAttr: '70',
    speedAttr: '70',
    powerAttr: '70',
    evolutionAttr: '70'
  });
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Edit Athlete States
  const [editingAthlete, setEditingAthlete] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    position: 'QB',
    overall: '70',
    email: '',
    profilePhoto: '',
    height: '',
    weight: '',
    wingspan: '',
    handSize: '',
    forceAttr: '70',
    skillAttr: '70',
    speedAttr: '70',
    powerAttr: '70',
    evolutionAttr: '70'
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState('roster'); // roster, team

  // Team Form States
  const [teamForm, setTeamForm] = useState({
    name: '',
    abbreviation: '',
    founded: '',
    primaryColor: '#f97316',
    logoUrl: '',
    history: '',
    wins: '0',
    losses: '0',
    draws: '0',
    trainingFrequency: '3x por semana',
    championships: '0'
  });
  const [savingTeam, setSavingTeam] = useState(false);
  const [teamSuccess, setTeamSuccess] = useState('');
  const [teamError, setTeamError] = useState('');

  const startEditAthlete = (athlete) => {
    setEditingAthlete(athlete);
    setEditForm({
      name: athlete.name,
      position: athlete.position,
      overall: athlete.overall.toString(),
      email: athlete.email || '',
      profilePhoto: athlete.profilePhoto || '',
      height: athlete.height || "6'2\"",
      weight: athlete.weight || "220 lbs",
      wingspan: athlete.wingspan || "75\"",
      handSize: athlete.handSize || "9.5\"",
      forceAttr: (athlete.forceAttr ?? 70).toString(),
      skillAttr: (athlete.skillAttr ?? 70).toString(),
      speedAttr: (athlete.speedAttr ?? 70).toString(),
      powerAttr: (athlete.powerAttr ?? 70).toString(),
      evolutionAttr: (athlete.evolutionAttr ?? 70).toString()
    });
    setEditError('');
  };

  const handleEditImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, profilePhoto: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEditAthlete = async (e) => {
    e.preventDefault();
    if (!coach || !editingAthlete) return;
    setSavingEdit(true);
    setEditError('');

    try {
      const res = await fetch('/api/coach/roster', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'editAthlete',
          id: editingAthlete.id,
          name: editForm.name,
          position: editForm.position,
          overall: parseInt(editForm.overall) || 70,
          email: editForm.email,
          profilePhoto: editForm.profilePhoto,
          height: editForm.height,
          weight: editForm.weight,
          wingspan: editForm.wingspan,
          handSize: editForm.handSize,
          forceAttr: parseInt(editForm.forceAttr) || 70,
          skillAttr: parseInt(editForm.skillAttr) || 70,
          speedAttr: parseInt(editForm.speedAttr) || 70,
          powerAttr: parseInt(editForm.powerAttr) || 70,
          evolutionAttr: parseInt(editForm.evolutionAttr) || 70
        })
      });
      const data = await res.json();
      if (data.success) {
        setEditingAthlete(null);
        mutateRoster();
      } else {
        setEditError(data.error || 'Erro ao atualizar atleta.');
      }
    } catch (err) {
      setEditError('Erro de conexão ao salvar alterações.');
    }
    setSavingEdit(false);
  };

  const handleDeleteAthlete = async (athleteId, athleteName) => {
    if (!window.confirm(`Tem certeza de que deseja excluir o atleta "${athleteName}"? Todos os treinos, históricos e relatórios associados a ele serão permanentemente apagados.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/coach/roster?id=${athleteId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setFormSuccess('Atleta excluído com sucesso!');
        mutateRoster();
        setTimeout(() => setFormSuccess(''), 4000);
      } else {
        setFormError(data.error || 'Erro ao excluir atleta.');
        setTimeout(() => setFormError(''), 4000);
      }
    } catch (err) {
      setFormError('Falha na conexão ao tentar excluir atleta.');
      setTimeout(() => setFormError(''), 4000);
    }
  };

  useEffect(() => {
    if (teamData && !savingTeam) {
      setTeamForm({
        name: teamData.name || '',
        abbreviation: teamData.abbreviation || '',
        founded: teamData.founded || '',
        primaryColor: teamData.primaryColor || '#f97316',
        logoUrl: teamData.logoUrl || '',
        history: teamData.history || '',
        wins: (teamData.wins || 0).toString(),
        losses: (teamData.losses || 0).toString(),
        draws: (teamData.draws || 0).toString(),
        trainingFrequency: teamData.trainingFrequency || '3x por semana',
        championships: (teamData.championships || 0).toString()
      });
    }
  }, [teamData]);

  useEffect(() => {
    if (!coach) return;

    const eventSource = new EventSource('/api/coach/roster/sse');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Recebido novo treino concluído em tempo real:", data);
        
        // 1. Atualizar o roster localmente
        mutateRoster((currentData) => {
          if (!currentData || !currentData.athletes) return currentData;
          return {
            ...currentData,
            athletes: currentData.athletes.map(ath => {
              if (ath.id === data.athleteId) {
                return {
                  ...ath,
                  overall: data.overall,
                  attendanceCount: data.attendanceCount,
                  prCount: data.prCount
                };
              }
              return ath;
            })
          };
        }, false);

        // 2. Toca som sintetizado premium de alerta de performance
        if (typeof window !== 'undefined') {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) {
            const context = new AudioCtx();
            const osc = context.createOscillator();
            const gain = context.createGain();
            osc.connect(gain);
            gain.connect(context.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, context.currentTime);
            gain.gain.setValueAtTime(0.08, context.currentTime);
            osc.start();
            gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.5);
            osc.stop(context.currentTime + 0.5);
          }
        }

        // 3. Exibir alerta na tela
        alert(`💥 NOTIFICAÇÃO EM TEMPO REAL: O atleta ${data.athleteName} finalizou o treino!\nStatus Atual: ${data.overall} OVR | PRs na sessão: ${data.newPRsCount}`);
      } catch (e) {
        console.error("Erro ao ler evento SSE:", e);
      }
    };

    eventSource.onerror = (e) => {
      console.error("Conexão SSE oscilou. Tentando restabelecer...");
    };

    return () => {
      eventSource.close();
    };
  }, [coach]);

  const handleSaveTeam = async (e) => {
    e.preventDefault();
    if (!coach) return;
    setSavingTeam(true);
    setTeamSuccess('');
    setTeamError('');

    const method = teamData ? 'PUT' : 'POST';
    const payload = {
      ...teamForm,
      wins: parseInt(teamForm.wins) || 0,
      losses: parseInt(teamForm.losses) || 0,
      draws: parseInt(teamForm.draws) || 0,
      championships: parseInt(teamForm.championships) || 0,
      coachId: coach.id
    };

    try {
      const res = await fetch('/api/coach/team', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setTeamSuccess('Dados da equipe salvos com sucesso!');
        mutateTeam();
        setTimeout(() => setTeamSuccess(''), 4000);
        if (method === 'POST') {
          const updatedCoach = { ...coach, teamName: data.team.name };
          // setCoach(updatedCoach); // Assuming setCoach is accessible or managed elsewhere
          localStorage.setItem('coach', JSON.stringify(updatedCoach));
        }
      } else {
        setTeamError(data.error || 'Erro ao salvar dados do time.');
      }
    } catch (err) {
      setTeamError('Erro na conexão com o servidor.');
    } finally {
      setSavingTeam(false);
    }
  };

  const handleTeamLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTeamForm(prev => ({ ...prev, logoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegisterAthlete = async (e) => {
    e.preventDefault();
    if (!coach) return;
    setAdding(true);
    setFormError('');
    setFormSuccess('');

    try {
      const res = await fetch('/api/coach/roster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAthlete,
          overall: parseInt(newAthlete.overall) || 70,
          forceAttr: parseInt(newAthlete.forceAttr) || 70,
          skillAttr: parseInt(newAthlete.skillAttr) || 70,
          speedAttr: parseInt(newAthlete.speedAttr) || 70,
          powerAttr: parseInt(newAthlete.powerAttr) || 70,
          evolutionAttr: parseInt(newAthlete.evolutionAttr) || 70,
          coachId: coach.id
        })
      });
      const data = await res.json();
      if (data.success) {
        setFormSuccess(`Atleta ${data.athlete.name} registrado com sucesso!`);
        setNewAthlete({
          name: '',
          position: 'QB',
          email: '',
          password: '',
          overall: '70',
          height: "6'2\"",
          weight: "220 lbs",
          wingspan: "75\"",
          handSize: "9.5\"",
          forceAttr: '70',
          skillAttr: '70',
          speedAttr: '70',
          powerAttr: '70',
          evolutionAttr: '70'
        });
        fetchAthletes(coach.id);
      } else {
        setFormError(data.error || 'Erro ao registrar atleta.');
      }
    } catch (err) {
      setFormError('Erro de conexão ao salvar atleta.');
    }
    setAdding(false);
  };

  const updateOVR = async (id, newOVR) => {
    const val = parseInt(newOVR);
    if (isNaN(val)) return;
    
    setAthletes(athletes.map(a => a.id === id ? { ...a, overall: val } : a));
    
    await fetch('/api/coach/roster', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, overall: val })
    });
  };

  const handleSetMVP = async (id) => {
    setAthletes(athletes.map(a => ({
      ...a,
      isMVP: a.id === id
    })));

    try {
      const res = await fetch('/api/coach/roster', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'setMVP' })
      });
      const data = await res.json();
      if (!data.success) {
        alert("Erro ao definir MVP: " + data.error);
        fetchAthletes(coach.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyLink = (id) => {
    const uniqueLink = `${window.location.origin}/athlete/${id}`;
    navigator.clipboard.writeText(uniqueLink);
    alert(`Link único copiado:\n${uniqueLink}`);
  };

  const triggerOverride = (athlete) => {
    localStorage.setItem('overrideAthlete', JSON.stringify(athlete));
    window.location.href = '/coach';
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'HC': return 'Head Coach (HC)';
      case 'DC': return 'Defensive Coordinator (DC)';
      case 'OC': return 'Offensive Coordinator (OC)';
      case 'PERSONAL': return 'Personal Trainer';
      default: return 'Coach';
    }
  };

  const getACWRBadge = (acwr) => {
    let text = 'Sem Carga';
    let bgColor = 'rgba(255,255,255,0.03)';
    let color = '#94a3b8';
    let glow = 'none';
    
    if (acwr > 0) {
      if (acwr < 0.8) {
        text = `${acwr} • Subtreino`;
        bgColor = 'rgba(56, 189, 248, 0.08)';
        color = '#38bdf8';
        glow = '0 0 10px rgba(56, 189, 248, 0.2)';
      } else if (acwr <= 1.3) {
        text = `${acwr} • Ideal`;
        bgColor = 'rgba(34, 197, 94, 0.08)';
        color = '#22c55e';
        glow = '0 0 10px rgba(34, 197, 94, 0.2)';
      } else if (acwr <= 1.5) {
        text = `${acwr} • Cuidado`;
        bgColor = 'rgba(234, 179, 8, 0.08)';
        color = '#eab308';
        glow = '0 0 10px rgba(234, 179, 8, 0.2)';
      } else {
        text = `${acwr} • Risco de Lesão`;
        bgColor = 'rgba(239, 68, 68, 0.08)';
        color = '#ef4444';
        glow = '0 0 10px rgba(239, 68, 68, 0.2)';
      }
    }
    
    return (
      <span style={{ 
        padding: '6px 14px', 
        borderRadius: '20px', 
        background: bgColor, 
        color: color, 
        fontWeight: 'bold', 
        fontSize: '0.75rem',
        border: `1px solid ${color}40`,
        boxShadow: glow,
        display: 'inline-block',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {text}
      </span>
    );
  };

  if (loadingCoach || loadingAthletes) return <div style={{ textAlign: 'center', padding: '100px', color: '#fff', fontSize: '1.2rem' }}>Carregando Roster Oficial...</div>;

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
      
      {/* Navigation */}
      <nav style={{ padding: 'var(--spacing-md) 0', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <div>
          <h2 style={{ color: 'var(--primary-color)', margin: 0 }}>MEU ROSTER & PERFORMANCE</h2>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Gerencie seus atletas, analise ACWR e métricas físicas
          </span>
        </div>
      </nav>

      {/* Tab Buttons - Premium Segmented Control */}
      <div style={{
        display: 'inline-flex',
        background: 'rgba(5, 8, 20, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '5px',
        marginBottom: '30px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
      }}>
        <button
          onClick={() => setActiveTab('roster')}
          style={{
            padding: '10px 24px',
            borderRadius: '12px',
            fontSize: '0.8rem',
            fontWeight: '800',
            letterSpacing: '1px',
            background: activeTab === 'roster' ? 'linear-gradient(135deg, var(--primary-color) 0%, #ea580c 100%)' : 'transparent',
            color: activeTab === 'roster' ? '#000' : 'rgba(255, 255, 255, 0.5)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: activeTab === 'roster' ? '0 4px 20px rgba(249, 115, 22, 0.4)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>📋</span> GERENCIAR ELENCO (ROSTER)
        </button>
        <button
          onClick={() => setActiveTab('team')}
          style={{
            padding: '10px 24px',
            borderRadius: '12px',
            fontSize: '0.8rem',
            fontWeight: '800',
            letterSpacing: '1px',
            background: activeTab === 'team' ? 'linear-gradient(135deg, var(--primary-color) 0%, #ea580c 100%)' : 'transparent',
            color: activeTab === 'team' ? '#000' : 'rgba(255, 255, 255, 0.5)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: activeTab === 'team' ? '0 4px 20px rgba(249, 115, 22, 0.4)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>🛡️</span> GERENCIAR TIME (TEAM HQ)
        </button>
      </div>

      {activeTab === 'roster' ? (
        <>
          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.9fr', gap: '25px' }}>
            {/* Left Side: Register Form Panel */}
            <section style={{
              background: 'rgba(8, 12, 24, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '24px',
              padding: '30px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              height: 'fit-content'
            }}>
              <h3 style={{ marginBottom: '10px', color: 'var(--primary-color)', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '1.1rem', fontWeight: '800' }}>Alistar Novo Atleta</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '25px', fontSize: '0.8rem', lineHeight: '1.4' }}>
                Cadastre atletas para acompanhamento fisiológico, controle de carga ACWR e gamificação de locker.
              </p>

              <form onSubmit={handleRegisterAthlete} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.5px' }}>NOME DO ATLETA</label>
                  <input 
                    required 
                    placeholder="Ex: T. Brady" 
                    value={newAthlete.name} 
                    onChange={e => setNewAthlete({...newAthlete, name: e.target.value})} 
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(0,0,0,0.5)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      outline: 'none',
                      fontSize: '0.85rem',
                      transition: 'all 0.2s'
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = 'var(--primary-color)';
                      e.currentTarget.style.boxShadow = '0 0 8px rgba(249, 115, 22, 0.2)';
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.5px' }}>POSIÇÃO / GRUPO</label>
                    <select 
                      value={newAthlete.position} 
                      onChange={e => setNewAthlete({...newAthlete, position: e.target.value})} 
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: 'rgba(0,0,0,0.5)',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '10px',
                        outline: 'none',
                        fontSize: '0.85rem',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = 'var(--primary-color)';
                        e.currentTarget.style.boxShadow = '0 0 8px rgba(249, 115, 22, 0.2)';
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <option value="QB">QB</option>
                      <option value="OL">OL (Linha Ofensiva)</option>
                      <option value="DL">DL (Linha Defensiva)</option>
                      <option value="Skills">Skills (WR/RB/DB)</option>
                      <option value="Forwards">Forwards (Rugby)</option>
                      <option value="Backs">Backs (Rugby)</option>
                      <option value="Força Base">Força Base (Powerlifting)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.5px' }}>OVR INICIAL</label>
                    <input 
                      type="number" 
                      min="50" 
                      max="99" 
                      value={newAthlete.overall} 
                      onChange={e => setNewAthlete({...newAthlete, overall: e.target.value})} 
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: 'rgba(0,0,0,0.5)',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '10px',
                        outline: 'none',
                        fontSize: '0.85rem',
                        transition: 'all 0.2s',
                        textAlign: 'center'
                      }}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = 'var(--primary-color)';
                        e.currentTarget.style.boxShadow = '0 0 8px rgba(249, 115, 22, 0.2)';
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.5px' }}>E-MAIL (OPCIONAL)</label>
                  <input 
                    type="email" 
                    placeholder="email@atleta.com" 
                    value={newAthlete.email} 
                    onChange={e => setNewAthlete({...newAthlete, email: e.target.value})} 
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(0,0,0,0.5)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      outline: 'none',
                      fontSize: '0.85rem',
                      transition: 'all 0.2s'
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = 'var(--primary-color)';
                      e.currentTarget.style.boxShadow = '0 0 8px rgba(249, 115, 22, 0.2)';
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.5px' }}>SENHA TEMPORÁRIA</label>
                  <input 
                    type="password" 
                    placeholder="Mínimo 6 caracteres" 
                    value={newAthlete.password} 
                    onChange={e => setNewAthlete({...newAthlete, password: e.target.value})} 
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(0,0,0,0.5)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      outline: 'none',
                      fontSize: '0.85rem',
                      transition: 'all 0.2s'
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = 'var(--primary-color)';
                      e.currentTarget.style.boxShadow = '0 0 8px rgba(249, 115, 22, 0.2)';
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Physical Metrics Grid */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '15px' }}>
                  <h4 style={{ fontSize: '0.8rem', color: '#06b6d4', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800' }}>Métricas Físicas</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Altura (ex: 6'2")</label>
                      <input 
                        placeholder={"6'2\""} 
                        value={newAthlete.height} 
                        onChange={e => setNewAthlete({...newAthlete, height: e.target.value})} 
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: 'rgba(0,0,0,0.5)',
                          color: '#fff',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '8px',
                          outline: 'none',
                          fontSize: '0.8rem',
                          transition: 'all 0.2s'
                        }}
                        onFocus={e => {
                          e.currentTarget.style.borderColor = '#06b6d4';
                          e.currentTarget.style.boxShadow = '0 0 8px rgba(6, 182, 212, 0.2)';
                        }}
                        onBlur={e => {
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Peso (ex: 220 lbs)</label>
                      <input 
                        placeholder="220 lbs" 
                        value={newAthlete.weight} 
                        onChange={e => setNewAthlete({...newAthlete, weight: e.target.value})} 
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: 'rgba(0,0,0,0.5)',
                          color: '#fff',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '8px',
                          outline: 'none',
                          fontSize: '0.8rem',
                          transition: 'all 0.2s'
                        }}
                        onFocus={e => {
                          e.currentTarget.style.borderColor = '#06b6d4';
                          e.currentTarget.style.boxShadow = '0 0 8px rgba(6, 182, 212, 0.2)';
                        }}
                        onBlur={e => {
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Envergadura</label>
                      <input 
                        placeholder={"75\""} 
                        value={newAthlete.wingspan} 
                        onChange={e => setNewAthlete({...newAthlete, wingspan: e.target.value})} 
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: 'rgba(0,0,0,0.5)',
                          color: '#fff',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '8px',
                          outline: 'none',
                          fontSize: '0.8rem',
                          transition: 'all 0.2s'
                        }}
                        onFocus={e => {
                          e.currentTarget.style.borderColor = '#06b6d4';
                          e.currentTarget.style.boxShadow = '0 0 8px rgba(6, 182, 212, 0.2)';
                        }}
                        onBlur={e => {
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Tamanho da Mão</label>
                      <input 
                        placeholder={"9.5\""} 
                        value={newAthlete.handSize} 
                        onChange={e => setNewAthlete({...newAthlete, handSize: e.target.value})} 
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: 'rgba(0,0,0,0.5)',
                          color: '#fff',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '8px',
                          outline: 'none',
                          fontSize: '0.8rem',
                          transition: 'all 0.2s'
                        }}
                        onFocus={e => {
                          e.currentTarget.style.borderColor = '#06b6d4';
                          e.currentTarget.style.boxShadow = '0 0 8px rgba(6, 182, 212, 0.2)';
                        }}
                        onBlur={e => {
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Custom Attributes Grid */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '15px', marginBottom: '5px' }}>
                  <h4 style={{ fontSize: '0.8rem', color: '#06b6d4', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800' }}>Atributos de Performance (50-99)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                    {[
                      { label: 'FOR', key: 'forceAttr' },
                      { label: 'HAB', key: 'skillAttr' },
                      { label: 'VEL', key: 'speedAttr' },
                      { label: 'POW', key: 'powerAttr' },
                      { label: 'EVO', key: 'evolutionAttr' }
                    ].map(attr => (
                      <div key={attr.key}>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center', fontWeight: 'bold' }}>{attr.label}</label>
                        <input 
                          type="number" 
                          min="50" 
                          max="99" 
                          value={newAthlete[attr.key]} 
                          onChange={e => setNewAthlete({...newAthlete, [attr.key]: e.target.value})} 
                          style={{
                            width: '100%',
                            padding: '10px 4px',
                            background: 'rgba(0,0,0,0.5)',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '8px',
                            outline: 'none',
                            fontSize: '0.8rem',
                            transition: 'all 0.2s',
                            textAlign: 'center'
                          }}
                          onFocus={e => {
                            e.currentTarget.style.borderColor = '#06b6d4';
                          }}
                          onBlur={e => {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {formError && <p style={{ color: 'var(--accent-red)', fontWeight: 'bold', fontSize: '0.8rem', margin: '5px 0' }}>{formError}</p>}
                {formSuccess && <p style={{ color: 'var(--accent-green)', fontWeight: 'bold', fontSize: '0.8rem', margin: '5px 0' }}>{formSuccess}</p>}

                <button 
                  type="submit" 
                  disabled={adding} 
                  className="btn" 
                  style={{ 
                    padding: '14px', 
                    fontSize: '0.9rem', 
                    marginTop: '10px',
                    fontWeight: '800',
                    letterSpacing: '1px',
                    background: 'linear-gradient(135deg, var(--primary-color) 0%, #ea580c 100%)',
                    border: 'none',
                    color: '#000',
                    borderRadius: '12px',
                    boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(249, 115, 22, 0.5)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(249, 115, 22, 0.3)';
                  }}
                >
                  {adding ? 'REGISTRANDO...' : 'ALISTAR ATLETA'}
                </button>
              </form>
            </section>

            {/* Right Side: Roster Table Panel */}
            <section style={{
              background: 'rgba(8, 12, 24, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '24px',
              padding: '30px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
            }}>
              <h3 style={{ marginBottom: '10px', color: 'var(--primary-color)', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '1.1rem', fontWeight: '800' }}>Atletas Monitorados</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '25px', fontSize: '0.8rem', lineHeight: '1.4' }}>
                Acompanhe a relação **ACWR (Aguda vs Crônica)**. Emissão de Card Histórico habilitada para atletas qualificados com 3+ PRs.
              </p>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--primary-color)', color: 'rgba(255,255,255,0.4)', background: 'rgba(0,0,0,0.3)', fontSize: '0.75rem', letterSpacing: '1px' }}>
                      <th style={{ padding: '16px 12px', fontWeight: 'bold' }}>NOME</th>
                      <th style={{ padding: '16px 12px', fontWeight: 'bold' }}>POSIÇÃO</th>
                      <th style={{ padding: '16px 12px', fontWeight: 'bold', textAlign: 'center' }}>OVR</th>
                      <th style={{ padding: '16px 12px', fontWeight: 'bold', textAlign: 'center' }}>CARGA (ACWR)</th>
                      <th style={{ padding: '16px 12px', fontWeight: 'bold', textAlign: 'center' }}>AÇÕES DE PERFORMANCE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {athletes.map(athlete => (
                      <tr 
                        key={athlete.id} 
                        style={{ 
                          borderBottom: '1px solid rgba(255,255,255,0.06)', 
                          background: athlete.isMVP ? 'rgba(250,204,21,0.02)' : 'transparent',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = athlete.isMVP ? 'rgba(250,204,21,0.04)' : 'rgba(255,255,255,0.01)'}
                        onMouseLeave={e => e.currentTarget.style.background = athlete.isMVP ? 'rgba(250,204,21,0.02)' : 'transparent'}
                      >
                        <td style={{ padding: '16px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button 
                            type="button"
                            onClick={() => handleSetMVP(athlete.id)} 
                            title={athlete.isMVP ? "Deselecionar MVP" : "Eleger como MVP do Time"}
                            style={{ 
                              background: 'transparent', 
                              border: 'none', 
                              cursor: 'pointer', 
                              fontSize: '1.3rem', 
                              color: athlete.isMVP ? '#facc15' : 'rgba(255,255,255,0.15)', 
                              padding: 0,
                              transition: 'transform 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            👑
                          </button>
                          <div>
                            <Link href={`/coach/roster/${athlete.id}`} style={{ textDecoration: 'none' }}>
                              <strong style={{ 
                                display: 'block', 
                                color: athlete.isMVP ? '#facc15' : '#fff', 
                                fontSize: '0.85rem',
                                transition: 'color 0.2s',
                                cursor: 'pointer'
                              }}
                              onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-color)'}
                              onMouseLeave={e => e.currentTarget.style.color = athlete.isMVP ? '#facc15' : '#fff'}
                              >
                                {athlete.name} ↗
                              </strong>
                            </Link>
                            {athlete.prCount >= 3 ? (
                              <span style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '4px', 
                                fontSize: '0.65rem', 
                                color: '#22c55e', 
                                background: 'rgba(34,197,94,0.08)', 
                                padding: '2px 6px', 
                                borderRadius: '4px',
                                marginTop: '4px',
                                border: '1px solid rgba(34,197,94,0.2)'
                              }}>
                                🏆 ELITE ({athlete.prCount} PRs)
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                PRs Ativos: {athlete.prCount || 0}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '16px 12px' }}>
                          <span style={{ 
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: 'rgba(255,255,255,0.7)',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }}>{athlete.position}</span>
                        </td>
                        <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                          <input 
                            type="number" 
                            value={athlete.overall} 
                            onChange={(e) => updateOVR(athlete.id, e.target.value)}
                            style={{ 
                              padding: '6px', 
                              background: 'rgba(0,0,0,0.5)', 
                              color: 'var(--primary-color)', 
                              border: '2px solid var(--primary-color)', 
                              borderRadius: '50%', 
                              width: '42px', 
                              height: '42px', 
                              fontWeight: '900', 
                              textAlign: 'center',
                              fontSize: '0.9rem',
                              outline: 'none',
                              boxShadow: '0 0 10px rgba(249, 115, 22, 0.15)'
                            }} 
                          />
                        </td>
                        <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                          {getACWRBadge(athlete.acwr || 0)}
                        </td>
                        <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                            {/* Customizar (Gear) */}
                            <button
                              type="button"
                              onClick={() => triggerOverride(athlete)}
                              title="Customizar Ajustes Cosméticos (Tema, Foto, Borda)"
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(250, 204, 21, 0.2)',
                                background: 'rgba(250, 204, 21, 0.08)',
                                color: '#facc15',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = '#facc15';
                                e.currentTarget.style.color = '#000';
                                e.currentTarget.style.boxShadow = '0 0 12px rgba(250, 204, 21, 0.4)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(250, 204, 21, 0.08)';
                                e.currentTarget.style.color = '#facc15';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              ⚙️
                            </button>
    
                            {/* Editar (Pencil) */}
                            <button
                              type="button"
                              onClick={() => startEditAthlete(athlete)}
                              title="Editar Informações Cadastrais e Atributos"
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(249, 115, 22, 0.2)',
                                background: 'rgba(249, 115, 22, 0.08)',
                                color: '#f97316',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = '#f97316';
                                e.currentTarget.style.color = '#000';
                                e.currentTarget.style.boxShadow = '0 0 12px rgba(249, 115, 22, 0.4)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(249, 115, 22, 0.08)';
                                e.currentTarget.style.color = '#f97316';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              ✏️
                            </button>
    
                            {/* Fisiológico (Chart) */}
                            <button
                              type="button"
                              onClick={() => setSelectedPhysioAthleteId(athlete.id)}
                              title="Ver Fisiológico & Controle de Carga ACWR"
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(6, 182, 212, 0.2)',
                                background: 'rgba(6, 182, 212, 0.08)',
                                color: '#06b6d4',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = '#06b6d4';
                                e.currentTarget.style.color = '#000';
                                e.currentTarget.style.boxShadow = '0 0 12px rgba(6, 182, 212, 0.4)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(6, 182, 212, 0.08)';
                                e.currentTarget.style.color = '#06b6d4';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              📈
                            </button>
    
                            {/* Espiar (Eye) */}
                            <button
                              type="button"
                              onClick={() => setSelectedAthleteId(athlete.id)}
                              title="Espiar Locker Room do Atleta (Visualizar Painel)"
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(56, 189, 248, 0.2)',
                                background: 'rgba(56, 189, 248, 0.08)',
                                color: '#38bdf8',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = '#38bdf8';
                                e.currentTarget.style.color = '#000';
                                e.currentTarget.style.boxShadow = '0 0 12px rgba(56, 189, 248, 0.4)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(56, 189, 248, 0.08)';
                                e.currentTarget.style.color = '#38bdf8';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              👁️
                            </button>
                            
                            {/* Card Histórico (Trophy) */}
                            {athlete.prCount >= 3 ? (
                              <Link
                                href={`/athlete/${athlete.id}?history=true`}
                                title="Ver Card Histórico de Elite (Qualificado)"
                                style={{ 
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '10px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '1px solid rgba(34, 197, 94, 0.2)',
                                  background: 'rgba(34, 197, 94, 0.08)',
                                  color: '#22c55e',
                                  cursor: 'pointer',
                                  fontSize: '1rem',
                                  textDecoration: 'none',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.background = '#22c55e';
                                  e.currentTarget.style.color = '#000';
                                  e.currentTarget.style.boxShadow = '0 0 12px rgba(34, 197, 94, 0.4)';
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.background = 'rgba(34, 197, 94, 0.08)';
                                  e.currentTarget.style.color = '#22c55e';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              >
                                🏆
                              </Link>
                            ) : (
                              <div
                                title="Card Histórico Bloqueado (Mínimo de 3 PRs necessários)"
                                style={{ 
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '10px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '1px solid rgba(255, 255, 255, 0.04)',
                                  background: 'rgba(255, 255, 255, 0.01)',
                                  color: 'rgba(255, 255, 255, 0.15)',
                                  cursor: 'not-allowed',
                                  fontSize: '1rem'
                                }}
                              >
                                🏆
                              </div>
                            )}
                            
                            {/* Copiar Link (Link) */}
                            <button 
                              type="button"
                              onClick={() => copyLink(athlete.id)} 
                              title="Copiar Link Único de Acesso do Atleta"
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(148, 163, 184, 0.2)',
                                background: 'rgba(148, 163, 184, 0.08)',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = '#94a3b8';
                                e.currentTarget.style.color = '#000';
                                e.currentTarget.style.boxShadow = '0 0 12px rgba(148, 163, 184, 0.4)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(148, 163, 184, 0.08)';
                                e.currentTarget.style.color = '#94a3b8';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              🔗
                            </button>

                            {/* Excluir Atleta */}
                            <button 
                              type="button"
                              onClick={() => handleDeleteAthlete(athlete.id, athlete.name)} 
                              title="Excluir Atleta da Plataforma"
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                background: 'rgba(239, 68, 68, 0.08)',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = '#ef4444';
                                e.currentTarget.style.color = '#000';
                                e.currentTarget.style.boxShadow = '0 0 12px rgba(239, 68, 68, 0.4)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                                e.currentTarget.style.color = '#ef4444';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              🗑️
                            </button>

                          </div>
                        </td>
                      </tr>
                    ))}
                    {athletes.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>Nenhum atleta cadastrado. Use o painel ao lado para registrar.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
    
          {/* Comparador Holográfico 3D */}
          <div style={{ marginTop: '35px' }}>
            <HolographicComparator athletes={athletes} />
          </div>
        </>
      ) : (
        /* GERENCIAR TIME (TEAM HQ) VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '25px' }}>
          {/* Left: Editor Form */}
          <section className="card-panel" style={{ height: 'fit-content', border: '1px solid #1e293b' }}>
            <h3 style={{ marginBottom: '10px', color: 'var(--primary-color)' }}>
              {teamData ? 'Editar Configurações do Time' : 'Cadastrar Novo Time'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
              Configure o brasão, cores oficiais, estatísticas e a história do seu time na plataforma.
            </p>

            <form onSubmit={handleSaveTeam} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Nome do Time</label>
                <input 
                  required 
                  placeholder="Ex: Ascend Athletics" 
                  value={teamForm.name} 
                  onChange={e => setTeamForm({...teamForm, name: e.target.value})} 
                  style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Abreviação</label>
                  <input 
                    required 
                    placeholder="Ex: AA" 
                    maxLength="4"
                    value={teamForm.abbreviation} 
                    onChange={e => setTeamForm({...teamForm, abbreviation: e.target.value.toUpperCase()})} 
                    style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', textAlign: 'center' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Ano de Fundação</label>
                  <input 
                    placeholder="Ex: 2024" 
                    value={teamForm.founded} 
                    onChange={e => setTeamForm({...teamForm, founded: e.target.value})} 
                    style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', textAlign: 'center' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '15px', alignItems: 'center' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Cor Primária (Hex)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      placeholder="#f97316" 
                      value={teamForm.primaryColor} 
                      onChange={e => setTeamForm({...teamForm, primaryColor: e.target.value})} 
                      style={{ flexGrow: 1, padding: '12px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }} 
                    />
                    <input 
                      type="color" 
                      value={teamForm.primaryColor} 
                      onChange={e => setTeamForm({...teamForm, primaryColor: e.target.value})} 
                      style={{ width: '45px', height: '45px', border: '1px solid #334155', background: 'transparent', cursor: 'pointer', padding: 0 }} 
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Presets</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['#f97316', '#06b6d4', '#eab308', '#22c55e', '#ef4444'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setTeamForm({...teamForm, primaryColor: c})}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: c,
                          border: teamForm.primaryColor === c ? '2px solid #fff' : 'none',
                          cursor: 'pointer'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Brasão do Time</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input 
                    placeholder="Cole o link da imagem ou upe um arquivo local" 
                    value={teamForm.logoUrl && teamForm.logoUrl.startsWith('data:') ? 'Imagem Local (Base64)' : teamForm.logoUrl} 
                    onChange={e => setTeamForm({...teamForm, logoUrl: e.target.value})} 
                    style={{ flexGrow: 1, padding: '12px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }} 
                  />
                  <label className="btn" style={{
                    padding: '12px 15px',
                    fontSize: '0.8rem',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    margin: 0
                  }}>
                    📁 Upar
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleTeamLogoUpload} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>História / Storytelling</label>
                <textarea 
                  rows="4"
                  placeholder="Escreva a lenda do seu time..." 
                  value={teamForm.history} 
                  onChange={e => setTeamForm({...teamForm, history: e.target.value})} 
                  style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', resize: 'vertical' }} 
                />
              </div>

              {/* Statistics */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--primary-color)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Estatísticas da Temporada</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '3px', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Vitórias</label>
                    <input 
                      type="number" 
                      min="0"
                      value={teamForm.wins} 
                      onChange={e => setTeamForm({...teamForm, wins: e.target.value})} 
                      style={{ width: '100%', padding: '10px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', textAlign: 'center' }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '3px', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Derrotas</label>
                    <input 
                      type="number" 
                      min="0"
                      value={teamForm.losses} 
                      onChange={e => setTeamForm({...teamForm, losses: e.target.value})} 
                      style={{ width: '100%', padding: '10px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', textAlign: 'center' }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '3px', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Empates</label>
                    <input 
                      type="number" 
                      min="0"
                      value={teamForm.draws} 
                      onChange={e => setTeamForm({...teamForm, draws: e.target.value})} 
                      style={{ width: '100%', padding: '10px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', textAlign: 'center' }} 
                    />
                  </div>
                </div>
              </div>

              {/* Activity Stats */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px', marginTop: '15px' }}>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--primary-color)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Parâmetros de Atividades</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '3px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Treinos por Semana</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 3 ou 3x por semana" 
                      value={teamForm.trainingFrequency} 
                      onChange={e => setTeamForm({...teamForm, trainingFrequency: e.target.value})} 
                      style={{ width: '100%', padding: '10px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '3px', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Títulos em Campeonatos</label>
                    <input 
                      type="number" 
                      min="0"
                      value={teamForm.championships} 
                      onChange={e => setTeamForm({...teamForm, championships: e.target.value})} 
                      style={{ width: '100%', padding: '10px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', textAlign: 'center' }} 
                    />
                  </div>
                </div>
              </div>

              {teamError && <p style={{ color: 'var(--accent-red)', fontWeight: 'bold', fontSize: '0.9rem' }}>{teamError}</p>}
              {teamSuccess && <p style={{ color: 'var(--accent-green)', fontWeight: 'bold', fontSize: '0.9rem' }}>{teamSuccess}</p>}

              <button type="submit" disabled={savingTeam} className="btn" style={{ padding: '12px', fontSize: '1rem', marginTop: '10px' }}>
                {savingTeam ? 'SALVANDO...' : teamData ? 'SALVAR ALTERAÇÕES' : 'CRIAR TIME'}
              </button>
            </form>
          </section>

          {/* Right: Live Preview */}
          <section className="card-panel" style={{ height: 'fit-content', border: '1px solid #1e293b' }}>
            <h3 style={{ marginBottom: '15px', color: 'var(--primary-color)' }}>Visualização em Tempo Real (Preview)</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '25px', fontSize: '0.9rem' }}>
              Como os atletas verão a seção do time em seus dashboards.
            </p>

            <div style={{
              background: 'rgba(8, 12, 24, 0.95)',
              border: `1.5px solid ${teamForm.primaryColor || '#06b6d4'}40`,
              borderRadius: '24px',
              padding: '25px',
              boxShadow: `0 15px 35px rgba(0,0,0,0.5), 0 0 20px ${teamForm.primaryColor || '#06b6d4'}15`,
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Ambient Background Glow */}
              <div style={{
                position: 'absolute',
                top: '-50px',
                left: '-50px',
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: `${teamForm.primaryColor || '#f97316'}15`,
                filter: 'blur(40px)',
                pointerEvents: 'none',
                zIndex: 1
              }} />

              {/* Title */}
              <h3 style={{ 
                fontSize: '0.9rem', 
                color: teamForm.primaryColor || '#06b6d4', 
                letterSpacing: '1px', 
                textTransform: 'uppercase', 
                margin: '0 0 20px 0',
                fontWeight: '800',
                zIndex: 2,
                position: 'relative'
              }}>
                🛡️ TEAM HQ // SEDE DO TIME
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 2, position: 'relative' }}>
                {/* Crest */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  {teamForm.logoUrl ? (
                    <img 
                      src={teamForm.logoUrl} 
                      alt="Preview logo" 
                      style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: `3px solid ${teamForm.primaryColor || '#f97316'}`,
                        boxShadow: `0 0 15px ${teamForm.primaryColor || '#f97316'}40`,
                        backgroundColor: '#0a0f1d'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `3px solid ${teamForm.primaryColor || '#f97316'}`,
                      boxShadow: `0 0 15px ${teamForm.primaryColor || '#f97316'}40`,
                      background: 'radial-gradient(circle, #1e293b 0%, #0f172a 100%)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', padding: '10px' }}>
                        <defs>
                          <linearGradient id="shieldGradPreview" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={teamForm.primaryColor || '#f97316'} />
                            <stop offset="100%" stopColor="#0a0a0a" />
                          </linearGradient>
                        </defs>
                        <path 
                          d="M50 10 L80 25 L80 60 C80 80 50 90 50 90 C50 90 20 80 20 60 L20 25 Z" 
                          fill="url(#shieldGradPreview)" 
                          stroke={teamForm.primaryColor || '#f97316'} 
                          strokeWidth="2"
                        />
                        <text 
                          x="50" 
                          y="58" 
                          fontFamily="var(--font-display)" 
                          fontSize="24" 
                          fontWeight="900" 
                          fill="#ffffff" 
                          textAnchor="middle"
                        >
                          {teamForm.abbreviation || (teamForm.name ? teamForm.name.substring(0, 2).toUpperCase() : 'AA')}
                        </text>
                      </svg>
                    </div>
                  )}
                </div>

                {/* Team metadata */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', margin: 0, textTransform: 'uppercase', color: '#fff' }}>
                      {teamForm.name || 'NOME DO TIME'}
                    </h4>
                    <span style={{ 
                      background: `${teamForm.primaryColor || '#f97316'}20`, 
                      border: `1px solid ${teamForm.primaryColor || '#f97316'}`, 
                      color: teamForm.primaryColor || '#f97316',
                      padding: '2px 8px',
                      borderRadius: '8px',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      fontFamily: 'var(--font-display)'
                    }}>
                      {teamForm.abbreviation || 'AA'}
                    </span>
                  </div>
                  {teamForm.founded && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                      EST. {teamForm.founded}
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '5px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', borderLeft: '3px solid #22c55e', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Vitórias</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>{teamForm.wins || 0}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', borderLeft: '3px solid #ef4444', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Derrotas</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>{teamForm.losses || 0}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', borderLeft: '3px solid #94a3b8', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Empates</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>{teamForm.draws || 0}</div>
                  </div>
                </div>

                {/* Activity Stats Preview */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '5px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', borderLeft: `3px solid ${teamForm.primaryColor || '#f97316'}`, padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Treinos/Sem</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>{teamForm.trainingFrequency || '3'}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', borderLeft: `3px solid ${teamForm.primaryColor || '#f97316'}`, padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Atletas</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>{athletes.length || 0}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', borderLeft: `3px solid ${teamForm.primaryColor || '#f97316'}`, padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Títulos</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>{teamForm.championships || 0}</div>
                  </div>
                </div>

                {/* History Previews */}
                {teamForm.history && (
                  <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px' }}>
                    <strong style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>História do Time (Previa)</strong>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', lineHeight: '1.4' }}>
                      {teamForm.history}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* POPUP MODAL: TACTICAL ESPIONAGE DASHBOARD */}
      {selectedAthleteId && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '40px 20px',
          overflowY: 'auto'
        }}>
          <div style={{ maxWidth: '1200px', width: '100%', position: 'relative', margin: 'auto' }}>
            <button 
              onClick={() => setSelectedAthleteId(null)}
              style={{
                position: 'absolute',
                top: '-35px',
                right: '0',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '1.8rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                zIndex: 1010
              }}
            >
              ✖ fechar
            </button>
            <TacticalDashboard athleteId={selectedAthleteId} />
          </div>
        </div>
      )}

      {/* POPUP MODAL: PHYSIOLOGICAL ANALYSIS DASHBOARD */}
      {selectedPhysioAthleteId && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{ maxWidth: '750px', width: '100%', position: 'relative' }}>
            <button 
              onClick={() => setSelectedPhysioAthleteId(null)}
              style={{
                position: 'absolute',
                top: '-35px',
                right: '0',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '1.8rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                zIndex: 1010
              }}
            >
              ✖ fechar
            </button>
            <PhysioDashboard athleteId={selectedPhysioAthleteId} />
          </div>
        </div>
      )}

      {/* POPUP MODAL: EDIT ATHLETE DETAILS */}
      {editingAthlete && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="card-panel" style={{ maxWidth: '500px', width: '100%', position: 'relative', border: '1.5px solid var(--primary-color)', background: 'var(--bg-surface)' }}>
            <button 
              onClick={() => setEditingAthlete(null)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '1.2rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                zIndex: 1010
              }}
            >
              ✖
            </button>
            <h3 style={{ marginBottom: '15px', color: 'var(--primary-color)' }}>Editar Cadastro do Atleta</h3>
            
            <form onSubmit={handleSaveEditAthlete} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Nome do Atleta</label>
                <input required placeholder="Ex: T. Brady" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Posição / Grupo</label>
                  <select value={editForm.position} onChange={e => setEditForm({...editForm, position: e.target.value})} style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }}>
                    <option value="QB">QB</option>
                    <option value="OL">OL (Linha Ofensiva)</option>
                    <option value="DL">DL (Linha Defensiva)</option>
                    <option value="Skills">Skills (WR/RB/DB)</option>
                    <option value="Forwards">Forwards (Rugby)</option>
                    <option value="Backs">Backs (Rugby)</option>
                    <option value="Força Base">Força Base (Powerlifting)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Overall (OVR)</label>
                  <input type="number" min="50" max="99" value={editForm.overall} onChange={e => setEditForm({...editForm, overall: e.target.value})} style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', textAlign: 'center' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>E-mail (Login)</label>
                <input type="email" placeholder="email@atleta.com" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Foto de Perfil</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input 
                    placeholder="Link da foto ou faça upload" 
                    value={editForm.profilePhoto && editForm.profilePhoto.startsWith('data:') ? 'Imagem carregada localmente' : editForm.profilePhoto} 
                    onChange={e => setEditForm({...editForm, profilePhoto: e.target.value})} 
                    style={{ flexGrow: 1, padding: '12px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }} 
                  />
                  <label className="btn" style={{
                    padding: '12px 15px',
                    fontSize: '0.8rem',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    margin: 0
                  }}>
                    📁 Upar
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleEditImageUpload} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>
              </div>

              {/* Physical Metrics Grid */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--primary-color)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Métricas Físicas</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '3px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Altura (ex: 6'2")</label>
                    <input placeholder={"6'2\""} value={editForm.height} onChange={e => setEditForm({...editForm, height: e.target.value})} style={{ width: '100%', padding: '10px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', fontSize: '0.85rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '3px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Peso (ex: 220 lbs)</label>
                    <input placeholder="220 lbs" value={editForm.weight} onChange={e => setEditForm({...editForm, weight: e.target.value})} style={{ width: '100%', padding: '10px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', fontSize: '0.85rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '3px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Envergadura (ex: 75")</label>
                    <input placeholder={"75\""} value={editForm.wingspan} onChange={e => setEditForm({...editForm, wingspan: e.target.value})} style={{ width: '100%', padding: '10px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', fontSize: '0.85rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '3px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tamanho da Mão</label>
                    <input placeholder={"9.5\""} value={editForm.handSize} onChange={e => setEditForm({...editForm, handSize: e.target.value})} style={{ width: '100%', padding: '10px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', fontSize: '0.85rem' }} />
                  </div>
                </div>
              </div>

              {/* Custom Attributes Grid */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px', marginBottom: '10px' }}>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--primary-color)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Atributos de Performance (50-99)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '3px', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>FOR</label>
                    <input type="number" min="50" max="99" value={editForm.forceAttr} onChange={e => setEditForm({...editForm, forceAttr: e.target.value})} style={{ width: '100%', padding: '8px 2px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', textAlign: 'center', fontSize: '0.85rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '3px', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>HAB</label>
                    <input type="number" min="50" max="99" value={editForm.skillAttr} onChange={e => setEditForm({...editForm, skillAttr: e.target.value})} style={{ width: '100%', padding: '8px 2px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', textAlign: 'center', fontSize: '0.85rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '3px', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>VEL</label>
                    <input type="number" min="50" max="99" value={editForm.speedAttr} onChange={e => setEditForm({...editForm, speedAttr: e.target.value})} style={{ width: '100%', padding: '8px 2px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', textAlign: 'center', fontSize: '0.85rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '3px', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>POW</label>
                    <input type="number" min="50" max="99" value={editForm.powerAttr} onChange={e => setEditForm({...editForm, powerAttr: e.target.value})} style={{ width: '100%', padding: '8px 2px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', textAlign: 'center', fontSize: '0.85rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '3px', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>EVO</label>
                    <input type="number" min="50" max="99" value={editForm.evolutionAttr} onChange={e => setEditForm({...editForm, evolutionAttr: e.target.value})} style={{ width: '100%', padding: '8px 2px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', textAlign: 'center', fontSize: '0.85rem' }} />
                  </div>
                </div>
              </div>

              {editError && <p style={{ color: 'var(--accent-red)', fontWeight: 'bold', fontSize: '0.9rem', margin: 0 }}>{editError}</p>}

              <button type="submit" disabled={savingEdit} className="btn" style={{ padding: '12px', fontSize: '1rem', marginTop: '10px' }}>
                {savingEdit ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
    </>
  );
}
