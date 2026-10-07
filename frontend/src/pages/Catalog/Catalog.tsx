import './Catalog.css';
import { Bookmark, BookOpen, Search, SlidersHorizontal, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../context';
import { useResource } from '../../hooks';
import type { Category, Course } from '../../types';
import CourseCard from '../../components/CourseCard';
import { EmptyState, ErrorState, Loading } from '../../components/Feedback';

export default function Catalog({ mode = 'all' }: { mode?: 'all' | 'enrolled' | 'bookmarked' }) {
  const { user, revision } = useApp();
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const query = params.get('q') || '';
  const filter = new URLSearchParams();
  if (category) filter.set('category', category);
  if (query) filter.set('q', query);
  if (mode !== 'all') filter.set(mode, 'true');
  const catalog = useResource<{ courses: Course[] }>(mode === 'all' || user ? `/courses/?${filter}` : null, revision);
  const categories = useResource<{ categories: Category[] }>('/categories/');
  const titles = { all: 'Courses', enrolled: 'My learning', bookmarked: 'Bookmarks' };
  const descriptions = { all: 'Browse courses by topic.', enrolled: 'Your enrolled courses and progress.', bookmarked: 'Courses you saved for later.' };
  function setFilter(key: string, value: string) {
    setParams(current => { const next = new URLSearchParams(current); if (value) next.set(key, value); else next.delete(key); return next; }, { replace: true });
  }
  return <><div className="page-heading"><div><h1>{titles[mode]}</h1><p>{descriptions[mode]}</p></div><span className="page-heading-icon">{mode === 'bookmarked' ? <Bookmark /> : <BookOpen />}</span></div>
    {mode !== 'all' && !user ? <EmptyState title="Make this space your own" description="Sign in to keep your courses, bookmarks, and progress together." action="Sign in to your account" to={`/login?next=${mode === 'enrolled' ? '/my-learning' : '/bookmarks'}`} /> : <>
      <div className="catalog-toolbar"><div className="filter-tabs" role="group" aria-label="Course categories"><button className={!category ? 'active' : ''} aria-pressed={!category} onClick={() => setFilter('category', '')}>All courses</button>{categories.data?.categories.map(item => <button className={category === item.slug ? 'active' : ''} aria-pressed={category === item.slug} key={item.slug} onClick={() => setFilter('category', item.slug)}>{item.name}</button>)}</div><span className="results-count"><SlidersHorizontal size={15} /> {catalog.data?.courses.length ?? '…'} courses</span></div>
      <form className="catalog-search" onSubmit={event => event.preventDefault()}><Search size={19} /><input aria-label="Filter courses by title or topic" placeholder="Search courses or topics…" value={query} onChange={event => setFilter('q', event.target.value)} />{query && <button className="icon-button" aria-label="Clear search" type="button" onClick={() => setFilter('q', '')}><X size={18} /></button>}</form>
      {catalog.loading ? <Loading /> : catalog.error ? <ErrorState message={catalog.error} retry={catalog.retry} /> : catalog.data?.courses.length ? <div className="course-grid catalog-grid">{catalog.data.courses.map(course => <CourseCard key={course.id} course={course} />)}</div> : <EmptyState title={query || category ? 'A different direction, perhaps?' : mode === 'enrolled' ? 'Your first step is waiting' : mode === 'bookmarked' ? 'Save a little inspiration' : 'More possibilities are on the way'} description={query || category ? 'Try another search or explore all of our courses.' : mode === 'enrolled' ? 'Explore the catalog and join a course that catches your curiosity.' : mode === 'bookmarked' ? 'Tap the bookmark on any course to keep it here for later.' : 'No courses have been added yet. Check back soon.'} />}
    </>}
  </>;
}
