"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PlaybookCanvas from '@/components/PlaybookCanvas';
import { useCoach } from '@/contexts/CoachContext';

export default function CoachPlaybookPage() {
  const { coach, loadingCoach } = useCoach();
  const [plays, setPlays] = useState([]);
  const [roster, setRoster] = useState([]);
  const [loadingPlays, setLoadingPlays] = useState(true);

  // Form / Edit State
  const [currentPlay, setCurrentPlay] = useState(null); // null significa criar nova jogada
  const [playName, setPlayName] = useState('');
  const [playSport, setPlaySport] = useState('Futebol Americano');
  const [playExecution, setPlayExecution] = useState('Ataque'); // Ataque, Defesa, Special Teams
  const [playPosition, setPlayPosition] = useState('ALL'); // Position
  const [playDescription, setPlayDescription] = useState(''); // Description
  const [playDataJSON, setPlayDataJSON] = useState({ players: [] });
  const [filterExecution, setFilterExecution] = useState('Todas'); // Filtro de lista

  // Presets
  const [showPresets, setShowPresets] = useState(false);

  const presetPlays = [
    { name: 'Slant / Flat Combo', execution: 'Ataque', position: 'QB, WR, RB', description: 'WR corre Slant, RB corre Flat. Leitura rápida do LB/Flat defender.', dataJSON: { players: [ { id: 1, type: 'offense', x: 250, y: 300, label: 'QB', routes: [{x: 250, y: 320, type: 'pass'}] }, { id: 2, type: 'offense', x: 200, y: 250, label: 'WR', routes: [{x: 200, y: 150, type: 'run'}, {x: 300, y: 100, type: 'run'}] }, { id: 3, type: 'offense', x: 280, y: 300, label: 'RB', routes: [{x: 350, y: 280, type: 'run'}, {x: 400, y: 200, type: 'run'}] }, { id: 4, type: 'defense', x: 350, y: 200, label: 'LB', routes: [] } ] } },
    { name: 'Cover 3 Blitz', execution: 'Defesa', position: 'LB, SS, CB', description: 'SS desce para a caixa, OLB faz o blitz pelo edge.', dataJSON: { players: [ { id: 1, type: 'defense', x: 250, y: 200, label: 'MLB', routes: [{x: 250, y: 220, type: 'zone'}] }, { id: 2, type: 'defense', x: 180, y: 200, label: 'OLB', routes: [{x: 180, y: 250, type: 'run'}, {x: 220, y: 300, type: 'blitz'}] }, { id: 3, type: 'defense', x: 350, y: 100, label: 'FS', routes: [{x: 250, y: 80, type: 'zone'}] } ] } },
    { name: 'Punt Return Middle', execution: 'Special Teams', position: 'ALL', description: 'Bloqueio duplo nas pontas e retorno pelo centro.', dataJSON: { players: [ { id: 1, type: 'offense', x: 250, y: 350, label: 'PR', routes: [{x: 250, y: 150, type: 'run'}] }, { id: 2, type: 'offense', x: 200, y: 300, label: 'BLOCK', routes: [{x: 200, y: 250, type: 'block'}] }, { id: 3, type: 'offense', x: 300, y: 300, label: 'BLOCK', routes: [{x: 300, y: 250, type: 'block'}] } ] } }
  ];

  const loadPreset = (preset) => {
    startNewPlay();
    setPlayName(preset.name + ' (Cópia)');
    setPlayExecution(preset.execution);
    setPlayPosition(preset.position);
    setPlayDescription(preset.description);
    setPlayDataJSON(preset.dataJSON);
    setShowPresets(false);
  };

  // Assignment states
  const [selectedAthleteIds, setSelectedAthleteIds] = useState([]);
  const [assigning, setAssigning] = useState(false);

  // Status feedback alerts
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  // Feedbacks monitor states
  const [feedbacksReport, setFeedbacksReport] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  useEffect(() => {
    if (coach) {
      loadPlays(coach.id);
      loadRoster(coach.id);
    } else if (!loadingCoach) {
      setLoadingPlays(false);
    }
  }, [coach, loadingCoach]);

  const loadPlays = async (coachId) => {
    try {
      const res = await fetch(`/api/coach/plays?coachId=${coachId}`);
      const data = await res.json();
      if (data.success) {
        setPlays(data.plays);
      }
    } catch (e) {
      console.error(e);
    }
    setLoadingPlays(false);
  };

  const loadRoster = async (coachId) => {
    try {
      const res = await fetch(`/api/coach/roster?coachId=${coachId}`);
      const data = await res.json();
      if (data.success) {
        setRoster(data.athletes);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const showAlert = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg({ type: '', text: '' }), 5000);
  };

  // Trata alterações feitas no Canvas
  const handleCanvasChange = (data) => {
    setPlayDataJSON(data);
  };

  // Carrega feedbacks da jogada selecionada
  const loadFeedbacksReport = async (playId) => {
    setLoadingFeedbacks(true);
    try {
      const res = await fetch(`/api/coach/plays/${playId}/feedback`);
      const data = await res.json();
      if (data.success) {
        setFeedbacksReport(data.reports);
      } else {
        setFeedbacksReport([]);
      }
    } catch (e) {
      console.error(e);
    }
    setLoadingFeedbacks(false);
  };

  // Inicia criação de nova jogada
  const startNewPlay = () => {
    setCurrentPlay(null);
    setPlayName('');
    setPlaySport('Futebol Americano');
    setPlayExecution('Ataque');
    setPlayPosition('ALL');
    setPlayDescription('');
    setPlayDataJSON({ players: [] });
    setSelectedAthleteIds([]);
    setFeedbacksReport([]);
  };

  // Carrega jogada existente para visualização/edição
  const selectPlay = (play) => {
    setCurrentPlay(play);
    setPlayName(play.name);
    setPlaySport(play.sport);
    setPlayExecution(play.execution || 'Ataque');
    setPlayPosition(play.position || 'ALL');
    setPlayDescription(play.description || '');
    try {
      const parsed = typeof play.dataJSON === 'string' ? JSON.parse(play.dataJSON) : play.dataJSON;
      setPlayDataJSON(parsed);
    } catch (e) {
      setPlayDataJSON({ players: [] });
    }
    // Opcional: Carregar atribuições existentes da jogada
    setSelectedAthleteIds([]);
    loadFeedbacksReport(play.id);
  };

  // Salva jogada no banco (cria ou atualiza)
  const handleSavePlay = async (e) => {
    e.preventDefault();
    if (!coach) return;
    if (!playName.trim()) {
      showAlert('error', 'Por favor, digite um nome para a jogada.');
      return;
    }

    try {
      const res = await fetch('/api/coach/plays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: playName,
          sport: playSport,
          execution: playExecution,
          position: playPosition,
          description: playDescription,
          fieldSize: '600,400',
          dataJSON: playDataJSON,
          coachId: coach.id
        })
      });
      const data = await res.json();
      if (data.success) {
        showAlert('success', `Jogada "${playName}" salva com sucesso!`);
        startNewPlay();
        loadPlays(coach.id);
      } else {
        showAlert('error', data.error || 'Erro ao salvar jogada.');
      }
    } catch (err) {
      showAlert('error', 'Falha de conexão com o servidor.');
    }
  };

  // Exclui jogada salva
  const handleDeletePlay = async (playId, e) => {
    e.stopPropagation();
    if (!window.confirm("Tem certeza que deseja excluir esta jogada? Todos os atletas perderão o acesso a ela.")) return;
    
    try {
      const res = await fetch(`/api/coach/plays/${playId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showAlert('success', 'Jogada excluída com sucesso!');
        if (currentPlay?.id === playId) startNewPlay();
        loadPlays(coach.id);
      } else {
        showAlert('error', data.error || 'Erro ao excluir jogada.');
      }
    } catch (err) {
      showAlert('error', 'Falha de conexão ao excluir jogada.');
    }
  };

  // Atribui jogada aos atletas marcados
  const handleAssignPlay = async () => {
    if (!currentPlay) {
      showAlert('error', 'Selecione uma jogada salva na lista ao lado para poder atribuí-la.');
      return;
    }

    setAssigning(true);
    try {
      const res = await fetch('/api/coach/plays/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playId: currentPlay.id,
          athleteIds: selectedAthleteIds
        })
      });
      const data = await res.json();
      if (data.success) {
        showAlert('success', 'Jogada atribuída com sucesso aos atletas selecionados!');
        setSelectedAthleteIds([]);
        loadFeedbacksReport(currentPlay.id);
      } else {
        showAlert('error', data.error || 'Erro ao atribuir jogada.');
      }
    } catch (e) {
      showAlert('error', 'Erro de conexão ao atribuir jogada.');
    }
    setAssigning(false);
  };

  // Toggle seleção de atleta
  const toggleAthleteSelection = (id) => {
    setSelectedAthleteIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  if (loadingCoach || loadingPlays) return <div style={{ textAlign: 'center', padding: '100px', color: '#fff', fontSize: '1.2rem' }}>Carregando Playbook Tático...</div>;

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
          <h2 style={{ color: '#06b6d4', margin: 0 }}>PLAYBOOK TÁTICO</h2>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Crie rotas e movimentações e envie para o time
          </span>
        </div>
      </nav>

      {alertMsg.text && (
        <div style={{
          padding: '12px 15px',
          borderRadius: '4px',
          marginBottom: '20px',
          background: alertMsg.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${alertMsg.type === 'success' ? '#22c55e' : '#ef4444'}`,
          color: alertMsg.type === 'success' ? '#86efac' : '#fca5a5',
          fontWeight: 'bold',
          fontSize: '0.9rem'
        }}>
          {alertMsg.text}
        </div>
      )}

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '25px' }} id="playbook-grid">
        
        {/* Left Column: Plays list & Assigment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {/* Jogadas Salvas */}
          <section className="card-panel" style={{ border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>Jogadas Salvas</h3>
              <div>
                <button onClick={() => setShowPresets(!showPresets)} className="btn" style={{ padding: '5px 10px', fontSize: '0.75rem', background: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', marginRight: '5px' }}>
                  📚 Presets
                </button>
                <button onClick={startNewPlay} className="btn" style={{ padding: '5px 10px', fontSize: '0.75rem' }}>
                  + Nova Jogada
                </button>
              </div>
            </div>

            {showPresets && (
              <div style={{ background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '8px', marginBottom: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h4 style={{ color: '#06b6d4', fontSize: '0.8rem', marginTop: 0, marginBottom: '10px', textTransform: 'uppercase' }}>Biblioteca de Plays Padrões</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {presetPlays.map((preset, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '6px' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{preset.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{preset.execution} • {preset.position}</div>
                      </div>
                      <button onClick={() => loadPreset(preset)} style={{ background: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        Usar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
              {['Todas', 'Ataque', 'Defesa', 'Special Teams'].map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setFilterExecution(cat)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '0.75rem',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    background: filterExecution === cat ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                    color: filterExecution === cat ? '#fff' : 'var(--text-secondary)'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
              {plays.filter(p => filterExecution === 'Todas' || p.execution === filterExecution).map(play => (
                <div 
                  key={play.id} 
                  onClick={() => selectPlay(play)}
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    background: currentPlay?.id === play.id ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${currentPlay?.id === play.id ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <div>
                    <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block' }}>{play.name}</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{play.execution} • {play.position || 'ALL'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                      Editar &rarr;
                    </span>
                    <button 
                      onClick={(e) => handleDeletePlay(play.id, e)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '0 5px' }}
                      title="Excluir Jogada"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
              {plays.length === 0 && (
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>
                  Nenhuma jogada tática salva.
                </span>
              )}
            </div>
          </section>

          {/* Roster Assignment */}
          <section className="card-panel" style={{ border: '1px solid #1e293b' }}>
            <h3 style={{ marginBottom: '10px', color: 'var(--primary-color)' }}>Atribuir aos Atletas</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '15px', fontSize: '0.8rem' }}>
              Selecione os atletas da lista abaixo para atribuir a jogada atual: <strong style={{ color: '#06b6d4' }}>{currentPlay ? currentPlay.name : 'Nenhuma jogada selecionada'}</strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto', marginBottom: '15px' }}>
              {roster.map(athlete => (
                <label 
                  key={athlete.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px',
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedAthleteIds.includes(athlete.id)}
                    onChange={() => toggleAthleteSelection(athlete.id)}
                    style={{ accentColor: '#06b6d4' }}
                  />
                  <div>
                    <strong style={{ color: '#fff', fontSize: '0.85rem', display: 'block' }}>{athlete.name}</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{athlete.position}</span>
                  </div>
                </label>
              ))}
              {roster.length === 0 && (
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '15px' }}>
                  Nenhum atleta disponível no Roster.
                </span>
              )}
            </div>

            <button 
              disabled={assigning || !currentPlay} 
              onClick={handleAssignPlay} 
              className="btn"
              style={{ width: '100%', padding: '12px', fontSize: '0.9rem', fontWeight: 'bold' }}
            >
              {assigning ? 'ATRIBUINDO...' : 'ENVIAR PLAYBOOK 🚀'}
            </button>
          </section>

          {/* Monitor de Compreensão */}
          {currentPlay && (
            <section className="card-panel" style={{ border: '1px solid #1e293b' }}>
              <h3 style={{ marginBottom: '10px', color: 'var(--primary-color)' }}>Monitor de Compreensão</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '15px', fontSize: '0.8rem' }}>
                Taxa de entendimento do time para: <strong style={{ color: '#06b6d4' }}>{currentPlay.name}</strong>
              </p>

              {loadingFeedbacks ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '10px' }}>Carregando dados...</div>
              ) : (
                <div>
                  {/* Mini-Stats Bar */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '15px', textAlign: 'center' }}>
                    <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '4px', padding: '6px' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#22c55e' }}>
                        {feedbacksReport.filter(f => f.status === 'UNDERSTOOD').length}
                      </div>
                      <div style={{ fontSize: '0.6rem', color: '#a1a1aa' }}>Entenderam</div>
                    </div>
                    <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '4px', padding: '6px' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ef4444' }}>
                        {feedbacksReport.filter(f => f.status === 'DOUBT').length}
                      </div>
                      <div style={{ fontSize: '0.6rem', color: '#a1a1aa' }}>Dúvidas</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', padding: '6px' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>
                        {feedbacksReport.filter(f => f.status === 'UNVIEWED').length}
                      </div>
                      <div style={{ fontSize: '0.6rem', color: '#a1a1aa' }}>Pendente</div>
                    </div>
                  </div>

                  {/* List of answers */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                    {feedbacksReport.map(report => (
                      <div 
                        key={report.athleteId}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '4px',
                          background: 'rgba(255,255,255,0.01)',
                          border: '1px solid rgba(255,255,255,0.03)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#fff' }}>{report.name} ({report.position})</span>
                          <span style={{
                            fontSize: '0.65rem',
                            padding: '2px 6px',
                            borderRadius: '10px',
                            background: report.status === 'UNDERSTOOD' ? 'rgba(34,197,94,0.1)' : report.status === 'DOUBT' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.02)',
                            color: report.status === 'UNDERSTOOD' ? '#22c55e' : report.status === 'DOUBT' ? '#ef4444' : '#94a3b8',
                            border: `1px solid ${report.status === 'UNDERSTOOD' ? '#22c55e' : report.status === 'DOUBT' ? '#ef4444' : 'rgba(255,255,255,0.05)'}`,
                            fontWeight: 'bold'
                          }}>
                            {report.status === 'UNDERSTOOD' ? 'Entendi' : report.status === 'DOUBT' ? 'Dúvida' : 'Não viu'}
                          </span>
                        </div>
                        {report.comment && (
                          <div style={{ fontSize: '0.7rem', color: '#a1a1aa', borderTop: '1px dashed rgba(255,255,255,0.03)', paddingTop: '4px', fontStyle: 'italic' }}>
                            "{report.comment}"
                          </div>
                        )}
                      </div>
                    ))}
                    {feedbacksReport.length === 0 && (
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textAlign: 'center', padding: '10px' }}>
                        Esta jogada não está atribuída a nenhum atleta ainda.
                      </span>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Right Column: Canvas Editor & Settings */}
        <section className="card-panel" style={{ border: '1px solid #1e293b' }}>
          <h3 style={{ marginBottom: '15px', color: 'var(--primary-color)' }}>
            {currentPlay ? `Editando Jogada: ${currentPlay.name}` : 'Criar Nova Jogada Tática'}
          </h3>

          <form onSubmit={handleSavePlay} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>Nome da Jogada</label>
                <input 
                  required
                  placeholder="Ex: Slant WR Direito / Curl QB" 
                  value={playName} 
                  onChange={e => setPlayName(e.target.value)} 
                  style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>Esporte</label>
                <select 
                  value={playSport} 
                  onChange={e => setPlaySport(e.target.value)} 
                  style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }}
                >
                  <option value="Futebol Americano">Futebol Americano</option>
                  <option value="Rugby">Rugby</option>
                  <option value="Powerlifting">Powerlifting</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>Execução</label>
                <select 
                  value={playExecution} 
                  onChange={e => {
                    setPlayExecution(e.target.value);
                    setPlayPosition('ALL'); // Reset position when execution changes
                  }} 
                  style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }}
                >
                  <option value="Ataque">Ataque</option>
                  <option value="Defesa">Defesa</option>
                  <option value="Special Teams">Special Teams</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>Posição Foco (Opcional)</label>
                <select 
                  value={playPosition} 
                  onChange={e => setPlayPosition(e.target.value)} 
                  style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }}
                >
                  <option value="ALL">Todo o Time</option>
                  {playExecution === 'Ataque' && (
                    <>
                      <option value="WR">WR</option>
                      <option value="RB">RB</option>
                      <option value="QB">QB</option>
                      <option value="OL">OL</option>
                      <option value="TE">TE</option>
                    </>
                  )}
                  {playExecution === 'Defesa' && (
                    <>
                      <option value="DL">DL</option>
                      <option value="LB">LB</option>
                      <option value="CB">CB</option>
                      <option value="SF">SF</option>
                      <option value="SS">SS</option>
                    </>
                  )}
                  {playExecution === 'Special Teams' && (
                    <>
                      <option value="Punt">Punt</option>
                      <option value="Kickoff">Kickoff</option>
                      <option value="Field Goal">Field Goal</option>
                      <option value="Retorno">Retorno</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>Descrição / O que deve ser feito?</label>
                <input 
                  placeholder="Ex: Rota curta de 5yds e corte p/ dentro." 
                  value={playDescription} 
                  onChange={e => setPlayDescription(e.target.value)} 
                  style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }} 
                />
              </div>
            </div>

            {/* Playbook Canvas Editor Component */}
            <PlaybookCanvas 
              playData={currentPlay ? { ...currentPlay, dataJSON: playDataJSON } : null}
              onChange={handleCanvasChange}
              readOnly={false}
            />

            <button type="submit" className="btn" style={{ padding: '12px', fontSize: '1rem', fontWeight: 'bold' }}>
              SALVAR CONFIGURAÇÃO DA JOGADA 💾
            </button>
          </form>
        </section>

      </div>
    </div>
    </>
  );
}
