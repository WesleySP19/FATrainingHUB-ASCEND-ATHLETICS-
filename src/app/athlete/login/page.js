"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function AthleteLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', position: 'QB' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/athlete/login' : '/api/athlete/register';
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        // Salvamos na sessão local o perfil blindado do atleta
        localStorage.setItem('athlete', JSON.stringify(data.athlete));
        window.location.href = `/athlete/${data.athlete.id}`;
      } else {
        setError(data.error);
      }
    } catch(err) {
      setError("Erro de rede ao conectar com o Servidor Central.");
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '10vh' }}>
      <div className="card-panel">
        <h2 style={{ textAlign: 'center', color: 'var(--primary-color)' }}>
          {isLogin ? 'ACESSO DO ATLETA' : 'ALISTAMENTO NO ROSTER'}
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '30px' }}>
          {isLogin ? 'Coloque seu capacete e entre no campo.' : 'Junte-se ao time e construa seu legado.'}
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {!isLogin && (
            <>
              <input required placeholder="Nome no Card (Ex: J. Doe)" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '15px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }} />
              <select required value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} style={{ padding: '15px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }}>
                <option value="QB">Quarterback (QB)</option>
                <option value="RB">Running Back (RB)</option>
                <option value="WR">Wide Receiver (WR)</option>
                <option value="TE">Tight End (TE)</option>
                <option value="OL">Offensive Lineman (OL)</option>
                <option value="DL">Defensive Lineman (DL)</option>
                <option value="LB">Linebacker (LB)</option>
                <option value="CB">Cornerback (CB)</option>
                <option value="S">Safety (S)</option>
                <option value="K">Kicker / Punter (K/P)</option>
              </select>
            </>
          )}
          
          <input required type="email" placeholder="E-mail" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ padding: '15px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }} />
          <input required type="password" placeholder="Senha" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ padding: '15px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }} />
          
          {error && <p style={{ color: 'var(--accent-red)', fontWeight: 'bold', textAlign: 'center' }}>{error}</p>}

          <button type="submit" disabled={loading} className="btn" style={{ marginTop: '10px', fontSize: '1.2rem', padding: '15px' }}>
            {loading ? 'PROCESSANDO...' : (isLogin ? 'ENTRAR NO GAME DAY' : 'CRIAR CONTA')}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '25px' }}>
          <button onClick={() => {setIsLogin(!isLogin); setError('');}} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'underline', fontSize: '1rem' }}>
            {isLogin ? 'Novo no time? Aliste-se aqui.' : 'Já é do time? Faça Login.'}
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <Link href="/" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>&larr; Voltar para Home</Link>
        </div>
      </div>
    </div>
  );
}
