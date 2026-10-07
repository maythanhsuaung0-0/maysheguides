import './Auth.css';
import { useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { post } from '../../api';
import { useApp } from '../../context';
import type { User } from '../../types';

export default function Auth({ register = false }: { register?: boolean }) {
  const { user, setUser, refresh } = useApp();
  const [params] = useSearchParams();
  const requested = params.get('next') || '/';
  const next = requested.startsWith('/') && !requested.startsWith('//') && !requested.includes('\\') ? requested : '/';
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (user) return <Navigate to={next} replace />;
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try { const response = await post<{ user: User }>(`/auth/${register ? 'register' : 'login'}/`, { name, email, password }); setUser(response.user); refresh(); navigate(next, { replace: true }); }
    catch (reason) { setError((reason as Error).message); }
    finally { setBusy(false); }
  }
  return <><Link className="back-link" to="/"><ArrowLeft size={15} /> Back to your learning space</Link><div className="auth-grid"><section className="auth-form-card"><h2>{register ? 'Create an account' : 'Sign in'}</h2><p>{register ? 'Save your courses, bookmarks, and progress.' : 'Access your courses and saved progress.'}</p><form onSubmit={submit}>{register && <label className="form-field">Your name<input autoComplete="given-name" name="name" placeholder="Your name" maxLength={150} value={name} onChange={event => setName(event.target.value)} required /></label>}<label className="form-field">Email address<input type="email" autoComplete="email" name="email" placeholder="you@example.com" maxLength={150} value={email} onChange={event => setEmail(event.target.value)} required /></label><label className="form-field">Password<span className="password-input"><input type={showPassword ? 'text' : 'password'} autoComplete={register ? 'new-password' : 'current-password'} name="password" minLength={register ? 8 : undefined} placeholder={register ? 'At least 8 characters' : 'Your password'} value={password} onChange={event => setPassword(event.target.value)} required /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>{register && <p className="password-hint">Use a unique password with a mix of letters and numbers.</p>}{error && <p className="form-error" role="alert">{error}</p>}<button className="button primary full-width" disabled={busy} type="submit">{busy ? 'Just a moment…' : register ? 'Create account' : 'Sign in'}<ArrowRight size={17} /></button></form><p className="auth-switch">{register ? 'Already have an account?' : 'Need an account?'} <Link to={`/${register ? 'login' : 'register'}?next=${encodeURIComponent(next)}`}>{register ? 'Sign in' : 'Create an account'}</Link></p></section></div></>;
}
