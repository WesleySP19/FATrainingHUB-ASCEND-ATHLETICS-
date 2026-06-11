"use client";

import { CoachProvider, useCoach } from '@/contexts/CoachContext';
import CoachNavbar from '@/components/coach/CoachNavbar';
import '@/app/globals.css'; // Garantir que estilos globais apliquem

function CoachShell({ children }) {
  const { coach, loadingCoach } = useCoach();

  // Se estiver carregando auth do localStorage, não pisca nada
  if (loadingCoach) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#fff' }}>Carregando Acesso...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
      {/* Mostra Navbar APENAS se estiver logado */}
      {coach && <CoachNavbar />}
      
      {/* Container Principal que ocupa a tela toda se não houver navbar, ou o restante se houver */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
    </div>
  );
}

export default function CoachLayout({ children }) {
  return (
    <CoachProvider>
      <CoachShell>
        {children}
      </CoachShell>
    </CoachProvider>
  );
}
