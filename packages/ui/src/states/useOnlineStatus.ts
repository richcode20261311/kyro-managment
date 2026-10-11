'use client';

import { useEffect, useState } from 'react';

/**
 * Estado real de conexión. Se inicializa en `true` (igual que el HTML del
 * servidor) y se sincroniza tras montar para evitar desajustes de hidratación.
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    setOnline(navigator.onLine);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return online;
}
