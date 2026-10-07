import './CourseCard.css';
import { useState } from 'react';
import { ArrowUpRight, Bookmark, Check, Clock3, Layers3 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { duration, post } from '../api';
import { useApp } from '../context';
import type { Course } from '../types';
import { CourseArtwork } from './Artwork';

export default function CourseCard({ course }: { course: Course }) {
  const { user, refresh, notify } = useApp();
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  async function bookmark() {
    if (!user) { navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`); return; }
    setBusy(true);
    try { const result = await post<{ bookmarked: boolean }>(`/courses/${course.slug}/bookmark/`); refresh(); notify(result.bookmarked ? 'Saved for a little later.' : 'Course removed from bookmarks.'); }
    catch (error) { notify((error as Error).message); }
    finally { setBusy(false); }
  }
  return <article className="course-card"><div className="course-art-wrap"><Link to={`/courses/${course.slug}`} tabIndex={-1} aria-hidden="true"><CourseArtwork type={course.artwork} /></Link><button className={`bookmark-button ${course.bookmarked ? 'saved' : ''}`} aria-label={`${course.bookmarked ? 'Remove bookmark for' : 'Bookmark'} ${course.title}`} aria-pressed={course.bookmarked} disabled={busy} onClick={bookmark}><Bookmark size={17} fill={course.bookmarked ? 'currentColor' : 'none'} /></button></div>
    <div className="course-card-body"><div className="course-meta-top"><span className={`category-label category-${course.category.slug}`}>{course.category.name}</span><span className="level-label">{course.level}</span></div><h3><Link to={`/courses/${course.slug}`}>{course.title}</Link></h3><p>{course.description}</p><div className="course-facts"><span><Layers3 size={13} />{course.lesson_count} lessons</span><span><Clock3 size={13} />{duration(course.duration_minutes)}</span></div>
      {course.enrolled ? <div className="card-progress"><div><span>{course.progress === 100 ? <><Check size={13} /> Course complete</> : `${course.completed_lessons} of ${course.lesson_count} lessons completed`}</span><strong>{course.progress}%</strong></div><div className="progress-track"><span style={{ width: `${course.progress}%` }} /></div><Link className="continue-link" to={course.next_lesson_id ? `/learn/${course.slug}/${course.next_lesson_id}` : `/courses/${course.slug}`}>{course.progress === 100 ? 'Revisit course' : 'Continue learning'}<ArrowUpRight size={16} /></Link></div>
        : <div className="course-card-footer"><span className="instructor"><span className="mini-avatar">m</span>{course.instructor}</span><Link to={`/courses/${course.slug}`} aria-label={`View ${course.title}`}><ArrowUpRight size={19} /></Link></div>}
    </div></article>;
}
