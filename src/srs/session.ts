import { db } from '../db/db';
import type { Example, ItemType, Phrase, ReviewState, Word } from '../types/models';
import { createReviewState, isDue, maturity, reviewStateId } from './scheduler';

/**
 * Étape de session — ce que consomment les cards de `screens/Session.tsx`.
 *
 * Chaque étape connaît l'item d'origine (`itemId`/`itemType`) pour que la
 * notation FSRS puisse ensuite charger / écrire le bon `ReviewState`.
 */
export type SessionStep =
  | { kind: 'discover'; itemId: string; itemType: 'word'; word: Word; example?: Example }
  | { kind: 'recognize'; itemId: string; itemType: 'word'; word: Word; options: string[] }
  | { kind: 'recall'; itemId: string; itemType: 'word'; word: Word; options: string[] }
  | { kind: 'listen'; itemId: string; itemType: 'word'; word: Word; options: string[] }
  | {
      kind: 'cloze';
      itemId: string;
      itemType: 'phrase';
      phrase: Phrase;
      blank: string;
      options: string[];
    };

/** Nombre maximum de nouveaux items introduits par session. */
const MAX_NEW_PER_SESSION = 3;

/** Charge la prochaine session pour l'utilisateur. */
export async function loadSession(
  userId: string,
  dailyGoal: number,
  now: Date = new Date(),
): Promise<SessionStep[]> {
  const [allWords, allPhrases, allExamples, allStates] = await Promise.all([
    db.words.orderBy('rank').toArray(),
    db.phrases.orderBy('rank').toArray(),
    db.examples.toArray(),
    db.reviewStates.where('userId').equals(userId).toArray(),
  ]);

  const stateById = new Map<string, ReviewState>();
  for (const s of allStates) stateById.set(`${s.itemType}:${s.itemId}`, s);

  // 1) Items déjà introduits et dus maintenant — triés par échéance.
  const dueStates = allStates
    .filter((s) => isDue(s, now))
    .sort((a, b) => a.card.due.getTime() - b.card.due.getTime());

  // 2) Items jamais vus (pas encore de ReviewState). On privilégie les rangs
  //    de fréquence faibles (= mots les plus fréquents) pour l'introduction.
  const newWords = allWords.filter((w) => !stateById.has(`word:${w.id}`));
  const newPhrases = allPhrases.filter((p) => !stateById.has(`phrase:${p.id}`));
  const newCandidates: Array<{ itemType: ItemType; id: string }> = [
    ...newWords.map((w) => ({ itemType: 'word' as const, id: w.id })),
    ...newPhrases.map((p) => ({ itemType: 'phrase' as const, id: p.id })),
  ].sort((a, b) => itemRank(a, allWords, allPhrases) - itemRank(b, allWords, allPhrases));

  // 3) Répartition : on réserve d'abord jusqu'à MAX_NEW_PER_SESSION nouveaux
  //    (pour garantir une progression de la couverture même quand les
  //    révisions s'accumulent), puis on remplit le reste avec les dues.
  //    Si aucun nouveau n'est dispo, tout le budget va aux révisions.
  const newBudget = Math.min(newCandidates.length, MAX_NEW_PER_SESSION, dailyGoal);
  const dueBudget = Math.min(dueStates.length, Math.max(0, dailyGoal - newBudget));

  const dueSelection = dueStates.slice(0, dueBudget);
  const newSelection = newCandidates.slice(0, newBudget);

  // 4) Construction des étapes : un `discover` pour chaque nouveau,
  //    puis un exercice pour chaque item (nouveau OU dû).
  const steps: SessionStep[] = [];

  // Découvertes (en tête, pour familiariser avant de tester).
  for (const cand of newSelection) {
    if (cand.itemType !== 'word') continue;
    const word = allWords.find((w) => w.id === cand.id);
    if (!word) continue;
    const example = allExamples.find((e) => e.itemId === word.id && e.itemType === 'word');
    steps.push({
      kind: 'discover',
      itemId: word.id,
      itemType: 'word',
      word,
      example,
    });
  }

  // Exercices : nouveaux d'abord (reconnaissance simple), puis dus (type varié
  //    selon maturité).
  for (const cand of newSelection) {
    const exercise = exerciseForNewItem(cand, allWords, allPhrases);
    if (exercise) steps.push(exercise);
  }
  for (const state of dueSelection) {
    const exercise = exerciseForDueItem(state, allWords, allPhrases);
    if (exercise) steps.push(exercise);
  }

  return steps;
}

function itemRank(
  cand: { itemType: ItemType; id: string },
  words: Word[],
  phrases: Phrase[],
): number {
  if (cand.itemType === 'word') {
    return words.find((w) => w.id === cand.id)?.rank ?? Number.MAX_SAFE_INTEGER;
  }
  return phrases.find((p) => p.id === cand.id)?.rank ?? Number.MAX_SAFE_INTEGER;
}

