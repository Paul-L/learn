# Pareto English — Contexte projet

Application **PWA** d'apprentissage de l'anglais pour francophones, fondée sur la
**loi de Pareto** : apprendre les ~1 000 mots et expressions les plus fréquents,
qui couvrent ~85 % d'une conversation courante. Usage personnel + quelques proches.

## Parti pris fondateur — à ne jamais transgresser

- **Vocabulaire uniquement.** Aucune leçon de grammaire, aucune conjugaison, aucun
  drill de règles. Ce n'est PAS un clone de Duolingo / Babbel.
- Les mots-outils (the, to, can…) sont appris via des **expressions toutes faites**
  mémorisées en bloc (« I'd like to… »), jamais décortiquées.
- **Interface en français** ; seuls les mots/expressions cibles sont en anglais.
- **Offline-first** : tout passe par IndexedDB, aucune dépendance réseau au runtime
  pour le MVP.
- Gamification motivante mais **sans dark patterns**.

## Documents de référence (à la racine)

- `Anglais-Pareto_Viabilite-et-PRD.md` — étude de viabilité + PRD complet. **À lire
  en premier.** Contient le périmètre MVP, les fonctionnalités, la roadmap.
- `Prompt-design-prototype.md` — prompt de design du prototype UI (sobre + chaleureux).

## Stack technique

- **React 18 + TypeScript + Vite**
- **PWA** : `vite-plugin-pwa` (Workbox) — manifest + service worker
- **Persistance** : `dexie` (IndexedDB), offline-first
- **Répétition espacée** : `ts-fsrs` (algorithme FSRS)
- **Styles** : Tailwind CSS

## Commandes

```bash
npm install      # installer les dépendances (à faire en premier)
npm run dev      # serveur de développement
npm run build    # vérification de types + build de production
npm run preview  # prévisualiser le build (teste la PWA / le service worker)
npm run lint     # vérification de types seule (tsc --noEmit)
```

## Structure

```
src/
├── types/models.ts        Modèle de données (Word, Phrase, Example, ReviewState, …)
├── data/corpus.sample.ts  Corpus d'EXEMPLE — à remplacer par les ~1 000 items réels
├── db/db.ts               Base Dexie/IndexedDB + amorçage (seed) + profil par défaut
├── srs/scheduler.ts       Moteur FSRS : création de cartes, notation, maturité
├── App.tsx                Écran de vérification de la fondation (temporaire)
└── main.tsx               Point d'entrée
```

## État actuel

Fondation posée et fonctionnelle : modèle de données typé, persistance Dexie,
moteur de répétition espacée FSRS, corpus d'exemple, écran smoke-test.
**L'interface réelle n'est pas encore construite.**

## Prochaines étapes suggérées

1. **Corpus réel** — remplacer `corpus.sample.ts` par les ~1 000 items (liste NGSL
   recommandée), avec traductions, exemples et expressions relus.
2. **Écrans UI** — construire à partir du prototype de design : onboarding,
   tableau de bord, session, bilan, progression.
3. **Boucle de session** — file de révision triée sur `reviewStates` par `card.due`,
   mélange révisions + nouveaux items, types d'exercices (cf. PRD §2.5 F3).
4. **Jauge de couverture conversationnelle** — l'élément signature (PRD §2.5 F5).
5. **Gamification** — série, objectif quotidien, XP, jalons.
6. **Voix** — synthèse vocale via la Web Speech API (`speechSynthesis`).

## Conventions

- TypeScript strict ; `noUnusedLocals` / `noUnusedParameters` activés.
- `ReviewState` encapsule directement la carte FSRS (`card`) — ne pas reconstruire
  manuellement les cartes, passer par `srs/scheduler.ts`.
- Le contenu (Word/Phrase/Example) est en lecture seule côté client ; seules la
  progression (ReviewState/Session) et l'utilisateur sont mutables.
