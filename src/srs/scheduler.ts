import { createEmptyCard, fsrs, generatorParameters, State, type Grade } from 'ts-fsrs';
import type { ItemType, ReviewItemState, ReviewState } from '../types/models';

/**
 * Moteur de répétition espacée, basé sur l'algorithme FSRS (cf. PRD §2.5 F2).
 *
 * `ReviewState` encapsule directement la carte FSRS : aucune conversion manuelle,
 * donc robuste aux évolutions internes de la bibliothèque.
 */

const scheduler = fsrs(generatorParameters({ enable_fuzz: true }));

/** Re-export pratique : Rating.Again / Hard / Good / Easy. */
export { Rating } from 'ts-fsrs';

/** Identifiant déterministe d'un état de révision. */
export function reviewStateId(userId: string, itemType: ItemType, itemId: string): string {
  return `${userId}:${itemType}:${itemId}`;
}

/** Crée l'état de révision initial d'un item (carte FSRS vierge). */
export function createReviewState(
  userId: string,
  itemType: ItemType,
  itemId: string,
  now: Date = new Date(),
): ReviewState {
  return {
    id: reviewStateId(userId, itemType, itemId),
    userId,
    itemId,
    itemType,
    card: createEmptyCard(now),
  };
}

/** Applique une note (Again / Hard / Good / Easy) et renvoie l'état mis à jour. */
export function gradeReview(
  state: ReviewState,
  rating: Grade,
  now: Date = new Date(),
): ReviewState {
  const { card } = scheduler.next(state.card, now, rating);
  return { ...state, card };
}

/** Vrai si l'item est dû à la date donnée (par défaut : maintenant). */
export function isDue(state: ReviewState, now: Date = new Date()): boolean {
  return state.card.due.getTime() <= now.getTime();
}

/**
 * Étiquette de maturité pour l'UI (jauge de couverture, statistiques).
 * Les seuils de stabilité sont indicatifs et pourront être ajustés.
 */
export function maturity(state: ReviewState): ReviewItemState {
  const card = state.card;
  if (card.state === State.New) return 'new';
  if (card.state === State.Learning || card.state === State.Relearning) return 'learning';
  if (card.stability >= 100) return 'mastered';
  if (card.stability >= 21) return 'mature';
  return 'young';
}

/**
 * Nombre de paliers franchissables vers la maîtrise — exposé pour les
 * barres segmentées de l'UI (`MaturityBar`). `new` = 0 palier franchi,
 * `mastered` = 4 paliers franchis.
 */
export const MATURITY_STEP_COUNT = 4;

/**
 * Mappe une maturité vers son indice de palier 0–4. Source de vérité unique
 * pour toutes les barres segmentées : ne jamais redériver ailleurs.
 */
export function maturityStepIndex(s: ReviewItemState): number {
  switch (s) {
    case 'new':
      return 0;
    case 'learning':
      return 1;
    case 'young':
      return 2;
    case 'mature':
      return 3;
    case 'mastered':
      return 4;
  }
}