function exerciseForNewItem(
  cand: { itemType: ItemType; id: string },
  words: Word[],
  phrases: Phrase[],
): SessionStep | null {
  if (cand.itemType === 'word') {
    const word = words.find((w) => w.id === cand.id);
    if (!word) return null;
    return makeRecognizeStep(word, words);
  }
  const phrase = phrases.find((p) => p.id === cand.id);
  if (!phrase) return null;
  return makeClozeStep(phrase, words);
}

function exerciseForDueItem(
  state: ReviewState,
  words: Word[],
  phrases: Phrase[],
): SessionStep | null {
  if (state.itemType === 'word') {
    const word = words.find((w) => w.id === state.itemId);
    if (!word) return null;
    return makeWordExercise(word, state, words);
  }
  const phrase = phrases.find((p) => p.id === state.itemId);
  if (!phrase) return null;
  // Les expressions se révisent en cloze, sinon pas révisables pour le MVP.
  return makeClozeStep(phrase, words);
}

/**
 * Choix de l'exercice selon la maturité — plus l'item est mûr, plus on demande
 * de production active (recall, listen) plutôt que de simple reconnaissance.
 */
function makeWordExercise(word: Word, state: ReviewState, words: Word[]): SessionStep {
  const m = maturity(state);
  const pool: Array<'recognize' | 'recall' | 'listen'> =
    m === 'new' || m === 'learning'
      ? ['recognize', 'recognize', 'recall']
      : m === 'young'
        ? ['recognize', 'recall', 'recall', 'listen']
        : ['recall', 'listen', 'listen'];
  const pick = pool[Math.floor(Math.random() * pool.length)];
  if (pick === 'recognize') return makeRecognizeStep(word, words);
  if (pick === 'recall') return makeRecallStep(word, words);
  return makeListenStep(word, words);
}

function makeRecognizeStep(word: Word, words: Word[]): SessionStep {
  return {
    kind: 'recognize',
    itemId: word.id,
    itemType: 'word',
    word,
    options: shuffledOptions(word.translationFr, distractorTranslations(word, words, 3)),
  };
}

function makeRecallStep(word: Word, words: Word[]): SessionStep {
  return {
    kind: 'recall',
    itemId: word.id,
    itemType: 'word',
    word,
    options: shuffledOptions(word.lemma, distractorLemmas(word, words, 3)),
  };
}

function makeListenStep(word: Word, words: Word[]): SessionStep {
  return {
    kind: 'listen',
    itemId: word.id,
    itemType: 'word',
    word,
    options: shuffledOptions(word.lemma, distractorLemmas(word, words, 3)),
  };
}

function makeClozeStep(phrase: Phrase, words: Word[]): SessionStep | null {
  if (!phrase.blank || !phrase.textEn.includes(phrase.blank)) return null;
  const distractors =
    phrase.distractors && phrase.distractors.length >= 3
      ? phrase.distractors.slice(0, 3)
      : distractorLemmasForBlank(phrase.blank, words, 3);
  return {
    kind: 'cloze',
    itemId: phrase.id,
    itemType: 'phrase',
    phrase,
    blank: phrase.blank,
    options: shuffledOptions(phrase.blank, distractors),
  };
}

function distractorTranslations(word: Word, words: Word[], n: number): string[] {
  const pool = words.filter((w) => w.id !== word.id).map((w) => w.translationFr);
  return uniqueSample(pool, n);
}

function distractorLemmas(word: Word, words: Word[], n: number): string[] {
  const pool = words.filter((w) => w.id !== word.id).map((w) => w.lemma);
  return uniqueSample(pool, n);
}

function distractorLemmasForBlank(blank: string, words: Word[], n: number): string[] {
  const pool = words.filter((w) => w.lemma !== blank).map((w) => w.lemma);
  return uniqueSample(pool, n);
}

function uniqueSample<T>(pool: T[], n: number): T[] {
  const out: T[] = [];
  const seen = new Set<T>();
  const copy = [...pool];
  while (out.length < n && copy.length > 0) {
    const i = Math.floor(Math.random() * copy.length);
    const [v] = copy.splice(i, 1);
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return out;
}

function shuffledOptions(correct: string, distractors: string[]): string[] {
  const arr = [correct, ...distractors];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Charge un ReviewState existant ou en crée un vierge. */
export async function loadOrCreateState(
  userId: string,
  itemType: ItemType,
  itemId: string,
  now: Date = new Date(),
): Promise<ReviewState> {
  const id = reviewStateId(userId, itemType, itemId);
  const existing = await db.reviewStates.get(id);
  return existing ?? createReviewState(userId, itemType, itemId, now);
}
