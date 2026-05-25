# Feuille de route — Pareto English

Du scaffold initial jusqu'au MVP. Cocher les cases au fur et à mesure.
Voir `CLAUDE.md` pour le contexte technique et `Anglais-Pareto_Viabilite-et-PRD.md`
pour le détail fonctionnel.

## Déjà fait — fondation

- [x] Configuration : Vite + React + TypeScript + Tailwind + vite-plugin-pwa
- [x] Modèle de données typé (`src/types/models.ts`)
- [x] Base Dexie / IndexedDB + amorçage (`src/db/db.ts`)
- [x] Moteur de répétition espacée FSRS (`src/srs/scheduler.ts`)
- [x] Corpus d'exemple + écran de vérification de la fondation

> La couche données est terminée. Les phases ci-dessous la *consomment* :
> ne pas reconstruire le modèle, Dexie ou le scheduler.

## Phase 1 — Intégrer le design

- [x] **Découper le prototype** — écrans dans `src/screens/`, composants dans
  `src/ui/`, helpers dans `src/lib/`.
- [x] **Centraliser les tokens visuels** — palette / typo / arrondis dans
  `tailwind.config.js` et `src/index.css`.
- [x] **Mettre en place la navigation** — routeur par état dans `App.tsx`
  (5 écrans + flux de session).
- [x] **Dé-câbler les données fictives** — les composants reçoivent leurs
  données par props ; `mock.ts` isolé.
- [x] **Réaligner les données factices sur les vrais types** — `mock.ts` produit
  des `Word` / `Phrase` / `Example`, les cartes de session sont typées sur le
  modèle définitif. La phase 2 devient un simple échange de source de données.

## Phase 2 — Brancher la couche données

- [x] **Ajouter `dexie-react-hooks`** — hooks réactifs via `useLiveQuery`
  (`useCurrentUser`, `useHomeStats`, `useSessionPreview`, `useVocabBreakdown`,
  `useWeeklyActivity`, `useCoverage` dans `src/db/hooks.ts`) : l'UI se
  rafraîchit quand IndexedDB change, le `statsKey` d'invalidation manuelle a
  été retiré.
- [x] **Onboarding fonctionnel** — `completeOnboarding(name, pace)` dans
  `src/db/db.ts` ; le choix de rythme alimente `dailyGoal` via `PACE_TO_GOAL`
  (easy → 6, std → 10, intense → 18).
- [x] **Tableau de bord réel** — couverture, série, révisions dues et
  programme calculés depuis la base par `loadHomeStats()` + `loadSession()`,
  consommés via `useHomeStats` / `useSessionPreview`.
- [x] **`buildSession()` depuis Dexie** — `loadSession()` lit `words`,
  `phrases`, `examples` et `reviewStates` de Dexie ; aucun `mock.ts` résiduel.

## Phase 3 — La boucle de session (cœur de l'app)

- [x] **File de session** — `loadSession()` (`src/srs/session.ts`) : dues triés
  par `card.due` + jusqu'à `MAX_NEW_PER_SESSION` nouveaux par rang croissant,
  total plafonné par `dailyGoal`. Si aucun nouveau dispo, tout le budget va
  aux révisions.
- [x] **Câbler les exercices** — `useAnswer` mesure le temps de réponse,
  `rateAnswer(wasCorrect, elapsedMs)` mappe vers `Rating` (Again / Good / Easy
  pour les réponses très rapides), `persistGrade()` sauvegarde via
  `gradeReview()` (`src/screens/Session.tsx`).
- [x] **Générer les QCM** — `distractorTranslations` / `distractorLemmas`
  tirent dans le reste du corpus (`src/srs/session.ts`).
- [x] **Support du cloze dans le modèle** — `Phrase.blank` + `Phrase.distractors`
  optionnels ; `makeClozeStep()` génère les distracteurs depuis le corpus si
  l'éditeur n'en fournit pas (`src/types/models.ts`, `src/srs/session.ts`).
- [ ] **Voix** — `speak()` est en place (`src/lib/speech.ts`) ; reste à
  vérifier sur iOS / desktop avec `pnpm run preview`.
