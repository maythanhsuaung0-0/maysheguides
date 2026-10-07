import './Artwork.css';
import { Braces, ChartNoAxesCombined, Code2, Layers3, Sparkles } from 'lucide-react';

export function CourseArtwork({ type }: { type: string }) {
  const icon = type === 'web' ? <Code2 /> : type === 'design' ? <Layers3 /> : type === 'data' ? <ChartNoAxesCombined /> : type === 'ai' ? <Sparkles /> : <Braces />;
  return <div className={`course-art art-${type}`} aria-hidden="true">
    {type === 'python' ? <div className="python-symbol"><span className="python-top"><i /></span><span className="python-bottom"><i /></span></div>
      : type === 'react' ? <svg className="react-symbol" viewBox="-100 -90 200 180"><g fill="none" stroke="currentColor" strokeWidth="5"><ellipse rx="83" ry="31" /><ellipse rx="83" ry="31" transform="rotate(60)" /><ellipse rx="83" ry="31" transform="rotate(120)" /></g><circle r="12" fill="currentColor" /></svg>
      : <span className="art-icon">{icon}</span>}
    <span className="art-label">{type === 'python' ? 'PY' : type === 'react' ? 'RE' : type === 'web' ? 'HTML / CSS' : type.toUpperCase()}</span>
  </div>;
}
