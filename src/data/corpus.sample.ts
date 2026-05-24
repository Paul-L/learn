import type { Example, Phrase, Word } from '../types/models';

/**
 * Corpus d'EXEMPLE — un petit échantillon pour amorcer le développement.
 *
 * À remplacer par les ~1 000 items réels (cf. PRD §2.4) :
 *  - mots de contenu issus d'une liste de fréquence (NGSL recommandée) ;
 *  - expressions toutes faites couvrant les mots-outils.
 */

export const sampleWords: Word[] = [
  { id: 'w-people', rank: 1, lemma: 'people', pos: 'noun', translationFr: 'les gens', ipa: '/ˈpiːpəl/' },
  { id: 'w-time', rank: 2, lemma: 'time', pos: 'noun', translationFr: 'le temps', ipa: '/taɪm/' },
  { id: 'w-year', rank: 3, lemma: 'year', pos: 'noun', translationFr: "l'année", ipa: '/jɪər/' },
  { id: 'w-day', rank: 4, lemma: 'day', pos: 'noun', translationFr: 'le jour', ipa: '/deɪ/' },
  { id: 'w-good', rank: 5, lemma: 'good', pos: 'adjective', translationFr: 'bon / bien', ipa: '/ɡʊd/' },
  { id: 'w-know', rank: 6, lemma: 'know', pos: 'verb', translationFr: 'savoir / connaître', ipa: '/noʊ/' },
  { id: 'w-think', rank: 7, lemma: 'think', pos: 'verb', translationFr: 'penser', ipa: '/θɪŋk/' },
  { id: 'w-want', rank: 8, lemma: 'want', pos: 'verb', translationFr: 'vouloir', ipa: '/wɒnt/' },
  { id: 'w-use', rank: 9, lemma: 'use', pos: 'verb', translationFr: 'utiliser', ipa: '/juːz/' },
  { id: 'w-work', rank: 10, lemma: 'work', pos: 'verb', translationFr: 'travailler', ipa: '/wɜːrk/' },
  { id: 'w-need', rank: 11, lemma: 'need', pos: 'verb', translationFr: 'avoir besoin de', ipa: '/niːd/' },
  { id: 'w-important', rank: 12, lemma: 'important', pos: 'adjective', translationFr: 'important', ipa: '/ɪmˈpɔːrtənt/' },
];

export const samplePhrases: Phrase[] = [
  { id: 'p-id-like', rank: 1, textEn: "I'd like to…", translationFr: 'je voudrais…', category: 'request' },
  { id: 'p-can-i-have', rank: 2, textEn: 'Can I have…?', translationFr: 'puis-je avoir… ?', category: 'request' },
  { id: 'p-how-much', rank: 3, textEn: 'How much is it?', translationFr: 'combien ça coûte ?', category: 'question' },
  { id: 'p-dont-understand', rank: 4, textEn: "I don't understand.", translationFr: 'je ne comprends pas.', category: 'social' },
  { id: 'p-there-is', rank: 5, textEn: 'There is / There are…', translationFr: 'il y a…', category: 'structure' },
];

export const sampleExamples: Example[] = [
  { id: 'e-people', itemId: 'w-people', itemType: 'word', sentenceEn: 'A lot of people speak English.', translationFr: 'Beaucoup de gens parlent anglais.' },
  { id: 'e-time', itemId: 'w-time', itemType: 'word', sentenceEn: "I don't have much time today.", translationFr: "Je n'ai pas beaucoup de temps aujourd'hui." },
  { id: 'e-good', itemId: 'w-good', itemType: 'word', sentenceEn: 'This is a good idea.', translationFr: "C'est une bonne idée." },
  { id: 'e-know', itemId: 'w-know', itemType: 'word', sentenceEn: 'I know the answer.', translationFr: 'Je connais la réponse.' },
  { id: 'e-want', itemId: 'w-want', itemType: 'word', sentenceEn: 'I want to learn English.', translationFr: "Je veux apprendre l'anglais." },
  { id: 'e-need', itemId: 'w-need', itemType: 'word', sentenceEn: 'I need some help.', translationFr: "J'ai besoin d'aide." },
  { id: 'e-id-like', itemId: 'p-id-like', itemType: 'phrase', sentenceEn: "I'd like to book a table.", translationFr: 'Je voudrais réserver une table.' },
  { id: 'e-can-i-have', itemId: 'p-can-i-have', itemType: 'phrase', sentenceEn: 'Can I have a coffee, please?', translationFr: "Puis-je avoir un café, s'il vous plaît ?" },
  { id: 'e-how-much', itemId: 'p-how-much', itemType: 'phrase', sentenceEn: 'How much is it for two nights?', translationFr: 'Combien ça coûte pour deux nuits ?' },
];
