# Apprentissage de l'anglais par la loi de Pareto

## Étude de viabilité & PRD de l'application

**Auteur :** Paul · **Date :** 24 mai 2026 · **Version :** 0.1 (brouillon de cadrage)
**Public :** usage personnel + quelques proches · **Cible technique :** PWA

---

# Partie 1 — Étude de viabilité

## 1.1 Le principe

L'idée : plutôt que d'apprendre l'anglais « en entier », on cible le sous-ensemble de
vocabulaire dont le rendement est le plus élevé. Les mots d'une langue ne sont pas
utilisés à fréquence égale, loin de là : une petite minorité de mots représente la
grande majorité de ce qui est réellement dit. C'est une distribution de type
**loi de Zipf** — et c'est précisément ce qui rend une stratégie Pareto pertinente
ici, bien plus que dans la plupart des domaines où « 80/20 » n'est qu'une métaphore.

## 1.2 Ce que disent les données

La recherche en linguistique appliquée — en particulier les travaux de **Paul Nation**
sur la *couverture lexicale* (lexical coverage) à partir de corpus comme le BNC et
COCA — donne des ordres de grandeur stables et reproductibles.

| Mots les plus fréquents (familles de mots) | Couverture à l'oral | Couverture à l'écrit |
|---|---|---|
| ~100 | ~50 % | ~50 % |
| **~1 000** | **~85 %** | **~75 %** |
| ~2 000 | ~90 % | ~80 % |
| ~3 000 | ~94 % | ~85 % |
| ~5 000 | ~96 % | ~88–90 % |

*Valeurs approximatives, arrondies. La couverture orale est systématiquement
supérieure à la couverture écrite : la conversation quotidienne est lexicalement
plus pauvre et plus répétitive que le texte écrit.*

**La prémisse du projet est donc correcte.** ~1 000 mots fréquents couvrent bien
environ 85 % des mots prononcés dans une conversation courante. Et la courbe est
fortement décroissante : les 1 000 premiers mots rapportent énormément, les 1 000
suivants beaucoup moins. Le « point Pareto » se situe réellement autour de ce
premier millier.

## 1.3 Les trois nuances critiques (à intégrer dès la conception)

C'est ici que le projet se joue. Une lecture naïve de « 1 000 mots = 85 % » mène à
une application qui déçoit. Trois réserves doivent être absorbées par le produit
lui-même.

### Nuance 1 — Couverture n'est pas compréhension

85 % de couverture signifie qu'**environ 1 mot sur 7 reste inconnu**. Or la recherche
situe le seuil de *compréhension confortable* bien plus haut :

- ~95 % de couverture pour une compréhension raisonnable avec aide du contexte ;
- ~98 % pour une compréhension autonome (lecture/écoute sans blocage).

Conséquence : avec 1 000 mots on **comprend le sujet et le sens général** d'une
conversation, mais on **perd des détails** et on bute régulièrement. C'est suffisant
pour *se débrouiller* et *se faire comprendre*, pas pour *tout suivre*. Le produit
doit donc poser la bonne promesse : « parler et survivre dans une conversation »,
pas « comprendre l'anglais ». Le seuil de confort réel se situe vers 2 000–3 000
mots — d'où l'importance d'une feuille de route en phases (voir 1.4).

### Nuance 2 — Le haut de la liste, ce sont des mots-outils

Les ~100 mots les plus fréquents (la moitié de tout ce qui se dit) sont presque
exclusivement des **mots grammaticaux** : articles, prépositions, pronoms,
auxiliaires, conjonctions (*the, of, to, and, a, in, is, it, you, that*…).

On **n'apprend pas « the » avec une carte de vocabulaire**. Ces mots ne portent pas
de sens isolément : ils s'acquièrent **en contexte, dans des structures de phrases**.
Le produit doit donc traiter deux types d'items différemment :

