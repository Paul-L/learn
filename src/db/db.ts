import Dexie, { type Table } from 'dexie';
import type { Example, Phrase, ReviewState, Session, User, Word } from '../types/models';
import { sampleExamples, samplePhrases, sampleWords } from '../data/corpus.sample';

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

/** Charge le corpus d'exemple en base au tout premier lancement. */
export async function seedCorpus(): Promise<void> {
  const count = await db.words.count();
  if (count > 0) return;
  await db.transaction('rw', db.words, db.phrases, db.examples, async () => {
    await db.words.bulkPut(sampleWords);
    await db.phrases.bulkPut(samplePhrases);
    await db.examples.bulkPut(sampleExamples);
  });
}

/** Garantit l'existence du profil local et le renvoie. */
export async function ensureDefaultUser(name = 'Moi'): Promise<User> {
  const existing = await db.users.get(DEFAULT_USER_ID);
  if (existing) return existing;
  const user: User = {
    id: DEFAULT_USER_ID,
    name,
    dailyGoal: 20,
    createdAt: Date.now(),
  };
  await db.users.put(user);
  return user;
}
