'use client';

import { useState, useEffect } from 'react';

export default function CountdownTimer({ expiresAt, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      return Math.max(0, Math.floor(diff / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isExpired = timeLeft <= 0;
  const isUrgent = timeLeft < 120 && timeLeft > 0;

  return (
    <div className={`countdown ${isExpired ? 'countdown-expired' : ''}`}
      style={isUrgent ? { animation: 'pulse 1s ease-in-out infinite' } : {}}>
      {isExpired ? (
        <>⏰ Hold expired</>
      ) : (
        <>
          ⏱️ {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')} remaining
        </>
      )}
    </div>
  );
}
