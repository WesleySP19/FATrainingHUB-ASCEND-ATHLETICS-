"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const CoachContext = createContext();

export function CoachProvider({ children }) {
  const [coach, setCoach] = useState(null);
  const [loadingCoach, setLoadingCoach] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (data.loggedIn && data.user.role === 'COACH') {
          setCoach(data.user);
          localStorage.setItem('coach', JSON.stringify(data.user));
        } else {
          setCoach(null);
          localStorage.removeItem('coach');
        }
      } catch (e) {
        // Fallback to localStorage if offline
        const stored = localStorage.getItem('coach');
        if (stored) setCoach(JSON.parse(stored));
      } finally {
        setLoadingCoach(false);
      }
    };
    fetchSession();
  }, []);

  // Proteger rotas filhas
  useEffect(() => {
    if (!loadingCoach && !coach && pathname !== '/coach') {
      // Se não estiver logado e tentar acessar área restrita, manda pro login
      router.push('/coach');
    }
  }, [coach, loadingCoach, pathname, router]);

  const loginCoach = (coachData) => {
    localStorage.setItem('coach', JSON.stringify(coachData));
    setCoach(coachData);
    router.refresh(); // Força update leve
  };

  const logoutCoach = async () => {
    try {
      await fetch('/api/coach/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout failed', e);
    }
    localStorage.removeItem('coach');
    setCoach(null);
    router.push('/coach');
  };

  return (
    <CoachContext.Provider value={{ coach, loadingCoach, loginCoach, logoutCoach }}>
      {children}
    </CoachContext.Provider>
  );
}

export function useCoach() {
  return useContext(CoachContext);
}
