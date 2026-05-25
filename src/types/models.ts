import type { Card } from 'ts-fsrs';

/**
 * Modèle de données de Pareto English.
 *
 * Deux familles de données :
 *  - le CONTENU (Word, Phrase, Example) — partagé, en lecture seule côté client ;
 *  - la PROGRESSION (ReviewState, Session) — propre à chaque utilisateur.
 */

/** Nature grammaticale — simple étiquette d'affichage, pas une leçon de grammaire. */
export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'other';

/** Un item d'apprentissage est soit un mot, soit une expression toute faite. */
export type ItemType = 'word' | 'phrase';

/** Étiquette de maturité d'un item, dérivée de l'état FSRS (pour l'UI / la jauge). */
export type ReviewItemState = 'new' | 'learning' | 'young' | 'mature' | 'mastered';

/** Mot de contenu (nom, verbe, adjectif…). */
export interface Word {
  id: string;
  /** Rang de fréquence (1 = le plus fréquent). */
  rank: number;
  /** Forme de base en anglais. */
  lemma: string;
  pos: PartOfSpeech;
  translationFr: string;
  /** Transcription phonétique (API). */
  ipa?: string;
  /** Référence audio optionnelle ; sinon synthèse vocale à la volée. */
  audioRef?: string;
}

/**
 * Expression toute faite — apprise et mémorisée EN BLOC, jamais décortiquée.
 * C'est le mécanisme par lequel les mots-outils entrent dans le corpus
 * sans qu'aucune règle de grammaire ne soit enseignée.
 */
export interface Phrase {
  id: string;
  rank: number;
  textEn: string;
  translationFr: string;
  /** Regroupement thématique (request, question, social…). */
  category?: string;
  audioRef?: string;
  /**
   * Mot caché pour l'exercice "cloze" (à trous).
   * Doit apparaître tel quel dans `textEn`. Si absent, l'item n'est pas
   * éligible au cloze (l'expression sert alors uniquement à mémoriser le bloc).
   */
  blank?: string;
  /**
   * Distracteurs éditoriaux pour le cloze (3 alternatives plausibles).
   * Si absent, ils seront générés à la volée depuis le corpus.
   */
  distractors?: string[];
}

/** Phrase d'exemple rattachée à un mot ou à une expression. */
export interface Example {
  id: string;
  itemId: string;
  itemType: ItemType;
  sentenceEn: string;
  translationFr: string;
}

/**
 * État de révision d'un item pour un utilisateur donné.
 * `card` porte l'intégralité de l'état FSRS (échéance, stabilité, difficulté…).
 */
export interface ReviewState {
  /** Identifiant déterministe : `${userId}:${itemType}:${itemId}`. */
  id: string;
  userId: string;
  itemId: string;
  itemType: ItemType;
  card: Card;
}

/** Profil utilisateur. MVP : un seul profil local, sans compte. */
export interface User {
  id: string;
  name: string;
  /** Objectif quotidien, en nombre d'items. */
  dailyGoal: number;
  /** Date de création (epoch ms). */
  createdAt: number;
  /**
   * Date de fin d'onboarding (epoch ms). Si absente, l'utilisateur n'a pas
   * encore terminé l'onboarding — on lui redemande à chaque lancement.
   */
  onboardedAt?: number;
}

/** Trace d'une session d'apprentissage (pour les statistiques et la série). */
export interface Session {
  id: string;
  userId: string;
  startedAt: number;
  itemsSeen: number;
  itemsCorrect: number;
  durationSec: number;
}
