import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function VisitorTracker() {
  const location = useLocation();

  useEffect(() => {
    try {
      fetch('/api/analytics/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: location.pathname }),
      }).catch(() => {
        // Silently catch error for network offline
      });
    } catch (e) {
      // Ignore
    }
  }, [location.pathname]);

  return null;
}
