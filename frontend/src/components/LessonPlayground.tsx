import './LessonPlayground.css';
import { useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Code2, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { post } from '../api';
import { useApp } from '../context';
import type { Lesson, LessonSummary } from '../types';

interface LessonPlaygroundProps {
  id: string;
  open: boolean;
  lesson: Lesson;
  practice: string;
  courseSlug: string;
  nextLesson: LessonSummary | undefined;
  courseCompleted: boolean;
  onClose: () => void;
}

export default function LessonPlayground({ id, open, lesson, practice, courseSlug, nextLesson, courseCompleted, onClose }: LessonPlaygroundProps) {
  const { refresh } = useApp();
  const panelRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [workspace, setWorkspace] = useState('');
  const [answer, setAnswer] = useState<number | null>(null);
  const [result, setResult] = useState<{ correct: boolean; explanation: string; completed: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useLayoutEffect(() => {
    if (!open || !panelRef.current) return;
    const panel = panelRef.current;
    const viewport = window.visualViewport;
    const updateHeight = () => {
      // Account for the header and the panel's actual position, not just viewport height.
      const viewportBottom = viewport ? viewport.offsetTop + viewport.height : window.innerHeight;
      const availableHeight = viewportBottom - Math.max(panel.getBoundingClientRect().top, 24) - 24;
      panel.style.setProperty('--playground-height', `${Math.max(0, availableHeight)}px`);
    };

    if (window.matchMedia('(max-width: 1000px)').matches) {
      panel.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
    updateHeight();
    headingRef.current?.focus({ preventScroll: true });
    window.addEventListener('resize', updateHeight);
    window.addEventListener('scroll', updateHeight, { passive: true });
    viewport?.addEventListener('resize', updateHeight);
    viewport?.addEventListener('scroll', updateHeight);
    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('scroll', updateHeight);
      viewport?.removeEventListener('resize', updateHeight);
      viewport?.removeEventListener('scroll', updateHeight);
    };
  }, [open]);

  async function check() {
    if (answer === null || busy) return;
    setBusy(true);
    setError('');
    try {
      const response = await post<{ correct: boolean; explanation: string; completed: boolean }>(`/lessons/${lesson.id}/complete/`, { answer });
      setResult(response);
      if (response.correct) refresh();
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return <aside
    ref={panelRef}
    id={id}
    className="lesson-playground"
    hidden={!open}
    aria-labelledby={`${id}-title`}
    onKeyDown={event => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    }}
  >
    <header className="playground-header">
      <div>
        <span className="eyebrow">YOUR TURN</span>
        <h2 id={`${id}-title`} ref={headingRef} tabIndex={-1}><Code2 size={19} />Playground</h2>
      </div>
      <button type="button" className="icon-button" aria-label="Close playground" onClick={onClose}><X size={19} /></button>
    </header>

    {practice && <div className="markdown playground-instructions"><ReactMarkdown>{practice}</ReactMarkdown></div>}

    <div className="playground-workspace">
      <label htmlFor={`${id}-workspace`}>Your workspace</label>
      <p>Use this space for your code, notes, or solution.</p>
      <textarea
        id={`${id}-workspace`}
        value={workspace}
        onChange={event => setWorkspace(event.target.value)}
        placeholder="Try an idea here…"
        spellCheck={false}
      />
    </div>

    <section className="playground-quiz" aria-labelledby={`${id}-quiz-title`}>
      <span className="eyebrow">A QUICK CHECK-IN</span>
      <h3 id={`${id}-quiz-title`}>Check your understanding.</h3>
      <form onSubmit={event => { event.preventDefault(); void check(); }}>
        <fieldset disabled={busy || result?.correct}>
          <legend>{lesson.question}</legend>
          <div className="quiz-options">
            {lesson.choices.map((choice, index) => <label className={`quiz-option ${answer === index ? 'selected' : ''}`} key={index}>
              <input type="radio" name={`answer-${lesson.id}`} value={index} checked={answer === index} onChange={() => { setAnswer(index); setResult(null); }} />
              <span>{choice}</span>
            </label>)}
          </div>
        </fieldset>
        {error && <p className="form-error" role="alert">{error}</p>}
        {result && <div className={`quiz-feedback ${result.correct ? 'correct' : 'incorrect'}`} role="status">
          {result.correct && <CheckCircle2 size={19} />}
          <div><strong>{result.correct ? 'A small win. Nice work!' : 'You’re still learning. Try again.'}</strong><p>{result.explanation}</p></div>
        </div>}
        {!result?.correct && <button className="button primary" type="submit" disabled={answer === null || busy}>
          {busy ? 'Checking…' : 'Check my answer'}<ArrowRight size={16} />
        </button>}
      </form>
      {(result?.correct || lesson.completed) && <Link className="button primary next-lesson" to={nextLesson ? `/learn/${courseSlug}/${nextLesson.id}` : '/my-learning'}>
        {nextLesson ? 'On to the next lesson' : courseCompleted ? 'Celebrate your progress' : 'Back to my learning'}<ArrowRight size={16} />
      </Link>}
    </section>
  </aside>;
}
