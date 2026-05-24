import { useEffect, useState } from 'react';
import { DEFAULT_USER_ID, db, ensureDefaultUser, seedCorpus } from './db/db';
import { Rating, createReviewState, gradeReview } from './srs/scheduler';
import type { ReviewState, Word } from './types/models';

/**
 * Écran de vérification de la fondation.
 *
 * Ce composant n'est PAS l'application finale : il confirme que la couche
 * données (modèle, Dexie, FSRS, corpus) est bien câblée. L'UI réelle se
 * construit à partir du prototype de design (cf. Prompt-design-prototype.md)
 * et du PRD (Anglais-Pareto_Viabilite-et-PRD.md).
 */

interface Foundation {
  userName: string;
  wordCount: number;
  phraseCount: number;
  preview: Word[];
}

export default function App() {
  const [data, setData] = useState<Foundation | null>(null);
  const [demo, setDemo] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      await seedCorpus();
      const user = await ensureDefaultUser();
      const [wordCount, phraseCount, preview] = await Promise.all([
        db.words.count(),
        db.phrases.count(),
        db.words.orderBy('rank').limit(5).toArray(),
      ]);
      setData({ userName: user.name, wordCount, phraseCount, preview });
    })();
  }, []);

  async function runFsrsDemo() {
    const first = await db.words.orderBy('rank').first();
    if (!first) return;
    let review: ReviewState = createReviewState(DEFAULT_USER_ID, 'word', first.id);
    review = gradeReview(review, Rating.Good);
    const next = review.card.due.toLocaleString('fr-FR');
    setDemo(`Carte « ${first.lemma} » notée « Bien » → prochaine révision le ${next}.`);
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col gap-5 px-5 py-10">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
          Pareto English
        </p>
        <h1 className="mt-1 text-2xl font-bold text-stone-800">Fondation du projet</h1>
        <p className="mt-1 text-sm text-stone-500">
          Apprentissage de l'anglais par la loi de Pareto — PWA.
        </p>
      </header>

      {!data ? (
        <p className="text-sm text-stone-500">Initialisation de la base locale…</p>
      ) : (
        <>
          <section className="rounded-2xl border border-stone-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-stone-700">Briques en place</h2>
            <ul className="mt-3 space-y-1.5 text-sm text-stone-600">
              <li>✓ Modèle de données typé (TypeScript)</li>
              <li>✓ Persistance locale Dexie / IndexedDB</li>
              <li>✓ Moteur de répétition espacée FSRS</li>
              <li>✓ PWA installable (vite-plugin-pwa)</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-stone-700">Corpus chargé</h2>
            <p className="mt-2 text-sm text-stone-600">
              Profil local : <strong>{data.userName}</strong> · {data.wordCount} mots ·{' '}
              {data.phraseCount} expressions.
            </p>
            <ul className="mt-3 space-y-1 text-sm">
              {data.preview.map((w) => (
                <li key={w.id} className="flex justify-between">
                  <span className="font-medium text-stone-800">{w.lemma}</span>
                  <span className="text-stone-500">{w.translationFr}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-stone-700">Test du moteur FSRS</h2>
            <button
              type="button"
              onClick={() => void runFsrsDemo()}
              className="mt-3 rounded-xl bg-amber-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-800"
            >
              Simuler une révision
            </button>
            {demo && <p className="mt-3 text-sm text-stone-600">{demo}</p>}
          </section>

          <p className="text-center text-xs text-stone-400">
            Fondation prête. La suite (UI, sessions, gamification) est décrite dans
            CLAUDE.md et le PRD.
          </p>
        </>
      )}
    </div>
  );
}
