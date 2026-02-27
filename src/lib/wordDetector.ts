function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .trim();
}

export const WORD_ALIASES: Record<string, string[]> = {
  'ci/cd': ['cicd', 'ci cd', 'continuous integration continuous delivery'],
  'mvp': ['minimum viable product', 'm.v.p.'],
  'roi': ['return on investment', 'r.o.i.'],
  'api': ['a.p.i.'],
  'devops': ['dev ops', 'dev-ops'],
  'a/b test': ['ab test', 'a b test', 'split test'],
  'scrum master': ['scrummaster'],
  'tech debt': ['technical debt'],
};

export function detectWords(
  transcript: string,
  cardWords: string[],
  alreadyFilled: Set<string>,
): string[] {
  const norm = normalizeText(transcript);
  const detected: string[] = [];

  for (const word of cardWords) {
    if (alreadyFilled.has(word.toLowerCase())) continue;
    const normWord = normalizeText(word);

    if (normWord.includes(' ')) {
      if (norm.includes(normWord)) detected.push(word);
    } else {
      const regex = new RegExp(`\\b${escapeRegex(normWord)}\\b`, 'i');
      if (regex.test(norm)) detected.push(word);
    }
  }

  return detected;
}

export function detectWordsWithAliases(
  transcript: string,
  cardWords: string[],
  alreadyFilled: Set<string>,
): string[] {
  const detected = detectWords(transcript, cardWords, alreadyFilled);
  const norm = normalizeText(transcript);

  for (const word of cardWords) {
    if (alreadyFilled.has(word.toLowerCase())) continue;
    if (detected.includes(word)) continue;

    const aliases = WORD_ALIASES[word.toLowerCase()];
    if (aliases?.some(alias => norm.includes(alias))) {
      detected.push(word);
    }
  }

  return detected;
}
