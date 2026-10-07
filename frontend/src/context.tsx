import './context.css';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, post } from './api';
import type { User } from './types';

interface AppContext {
  user: User | null; loading: boolean; sessionError: string; refreshSession: () => Promise<void>;
  setUser: (user: User | null) => void; logout: () => Promise<void>; notify: (message: string) => void;
  revision: number; refresh: () => void;
}
const Context = createContext<AppContext | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState('');
  const [toast, setToast] = useState('');
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision(value => value + 1), []);
  const refreshSession = useCallback(async () => {
    setLoading(true);
    setSessionError('');
    try { const result = await api<{ user: User | null }>('/auth/session/'); setUser(result.user); }
    catch { setSessionError('The learning server is unavailable. Start Django and try again.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void refreshSession(); }, [refreshSession]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 4000); return () => clearTimeout(timer); }, [toast]);
  async function logout() { await post('/auth/logout/'); setUser(null); refresh(); }
  return <Context.Provider value={{ user, setUser, loading, sessionError, refreshSession, logout, notify: setToast, revision, refresh }}>
    {children}
    {toast && <div className="toast" role="status">{toast}<button aria-label="Dismiss message" onClick={() => setToast('')}>×</button></div>}
  </Context.Provider>;
}

export function useApp() {
  const context = useContext(Context);
  if (!context) throw new Error('useApp requires AppProvider');
  return context;
}
