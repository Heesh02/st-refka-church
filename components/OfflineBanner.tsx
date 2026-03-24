import React, { useEffect, useState } from 'react';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const onOffline = () => setIsOffline(true);
    const onOnline = () => setIsOffline(false);
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-[60] bg-amber-500 text-zinc-900 text-sm font-medium text-center py-2 px-4">
      You are offline. Some features may be unavailable.
    </div>
  );
};
