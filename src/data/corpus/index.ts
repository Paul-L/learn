import type { Example, ItemType, PartOfSpeech, Phrase, Word } from '../../types/models';
import wordsTsv from './words.tsv?raw';
import phrasesTsv from './phrases.tsv?raw';
import examplesTsv from './examples.tsv?raw';

/**
 * Corpus Pareto English — chargé à partir de fichiers TSV éditables à la main.
 *
 *  - `words.tsv` : un mot de contenu par ligne (rang, lemme, PoS, FR, IPA).
 *  - `phrases.tsv` : une expression toute faite par ligne, avec cloze.
 *  - `examples.tsv` : phrases d'exemple liées par référence (lemme ou textEn).
 *
 * Les IDs sont dérivés de manière déterministe : `w-<slug>` pour les mots,
 * `p-<slug>` pour les phrases. Renommer un lemme ou un textEn change l'ID
 * et perd l'historique FSRS associé — c'est délibéré (item différent).
 *
 * Toute incohérence (ID dupliqué, exemple orphelin, cloze.blank absent du
 * textEn) lève à l'import, pour échouer tôt et non en pleine session.
 */

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseTsv(raw: string): string[][] {
  return raw
    .split('\n')
    .map((l) => l.replace(/\r$/, ''))
    .filter((l) => l.length > 0 && !l.startsWith('#'))
    .map((l) => l.split('\t'));
}

function loadWords(raw: string): Word[] {
  const [, ...rows] = parseTsv(raw);
  return rows.map((row, i) => {
    const [rank, lemma, pos, translationFr, ipa] = row;
    if (!lemma || !pos || !translationFr) {
      throw new Error(`words.tsv ligne ${i + 2} : champs requis manquants`);
    }
    return {
      id: `w-${slugify(lemma)}`,
      rank: Number.parseInt(rank, 10),
      lemma: lemma.trim(),
      pos: pos.trim() as PartOfSpeech,
      translationFr: translationFr.trim(),
      ipa: ipa?.trim() || undefined,
    };
  });
}

function loadPhrases(raw: string): Phrase[] {
  const [, ...rows] = parseTsv(raw);
  return rows.map((row, i) => {
    const [rank, textEn, translationFr, category, blank, distractors] = row;
    if (!textEn || !translationFr) {
      throw new Error(`phrases.tsv ligne ${i + 2} : champs requis manquants`);
    }
    return {
      id: `p-${slugify(textEn)}`,
      rank: Number.parseInt(rank, 10),
      textEn: textEn.trim(),
      translationFr: translationFr.trim(),
      category: category?.trim() || undefined,
      blank: blank?.trim() || undefined,
      distractors: distractors?.trim()
        ? distractors.split('|').map((d) => d.trim())
        : undefined,
    };
  });
}

function loadExamples(raw: string, words: Word[], phrases: Phrase[]): Example[] {
  const wordByLemma = new Map(words.map((w) => [w.lemma, w]));
  const phraseByText = new Map(phrases.map((p) => [p.textEn, p]));
  const [, ...rows] = parseTsv(raw);
  return rows.map((row, i) => {
    const [itemType, itemRef, sentenceEn, translationFr] = row;
    if (!itemType || !itemRef || !sentenceEn || !translationFr) {
      throw new Error(`examples.tsv ligne ${i + 2} : champs requis manquants`);
    }
    const type = itemType.trim() as ItemType;
    let itemId: string;
    if (type === 'word') {
      const w = wordByLemma.get(itemRef.trim());
      if (!w) throw new Error(`examples.tsv ligne ${i + 2} : mot inconnu "${itemRef}"`);
      itemId = w.id;
    } else if (type === 'phrase') {
      const p = phraseByText.get(itemRef.trim());
      if (!p) throw new Error(`examples.tsv ligne ${i + 2} : expression inconnue "${itemRef}"`);
      itemId = p.id;
    } else {
      throw new Error(`examples.tsv ligne ${i + 2} : itemType invalide "${itemType}"`);
    }
    return {
      id: `e-${itemId}-${i}`,
      itemId,
      itemType: type,
      sentenceEn: sentenceEn.trim(),
      translationFr: translationFr.trim(),
    };
  });
}

function validateCorpus(words: Word[], phrases: Phrase[]): void {
  const wordIds = new Set<string>();
  for (const w of words) {
    if (wordIds.has(w.id)) throw new Error(`Mot dupliqué : ${w.id}`);
    wordIds.add(w.id);
  }
  const phraseIds = new Set<string>();
  for (const p of phrases) {
    if (phraseIds.has(p.id)) throw new Error(`Expression dupliquée : ${p.id}`);
    phraseIds.add(p.id);
    if (p.blank && !p.textEn.includes(p.blank)) {
      throw new Error(`Expression "${p.textEn}" : cloze.blank "${p.blank}" absent du textEn`);
    }
    if (p.distractors && p.distractors.length !== 3) {
      throw new Error(`Expression "${p.textEn}" : il faut exactement 3 distracteurs`);
    }
  }
}

export const corpusWords: Word[] = loadWords(wordsTsv);
export const corpusPhrases: Phrase[] = loadPhrases(phrasesTsv);
validateCorpus(corpusWords, corpusPhrases);
export const corpusExamples: Example[] = loadExamples(examplesTsv, corpusWords, corpusPhrases);
