import './LessonSidebar.css';
import { useId, useState } from 'react';
import { BookOpen, Check, ChevronRight, LockKeyhole, Map } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useResource } from '../hooks';
import type { Course, CourseDetail } from '../types';

interface LessonSidebarProps {
  course: CourseDetail | null;
  lessonId: number;
  loading: boolean;
  error: string;
  retry: () => void;
  onNavigate: () => void;
}

export default function LessonSidebar({ course, lessonId, loading, error, retry, onNavigate }: LessonSidebarProps) {
  const [expanded, setExpanded] = useState<'topic' | 'roadmap' | null>(null);
  const panelId = useId();
  const roadmap = useResource<{ courses: Course[] }>(course && expanded === 'roadmap'
    ? `/courses/?category=${encodeURIComponent(course.category.slug)}` : null);
  const roadmapCourses = roadmap.data?.courses ?? [];
  const courseIndex = roadmapCourses.findIndex(item => item.id === course?.id);
  const nextSteps = courseIndex >= 0 ? roadmapCourses.slice(courseIndex + 1) : roadmapCourses.filter(item => item.id !== course?.id);

  function toggle(section: 'topic' | 'roadmap') {
    setExpanded(current => current === section ? null : section);
  }

  return <div className="lesson-navigation">
    <nav className="lesson-nav" aria-label="Focused learning navigation">
      <div className="lesson-nav-section">
        <button
          type="button"
          className="lesson-nav-toggle"
          aria-expanded={expanded === 'topic'}
          aria-controls={`${panelId}-topic`}
          disabled={!course}
          onClick={() => toggle('topic')}
        >
          <BookOpen size={18} />
          <span className="lesson-nav-title">{course?.title ?? 'Current topic'}</span>
          <ChevronRight size={15} className="lesson-nav-chevron" />
        </button>
        <div id={`${panelId}-topic`} hidden={expanded !== 'topic'}>
          <ul className="lesson-subtopics" aria-label="Lessons in the current topic">
            {course?.lessons.map(lesson => <li key={lesson.id}>
              <Link
                className={`lesson-nav-link ${lesson.id === lessonId ? 'current' : ''}`}
                to={`/learn/${course.slug}/${lesson.id}`}
                aria-current={lesson.id === lessonId ? 'page' : undefined}
                onClick={onNavigate}
              >
                <span className={`lesson-nav-number ${lesson.completed ? 'complete' : ''}`}>
                  {lesson.completed ? <Check size={14} aria-label="Completed" /> : String(lesson.order).padStart(2, '0')}
                </span>
                <div>{lesson.title}<span className="lesson-nav-meta">{lesson.duration_minutes} min</span></div>
              </Link>
            </li>)}
          </ul>
        </div>
      </div>

      <div className="lesson-nav-section">
        <button
          type="button"
          className="lesson-nav-toggle"
          aria-expanded={expanded === 'roadmap'}
          aria-controls={`${panelId}-roadmap`}
          disabled={!course}
          onClick={() => toggle('roadmap')}
        >
          <Map size={18} />
          <span className="lesson-nav-title">Roadmap</span>
          <ChevronRight size={15} className="lesson-nav-chevron" />
        </button>
        <div id={`${panelId}-roadmap`} className="lesson-roadmap" hidden={expanded !== 'roadmap'}>
          {expanded === 'roadmap' && <>
            <p className="lesson-nav-message">A preview of what comes next. Keep your focus on this course for now.</p>
            {roadmap.loading ? <p className="lesson-nav-message" role="status">Loading your next steps…</p>
              : roadmap.error ? <div className="lesson-nav-error" role="alert"><p>{roadmap.error}</p><button type="button" onClick={roadmap.retry}>Try again</button></div>
              : nextSteps.length ? <ol className="lesson-roadmap-steps" aria-label={`Next steps in ${course?.category.name}`}>
                {nextSteps.map(step => <li className="lesson-roadmap-step" key={step.id} aria-disabled="true">
                  <LockKeyhole size={13} aria-hidden="true" />
                  <div>{step.title}<span className="lesson-nav-meta">For later · {step.level}</span></div>
                </li>)}
              </ol> : <p className="lesson-nav-message">You’re at the end of this subject’s current roadmap. More steps can be added later.</p>}
          </>}
        </div>
      </div>
    </nav>

    {!course && <div className="lesson-nav-message" role={error ? 'alert' : 'status'}>
      {error ? <>{error}<button type="button" className="lesson-nav-retry" onClick={retry}>Try again</button></> : loading ? 'Loading your topic…' : 'Your topic will appear here.'}
    </div>}

    {course && <div className="lesson-nav-summary">
      <div className="card-progress">
        <div><span>{course.completed_lessons} of {course.lesson_count} lessons complete</span><strong>{course.progress}%</strong></div>
        <div className="progress-track" role="progressbar" aria-label="Course progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={course.progress}>
          <span style={{ width: `${course.progress}%` }} />
        </div>
      </div>
      <p>One topic at a time. Your progress is saved with every completed knowledge check.</p>
    </div>}
  </div>;
}
