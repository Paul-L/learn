import Dexie, { type Table } from 'dexie';
import type { Example, Phrase, ReviewState, Session, User, Word } from '../types/models';
import { corpusExamples, corpusPhrases, corpusWords } from '../data/corpus';
import { PACE_TO_GOAL, type PaceKey } from '../srs/stats';

/** MVP : un seul profil local, sans système de comptes. */
export const DEFAULT_USER_ID = 'local-user';

/**
 * Base IndexedDB (via Dexie) — toute l'application fonctionne hors-ligne.
 * La synchronisation multi-appareils est prévue en v1 (cf. PRD §2.5 F7).
 */
export const db = new Dexie('pareto-english') as Dexie & {
  words: Table<Word, string>;
  phrases: Table<Phrase, string>;
  examples: Table<Example, string>;
  reviewStates: Table<ReviewState, string>;
  users: Table<User, string>;
  sessions: Table<Session, string>;
};

db.version(1).stores({
  words: 'id, rank, lemma',
  phrases: 'id, rank',
  examples: 'id, itemId, [itemType+itemId]',
  // `card.due` indexé : permet de récupérer la file de révision du jour.
  reviewStates: 'id, userId, card.due, card.state, [userId+itemType]',
  users: 'id',
  sessions: 'id, userId, startedAt',
});

/**
 * Charge le corpus en base au tout premier lancement (et le re-synchronise
 * si le nombre d'items en base ne correspond plus au corpus de référence —
 * cas d'une mise à jour de l'app qui apporte de nouveaux mots).
 */
export async function seedCorpus(): Promise<void> {
  const [wordsInDb, phrasesInDb] = await Promise.all([
    db.words.count(),
    db.phrases.count(),
  ]);
  if (wordsInDb === corpusWords.length && phrasesInDb === corpusPhrases.length) return;

  await db.transaction('rw', db.words, db.phrases, db.examples, async () => {
    await db.words.bulkPut(corpusWords);
    await db.phrases.bulkPut(corpusPhrases);
    await db.examples.bulkPut(corpusExamples);
  });
}

/** Garantit l'existence du profil local et le renvoie. */
export async function ensureDefaultUser(name = ''): Promise<User> {
  const existing = await db.users.get(DEFAULT_USER_ID);
  if (existing) return existing;
  const user: User = {
    id: DEFAULT_USER_ID,
    name,
    dailyGoal: PACE_TO_GOAL.std,
    createdAt: Date.now(),
  };
  await db.users.put(user);
  return user;
}

/**
 * Finalise l'onboarding : enregistre le prénom, l'objectif quotidien dérivé
 * du rythme choisi, et marque l'utilisateur comme onboardé.
 */
export async function completeOnboarding(name: string, pace: PaceKey): Promise<User> {
  const trimmed = name.trim() || 'Moi';
  const dailyGoal = PACE_TO_GOAL[pace];
  await db.users.update(DEFAULT_USER_ID, {
    name: trimmed,
    dailyGoal,
    onboardedAt: Date.now(),
  });
  const updated = await db.users.get(DEFAULT_USER_ID);
  if (!updated) throw new Error('User disparu après update');
  return updated;
}
