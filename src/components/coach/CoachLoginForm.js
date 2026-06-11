"use client";
import Link from 'next/link';

export default function CoachLoginForm({ email, setEmail, password, setPassword, handleLogin, loginError }) {
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
