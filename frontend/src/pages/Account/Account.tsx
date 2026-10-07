import './Account.css';
import { useState } from 'react';
import { ArrowRight, LogOut, UserRound } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useApp } from '../../context';

export default function Account() {
  const { user, logout, notify } = useApp();
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  if (!user) return <Navigate to="/login?next=/account" replace />;
  async function signOut() {
    setBusy(true);
    try { await logout(); navigate('/'); notify('Signed out. Your learning will be here when you return.'); }
    catch (error) { notify((error as Error).message); }
    finally { setBusy(false); }
  }
  return <><div className="page-heading"><div><h1>Your account</h1></div></div><section className="account-card"><div className="account-profile"><span className="avatar">{user.name.charAt(0).toUpperCase()}</span><div><h2>{user.name}</h2></div><UserRound className="muted" /></div><dl><div><dt>Name</dt><dd>{user.name}</dd></div><div><dt>Email address</dt><dd>{user.email}</dd></div></dl><div className="account-actions"><Link className="button primary" to="/my-learning">Back to my learning<ArrowRight size={16} /></Link><button className="button quiet" disabled={busy} onClick={signOut}><LogOut size={16} />{busy ? 'Signing out…' : 'Sign out'}</button></div></section></>;
}
