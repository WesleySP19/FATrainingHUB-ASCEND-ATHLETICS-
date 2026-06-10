"use client";

import { useEffect, useRef, useState } from 'react';

export default function PlaybookCanvas({
  playData,
  highlightAthleteId = null,
  readOnly = false,
  onChange = null // Callback enviando o payload JSON atualizado das jogadas
}) {
  const canvasRef = useRef(null);
  const [players, setPlayers] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [isDrawingRoute, setIsDrawingRoute] = useState(false);
  const [animationTime, setAnimationTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 0.5, 1, 2
  const [selectedRole, setSelectedRole] = useState('OFFENSE'); // OFFENSE ou DEFENSE

  // Câmera e Quiz States
  const [cameraFollow, setCameraFollow] = useState(false);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizStatus, setQuizStatus] = useState('IDLE'); // IDLE, PROMPTED, CORRECT, INCORRECT

  // Iniciar jogadores a partir dos dados recebidos
  useEffect(() => {
    if (playData && playData.dataJSON) {
      try {
        const parsed = typeof playData.dataJSON === 'string' 
          ? JSON.parse(playData.dataJSON) 
          : playData.dataJSON;
        setPlayers(parsed.players || []);
      } catch (e) {
        console.error("Erro ao ler JSON da jogada:", e);
      }
    } else {
      setPlayers([]);
    }
  }, [playData]);

  // Notificar pai sobre alterações nos jogadores
  const notifyChange = (updatedPlayers) => {
    if (onChange) {
      onChange({ players: updatedPlayers });
    }
  };

  // Loop de Animação
  useEffect(() => {
    if (!isPlaying) return;

    let animId;
    let lastTime = performance.now();

    const loop = (now) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      setAnimationTime(prev => {
        const next = prev + delta * playbackSpeed * 0.2; // Escalar velocidade
        
        // Se estiver no Modo Quiz e cruzar a metade (50%), pausa e pergunta
        if (isQuizMode && prev < 0.5 && next >= 0.5 && quizStatus === 'IDLE') {
          setIsPlaying(false);
          setQuizStatus('PROMPTED');
          return 0.5;
        }

        if (next >= 1.0) {
          setIsPlaying(false);
          return 1.0;
        }
        return next;
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, playbackSpeed, isQuizMode, quizStatus]);

  // Função para interpolar posição com base no tempo (0 a 1)
  const getPlayerPositionAtTime = (player, time) => {
    const start = player.start || [100, 100];
    const route = player.route || [];

    if (route.length === 0 || time <= 0) return { x: start[0], y: start[1] };
    if (time >= 1.0) {
      const end = route[route.length - 1];
      return { x: end[0], y: end[1] };
    }

    // Lista completa de nós: [início, ...rota]
    const nodes = [start, ...route];
    const totalSegments = nodes.length - 1;
    const scaledTime = time * totalSegments;
    const segmentIndex = Math.floor(scaledTime);
    const segmentTime = scaledTime - segmentIndex;

    const pA = nodes[segmentIndex];
    const pB = nodes[segmentIndex + 1];

    if (!pA || !pB) return { x: start[0], y: start[1] };

    return {
      x: pA[0] + (pB[0] - pA[0]) * segmentTime,
      y: pA[1] + (pB[1] - pA[1]) * segmentTime
    };
  };

  // Renderizar o Campo e Jogadores no Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const width = canvas.width;
    const height = canvas.height;

    // 1. Limpar e desenhar fundo sólido do campo
    ctx.fillStyle = '#081215';
    ctx.fillRect(0, 0, width, height);

    ctx.save();

    // Lógica da Câmera (Seguir jogador destacado)
    if (cameraFollow && highlightAthleteId) {
      const highlightedPlayer = players.find(p => p.athleteId === highlightAthleteId);
      if (highlightedPlayer) {
        const pos = getPlayerPositionAtTime(highlightedPlayer, animationTime);
        // Deslocar para manter o jogador no centro do Canvas (width / 2, height / 2)
        ctx.translate(width / 2 - pos.x, height / 2 - pos.y);
      }
    }

    // Grid Gridlines
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 20;
    for (let x = -width; x < width * 2; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, -height);
      ctx.lineTo(x, height * 2);
      ctx.stroke();
    }
    for (let y = -height; y < height * 2; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(-width, y);
      ctx.lineTo(width * 2, y);
      ctx.stroke();
    }

    // Linhas Laterais e do Campo (Ciano semi-transparente)
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Linha de 50 jardas e hashmarks
    const centerLineX = width / 2;
    ctx.beginPath();
    ctx.moveTo(centerLineX, 20);
    ctx.lineTo(centerLineX, height - 20);
    ctx.stroke();

    // Endzones
    ctx.fillStyle = 'rgba(239, 68, 68, 0.05)'; // Endzone Esquerda
    ctx.fillRect(20, 20, 40, height - 40);
    ctx.fillStyle = 'rgba(6, 182, 212, 0.05)'; // Endzone Direita
    ctx.fillRect(width - 60, 20, 40, height - 40);

    ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)';
    ctx.strokeRect(20, 20, 40, height - 40);
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
    ctx.strokeRect(width - 60, 20, 40, height - 40);

    // Desenha rotas completas em transparência
    players.forEach(p => {
      if (p.route && p.route.length > 0) {
        ctx.beginPath();
        ctx.moveTo(p.start[0], p.start[1]);
        p.route.forEach(pt => {
          ctx.lineTo(pt[0], pt[1]);
        });
        ctx.strokeStyle = p.team === 'OFFENSE' ? 'rgba(0, 255, 255, 0.25)' : 'rgba(249, 115, 22, 0.25)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // 2. Desenhar jogadores com posições interpoladas
    players.forEach(p => {
      const pos = getPlayerPositionAtTime(p, animationTime);
      const isSelected = p.id === selectedPlayerId;
      const isHighlighted = highlightAthleteId && p.athleteId === highlightAthleteId;

      ctx.save();
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 14, 0, 2 * Math.PI);

      // Cores conforme equipe
      if (p.team === 'OFFENSE') {
        ctx.fillStyle = '#06b6d4'; // Ciano
        ctx.shadowColor = '#06b6d4';
      } else {
        ctx.fillStyle = '#f97316'; // Laranja
        ctx.shadowColor = '#f97316';
      }

      ctx.shadowBlur = isSelected ? 15 : isHighlighted ? 25 : 5;
      ctx.fill();

      // Borda especial se estiver destacado (atleta ativo estuda esta rota)
      if (isHighlighted) {
        ctx.strokeStyle = '#facc15'; // Ouro/Amarelo
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Desenhar seta indicadora neon acima do jogador
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y - 22);
        ctx.lineTo(pos.x - 6, pos.y - 32);
        ctx.lineTo(pos.x + 6, pos.y - 32);
        ctx.closePath();
        ctx.fill();
      } else if (isSelected) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.restore();

      // Rótulo/Número na camisa
      ctx.fillStyle = '#000';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.number || p.position || '', pos.x, pos.y);
    });

    ctx.restore(); // Restaura câmera
  }, [players, selectedPlayerId, animationTime, highlightAthleteId, cameraFollow]);

  // Sons sintéticos de feedback do Quiz (Web Audio API)
  const playSoundEffect = (type) => {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const context = new AudioCtx();
    const now = context.currentTime;

    if (type === 'success') {
      // Arpejo neon feliz (C5 -> E5 -> G5 -> C6)
      const frequencies = [523.25, 659.25, 783.99, 1046.50];
      frequencies.forEach((freq, idx) => {
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.connect(gain);
        gain.connect(context.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.06, now + idx * 0.08);
        osc.start(now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
        osc.stop(now + idx * 0.08 + 0.3);
      });
    } else if (type === 'error') {
      // Tom grave triste de erro (Low Sawtooth Buzz)
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.connect(gain);
      gain.connect(context.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      gain.gain.setValueAtTime(0.08, now);
      osc.start(now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.stop(now + 0.4);
    }
  };

  // Tratar Cliques
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Rescale coordinates if visual matches
    const x = clickX * (canvas.width / rect.width);
    const y = clickY * (canvas.height / rect.height);

    // 1. Resposta do Quiz
    if (quizStatus === 'PROMPTED' && highlightAthleteId) {
      const highlightedPlayer = players.find(p => p.athleteId === highlightAthleteId);
      if (highlightedPlayer) {
        // Obter destino da jogada
        const endNode = highlightedPlayer.route[highlightedPlayer.route.length - 1] || highlightedPlayer.start;
        
        // Tratar coordenadas da câmera
        let targetX = x;
        let targetY = y;
        if (cameraFollow) {
          const pos = getPlayerPositionAtTime(highlightedPlayer, 0.5); // Posição atual aos 50%
          const dx = canvas.width / 2 - pos.x;
          const dy = canvas.height / 2 - pos.y;
          targetX = x - dx;
          targetY = y - dy;
        }

        const distance = Math.hypot(targetX - endNode[0], targetY - endNode[1]);

        if (distance <= 28) {
          setQuizStatus('CORRECT');
          playSoundEffect('success');
          // Retoma animação após 1 segundo
          setTimeout(() => {
            setIsPlaying(true);
          }, 1200);
        } else {
          setQuizStatus('INCORRECT');
          playSoundEffect('error');
        }
      }
      return;
    }

    if (readOnly) return;

    // 2. Modo Desenho de Rota (Coach)
    if (isDrawingRoute && selectedPlayerId) {
      const updated = players.map(p => {
        if (p.id === selectedPlayerId) {
          return {
            ...p,
            route: [...(p.route || []), [x, y]]
          };
        }
        return p;
      });
      setPlayers(updated);
      notifyChange(updated);
      return;
    }

    // 3. Seleção de Jogador Existente
    const clickedPlayer = players.find(p => {
      const pos = getPlayerPositionAtTime(p, animationTime);
      const dist = Math.hypot(pos.x - x, pos.y - y);
      return dist <= 18;
    });

    if (clickedPlayer) {
      setSelectedPlayerId(clickedPlayer.id);
      setIsDrawingRoute(false);
    } else {
      // 4. Inclusão de Novo Jogador (Coach)
      const numberStr = prompt("Número da camisa (Ex: 88, 12):", "10");
      if (numberStr === null) return;

      const posStr = prompt("Posição/Grupo (Ex: WR, QB, DL):", "WR");
      if (posStr === null) return;

      const newPlayer = {
        id: 'player-' + Date.now(),
        number: numberStr || '10',
        position: posStr || 'WR',
        team: selectedRole,
        start: [x, y],
        route: []
      };

      const updated = [...players, newPlayer];
      setPlayers(updated);
      setSelectedPlayerId(newPlayer.id);
      setIsDrawingRoute(false);
      notifyChange(updated);
    }
  };

  // Limpar todas as jogadas
  const handleClearPlay = () => {
    if (window.confirm("Deseja realmente limpar todos os marcadores da jogada?")) {
      setPlayers([]);
      setSelectedPlayerId(null);
      setIsDrawingRoute(false);
      setAnimationTime(0);
      notifyChange([]);
    }
  };

  // Vincular jogador selecionado a um atleta do roster
  const handleLinkAthlete = () => {
    if (!selectedPlayerId) return;
    const athleteId = prompt("Digite o ID do atleta para esta rota:");
    if (athleteId === null) return;

    const updated = players.map(p => {
      if (p.id === selectedPlayerId) {
        return { ...p, athleteId: athleteId || null };
      }
      return p;
    });
    setPlayers(updated);
    notifyChange(updated);
    alert("Atleta vinculado!");
  };

  const handleResetQuiz = () => {
    setAnimationTime(0);
    setQuizStatus('IDLE');
    setIsPlaying(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
      
      {/* Quiz Prompt Banner */}
      {isQuizMode && quizStatus === 'PROMPTED' && (
        <div style={{
          background: 'rgba(6, 182, 212, 0.15)',
          border: '1px solid #06b6d4',
          borderRadius: '6px',
          padding: '12px',
          color: '#e0f2fe',
          textAlign: 'center',
          fontSize: '0.85rem',
          fontWeight: 'bold',
          animation: 'pulse 1.5s infinite'
        }}>
          ❓ ESTUDO COGNITIVO: Onde você deve se posicionar no final da rota? Clique no campo!
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes pulse { 0% { opacity: 0.9; } 50% { opacity: 0.6; } 100% { opacity: 0.9; } }
          `}} />
        </div>
      )}

      {quizStatus === 'CORRECT' && (
        <div style={{
          background: 'rgba(34, 197, 94, 0.15)',
          border: '1px solid #22c55e',
          borderRadius: '6px',
          padding: '12px',
          color: '#86efac',
          textAlign: 'center',
          fontSize: '0.85rem',
          fontWeight: 'bold'
        }}>
          🎯 ACERTOU! Excelente leitura espacial. Continuando a jogada...
        </div>
      )}

      {quizStatus === 'INCORRECT' && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid #ef4444',
          borderRadius: '6px',
          padding: '12px',
          color: '#fca5a5',
          textAlign: 'center',
          fontSize: '0.85rem',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>❌ POSICIONAMENTO INCORRETO. Rota errada.</span>
          <button onClick={handleResetQuiz} className="btn" style={{ padding: '4px 10px', fontSize: '0.75rem', background: '#ef4444', color: '#000' }}>
            Tentar Novamente 🔄
          </button>
        </div>
      )}

      {/* Canvas Viewport Frame */}
      <div style={{ position: 'relative', width: '100%', overflow: 'hidden', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          onClick={handleCanvasClick}
          style={{
            display: 'block',
            width: '100%',
            height: 'auto',
            aspectRatio: '6/4',
            cursor: readOnly ? (quizStatus === 'PROMPTED' ? 'crosshair' : 'default') : isDrawingRoute ? 'crosshair' : 'pointer'
          }}
        />
      </div>

      {/* Barra de Controles de Reprodução */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.05)',
        padding: '12px 15px',
        borderRadius: '6px',
        flexWrap: 'wrap',
        gap: '10px'
      }} id="playbook-controls">
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={quizStatus === 'PROMPTED' || quizStatus === 'INCORRECT'}
            className="btn"
            style={{ padding: '6px 12px', fontSize: '0.8rem', minWidth: '70px', opacity: (quizStatus === 'PROMPTED' || quizStatus === 'INCORRECT') ? 0.5 : 1 }}
          >
            {isPlaying ? 'PAUSA ⏸' : 'PLAY ▶'}
          </button>
          
          <button
            onClick={handleResetQuiz}
            className="btn"
            style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#1e293b' }}
          >
            REINICIAR 🔄
          </button>
        </div>

        {/* Linha de Tempo Interativa */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1, maxWidth: '300px' }}>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>TEMPO</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={animationTime}
            disabled={quizStatus === 'PROMPTED' || quizStatus === 'INCORRECT'}
            onChange={(e) => {
              setAnimationTime(parseFloat(e.target.value));
              setIsPlaying(false);
            }}
            style={{ flexGrow: 1, accentColor: '#06b6d4' }}
          />
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', minWidth: '35px', textAlign: 'right' }}>
            {Math.round(animationTime * 100)}%
          </span>
        </div>

        {/* Câmera & Modo Quiz controls (Somente Atleta / Read Only) */}
        {highlightAthleteId && (
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', cursor: 'pointer', color: '#06b6d4', fontWeight: 'bold' }}>
              <input
                type="checkbox"
                checked={cameraFollow}
                onChange={(e) => setCameraFollow(e.target.checked)}
                style={{ accentColor: '#06b6d4' }}
              />
              Focar Câmera 🎥
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', cursor: 'pointer', color: '#facc15', fontWeight: 'bold' }}>
              <input
                type="checkbox"
                checked={isQuizMode}
                onChange={(e) => {
                  setIsQuizMode(e.target.checked);
                  handleResetQuiz();
                }}
                style={{ accentColor: '#facc15' }}
              />
              Modo Quiz 🧠
            </label>
          </div>
        )}

        {/* Seletor de Velocidade */}
        <div style={{ display: 'flex', gap: '5px' }}>
          {[0.5, 1, 2].map(speed => (
            <button
              key={speed}
              onClick={() => setPlaybackSpeed(speed)}
              className="btn"
              style={{
                padding: '4px 8px',
                fontSize: '0.7rem',
                background: playbackSpeed === speed ? '#06b6d4' : '#111827',
                color: playbackSpeed === speed ? '#000' : '#fff',
                borderColor: playbackSpeed === speed ? '#06b6d4' : 'rgba(255,255,255,0.1)'
              }}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* Painel do Editor (Apenas Coach / Gravável) */}
      {!readOnly && (
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.04)',
          padding: '15px',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }} id="playbook-editor-panel">
          <div style={{ display: 'flex', justifyContext: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h4 style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#06b6d4', textTransform: 'uppercase' }}>
                Painel do Editor de Táticas
              </h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                Adicione jogadores clicando no campo ou selecione para desenhar rotas.
              </p>
            </div>
            
            {/* Seletor de Time */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setSelectedRole('OFFENSE')}
                className="btn"
                style={{
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  background: selectedRole === 'OFFENSE' ? '#06b6d4' : '#111827',
                  color: selectedRole === 'OFFENSE' ? '#000' : '#fff'
                }}
              >
                Ataque (Ciano)
              </button>
              <button
                onClick={() => setSelectedRole('DEFENSE')}
                className="btn"
                style={{
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  background: selectedRole === 'DEFENSE' ? '#f97316' : '#111827',
                  color: selectedRole === 'DEFENSE' ? '#000' : '#fff'
                }}
              >
                Defesa (Laranja)
              </button>
            </div>
          </div>

          {selectedPlayerId && (
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              padding: '10px 12px',
              borderRadius: '6px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <span style={{ fontSize: '0.8rem', color: '#fff' }}>
                Jogador camisa #{players.find(p => p.id === selectedPlayerId)?.number} ({players.find(p => p.id === selectedPlayerId)?.position}) selecionado.
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setIsDrawingRoute(!isDrawingRoute)}
                  className="btn"
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    background: isDrawingRoute ? '#10b981' : '#1e293b',
                    color: '#fff'
                  }}
                >
                  {isDrawingRoute ? 'CONCLUIR ROTA ✔' : 'DESENHAR ROTA ✏'}
                </button>
                <button
                  onClick={handleLinkAthlete}
                  className="btn"
                  style={{ padding: '6px 12px', fontSize: '0.75rem', background: '#475569' }}
                >
                  VINCULAR ATLETA 🔗
                </button>
                <button
                  onClick={() => {
                    const updated = players.filter(p => p.id !== selectedPlayerId);
                    setPlayers(updated);
                    setSelectedPlayerId(null);
                    setIsDrawingRoute(false);
                    notifyChange(updated);
                  }}
                  className="btn"
                  style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderColor: '#ef4444' }}
                >
                  REMOVER
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
            <button
              onClick={handleClearPlay}
              className="btn"
              style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid #ef4444' }}
            >
              LIMPAR TODO O CAMPO 🗑️
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
