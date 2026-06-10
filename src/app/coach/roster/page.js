"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import TacticalDashboard from '@/components/TacticalDashboard';
import PhysioDashboard from '@/components/PhysioDashboard';
import HolographicComparator from '@/components/HolographicComparator';

export default function RosterAdmin() {
  const [coach, setCoach] = useState(null);
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
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
        fetchAthletes(coach.id);
      } else {
        setEditError(data.error || 'Erro ao atualizar atleta.');
      }
    } catch (err) {
      setEditError('Erro de conexão ao salvar alterações.');
    }
    setSavingEdit(false);
  };

  useEffect(() => {
    const storedCoach = localStorage.getItem('coach');
    if (storedCoach) {
      const parsedCoach = JSON.parse(storedCoach);
      setCoach(parsedCoach);
      fetchAthletes(parsedCoach.id);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!coach) return;

    const eventSource = new EventSource('/api/coach/roster/sse');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Recebido novo treino concluído em tempo real:", data);
        
        // 1. Atualizar o roster localmente
        setAthletes(prev => prev.map(ath => {
          if (ath.id === data.athleteId) {
            return {
              ...ath,
              overall: data.overall,
              attendanceCount: data.attendanceCount,
              prCount: data.prCount
            };
          }
          return ath;
        }));

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

  const fetchAthletes = async (coachId) => {
    try {
      const res = await fetch(`/api/coach/roster?coachId=${coachId}`);
      const data = await res.json();
      if (data.success) {
        setAthletes(data.athletes);
      }
    } catch (err) {
      console.error("Erro ao carregar roster:", err);
    }
    setLoading(false);
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
    let bgColor = 'rgba(255,255,255,0.05)';
    let color = '#94a3b8';
    
    if (acwr > 0) {
      if (acwr < 0.8) {
        text = `${acwr} - Subtreino`;
        bgColor = 'rgba(56, 189, 248, 0.1)';
        color = '#38bdf8';
      } else if (acwr <= 1.3) {
        text = `${acwr} - Ideal`;
        bgColor = 'rgba(34, 197, 94, 0.1)';
        color = '#22c55e';
      } else if (acwr <= 1.5) {
        text = `${acwr} - Cuidado`;
        bgColor = 'rgba(234, 179, 8, 0.1)';
        color = '#eab308';
      } else {
        text = `${acwr} - Risco de Lesão`;
        bgColor = 'rgba(239, 68, 68, 0.15)';
        color = '#ef4444';
      }
    }
    
    return (
      <span style={{ 
        padding: '6px 12px', 
        borderRadius: '20px', 
        background: bgColor, 
        color: color, 
        fontWeight: 'bold', 
        fontSize: '0.75rem',
        border: `1px solid ${color}`,
        display: 'inline-block'
      }}>
        {text}
      </span>
    );
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: '#fff', fontSize: '1.2rem' }}>Carregando Roster Oficial...</div>;

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
    <div className="container" style={{ paddingBottom: '50px' }}>
      
      {/* Navigation */}
      <nav style={{ padding: 'var(--spacing-md) 0', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <div>
          <h2 style={{ color: 'var(--primary-color)', margin: 0 }}>ROSTER ADMIN</h2>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {coach.teamName ? `${coach.teamName} - ` : ''}{getRoleText(coach.role)}: {coach.name}
          </span>
        </div>
        <Link href="/coach" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 'bold' }}>&larr; Voltar pro Playbook</Link>
      </nav>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.9fr', gap: '25px' }}>
        
        {/* Left Side: Register Form */}
        <section className="card-panel" style={{ height: 'fit-content', border: '1px solid #1e293b' }}>
          <h3 style={{ marginBottom: '10px', color: 'var(--primary-color)' }}>Alistar Novo Atleta</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
            Cadastre atletas para acompanhamento fisiológico, controle de carga ACWR e gamificação.
          </p>

          <form onSubmit={handleRegisterAthlete} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Nome do Atleta</label>
              <input required placeholder="Ex: T. Brady" value={newAthlete.name} onChange={e => setNewAthlete({...newAthlete, name: e.target.value})} style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Posição / Grupo</label>
                <select value={newAthlete.position} onChange={e => setNewAthlete({...newAthlete, position: e.target.value})} style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }}>
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
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>OVR Inicial</label>
                <input type="number" min="50" max="99" value={newAthlete.overall} onChange={e => setNewAthlete({...newAthlete, overall: e.target.value})} style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', textAlign: 'center' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>E-mail (Opcional)</label>
              <input type="email" placeholder="email@atleta.com" value={newAthlete.email} onChange={e => setNewAthlete({...newAthlete, email: e.target.value})} style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Senha Temporária</label>
              <input type="password" placeholder="Mínimo 6 caracteres" value={newAthlete.password} onChange={e => setNewAthlete({...newAthlete, password: e.target.value})} style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }} />
            </div>

            {/* Physical Metrics Grid */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--primary-color)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Métricas Físicas</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '3px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Altura (ex: 6'2")</label>
                  <input placeholder={"6'2\""} value={newAthlete.height} onChange={e => setNewAthlete({...newAthlete, height: e.target.value})} style={{ width: '100%', padding: '10px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '3px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Peso (ex: 220 lbs)</label>
                  <input placeholder="220 lbs" value={newAthlete.weight} onChange={e => setNewAthlete({...newAthlete, weight: e.target.value})} style={{ width: '100%', padding: '10px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '3px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Envergadura (ex: 75")</label>
                  <input placeholder={"75\""} value={newAthlete.wingspan} onChange={e => setNewAthlete({...newAthlete, wingspan: e.target.value})} style={{ width: '100%', padding: '10px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '3px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tamanho da Mão</label>
                  <input placeholder={"9.5\""} value={newAthlete.handSize} onChange={e => setNewAthlete({...newAthlete, handSize: e.target.value})} style={{ width: '100%', padding: '10px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', fontSize: '0.85rem' }} />
                </div>
              </div>
            </div>

            {/* Custom Attributes Grid */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px', marginBottom: '10px' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--primary-color)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Atributos de Performance (50-99)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '3px', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>FOR</label>
                  <input type="number" min="50" max="99" value={newAthlete.forceAttr} onChange={e => setNewAthlete({...newAthlete, forceAttr: e.target.value})} style={{ width: '100%', padding: '8px 2px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', textAlign: 'center', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '3px', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>HAB</label>
                  <input type="number" min="50" max="99" value={newAthlete.skillAttr} onChange={e => setNewAthlete({...newAthlete, skillAttr: e.target.value})} style={{ width: '100%', padding: '8px 2px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', textAlign: 'center', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '3px', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>VEL</label>
                  <input type="number" min="50" max="99" value={newAthlete.speedAttr} onChange={e => setNewAthlete({...newAthlete, speedAttr: e.target.value})} style={{ width: '100%', padding: '8px 2px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', textAlign: 'center', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '3px', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>POW</label>
                  <input type="number" min="50" max="99" value={newAthlete.powerAttr} onChange={e => setNewAthlete({...newAthlete, powerAttr: e.target.value})} style={{ width: '100%', padding: '8px 2px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', textAlign: 'center', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '3px', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>EVO</label>
                  <input type="number" min="50" max="99" value={newAthlete.evolutionAttr} onChange={e => setNewAthlete({...newAthlete, evolutionAttr: e.target.value})} style={{ width: '100%', padding: '8px 2px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px', textAlign: 'center', fontSize: '0.85rem' }} />
                </div>
              </div>
            </div>

            {formError && <p style={{ color: 'var(--accent-red)', fontWeight: 'bold', fontSize: '0.9rem' }}>{formError}</p>}
            {formSuccess && <p style={{ color: 'var(--accent-green)', fontWeight: 'bold', fontSize: '0.9rem' }}>{formSuccess}</p>}

            <button type="submit" disabled={adding} className="btn" style={{ padding: '12px', fontSize: '1rem', marginTop: '10px' }}>
              {adding ? 'REGISTRANDO...' : 'ALISTAR ATLETA'}
            </button>
          </form>
        </section>

        {/* Right Side: Roster Table */}
        <section className="card-panel" style={{ border: '1px solid #1e293b' }}>
          <h3 style={{ marginBottom: '10px', color: 'var(--primary-color)' }}>Atletas Monitorados</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
            Acompanhe a relação **ACWR (Aguda vs Crônica)**. Emissão de Card Histórico habilitada para atletas com 3+ PRs.
          </p>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--primary-color)', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.5)' }}>
                  <th style={{ padding: '12px' }}>NOME</th>
                  <th style={{ padding: '12px' }}>POSIÇÃO</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>OVR</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>CARGA DE TREINO (ACWR)</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>AÇÕES DE PERFORMANCE</th>
                </tr>
              </thead>
              <tbody>
                {athletes.map(athlete => (
                  <tr key={athlete.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: athlete.isMVP ? 'rgba(250,204,21,0.02)' : 'transparent' }}>
                    <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button 
                        onClick={() => handleSetMVP(athlete.id)} 
                        title={athlete.isMVP ? "MVP do Time" : "Eleger como MVP"}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.3rem', color: athlete.isMVP ? '#facc15' : 'rgba(255,255,255,0.15)', padding: 0 }}
                      >
                        👑
                      </button>
                      <div>
                        <strong style={{ display: 'block', color: athlete.isMVP ? '#facc15' : '#fff' }}>
                          {athlete.name}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          PRs Ativos: {athlete.prCount || 0}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{athlete.position}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <input 
                        type="number" 
                        value={athlete.overall} 
                        onChange={(e) => updateOVR(athlete.id, e.target.value)}
                        style={{ padding: '6px', background: '#000', color: 'var(--primary-color)', border: '1px solid var(--primary-color)', borderRadius: '4px', width: '55px', fontWeight: 'bold', textAlign: 'center' }} 
                      />
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {getACWRBadge(athlete.acwr || 0)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                        <button
                          onClick={() => triggerOverride(athlete)}
                          className="btn"
                          style={{ padding: '6px 10px', fontSize: '0.75rem', background: 'rgba(250, 204, 21, 0.1)', color: 'var(--primary-color)', border: '1px solid var(--primary-color)' }}
                        >
                          Customizar ⚙️
                        </button>

                        <button
                          onClick={() => startEditAthlete(athlete)}
                          className="btn"
                          style={{ padding: '6px 10px', fontSize: '0.75rem', background: 'rgba(249, 115, 22, 0.15)', color: 'var(--primary-color)', border: '1px solid var(--primary-color)' }}
                        >
                          Editar ✏️
                        </button>

                        <button
                          onClick={() => setSelectedPhysioAthleteId(athlete.id)}
                          className="btn"
                          style={{ padding: '6px 10px', fontSize: '0.75rem', background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', border: '1px solid #06b6d4' }}
                        >
                          Fisiológico 📈
                        </button>

                        <button
                          onClick={() => setSelectedAthleteId(athlete.id)}
                          className="btn"
                          style={{ padding: '6px 10px', fontSize: '0.75rem', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid #38bdf8' }}
                        >
                          Espiar 👁️
                        </button>
                        
                        <Link
                          href={`/athlete/${athlete.id}?history=true`}
                          className="btn"
                          style={{ 
                            padding: '6px 10px', 
                            fontSize: '0.75rem', 
                            background: athlete.prCount >= 3 ? '#22c55e' : '#1e293b', 
                            color: '#fff', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            opacity: athlete.prCount >= 3 ? 1 : 0.4,
                            pointerEvents: athlete.prCount >= 3 ? 'auto' : 'none',
                            textDecoration: 'none',
                            display: 'inline-block'
                          }}
                        >
                          Card Histórico 🏆
                        </Link>
                        
                        <button 
                          onClick={() => copyLink(athlete.id)} 
                          className="btn" 
                          style={{ padding: '6px 10px', fontSize: '0.75rem', background: '#111827', border: '1px solid #374151' }}
                        >
                          Copiar Link 🔗
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
          padding: '20px'
        }}>
          <div style={{ maxWidth: '750px', width: '100%', position: 'relative' }}>
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
  );
}
