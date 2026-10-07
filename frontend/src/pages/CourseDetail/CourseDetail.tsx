import './CourseDetail.css';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Bookmark, Check, CircleCheck, Clock3, Layers3, LockKeyhole, Play } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { duration, post } from '../../api';
import { useApp } from '../../context';
import { useResource } from '../../hooks';
import type { Course, CourseDetail as CourseType } from '../../types';
import { ErrorState, Loading } from '../../components/Feedback';

export default function CourseDetail() {
  const { slug } = useParams();
  const { user, revision, refresh, notify } = useApp();
  const resource = useResource<{ course: CourseType }>(`/courses/${slug}/`, revision);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  if (resource.loading) return <Loading />;
  if (resource.error || !resource.data) return <ErrorState message={resource.error || 'This course is unavailable.'} retry={resource.retry} />;
  const course = resource.data.course;
  async function start() {
    if (!user) { navigate(`/register?next=${encodeURIComponent(`/courses/${slug}`)}`); return; }
    setBusy(true);
    try {
      const { course: enrolled } = await post<{ course: Course }>(`/courses/${slug}/enroll/`);
      refresh();
      const lesson = enrolled.next_lesson_id || course.lessons[0]?.id;
      if (lesson) navigate(`/learn/${slug}/${lesson}`);
    } catch (error) { notify((error as Error).message); }
    finally { setBusy(false); }
  }
  async function save() {
    if (!user) { navigate(`/login?next=${encodeURIComponent(`/courses/${slug}`)}`); return; }
    setBusy(true);
    try { const result = await post<{ bookmarked: boolean }>(`/courses/${slug}/bookmark/`); refresh(); notify(result.bookmarked ? 'Saved for a little later.' : 'Bookmark removed.'); }
    catch (error) { notify((error as Error).message); }
    finally { setBusy(false); }
  }
  return <><Link className="back-link" to="/courses"><ArrowLeft size={15} /> Back to courses</Link><div className="course-detail-grid"><div className="course-detail-main"><div className="detail-labels"><span className={`category-label category-${course.category.slug}`}>{course.category.name}</span><span className="level-label">{course.level}</span></div><h1 className="detail-title">{course.title}</h1><p className="detail-description">{course.description}</p><div className="detail-instructor"><span className="avatar">m</span><span><strong>{course.instructor}</strong><small>{course.instructor_role}</small></span></div>
      <div className="section-heading"><div><h2>Lessons</h2><p>{course.lesson_count} lessons · {duration(course.duration_minutes)}</p></div>{course.enrolled && <span className="progress-pill">{course.progress}% complete</span>}</div>
      <div className="lesson-list">{course.lessons.map(lesson => <div className={`lesson-row ${lesson.completed ? 'lesson-complete' : ''}`} key={lesson.id}><span className="lesson-number">{lesson.completed ? <Check size={18} /> : String(lesson.order).padStart(2, '0')}</span><div><h3>{course.enrolled ? <Link to={`/learn/${course.slug}/${lesson.id}`}>{lesson.title}</Link> : lesson.title}</h3><span>Reading + knowledge check</span></div><span className="lesson-time"><Clock3 size={13} />{lesson.duration_minutes} min</span>{course.enrolled ? <Link className="icon-button" aria-label={`Open ${lesson.title}`} to={`/learn/${course.slug}/${lesson.id}`}><Play size={16} /></Link> : <LockKeyhole size={15} className="muted" />}</div>)}</div>
      <div className="course-note"><CircleCheck size={18} /><p>Progress is saved as you complete each lesson’s knowledge check. You can revisit any lesson whenever you like.</p></div>
    </div><aside className="course-enroll-card"><div className="enroll-card-body"><h2>Course actions</h2><div className="enroll-facts"><span><Layers3 size={17} />{course.lesson_count} lessons</span><span><Clock3 size={17} />{duration(course.duration_minutes)}</span><span><CircleCheck size={17} />Knowledge checks</span></div>{course.enrolled && <div className="card-progress"><div><span>{course.completed_lessons} of {course.lesson_count} lessons complete</span><strong>{course.progress}%</strong></div><div className="progress-track"><span style={{ width: `${course.progress}%` }} /></div></div>}<button className="button primary full-width" disabled={busy || !course.lesson_count} onClick={start}>{busy ? 'Just a moment…' : course.progress === 100 ? 'Revisit this course' : course.enrolled ? 'Continue learning' : 'Start learning'}<ArrowRight size={16} /></button><button className="button quiet full-width" disabled={busy} onClick={save}><Bookmark size={16} fill={course.bookmarked ? 'currentColor' : 'none'} />{course.bookmarked ? 'Saved to bookmarks' : 'Save for later'}</button></div></aside></div></>;
}
