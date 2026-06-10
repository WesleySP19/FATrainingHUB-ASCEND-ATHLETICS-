"use client";

import { useEffect, useState } from 'react';

export default function PhysioDashboard({ athleteId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (athleteId) {
      setLoading(true);
      setError('');
      fetch(`/api/athlete/${athleteId}/physio`)
        .then(res => res.json())
        .then(resData => {
          if (resData.success) {
            setData(resData.physioData);
          } else {
            setError(resData.error || 'Erro ao carregar dados fisiológicos.');
          }
          setLoading(false);
        })
        .catch(() => {
          setError('Sem conexão com o servidor.');
          setLoading(false);
        });
    }
  }, [athleteId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#06b6d4', fontWeight: 'bold' }}>
        <div className="spinner" style={{
          border: '4px solid rgba(6, 182, 212, 0.1)',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          borderLeftColor: '#06b6d4',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 15px'
        }}></div>
        Sincronizando Dados Fisiológicos...
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: '30px', color: '#ef4444', textAlign: 'center', fontWeight: 'bold' }}>
        ⚠️ {error || 'Nenhum dado fisiológico disponível.'}
      </div>
    );
  }

  const { athleteName, position, overall, acwr, history } = data;

  // Determinar status do ACWR
  let acwrStatusText = 'Sem Carga';
  let acwrColor = '#94a3b8'; // Cinza
  let acwrAdvice = 'Nenhum treino recente registrado para gerar análise fisiológica.';
  let acwrSeverity = 'neutral';

  if (acwr > 0) {
    if (acwr < 0.8) {
      acwrStatusText = 'Subtreino (Under-training)';
      acwrColor = '#38bdf8'; // Ciano
      acwrAdvice = 'O atleta apresenta carga de treino aguda significativamente menor que a crônica. Há risco de destreinamento. Recomendação: Aumentar gradualmente a intensidade ou volume das sessões.';
      acwrSeverity = 'info';
    } else if (acwr <= 1.3) {
      acwrStatusText = 'Zona Ideal (Optimal Workload)';
      acwrColor = '#10b981'; // Emerald
      acwrAdvice = 'A relação entre treino agudo e crônico está equilibrada. Esta é a "Zona Verde", onde o condicionamento físico melhora minimizando o risco de lesões. Recomendação: Manter a planilha atual.';
      acwrSeverity = 'success';
    } else if (acwr <= 1.5) {
      acwrStatusText = 'Zona de Sobrecarga (Overreaching)';
      acwrColor = '#f59e0b'; // Amarelo
      acwrAdvice = 'Carga de treino em ascensão acelerada. O atleta está em fase de sobrecarga funcional. Recomendação: Monitorar atentamente a dor muscular e garantir o repouso adequado nos próximos dias.';
      acwrSeverity = 'warning';
    } else {
      acwrStatusText = 'Risco Crítico de Lesão (Danger Zone)';
      acwrColor = '#ef4444'; // Vermelho
      acwrAdvice = '🚨 ALERTA CRÍTICO: Relação agudo-crônica acima da linha de perigo (ACWR > 1.50). O risco de lesão muscular ou fadiga crônica é estatisticamente muito alto. Recomendação: Reduzir imediatamente a carga em 40-50% ou sugerir repouso/treino regenerativo.';
      acwrSeverity = 'danger';
    }
  }

  // Ajustar recomendação se houver dor/soneca ruim nos últimos treinos
  const lastSession = history.length > 0 ? history[history.length - 1] : null;
  let wellnessAlert = null;
  if (lastSession) {
    if (lastSession.pain >= 4 && acwr > 1.3) {
      wellnessAlert = '⚠️ ATENÇÃO: Dor muscular elevada detectada em conjunto com sobrecarga de treinamento. Risco iminente de estiramento.';
      acwrAdvice = 'Atenção redobrada! Recomenda-se repouso total ou sessão exclusiva de fisioterapia/liberação miofascial.';
    } else if (lastSession.sleep <= 2) {
      wellnessAlert = '💤 AVISO DE RECUPERAÇÃO: Qualidade do sono crítica nas últimas 24h. O processo de restauração muscular foi comprometido.';
    }
  }

  // SVG Chart Dimensions
  const width = 500;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;

  // Helper para desenhar linhas no gráfico 1 (Workload vs RPE)
  const maxWorkload = history.length > 0 ? Math.max(...history.map(h => h.workload), 200) : 200;
  const getX = (index) => paddingX + (index * (width - 2 * paddingX) / (history.length - 1 || 1));
  const getYWorkload = (val) => height - paddingY - (val * (height - 2 * paddingY) / maxWorkload);
  const getYRpe = (val) => height - paddingY - (val * (height - 2 * paddingY) / 10);

  // Helper para desenhar linhas no gráfico 2 (Sono vs Dor)
  const getYWellness = (val) => height - paddingY - (val * (height - 2 * paddingY) / 5);

  return (
    <div style={{
      background: 'rgba(8, 10, 20, 0.95)',
      color: '#fff',
      padding: '25px',
      borderRadius: '12px',
      border: '1px solid rgba(6, 182, 212, 0.25)',
      boxShadow: '0 8px 32px rgba(6, 182, 212, 0.15)',
      fontFamily: 'var(--font-sans, system-ui, sans-serif)',
      position: 'relative'
    }}>
      
      {/* Glow effect backdrops */}
      <div style={{
        position: 'absolute',
        top: '-10%', left: '-10%',
        width: '40%', height: '40%',
        background: `${acwrColor}1A`,
        filter: 'blur(80px)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }}></div>

      {/* Header */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        paddingBottom: '15px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }} id="physio-header">
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-display)', color: '#fff', letterSpacing: '1px' }}>
            ANÁLISE FISIOLÓGICA DE PERFORMANCE
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            ATLETA: <strong style={{ color: acwrColor }}>{athleteName}</strong> | {position} | OVR {overall}
          </span>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          padding: '6px 12px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          color: '#94a3b8',
          fontWeight: 'bold'
        }}>
          STATUS: MONITORADO
        </div>
      </div>

      {/* Grid: ACWR Meter + Advice Panel */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '20px',
        marginBottom: '25px'
      }} id="physio-grid-summary">
        {/* Radial ACWR Meter */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: '8px',
          padding: '15px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '0.75rem', color: '#a1a1aa', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>
            Workload Ratio
          </span>
          <div style={{ position: 'relative', width: '100px', height: '100px' }}>
            {/* SVG Circle Gauge */}
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="2.5"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={acwrColor}
                strokeWidth="3"
                strokeDasharray={`${Math.min(acwr * 50, 100)}, 100`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#fff' }}>{acwr || '0.0'}</div>
              <div style={{ fontSize: '0.55rem', color: '#a1a1aa', fontWeight: 'bold' }}>ACWR</div>
            </div>
          </div>
          <span style={{ marginTop: '12px', fontSize: '0.75rem', fontWeight: 'bold', color: acwrColor, textTransform: 'uppercase' }}>
            {acwrStatusText}
          </span>
        </div>

        {/* Clinical Advice Panel */}
        <div style={{
          background: 'rgba(255,255,255,0.01)',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: '8px',
          padding: '15px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
            🔬 DIAGNÓSTICO E PRESCRIÇÃO FISIOLÓGICA
          </h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#d4d4d8', lineHeight: '1.4' }}>
            {acwrAdvice}
          </p>
          
          {wellnessAlert && (
            <div style={{
              marginTop: '10px',
              padding: '8px 12px',
              borderRadius: '4px',
              background: lastSession?.pain >= 4 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)',
              border: `1px solid ${lastSession?.pain >= 4 ? '#ef4444' : '#f59e0b'}`,
              color: lastSession?.pain >= 4 ? '#fca5a5' : '#fde047',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}>
              {wellnessAlert}
            </div>
          )}
        </div>
      </div>

      {/* Grid: Charts */}
      {history.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px'
        }} id="physio-charts">
          {/* Chart 1: Workload & RPE */}
          <div style={{
            background: 'rgba(24, 24, 27, 0.6)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '8px',
            padding: '15px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h5 style={{ margin: 0, fontSize: '0.75rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Carga Semanal vs RPE
              </h5>
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.65rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#a3e635' }}>
                  <span style={{ width: '6px', height: '6px', background: '#a3e635', borderRadius: '50%' }}></span> Carga
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f43f5e' }}>
                  <span style={{ width: '6px', height: '6px', background: '#f43f5e', borderRadius: '50%' }}></span> RPE
                </span>
              </div>
            </div>
            
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', background: '#09090b', borderRadius: '4px' }}>
              {/* Grid lines */}
              <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1={paddingX} y1={height/2} x2={width - paddingX} y2={height/2} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

              {/* Workload Area / Line */}
              {history.length > 1 && (
                <>
                  <path
                    d={`M ${getX(0)} ${height - paddingY} ` + history.map((h, i) => `L ${getX(i)} ${getYWorkload(h.workload)}`).join(' ') + ` L ${getX(history.length - 1)} ${height - paddingY} Z`}
                    fill="url(#workload-grad)"
                    opacity="0.1"
                  />
                  <path
                    d={history.map((h, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getYWorkload(h.workload)}`).join(' ')}
                    fill="none"
                    stroke="#a3e635"
                    strokeWidth="2"
                  />
                </>
              )}

              {/* RPE Line */}
              {history.length > 1 && (
                <path
                  d={history.map((h, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getYRpe(h.rpe)}`).join(' ')}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="1.8"
                  strokeDasharray="2 2"
                />
              )}

              {/* Data circles */}
              {history.map((h, i) => (
                <g key={i}>
                  <circle cx={getX(i)} cy={getYWorkload(h.workload)} r="3" fill="#a3e635" />
                  <circle cx={getX(i)} cy={getYRpe(h.rpe)} r="3" fill="#f43f5e" />
                </g>
              ))}

              {/* Gradients */}
              <defs>
                <linearGradient id="workload-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a3e635" />
                  <stop offset="100%" stopColor="#a3e635" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Chart 2: Wellness trends (Sleep vs Pain) */}
          <div style={{
            background: 'rgba(24, 24, 27, 0.6)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '8px',
            padding: '15px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h5 style={{ margin: 0, fontSize: '0.75rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Wellness: Sono vs Dor
              </h5>
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.65rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#38bdf8' }}>
                  <span style={{ width: '6px', height: '6px', background: '#38bdf8', borderRadius: '50%' }}></span> Sono
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#eab308' }}>
                  <span style={{ width: '6px', height: '6px', background: '#eab308', borderRadius: '50%' }}></span> Dor Muscular
                </span>
              </div>
            </div>

            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', background: '#09090b', borderRadius: '4px' }}>
              {/* Grid lines */}
              <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1={paddingX} y1={height/2} x2={width - paddingX} y2={height/2} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

              {/* Sleep Line */}
              {history.length > 1 && (
                <path
                  d={history.map((h, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getYWellness(h.sleep)}`).join(' ')}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
              )}

              {/* Pain Line */}
              {history.length > 1 && (
                <path
                  d={history.map((h, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getYWellness(h.pain)}`).join(' ')}
                  fill="none"
                  stroke="#eab308"
                  strokeWidth="2"
                />
              )}

              {/* Data circles */}
              {history.map((h, i) => (
                <g key={i}>
                  <circle cx={getX(i)} cy={getYWellness(h.sleep)} r="3" fill="#38bdf8" />
                  <circle cx={getX(i)} cy={getYWellness(h.pain)} r="3" fill="#eab308" />
                </g>
              ))}
            </svg>
          </div>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          background: 'rgba(255,255,255,0.01)',
          border: '1px dashed rgba(255,255,255,0.1)',
          borderRadius: '8px',
          color: '#71717a',
          fontSize: '0.85rem'
        }}>
          Nenhum histórico fisiológico disponível para os treinos deste atleta.
        </div>
      )}
    </div>
  );
}
