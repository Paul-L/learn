# Prompt — Design du prototype interactif « Pareto English »

> À copier-coller dans une nouvelle conversation Claude. Le prompt est autonome :
> il contient tout le contexte nécessaire.

---

Tu es un **designer produit senior** spécialisé dans les applications mobiles
d'apprentissage. Je veux que tu conçoives **et codes** un **prototype interactif
cliquable** pour une application mobile, livré sous forme d'artifact React en un
seul fichier.

## Contexte produit

**Pareto English** est une petite application mobile (PWA) d'apprentissage de
l'anglais pour des francophones. Son principe : appliquer la **loi de Pareto** au
vocabulaire — apprendre les **~1 000 mots et expressions les plus fréquents**, qui
couvrent à eux seuls environ **85 % d'une conversation courante**.

Parti pris essentiel, à respecter dans tout le design :

- **Vocabulaire uniquement.** Aucune leçon de grammaire, aucune conjugaison, aucun
  drill de règles. Ce n'est PAS un clone de Duolingo / Babbel.
- Les mots-outils (the, to, can…) sont appris via des **expressions toutes faites**
  mémorisées en bloc (« I'd like to… », « Can I have…? »), jamais décortiquées.
- L'apprentissage repose sur la **répétition espacée** : chaque jour, une courte
  session mêle révisions et nouveaux mots.
- Public : usage personnel + quelques proches. Faux-débutants (A1/A2). Ton adulte,
  jamais infantilisant.
- **Interface en français** ; seuls les mots/expressions à apprendre sont en anglais.

## Ce que tu dois produire

Un **prototype React interactif et navigable**, dans un artifact, **en un seul
fichier**. On doit pouvoir **cliquer pour passer d'un écran à l'autre** ; l'état est
géré en mémoire avec `useState` (boutons, sélections, progression de session
fonctionnels).

Contraintes techniques de l'artifact :

- React en un seul fichier, export par défaut, aucune prop requise.
- Styling avec les **classes utilitaires Tailwind de base uniquement**.
- Icônes via `lucide-react`.
- **Pas de `localStorage` / `sessionStorage`** — tout l'état en mémoire (`useState`).
- Données d'exemple **codées en dur** et réalistes (vrais mots anglais fréquents +
  traductions françaises) pour que le prototype paraisse vivant.
- Conçois **mobile-first** : affiche le prototype dans un **cadre de téléphone**
  (~390 × 844 px, coins arrondis) centré sur fond neutre, comme une vraie maquette.
- Bonus apprécié : câble réellement les boutons audio avec l'API navigateur
  `speechSynthesis` pour prononcer le mot anglais au clic.

## Écrans à concevoir (parcours cliquable complet)

1. **Onboarding** (2 écrans)
   - Écran d'accueil : le nom de l'app, la promesse en une phrase
     (« ~1 000 mots pour comprendre 85 % des conversations »), un bouton *Commencer*.
   - Configuration : saisie du prénom + choix du rythme quotidien
     (*Tranquille* / *Standard* / *Intensif*).

2. **Accueil / Tableau de bord**
   - **Jauge de couverture conversationnelle** — l'élément signature (voir plus bas).
   - Série en cours (jours consécutifs), objectif du jour, nombre de révisions dues.
   - Un bouton principal bien visible : *Démarrer la session du jour*.

3. **Session d'apprentissage** (sous-écrans enchaînés, avec barre de progression)
   - **Découverte d'un nouveau mot** : le mot anglais en grand, sa phonétique, un
     bouton écoute, la traduction française, une phrase d'exemple bilingue.
   - **Exercice de reconnaissance** : QCM anglais → français.
   - **Exercice de rappel** : français → anglais.
   - **Exercice d'écoute** : bouton audio → QCM.
   - **Expression à trous** : compléter une expression déjà apprise.
   - Montre les états de réponse (correct / incorrect) avec un retour visuel clair.

4. **Bilan de session**
   - Récap : items vus, bonnes réponses, XP gagné, série confirmée.
   - La jauge de couverture qui progresse (idéalement avec une petite animation).

5. **Progression**
   - Mots *maîtrisés* / *en cours* / *restants*, une courbe d'activité hebdomadaire,
     les prochains jalons à atteindre.

Navigation : une barre d'onglets en bas (*Accueil*, *Progression*) ; le flux de
session s'ouvre en plein écran.

## Élément signature — la jauge de couverture

C'est le cœur émotionnel de l'app. Une jauge qui affiche **« Tu couvres ~X % d'une
conversation courante »** et monte à mesure que des mots sont maîtrisés. Elle
matérialise la promesse Pareto. Soigne-la particulièrement : c'est elle qui doit
donner envie de revenir.

## Direction visuelle — sobre mais chaleureux

- Base neutre et apaisée (blanc cassé / gris chaud), **une seule couleur d'accent
  chaleureuse** bien choisie, plus une couleur de réussite et une couleur d'erreur
  douces.
- Coins arrondis modérés, **beaucoup d'espace**, hiérarchie typographique nette avec
  une sans-serif amicale mais adulte (pas enfantine).
- **Gamification présente mais dosée** : série, XP, jalons, objectif quotidien —
  visibles et motivants, jamais criards. **Aucun dark pattern** : pas de rouge
  agressif, pas de culpabilisation, pas de compte à rebours stressant.
- Le design doit respirer le calme et la régularité, pas l'urgence.

## Critères de réussite

- Le parcours complet est cliquable de bout en bout (onboarding → accueil → session
  → bilan → progression).
- La jauge de couverture est mémorable et bien mise en valeur.
- L'ensemble paraît sobre, soigné et adulte, tout en restant motivant.
- Rien dans l'interface n'évoque un cours de grammaire.

Commence par me proposer brièvement ta direction (palette, typo, principe de mise en
page) en 3-4 lignes, puis livre le prototype.
