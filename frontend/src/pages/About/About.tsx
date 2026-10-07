import './About.css';
import { BookOpen, CheckCircle2, Compass } from 'lucide-react';

export default function About() {
  return <div className="about-page"><h1>How it works</h1><p className="about-lead">Choose a course, read each lesson, and use the playground to practice. Your account keeps your progress and bookmarks.</p><div className="about-steps">{[{ icon: Compass, title: 'Choose a course', text: 'Explore short starter courses in development, design, and data. Open a course to see its lesson list.' }, { icon: BookOpen, title: 'Read and practice', text: 'Read the lecture, then select Try now to open the playground. Use Next lesson to move through the course.' }, { icon: CheckCircle2, title: 'Save your progress', text: 'Answer a quick knowledge check. A correct answer completes the lesson and saves your progress.' }].map((step, index) => <article key={step.title}><span className="about-step-number">0{index + 1}</span><step.icon size={29} /><h2>{step.title}</h2><p>{step.text}</p></article>)}</div></div>;
}
