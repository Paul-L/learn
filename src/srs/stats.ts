import { db } from '../db/db';
import { isDue, maturity } from './scheduler';
import type { ReviewItemState } from '../types/models';

/** Catégories du pavé statut Progression. */
export interface VocabBreakdown {
  mastered: number; // mature + mastered
  learning: number; // new + learning + young (a déjà été vu)
  remaining: number; // jamais introduit
  total: number;
}

export interface HomeStats {
  /** Couverture conversationnelle (0..100) — mature + mastered / total. */
  coverage: number;
  /** Items dus à réviser maintenant. */
  dueCount: number;
  /** Items jamais introduits. */
  newCount: number;
  /**
   * Jours consécutifs où l'objectif quotidien a été atteint, jusqu'à
   * aujourd'hui (tolérance d'un jour de grâce). Une session "tiède" qui
   * n'atteint pas `dailyGoal` n'incrémente PAS la série — c'est l'engagement
   * sur la durée qui compte, pas la simple ouverture de l'app.
   */
  streak: number;
  /** Items vus aujourd'hui (toutes sessions confondues), pour le suivi de l'objectif. */
  todayItemsSeen: number;
}

export interface WeeklyDay {
  d: string;
  v: number;
  today?: boolean;
}

export const PACE_TO_GOAL = { easy: 6, std: 10, intense: 18 } as const;
export type PaceKey = keyof typeof PACE_TO_GOAL;

/** Compte par catégorie de maturité pour un utilisateur. */
export async function vocabBreakdown(userId: string): Promise<VocabBreakdown> {
  const [states, totalWords] = await Promise.all([
    db.reviewStates.where('userId').equals(userId).toArray(),
    db.words.count(),
  ]);

  const counts: Record<ReviewItemState, number> = {
    new: 0,
    learning: 0,
    young: 0,
    mature: 0,
    mastered: 0,
  };
  for (const s of states) {
    if (s.itemType !== 'word') continue;
    counts[maturity(s)]++;
  }

  const masteredCount = counts.mature + counts.mastered;
  const introducedWords = states.filter((s) => s.itemType === 'word').length;

  return {
    mastered: masteredCount,
    learning: introducedWords - masteredCount,
    remaining: Math.max(0, totalWords - introducedWords),
    total: totalWords,
  };
}

/** Couverture conversationnelle en pourcentage (0..100). */
export async function computeCoverage(userId: string): Promise<number> {
  const b = await vocabBreakdown(userId);
  if (b.total === 0) return 0;
  return (b.mastered / b.total) * 100;
}

/** Stats agrégées de l'écran d'accueil. */
export async function loadHomeStats(userId: string, now: Date = new Date()): Promise<HomeStats> {
  const [user, states, breakdown, sessions] = await Promise.all([
    db.users.get(userId),
    db.reviewStates.where('userId').equals(userId).toArray(),
    vocabBreakdown(userId),
    db.sessions.where('userId').equals(userId).toArray(),
  ]);

  const dailyGoal = user?.dailyGoal ?? PACE_TO_GOAL.std;
  const dueCount = states.filter((s) => isDue(s, now)).length;
  const coverage = breakdown.total === 0 ? 0 : (breakdown.mastered / breakdown.total) * 100;
  const todayStart = startOfDay(now).getTime();
  const todayItemsSeen = sessions
    .filter((s) => s.startedAt >= todayStart)
    .reduce((acc, s) => acc + s.itemsSeen, 0);

  return {
    coverage,
    dueCount,
    newCount: breakdown.remaining,
    streak: computeStreak(sessions, dailyGoal, now),
    todayItemsSeen,
  };
}

/** Activité hebdomadaire (lundi → dimanche, dernière semaine glissante). */
export async function loadWeeklyActivity(
  userId: string,
  now: Date = new Date(),
): Promise<WeeklyDay[]> {
  const sessions = await db.sessions.where('userId').equals(userId).toArray();
  const days: WeeklyDay[] = [];
  // Aligner sur lundi (notre semaine commence à L = lundi).
  const today = startOfDay(now);
  const dow = (today.getDay() + 6) % 7; // 0 = lundi, 6 = dimanche
  const monday = addDays(today, -dow);
  const labels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  for (let i = 0; i < 7; i++) {
    const day = addDays(monday, i);
    const next = addDays(day, 1);
    const v = sessions
      .filter((s) => s.startedAt >= day.getTime() && s.startedAt < next.getTime())
      .reduce((acc, s) => acc + s.itemsSeen, 0);
    days.push({
      d: labels[i],
      v,
      today: day.getTime() === today.getTime() ? true : undefined,
    });
  }
  return days;
}

/** Combien d'items réussis cette semaine, pour le sous-titre du graphique. */
export async function loadWeeklyTotal(userId: string, now: Date = new Date()): Promise<number> {
  const days = await loadWeeklyActivity(userId, now);
  return days.reduce((acc, d) => acc + d.v, 0);
}

/**
 * Une journée incrémente la série uniquement si l'objectif quotidien
 * (`dailyGoal` items vus, toutes sessions du jour cumulées) a été atteint.
 * Tolérance d'un « jour de grâce » : si aujourd'hui n'est pas validé mais
 * qu'hier l'était, la série tient encore — on ne pénalise pas le jour en
 * cours s'il n'est pas commencé.
 */
function computeStreak(
  sessions: { startedAt: number; itemsSeen: number }[],
  dailyGoal: number,
  now: Date,
): number {
  if (sessions.length === 0 || dailyGoal <= 0) return 0;

  const itemsByDay = new Map<number, number>();
  for (const s of sessions) {
    const day = startOfDay(new Date(s.startedAt)).getTime();
    itemsByDay.set(day, (itemsByDay.get(day) ?? 0) + s.itemsSeen);
  }
  const isGoalMet = (day: number) => (itemsByDay.get(day) ?? 0) >= dailyGoal;

  const today = startOfDay(now).getTime();
  let cursor = today;
  if (!isGoalMet(cursor)) cursor -= 86_400_000;
  if (!isGoalMet(cursor)) return 0;

  let streak = 0;
  while (isGoalMet(cursor)) {
    streak++;
    cursor -= 86_400_000;
  }
  return streak;
}

function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}
