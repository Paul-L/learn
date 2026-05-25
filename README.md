# Pareto English

Application **PWA** d'apprentissage de l'anglais fondée sur la **loi de Pareto** :
les ~1 000 mots et expressions les plus fréquents, qui couvrent ~85 % d'une
conversation courante.

> Apprentissage **par le vocabulaire uniquement** — pas de leçons de grammaire.
> Voir `Anglais-Pareto_Viabilite-et-PRD.md` pour l'étude de viabilité et le PRD,
> et `CLAUDE.md` pour le contexte de développement.

## Prérequis

- Node.js 18 ou plus récent

## Démarrage

```bash
npm install
npm run dev
```

L'application est disponible sur l'adresse indiquée par Vite (par défaut
`http://localhost:5173`).

## Scripts

| Commande          | Rôle                                              |
| ----------------- | ------------------------------------------------- |
| `npm run dev`     | Serveur de développement                          |
| `npm run build`   | Vérification de types + build de production        |
| `npm run preview` | Prévisualisation du build (teste le service worker) |
| `npm run lint`    | Vérification de types (`tsc --noEmit`)            |

## Stack

React 18 · TypeScript · Vite · vite-plugin-pwa · Dexie (IndexedDB) · ts-fsrs · Tailwind CSS

## Corpus

Trois fichiers TSV éditables à la main dans `src/data/corpus/` :

- `words.tsv` — mots de contenu (rang, lemme, PoS, traduction FR, IPA).
- `phrases.tsv` — expressions toutes faites avec champ `blank` pour le cloze.
- `examples.tsv` — phrases d'exemple liées par référence textuelle (lemme du
  mot, ou `textEn` exact de l'expression).

Le loader (`src/data/corpus/index.ts`) parse les TSV à l'import, dérive des IDs
stables (`w-<slug>`, `p-<slug>`) et valide la cohérence (doublons, exemples
orphelins, cloze.blank absent du textEn). Une incohérence lève une erreur dès
le chargement de l'app — fail fast.

> Pour ajouter du contenu : éditer les TSV, relancer `pnpm run dev`. Le
> `seedCorpus()` re-synchronise IndexedDB quand le nombre d'items change.

## Tester la PWA en local

```bash
pnpm run build
pnpm run preview
```

Puis dans Chrome / Safari :

1. Ouvrir l'URL servie par `preview`, vérifier que l'app installable apparaît
   dans la barre d'adresse (icône « Installer »).
2. Bascule **DevTools → Network → Offline**, recharger : l'app doit tourner
   hors-ligne, les sessions persister, la synthèse vocale fonctionner (sur
   iOS, vérifier en sortant Safari du Wi-Fi).
3. Sur iPhone : *Partager → Sur l'écran d'accueil* pour tester l'installation
   plein écran.

## Déploiement (Cloudflare Workers — Static Assets)

`wrangler.jsonc` à la racine configure un déploiement Workers Static Assets :
`./dist` est uploadé tel quel, `not_found_handling: "single-page-application"`
sert `index.html` sur toute route inconnue (fallback SPA natif).

> Le `name` du `wrangler.jsonc` doit correspondre au Worker existant sur le
> dashboard Cloudflare (Settings → General → Worker name). Renommer ici sans
> renommer côté dashboard crée un nouveau Worker.

```bash
pnpm run build
npx wrangler deploy
```

Pour un déploiement automatique sur push : connecter le repo depuis le
dashboard Cloudflare (Workers & Pages → Create → Import a repository) avec
build command `pnpm run build`. La détection du framework Vite est
**volontairement contournée** par `wrangler.jsonc` (sinon Cloudflare exigerait
Vite ≥ 6 via son plugin Workers/Vite).

## État

MVP fonctionnel : onboarding, file de session, FSRS, jauge de couverture,
streak strict, jalons en mots maîtrisés, PWA installable. Corpus initial de
~130 mots et 30 expressions à étendre éditorialement.
