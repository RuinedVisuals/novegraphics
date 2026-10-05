'use client';

import { useEffect, useState } from 'react';

const fmt = () => new Date().toLocaleTimeString('en-GB', { timeZone: 'Europe/Athens', hour12: false });

export default function AthensClock() {
  const [now, setNow] = useState('--:--:--');
  useEffect(() => {
    const tick = () => setNow(fmt());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => { clearTimeout(first); clearInterval(id); };
  }, []);
  return <span>ATHENS {now}</span>;
}
