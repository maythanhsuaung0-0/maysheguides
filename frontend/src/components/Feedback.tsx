import './Feedback.css';
import { BookOpen, CircleAlert, LoaderCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Loading() { return <div className="loading" role="status"><LoaderCircle className="spin" size={24} /><span>Making room for learning…</span></div>; }
export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return <div className="empty-state" role="alert"><CircleAlert /><h2>Let’s try that again</h2><p>{message}</p>{retry && <button className="button primary" onClick={retry}>Try again</button>}</div>;
}
export function EmptyState({ title, description, action = 'Explore courses', to = '/courses' }: { title: string; description: string; action?: string; to?: string }) {
  return <div className="empty-state"><span className="empty-icon"><BookOpen /></span><h2>{title}</h2><p>{description}</p><Link className="button primary" to={to}>{action}</Link></div>;
}
