'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const KEY = 'asc-progress-v3';
const Ctx = createContext({ done: new Set(), toggle: () => {}, reset: () => {}, ready: false });

export function ProgressProvider({ children }) {
  const [done, setDone] = useState(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setDone(new Set(JSON.parse(raw)));
    } catch {
      /* storage unavailable — progress just won't persist */
    }
    setReady(true);
  }, []);

  function persist(next) {
    setDone(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify([...next]));
    } catch {
      /* ignore */
    }
  }

  function toggle(id) {
    const next = new Set(done);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    persist(next);
  }

  function reset() {
    persist(new Set());
  }

  return <Ctx.Provider value={{ done, toggle, reset, ready }}>{children}</Ctx.Provider>;
}

export const useProgress = () => useContext(Ctx);
