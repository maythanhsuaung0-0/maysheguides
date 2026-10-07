import './App.css';
import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useApp } from './context';
import Layout from './components/Layout';
import { EmptyState, ErrorState, Loading } from './components/Feedback';
import Overview from './pages/Overview/Overview';
import Catalog from './pages/Catalog/Catalog';
import CourseDetail from './pages/CourseDetail/CourseDetail';
import Lesson from './pages/Lesson/Lesson';
import Auth from './pages/Auth/Auth';
import About from './pages/About/About';
import Account from './pages/Account/Account';

export default function App() {
  const { loading, sessionError, refreshSession } = useApp();
  const location = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);
  if (loading) return <div className="initial-loading"><Loading /></div>;
  if (sessionError) return <div className="initial-loading"><ErrorState message={sessionError} retry={() => { void refreshSession(); }} /></div>;
  return <><a className="skip-link" href="#main-content">Skip to content</a><Routes><Route element={<Layout />}>
    <Route index element={<Overview />} /><Route path="courses" element={<Catalog />} /><Route path="my-learning" element={<Catalog mode="enrolled" />} /><Route path="bookmarks" element={<Catalog mode="bookmarked" />} /><Route path="courses/:slug" element={<CourseDetail />} /><Route path="learn/:slug/:lessonId" element={<Lesson />} /><Route path="login" element={<Auth key="login" />} /><Route path="register" element={<Auth register key="register" />} /><Route path="about" element={<About />} /><Route path="account" element={<Account />} /><Route path="*" element={<EmptyState title="A little off the path" description="We couldn’t find this page. Let’s find your way back." action="Back to your overview" to="/" />} />
  </Route></Routes></>;
}
