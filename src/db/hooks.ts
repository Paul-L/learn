import { useLiveQuery } from 'dexie-react-hooks';
import { DEFAULT_USER_ID, db } from './db';
import {
  computeCoverage,
  loadHomeStats,
  loadWeeklyActivity,
  vocabBreakdown,
  type HomeStats,
  type VocabBreakdown,
  type WeeklyDay,
} from '../srs/stats';
import { loadSession, type SessionStep } from '../srs/session';
import type { User } from '../types/models';

/**
 * Hooks réactifs Dexie. Chaque hook re-tire la requête automatiquement quand
 * une table touchée par la lecture change — l'UI se rafraîchit sans clé
 * d'invalidation manuelle (cf. README Dexie « liveQuery »).
 *
 * Valeur `undefined` = première lecture en cours. Les écrans doivent prévoir
 * un état de chargement.
 */

export function useCurrentUser(): User | undefined {
  return useLiveQuery(() => db.users.get(DEFAULT_USER_ID), []);
}

export function useHomeStats(userId: string | undefined): HomeStats | undefined {
  return useLiveQuery(() => (userId ? loadHomeStats(userId) : undefined), [userId]);
}

export function useSessionPreview(
  userId: string | undefined,
  dailyGoal: number,
): SessionStep[] | undefined {
  return useLiveQuery(
    () => (userId ? loadSession(userId, dailyGoal) : undefined),
    [userId, dailyGoal],
  );
}

export function useVocabBreakdown(userId: string | undefined): VocabBreakdown | undefined {
  return useLiveQuery(() => (userId ? vocabBreakdown(userId) : undefined), [userId]);
}

export function useWeeklyActivity(userId: string | undefined): WeeklyDay[] | undefined {
  return useLiveQuery(() => (userId ? loadWeeklyActivity(userId) : undefined), [userId]);
}

export function useCoverage(userId: string | undefined): number | undefined {
  return useLiveQuery(() => (userId ? computeCoverage(userId) : undefined), [userId]);
}
