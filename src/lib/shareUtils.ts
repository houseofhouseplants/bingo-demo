import type { GameState } from '../types';
import { CATEGORIES } from '../data/categories';

export function buildShareText(game: GameState): string {
  const { winningWord, filledCount, completedAt, startedAt, category } = game;
  const elapsed = startedAt && completedAt ? Math.round((completedAt - startedAt) / 60000) : 0;
  const categoryName = CATEGORIES.find(c => c.id === category)?.name ?? category ?? '';
  return [
    `🎯 I got BINGO in ${elapsed} minutes!`,
    `Category: ${categoryName}`,
    `Winning word: "${winningWord}"`,
    `${filledCount}/25 squares filled`,
    ``,
    `Play Meeting Bingo: ${window.location.href}`,
  ].join('\n');
}

export async function shareResult(game: GameState): Promise<'shared' | 'copied' | 'error'> {
  const text = buildShareText(game);
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return 'shared';
    } catch {
      // user cancelled or share failed — fall through to clipboard
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'error';
  }
}
