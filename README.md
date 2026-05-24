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

## État

Fondation du projet : modèle de données, persistance hors-ligne et moteur de
répétition espacée sont en place. L'interface reste à construire — voir la section
« Prochaines étapes » de `CLAUDE.md`.