- **Mots de contenu** (noms, verbes, adjectifs porteurs de sens) → carte de
  vocabulaire classique, traduction, exemple.
- **Mots-outils** → absorbés à l'intérieur d'**expressions toutes faites** (blocs
  préfabriqués) à fréquence élevée (*I'd like to…*, *Can you…?*, *There is…*,
  *I'm going to…*), mémorisées comme une unité — sans jamais être décortiquées.

C'est la différence entre une appli qui « marche » et une appli qui produit
réellement de la parole.

### Nuance 3 — Le vocabulaire n'est pas toute la langue

1 000 mots ne donnent pas l'anglais entier ; ils en donnent la matière première. La
grammaire fine, les temps complexes et la maîtrise des collocations resteront à
acquérir ailleurs. **C'est un parti pris assumé du produit :** pas de leçons de
grammaire ni de conjugaison — ce terrain est déjà saturé par les apps classiques, et
ce n'est pas l'objectif. La grammaire de base (l'ordre des mots, les tournures les
plus courantes) est absorbée **implicitement** : par les expressions toutes faites
mémorisées en bloc et par la phrase d'exemple qui accompagne chaque mot. L'oreille et
la prononciation, elles, se greffent sur le même corpus via l'audio et les exercices
d'écoute, sans sortir du périmètre des 1 000 mots. Une appli de pur « flashcards de
mots nus » plafonnerait vite ; en gardant le mot dans une phrase et en mémorisant des
blocs utiles, on reste 100 % vocabulaire tout en produisant de la parole réelle.

## 1.4 Verdict de viabilité

**Viable, et même excellent — sous conditions.** L'approche est particulièrement
adaptée à un objectif précis : amener un **faux-débutant** (A1/A2) à un niveau
**conversationnel fonctionnel** le plus vite possible, avec une motivation
entretenue par des progrès visibles et rapides.

Conditions de réussite, à porter par le produit :

1. **Répétition espacée (SRS)** — non négociable pour la rétention long terme.
2. **Apprendre en contexte** — chaque mot vit dans une phrase et, quand c'est
   pertinent, dans une expression toute faite ; jamais de mot nu.
3. **Input compréhensible et audio** — entendre avant de produire.
4. **Promesse honnête** — « parler et se débrouiller », pas « tout comprendre ».
5. **Feuille de route en phases** pour ne pas heurter le plafond des 85 % :

| Phase | Vocabulaire cumulé | Promesse réaliste |
|---|---|---|
| **Phase 1 — Survie** | ~1 000 mots | Tenir une conversation simple, se faire comprendre |
| **Phase 2 — Confort** | ~2 000 mots | Suivre une conversation courante sans décrocher |
| **Phase 3 — Autonomie** | ~3 000 mots | Comprendre l'essentiel des médias et échanges courants |

L'application est conçue pour la **Phase 1** (le cœur Pareto, le plus fort
rendement), avec une architecture qui rend les phases 2 et 3 possibles sans
réécriture — il suffit d'étendre le corpus.

> **En une phrase :** la loi de Pareto est le bon angle d'attaque pour *démarrer*
> vite et fort ; ce n'est pas un raccourci vers la maîtrise. Le produit doit vendre
> et tenir la première promesse, tout en gardant la porte ouverte vers la suite.

---

# Partie 2 — PRD (Product Requirements Document)

## 2.1 Vision

> Une application personnelle, légère et installable, qui amène l'utilisateur à
> tenir une conversation en anglais le plus vite possible, en se concentrant
> exclusivement sur le vocabulaire et les expressions toutes faites à plus haut
> rendement.

**Parti pris fondateur :** l'application enseigne **du vocabulaire, et rien que du
vocabulaire**. Aucune leçon de grammaire, aucune table de conjugaison, aucun drill
de règles. C'est ce qui la distingue radicalement des apps classiques (Duolingo,
Babbel…), qui suivent un curriculum grammatical. Les structures de la langue ne
sont jamais *expliquées* : elles sont *absorbées* via des expressions mémorisées en
bloc et les phrases d'exemple.

