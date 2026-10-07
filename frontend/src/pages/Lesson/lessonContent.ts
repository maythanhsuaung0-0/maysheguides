const practiceHeadings = /^(?:try (?:it )?yourself|try now|your mini project|a simple exercise|exercises?|practice|your turn|challenge)$/i;
const practiceFollowUps = /^(?:check your work|review)$/i;

/** Separate exercise sections while leaving examples and fenced code in the lecture. */
export function splitLessonContent(content: string): { lecture: string; practice: string } {
  const lecture: string[] = [];
  const practice: string[] = [];
  let practiceDepth: number | null = null;
  let fence: { character: string; length: number } | null = null;

  for (const line of content.split('\n')) {
    const fenceMatch = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fenceMatch) {
      const marker = fenceMatch[1];
      if (!fence) {
        fence = { character: marker[0], length: marker.length };
      } else if (marker[0] === fence.character && marker.length >= fence.length && !fenceMatch[2].trim()) {
        fence = null;
      }
    } else if (!fence) {
      const heading = line.match(/^ {0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
      if (heading) {
        const depth = heading[1].length;
        const title = heading[2].replace(/[*_]/g, '').trim();
        if (practiceHeadings.test(title)) {
          practiceDepth = depth;
        } else if (practiceDepth !== null && depth <= practiceDepth && !practiceFollowUps.test(title)) {
          practiceDepth = null;
        }
      }
    }
    (practiceDepth === null ? lecture : practice).push(line);
  }

  return { lecture: lecture.join('\n').trim(), practice: practice.join('\n').trim() };
}
