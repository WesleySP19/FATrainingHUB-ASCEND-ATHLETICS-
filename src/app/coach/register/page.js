"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function CoachRegister() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', teamName: '', role: 'HC' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/coach/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        alert(data.error);
      }
    } catch(e) {
      alert("Erro de conexão.");
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '10vh' }}>
        <h2 style={{ color: 'var(--accent-green)', fontSize: '3rem', marginBottom: '20px' }}>CONTA CRIADA!</h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Bem-vindo ao FA Training Hub, Coach {formData.name}.</p>
        <Link href="/coach" className="btn" style={{ display: 'inline-block', marginTop: '30px', textDecoration: 'none' }}>ACESSAR O PLAYBOOK</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '450px', marginTop: '10vh' }}>
      <div className="card-panel">
        <h2 style={{ textAlign: 'center', color: 'var(--primary-color)' }}>NOVO COACH / PERSONAL</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '30px' }}>Cadastre-se para montar o Roster e controlar seu Time ou Alunos.</p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input required placeholder="Nome Completo" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '15px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }} />
          <input required type="email" placeholder="E-mail" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ padding: '15px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }} />
          <input required type="password" placeholder="Senha Forte" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ padding: '15px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }} />
          
          <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ padding: '15px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }}>
            <option value="HC">Head Coach (HC)</option>
            <option value="DC">Defensive Coordinator (DC)</option>
            <option value="OC">Offensive Coordinator (OC)</option>
            <option value="PERSONAL">Personal Trainer / Preparador Físico</option>
          </select>

          <input 
            required={formData.role !== 'PERSONAL'} 
            placeholder={formData.role === 'PERSONAL' ? "Nome da Academia/Clínica (Opcional)" : "Nome do Time (Ex: Coritiba Crocodiles)"} 
            value={formData.teamName} 
            onChange={e => setFormData({...formData, teamName: e.target.value})} 
            style={{ padding: '15px', background: '#000', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }} 
          />
          
          <button type="submit" disabled={loading} className="btn" style={{ marginTop: '10px' }}>{loading ? 'CRIANDO...' : 'CADASTRAR E COMEÇAR'}</button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '25px' }}>
          <Link href="/coach" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Já tem conta? Clique aqui para Entrar.</Link>
        </div>
      </div>
    </div>
  );
}
