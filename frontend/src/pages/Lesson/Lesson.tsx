import "./Lesson.css";
import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Code2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Link, Navigate, useOutletContext, useParams } from "react-router-dom";
import { useApp } from "../../context";
import type { LessonOutletContext } from "../../components/Layout";
import { ErrorState, Loading } from "../../components/Feedback";
import LessonPlayground from "../../components/LessonPlayground";
import { splitLessonContent } from "./lessonContent";

export default function Lesson() {
  const { slug, lessonId } = useParams();
  const { user } = useApp();
  const { lessonResource: resource } = useOutletContext<LessonOutletContext>();
  const [playgroundOpen, setPlaygroundOpen] = useState(false);
  const tryButtonRef = useRef<HTMLButtonElement>(null);
  const playgroundId = useId();
  useEffect(() => {
    setPlaygroundOpen(false);
    window.scrollTo(0, 0);
  }, [lessonId]);
  if (!user)
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(`/learn/${slug}/${lessonId}`)}`}
        replace
      />
    );
  if (resource.loading && !resource.data) return <Loading />;
  if (resource.error || !resource.data)
    return (
      <>
        <Link className="back-link" to={`/courses/${slug}`}>
          <ArrowLeft size={15} /> Back to the course
        </Link>
        <ErrorState
          message={resource.error || "This lesson is unavailable."}
          retry={resource.retry}
        />
      </>
    );
  const { lesson, course } = resource.data;
  if (course.slug !== slug)
    return <Navigate to={`/learn/${course.slug}/${lesson.id}`} replace />;
  const currentIndex = course.lessons.findIndex(
    (item) => item.id === lesson.id,
  );
  const nextLesson = course.lessons[currentIndex + 1];
  const { lecture, practice } = splitLessonContent(lesson.content);

  function closePlayground() {
    setPlaygroundOpen(false);
    tryButtonRef.current?.focus();
  }
  return (
    <>
      <Link className="back-link" to={`/courses/${slug}`}>
        <ArrowLeft size={15} />
        {course.title}
      </Link>
      <div
        className={`classroom-grid ${playgroundOpen ? "playground-open" : ""}`}
      >
        <article className="lesson-article">
          <div className="lesson-heading">
            <span className="eyebrow">
              LESSON {lesson.order} OF {course.lesson_count}
            </span>
            <span className="lesson-time">
              <Clock3 size={14} /> {lesson.duration_minutes} min
            </span>
          </div>
          <h1>{lesson.title}</h1>
          {lesson.completed && (
            <span className="completed-badge">
              <CheckCircle2 size={15} /> You’ve completed this lesson
            </span>
          )}
          <div className="markdown">
            <ReactMarkdown>{lecture}</ReactMarkdown>
          </div>
          <div className="lesson-try-action">
            <button
              className="button primary"
              type="button"
              ref={tryButtonRef}
              aria-expanded={playgroundOpen}
              aria-controls={playgroundId}
              onClick={() => setPlaygroundOpen((open) => !open)}
            >
              {playgroundOpen ? "Hide playground" : "Try now"}
              <Code2 size={16} />
            </button>
          </div>
        </article>
        <LessonPlayground
          key={lesson.id}
          id={playgroundId}
          open={playgroundOpen}
          lesson={lesson}
          practice={practice}
          courseSlug={course.slug}
          nextLesson={nextLesson}
          courseCompleted={course.progress === 100}
          onClose={closePlayground}
        />
      </div>
    </>
  );
}
