import './Layout.css';
import { useState, type FormEvent } from 'react';
import { ArrowRight, BookOpen, Bookmark, ChevronRight, CircleHelp, Compass, LayoutGrid, Menu, Search, UserRound, X } from 'lucide-react';
import { Link, NavLink, Outlet, matchPath, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { useResource } from '../hooks';
import type { LessonResponse } from '../types';
import LessonSidebar from './LessonSidebar';

export interface LessonOutletContext {
  lessonResource: {
    data: LessonResponse | null;
    loading: boolean;
    error: string;
    retry: () => void;
  };
}

const navigation = [{ to: '/', label: 'Overview', icon: LayoutGrid }, { to: '/courses', label: 'Explore courses', icon: Compass }, { to: '/my-learning', label: 'My learning', icon: BookOpen }, { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark }];

export function Logo({ linked = true }: { linked?: boolean }) {
  const content = <><span className="brand-mark"><svg viewBox="0 0 32 32" fill="none"><path d="M6 23V9l10 7 10-7v14M16 16v10" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg></span><span>mayshe</span></>;
  return linked ? <Link className="brand" to="/" aria-label="Mayshe Guides home">{content}</Link> : <div className="brand" aria-label="Mayshe Guides">{content}</div>;
}

export default function Layout() {
  const { user, revision } = useApp();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const lessonMatch = matchPath('/learn/:slug/:lessonId', location.pathname);
  const focused = Boolean(lessonMatch);
  const resource = useResource<LessonResponse>(lessonMatch && user ? `/lessons/${lessonMatch.params.lessonId}/` : null, revision);
  // Keep the previous lesson's response out of a newly selected lesson's view.
  const currentData = resource.data?.lesson.id === Number(lessonMatch?.params.lessonId) ? resource.data : null;
  const lessonResource = {
    ...resource,
    data: currentData,
    loading: resource.loading || Boolean(lessonMatch && user && !currentData && !resource.error),
  };
  const labels: Record<string, string> = { '/': 'Overview', '/courses': 'Explore courses', '/my-learning': 'My learning', '/bookmarks': 'Bookmarks', '/about': 'How it works', '/account': 'Your account' };
  const page = labels[location.pathname] || (location.pathname.startsWith('/learn/') ? 'Your classroom' : 'Explore courses');
  function submit(event: FormEvent) { event.preventDefault(); navigate(`/courses${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ''}`); setMenu(false); }
  return <div className="app-shell">
    {menu && <button className="sidebar-overlay" aria-label="Close navigation" onClick={() => setMenu(false)} />}
    <aside className={`sidebar ${menu ? 'sidebar-open' : ''} ${focused ? 'sidebar-focused' : ''}`}>
      <Logo linked={!focused} /><button className="close-menu icon-button" aria-label="Close navigation" onClick={() => setMenu(false)}><X /></button>
      <div className="nav-label">{focused ? 'YOUR CLASSROOM' : 'YOUR LEARNING SPACE'}</div>
      {focused ? <LessonSidebar
        key={lessonMatch?.params.slug}
        course={currentData?.course ?? null}
        lessonId={Number(lessonMatch?.params.lessonId)}
        loading={lessonResource.loading}
        error={lessonResource.error}
        retry={lessonResource.retry}
        onNavigate={() => setMenu(false)}
      /> : <>
      <nav className="main-nav" aria-label="Main navigation">{navigation.map(item => <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={() => setMenu(false)}><item.icon size={19} /><span>{item.label}</span></NavLink>)}</nav>
      <div className="sidebar-bottom"><NavLink to="/about" onClick={() => setMenu(false)}><CircleHelp size={18} /> How it works</NavLink><div className="sidebar-divider" />
        <Link className="sidebar-profile" to={user ? '/account' : '/login'} onClick={() => setMenu(false)}><span className="avatar">{user ? user.name.charAt(0).toUpperCase() : <UserRound size={18} />}</span><span><strong>{user ? user.name : 'Your account'}</strong><small>{user ? user.email : 'Sign in'}</small></span><ChevronRight size={15} /></Link>
      </div>
      </>}
    </aside>
    <div className="main-shell"><header className="topbar"><div className="topbar-title"><button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setMenu(true)}><Menu /></button><span>{page}</span></div>
      <form className="search-form" onSubmit={submit}><Search size={17} /><input aria-label="Search courses" placeholder="What do you want to learn?" value={search} onChange={event => setSearch(event.target.value)} /><button type="submit" aria-label="Submit course search"><ArrowRight size={16} /></button></form>
      <div className="topbar-right">{user ? <Link className="avatar" to="/account" aria-label="Your account">{user.name.charAt(0).toUpperCase()}</Link> : <Link className="signin-link" to="/login">Sign in <ArrowRight size={15} /></Link>}</div>
    </header><main className={`page-content ${focused ? 'page-content-lesson' : ''}`} id="main-content" key={location.pathname}><Outlet context={{ lessonResource } satisfies LessonOutletContext} /></main><footer className="footer"><span>© {new Date().getFullYear()} Mayshe Guides</span></footer></div>
  </div>;
}
