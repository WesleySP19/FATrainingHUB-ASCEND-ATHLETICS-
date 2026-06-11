import { useEffect } from 'react';

export default function useOfflineSync() {
  const syncOfflineQueue = async () => {
    if (typeof window === 'undefined' || !navigator.onLine) return;
    const queue = JSON.parse(localStorage.getItem('ascend_offline_queue') || '[]');
    if (queue.length === 0) return;

    console.log(`Sincronizando ${queue.length} item(ns) pendente(s) offline...`);
    const successfulIndexes = [];

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      try {
        const res = await fetch(item.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.body)
        });
        const data = await res.json();
        if (data.success) {
          successfulIndexes.push(i);
        }
      } catch (e) {
        console.error("Falha ao sincronizar item offline:", e);
      }
    }

    const remainingQueue = queue.filter((_, idx) => !successfulIndexes.includes(idx));
    localStorage.setItem('ascend_offline_queue', JSON.stringify(remainingQueue));
    if (successfulIndexes.length > 0) {
      alert(`${successfulIndexes.length} registro(s) de performance salvo(s) offline foi/foram sincronizado(s) com sucesso!`);
    }
  };

  const saveToOfflineQueue = (url, body, fallbackMessage = "Ação salva offline! Será sincronizada quando a conexão retornar.") => {
    const queue = JSON.parse(localStorage.getItem('ascend_offline_queue') || '[]');
    queue.push({ url, body });
    localStorage.setItem('ascend_offline_queue', JSON.stringify(queue));
    alert(fallbackMessage);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      syncOfflineQueue();
      window.addEventListener('online', syncOfflineQueue);
      return () => window.removeEventListener('online', syncOfflineQueue);
    }
  }, []);

  return { syncOfflineQueue, saveToOfflineQueue };
}