- [x] **Bilan de session** — `db.sessions.add()` enregistre la session ;
  `Recap` reçoit items vus / réussite / streak / `CoverageGauge` animée
  avant→après (`src/screens/Session.tsx`, `src/screens/Recap.tsx`).

## Phase 4 — Gamification & progression

- [x] **Série / streak** — `computeStreak()` exige l'objectif quotidien atteint
  (somme `itemsSeen` du jour ≥ `dailyGoal`), pas une simple ouverture de l'app ;
  tolérance d'un jour de grâce conservée. Indicateur « Objectif du jour X/Y »
  sur Home avec passage en sage à l'atteinte (`src/screens/Home.tsx`
  `DailyGoal`). Jalons en mots maîtrisés (250 / 500 / 750 / 1000) alignés sur
  PRD §2.5 F5 (`src/screens/Progress.tsx`). XP : volontairement éphémère dans
  `Recap` — la progression durable passe par la couverture et les jalons,
  pas par un compteur cumulé.
- [x] **Jauge de couverture** — `CoverageGauge` + `computeCoverage()` sur
  `mature` + `mastered`, affichée sur Home et animée dans `Recap`.
- [x] **Écran Progression** — `vocabBreakdown()` projette les 5 niveaux de
  `maturity()` sur 3 buckets (maîtrisés = mature + mastered, en cours = new +
  learning + young déjà introduits, restants = jamais vus). `loadWeeklyActivity()`
  agrège la table `sessions` sur la semaine glissante.

## Phase 5 — Contenu, PWA, mise en ligne

- [x] **Corpus réel** — pipeline TSV + loader/validateur en place
  (`src/data/corpus/{words,phrases,examples}.tsv`, `src/data/corpus/index.ts`).
  Corpus à deux paliers : **2000 mots de contenu** (NGSL filtré, rangs 1-2000,
  mots-outils exclus) + **151 expressions toutes faites** + **2010 phrases
  d'exemple**, soit **2151 items**. Palier 1 (rangs 1-906) = aisance de base
  (~85 % de couverture orale) ; palier 2 (rangs 907-2000) = aisance
  conversationnelle (~95 %). `corpus.sample.ts` supprimé. IPA générée puis
  normalisée (eng-to-ipa, style maison). Chaque mot a une phrase d'exemple.
- [ ] **Recalibrer la jauge de couverture** — `computeCoverage()` divise par le
  total du corpus ; avec 2000 mots le dénominateur a doublé. Pondérer par rang
  (ou plafonner sur le palier 1) pour que la jauge reflète la couverture
  conversationnelle réelle, non linéaire en nombre de mots.
- [ ] **Vérifier l'install PWA et le hors-ligne** — instructions dans
  `README.md` (section « Tester la PWA en local »). À faire toi-même :
  `pnpm run build && pnpm run preview`, installer, Network → Offline, recharger.
- [ ] **Déployer** — config Cloudflare Pages prête (`public/_redirects` SPA
  fallback, `public/_headers` cache court sw / immutable assets). À lancer :
  `pnpm dlx wrangler pages deploy dist --project-name=pareto-english`.

## Itérations post-MVP — ergonomie

Petites améliorations issues du test réel de l'app.

- [x] **Écran Réglages** — `src/screens/Settings.tsx` (3e onglet) permet de
  changer le prénom et le rythme quotidien à tout moment. `updateProfile()`
  dans `src/db/db.ts` ; persistance live via `useCurrentUser`, l'objectif du
  jour sur Home se met à jour sans rechargement. Le lien « ajuste ton rythme
  dans tes réglages » de l'écran de session vide ouvre l'onglet directement.
- [x] **Bouton « Continuer la révision » sur Recap** — relance immédiatement
  une nouvelle session depuis le bilan, sans repasser par Home. Masqué quand
  `useSessionPreview` n'a plus rien à proposer.

---

**Conseils**

- Commit à la fin de chaque phase (étapes courtes, faciles à revoir).
- Garder le parti pris : vocabulaire uniquement, aucune grammaire enseignée.
- Tout reste offline-first : aucune dépendance réseau au runtime pour le MVP.