**Nom de travail :** *Pareto English* (à arbitrer).

## 2.2 Objectifs & non-objectifs

**Objectifs**

- Faire acquérir et **retenir durablement** ~1 000 mots et expressions à haute
  fréquence.
- Rendre la progression **visible et motivante** (métrique de couverture, séries).
- Entraîner les **quatre angles** d'un mot : reconnaissance, rappel, écoute,
  production orale.
- Fonctionner **hors-ligne**, sur mobile et ordinateur, sans App Store.
- Servir **plusieurs profils** (toi + quelques proches) sans complexité inutile.

**Non-objectifs (hors périmètre)**

- **Aucun enseignement de grammaire ni de conjugaison** : pas de règles, pas de
  tables, pas de drills grammaticaux. La grammaire de base s'acquiert uniquement
  *implicitement*, par imprégnation (expressions en bloc + phrases d'exemple).
- Pas de préparation à un examen (TOEIC, IELTS…).
- Pas de réseau social, de classement public, ni de contenu généré par les
  utilisateurs.
- Pas de monétisation, pas de comptes à grande échelle.

## 2.3 Personas

- **Paul (utilisateur principal)** — développeur, motivé, veut un outil sobre,
  efficace, sans friction ni dark patterns. Usage quotidien en sessions courtes.
- **Proche faux-débutant** — niveau A1/A2, peu à l'aise avec les apps complexes.
  A besoin d'un onboarding minimal et d'une boucle d'usage évidente.
- **Langue source de tous les profils : français.** Toutes les traductions et
  consignes sont en français (hypothèse de cadrage — à confirmer).

## 2.4 Le corpus pédagogique (le cœur du produit)

C'est l'actif central. La qualité du corpus prime sur la quantité de
fonctionnalités.

### 2.4.1 Choix de la liste de référence

Recommandation : partir d'une liste de fréquence **dérivée d'un corpus oral**,
plus pertinente que les listes écrites pour un objectif conversationnel.

- **Option recommandée : NGSL** (*New General Service List*, Browne et al.) — moderne,
  pédagogiquement validée, librement disponible ; en prendre les **~1 000 premières
  familles**.
- **Alternative : COCA — sous-corpus oral** (*spoken frequency*) — la plus fidèle à
  la conversation réelle.
- Le décompte se fait en **familles de mots / lemmes** (un mot-tête + ses formes
  fléchies) ; les formes fléchies apparaissent naturellement dans les phrases
  d'exemple. Cible : ~1 000 lemmes.

### 2.4.2 Deux types d'items (cf. Nuance 2)

- **Carte « mot »** — mots de contenu (noms, verbes, adjectifs). Champs : lemme,
  traduction FR, nature (étiquette d'affichage, pas une leçon), API/phonétique,
  phrase d'exemple + traduction, audio.
- **Carte « expression »** — expressions toutes faites à haute fréquence,
  intégrant naturellement les mots-outils (*I'd like…*, *Can I have…?*,
  *How much is…?*). **Mémorisées en bloc, exactement comme un mot** : jamais
  décomposées, jamais expliquées grammaticalement. C'est le mécanisme par lequel
  les mots-outils entrent dans le corpus sans qu'on enseigne de grammaire.

### 2.4.3 Unité d'apprentissage minimale

Chaque item = **mot/expression + phrase porteuse + audio + traduction**. Jamais de mot
isolé sans contexte.

> **Décision ouverte :** curation du corpus. Une liste de fréquence brute existe,
> mais traductions, exemples et expressions doivent être rédigés/relus avec soin. Un
> premier jet peut être généré puis **vérifié manuellement** — la qualité du
> contenu est le principal risque produit (cf. 2.12).

## 2.5 Fonctionnalités

### F1 — Bibliothèque de contenu

Le corpus structuré (2.4), versionné, livré avec l'application et chargé en base
locale au premier lancement. Mises à jour de contenu possibles sans réinstallation.

### F2 — Moteur de répétition espacée (SRS)

Cœur pédagogique. Chaque item a un **état de révision par utilisateur**.

- **Algorithme recommandé : FSRS** (via `ts-fsrs`) — moderne, open source, planifie
  les révisions plus finement que SM-2 et limite le sur-apprentissage.
- L'utilisateur ne voit pas l'algorithme : juste une file « à réviser
  aujourd'hui » + un quota de nouveaux items/jour (réglable, défaut bas : 5–10).
- États d'un item : *nouveau → en apprentissage → jeune → mûr → maîtrisé*.

### F3 — Types d'exercices

Faire travailler les quatre faces de chaque mot, en variant pour éviter la lassitude :

1. **Reconnaissance** — EN → choisir la traduction FR (QCM).
2. **Rappel actif** — FR → produire le mot EN (saisie ou QCM selon difficulté).
3. **Compréhension orale** — audio → identifier le mot/sens.
4. **Production orale** — entendre puis répéter à voix haute (cf. F4).
5. **Expression à trous** — restituer un mot manquant dans une expression déjà
   apprise (rappel du bloc mémorisé, pas un exercice de grammaire).

Le moteur SRS choisit le type d'exercice selon la maturité de l'item (reconnaissance
pour le neuf, rappel et production pour le mûr).

### F4 — Voix (décision tranchée)

Recommandation en trois temps, du plus rentable au plus coûteux :

- **MVP — Écoute (TTS).** Synthèse vocale via la **Web Speech API**
  (`speechSynthesis`), intégrée au navigateur, gratuite, hors-ligne sur la plupart
  des plateformes. Couvre tout F3.3 et l'écoute de chaque item. **Suffisant et
  fiable pour le lancement.**
- **v1 — Production « répéter & comparer ».** L'utilisateur enregistre sa voix
  (MediaRecorder) et la **réécoute juxtaposée** au modèle TTS. Auto-évaluation,
  pas de notation automatique. Faible coût, vraie valeur pédagogique.
- **v2 (optionnel) — Notation de prononciation (ASR).** Évaluation automatique de
  la prononciation. Nécessite un service tiers (type *Azure Pronunciation
  Assessment*) → coût + dépendance réseau. À n'envisager que si le besoin se
  confirme à l'usage.

> **Pourquoi ne pas faire la reconnaissance vocale dès le MVP :** l'API
> `SpeechRecognition` du navigateur est inégale — correcte sur Chrome/Android,
> **absente ou limitée sur Safari/iOS**, ce qui est rédhibitoire pour une PWA
> installée sur iPhone. L'approche « répéter & comparer » contourne ce trou de
> couverture tout en restant 100 % hors-ligne.

### F5 — Gamification (motivante, sans dark patterns)

La gamification sert la régularité, pas l'addiction. Aucune notification
culpabilisante, aucune pression sociale.

- **Compteur de couverture conversationnelle** — la mécanique signature : une jauge
  « tu couvres ~X % d'une conversation courante » qui monte avec les mots maîtrisés.
  Elle **matérialise directement la promesse Pareto** et c'est le meilleur moteur de
  motivation du produit.
- **Série (streak)** — jours consécutifs ; tolérance d'un « jour de grâce » pour ne
  pas punir une absence isolée.
- **Objectif quotidien** — court et atteignable (ex. 10 min ou 20 items) ; réglable.
- **XP & niveaux** — niveaux indexés sur des **paliers de couverture** (250 / 500 /
  750 / 1 000 mots), pas sur du temps passé.
- **Jalons** — petites célébrations aux paliers (« tu peux maintenant commander au
  restaurant », etc.).

### F6 — Tableau de bord & progression

Vue unique : couverture estimée, mots maîtrisés / en cours / restants, série en
cours, révisions du jour, courbe de progression hebdomadaire.

### F7 — Multi-profils

- **MVP :** profil unique, 100 % local (pas de compte).
- **v1 :** comptes légers + **synchronisation multi-appareils** et profils pour les
  proches. Le **corpus est partagé** ; seule la progression est par utilisateur.

### F8 — PWA installable & hors-ligne

Installable sur écran d'accueil (mobile et desktop), démarrage et sessions
**fonctionnels sans réseau**, données persistées localement.

## 2.6 Parcours utilisateur

**Onboarding (premier lancement)**

1. Écran d'accueil : la promesse (« ~1 000 mots pour 85 % des conversations »).
2. Création du profil (prénom ; pas d'email au MVP).
3. Choix du rythme quotidien (tranquille / standard / intensif).
4. *Optionnel :* mini-test de placement pour marquer comme « déjà connus » des mots
   évidents (saute la Phase 0 du débutant non-total). Reportable en v1.
5. Première session guidée (3–5 items) → première victoire immédiate.

**Session type (la boucle quotidienne, ~5–10 min)**

Lancer → réviser les items dus (SRS) → introduire N nouveaux items (vu → exemple
audio → premier exercice) → bilan de session (items vus, jauge de couverture mise à
jour, série) → rappel doux du lendemain.

## 2.7 Contraintes & architecture techniques

Cible : **PWA**, mono-développeur, hébergement à coût ~nul, priorité **offline-first**.

| Brique | Choix proposé | Raison |
|---|---|---|
| Framework UI | React + Vite, ou SvelteKit | Écosystème PWA mûr, TypeScript |
| PWA / SW | `vite-plugin-pwa` (Workbox) | Manifest + service worker + cache d'app |
| Stockage local | IndexedDB via **Dexie.js** | Corpus + progression hors-ligne |
| Moteur SRS | `ts-fsrs` | FSRS prêt à l'emploi |
| Voix | **Web Speech API** (`speechSynthesis`) | TTS gratuit, intégré, hors-ligne |
| Enregistrement (v1) | MediaRecorder API | « Répéter & comparer » natif navigateur |
| Sync (v1) | Supabase (Postgres + Auth) | Offre gratuite généreuse, suffisant pour quelques profils |
| Hébergement | Vercel / Netlify / Cloudflare Pages | Statique, gratuit, déploiement simple |

**Points d'attention PWA / iOS** (à ne pas découvrir en route) :

- `SpeechRecognition` indisponible/instable sur Safari → écarté du MVP (cf. F4).
- Stockage IndexedDB potentiellement **évincé** par iOS si l'app est peu utilisée
  → garder le corpus rechargeable depuis le bundle ; sync v1 comme filet.
- Notifications push web limitées sur iOS → la régularité repose sur la jauge et la
  série in-app, pas sur le push.
- Voix TTS : qualité et voix disponibles **variables selon l'OS** → prévoir une
  sélection de voix et un repli gracieux.

## 2.8 Modèle de données (esquisse)

```
User        { id, name, dailyGoal, createdAt }
Word        { id, rank, lemma, pos, translationFr, ipa, audioRef? }
Phrase      { id, rank, textEn, translationFr, category, audioRef? }  // expression toute faite
Example     { id, itemId, itemType, sentenceEn, translationFr }
ReviewState { userId, itemId, itemType, stability, difficulty,
              due, state, lastReviewedAt }      // FSRS, par utilisateur
Session     { id, userId, startedAt, itemsSeen, itemsCorrect, durationSec }
```

`Word` / `Phrase` / `Example` = contenu partagé (en lecture seule côté client).
`ReviewState` / `Session` = données par utilisateur (locales au MVP, synchronisées
en v1).

## 2.9 Périmètre du MVP

**Inclus** — profil local unique · corpus ~1 000 items (mots + expressions) avec
exemples et traductions FR · moteur SRS (FSRS) · exercices F3.1/F3.2/F3.3 +
expression à trous ·
TTS (écoute) · gamification F5 (jauge de couverture, série, objectif quotidien) ·
tableau de bord · PWA installable et hors-ligne.

**Exclu du MVP** — multi-profils & sync · production orale « répéter & comparer » ·
notation ASR · test de placement · phases 2 et 3 du corpus.

## 2.10 Feuille de route

| Version | Contenu | Objectif |
|---|---|---|
| **MVP** | Périmètre 2.9 | Boucle d'apprentissage complète, utilisable au quotidien, solo |
| **v1** | Multi-profils + sync (Supabase) · « répéter & comparer » · tableau de bord enrichi · test de placement | Ouverture aux proches, suivi multi-appareils |
| **v2** | Notation de prononciation (ASR) · Corpus Phase 2 (→2 000 mots) · sentence mining | Franchir le plafond des 85 % |

## 2.11 Indicateurs de succès (usage personnel)

- **Régularité** — jours actifs / semaine ; longueur de série moyenne.
- **Rétention** — % de réussite des révisions d'items mûrs (cible > 85 %).
- **Progression** — mots maîtrisés / semaine ; couverture estimée atteinte.
- **Jalon clé** — temps réel pour atteindre les 1 000 items maîtrisés.
- **Critère qualitatif** — sentiment de « pouvoir tenir une conversation simple ».

## 2.12 Risques & mitigations

| Risque | Impact | Mitigation |
|---|---|---|
| Qualité du corpus (traductions, exemples, expressions) | Élevé | Curation manuelle ; relecture systématique ; corpus versionné |
| Mots-outils mal enseignés (en cartes nues) | Élevé | Type d'item « expression » dédié (cf. 2.4.2) |
| Attente irréaliste (« je vais tout comprendre ») | Moyen | Promesse honnête dans l'onboarding ; jauge = couverture, pas compréhension |
| Décrochage de motivation | Moyen | Objectif quotidien bas ; série tolérante ; jalons fréquents |
| Limites PWA/iOS (voix, stockage, push) | Moyen | TTS only au MVP ; corpus rechargeable ; régularité in-app |
| Périmètre qui s'étend (over-engineering) | Moyen | MVP strict (2.9) ; phases 2/3 explicitement repoussées |

## 2.13 Décisions ouvertes

1. **Corpus source** — NGSL (premiers 1 000) vs COCA oral. *Reco : NGSL pour
   démarrer, le plus simple à exploiter.*
2. **Langue source** — français confirmé comme unique L1 ? (hypothèse actuelle).
3. **Audio** — TTS à la volée uniquement, ou fichiers audio pré-enregistrés pour la
   qualité ? *Reco : TTS au MVP, audio pré-enregistré envisageable plus tard.*
4. **Nom du produit.**
5. **Test de placement** — utile dès le MVP pour un faux-débutant déjà avancé, ou
   reporté en v1 ?

---

## Annexe — Synthèse en une page

- **La prémisse est juste :** ~1 000 mots fréquents ≈ 85 % des mots d'une
  conversation courante. La loi de Pareto s'applique réellement (distribution de
  Zipf).
- **Mais 85 % de couverture ≠ 85 % de compréhension** : le confort réel arrive vers
  2 000–3 000 mots. Promesse honnête = « parler et se débrouiller ».
- **Les mots les plus fréquents sont des mots-outils** : à absorber dans des
  *expressions toutes faites*, pas en cartes isolées.
- **Conditions de réussite :** répétition espacée, apprentissage en contexte, audio,
  feuille de route en phases.
- **Produit :** PWA hors-ligne, FSRS, exercices variés, TTS au MVP (voix produite en
  v1), gamification centrée sur une **jauge de couverture conversationnelle**.
- **Stratégie de livraison :** MVP solo et strict → v1 multi-profils + sync → v2
  prononciation notée + extension du corpus.
