import './Overview.css';
import { useState, type ReactNode } from 'react';
import { ArrowRight, BookOpen, Check, Clock3, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { duration } from '../../api';
import { useApp } from '../../context';
import { useResource } from '../../hooks';
import type { Category, Course, Dashboard } from '../../types';
import CourseCard from '../../components/CourseCard';
import { ErrorState, Loading } from '../../components/Feedback';

export default function Overview() {
  const { user, revision } = useApp();
  const [category, setCategory] = useState('');
  const catalog = useResource<{ courses: Course[] }>('/courses/', revision);
  const categories = useResource<{ categories: Category[] }>('/categories/');
  const dashboard = useResource<Dashboard>(user ? '/dashboard/' : null, revision);
  const courses = catalog.data?.courses || [];
  const filtered = courses.filter(course => !category || course.category.slug === category);
  const stats = dashboard.data?.stats;
  const continuing = dashboard.data?.courses.filter(course => course.progress < 100) || [];

  return <>
    <div className="page-heading"><div><h1>Learning overview</h1></div></div>
    {user && <div className="stats-grid">
      <Stat icon={<BookOpen size={20} />} label="Enrolled courses" value={stats?.enrolled_courses ?? '—'} color="green" />
      <Stat icon={<Check size={20} />} label="Lessons completed" value={stats?.completed_lessons ?? '—'} color="blue" />
      <Stat icon={<Clock3 size={20} />} label="Learning time" value={stats ? duration(stats.learning_minutes) : '—'} color="sand" />
      <Stat icon={<Trophy size={20} />} label="Courses completed" value={stats?.completed_courses ?? '—'} color="lavender" />
    </div>}
    {dashboard.error && <div className="inline-error" role="alert">{dashboard.error} <button onClick={dashboard.retry}>Retry</button></div>}
    {continuing.length > 0 && <section className="continue-banner">
      <span className="continue-icon"><BookOpen size={23} /></span>
      <div><h2>{continuing[0].title}</h2><p>{continuing[0].completed_lessons} of {continuing[0].lesson_count} lessons completed</p></div>
      <Link className="button secondary" to={continuing[0].next_lesson_id ? `/learn/${continuing[0].slug}/${continuing[0].next_lesson_id}` : `/courses/${continuing[0].slug}`}>Continue learning <ArrowRight size={16} /></Link>
    </section>}
    <section className="overview-courses">
      <div className="section-heading"><h2>Courses</h2><Link to="/courses">View all courses <ArrowRight size={15} /></Link></div>
      <div className="filter-tabs" role="group" aria-label="Filter courses">
        <button className={!category ? 'active' : ''} aria-pressed={!category} onClick={() => setCategory('')}>All courses</button>
        {categories.data?.categories.map(item => <button key={item.slug} className={category === item.slug ? 'active' : ''} aria-pressed={category === item.slug} onClick={() => setCategory(item.slug)}>{item.name}</button>)}
      </div>
      {catalog.loading ? <Loading /> : catalog.error ? <ErrorState message={catalog.error} retry={catalog.retry} /> : <div className="course-grid">{filtered.map(course => <CourseCard key={course.id} course={course} />)}</div>}
    </section>
  </>;
}

function Stat({ icon, label, value, color }: { icon: ReactNode; label: string; value: string | number; color: string }) {
  return <div className="stat-card"><span className={`stat-icon stat-${color}`}>{icon}</span><span className="stat-label">{label}</span><strong>{value}</strong></div>;
}
