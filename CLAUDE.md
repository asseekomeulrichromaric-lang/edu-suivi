# EduSuivi — Contexte du projet pour Claude Code

Ce fichier résume les décisions prises pendant la phase de conception, pour que tu (Claude, dans VS Code) aies le contexte complet sans que l'utilisateur ait à tout réexpliquer.

## Le projet

Application web pour l'INSG (Institut National de Sciences de Gestion) qui numérise le suivi des
séances de cours. Déployée d'abord sur un seul département pilote (Informatique de Gestion), avec
extension multi-départements prévue en V2. Nom : **EduSuivi**. Baseline : « Le suivi pédagogique,
sans papier ni oubli. »

Contrainte de calendrier : projet étudiant, soutenance dans un délai très court. Prioriser un MVP
fonctionnel et cohérent plutôt que l'exhaustivité.

## Les 4 rôles (jamais en inventer d'autres, jamais de rôle "étudiant")

- **Administrateur** : gère les comptes, départements, filières, niveaux, matières, paramètres globaux.
- **Chef de département** : crée les affectations pédagogiques et les fiches, arbitre les fiches
  incomplètes en fin de semestre (clôture justifiée ou prolongation), confirme la réception des
  fiches signées à la main (déclenche l'archivage officiel).
- **Enseignant** : valide ou refuse (avec motif obligatoire) chaque séance saisie par le chef de classe.
- **Chef de classe** : enregistre chaque séance réalisée (date, créneau horaire, contenu).

## Le workflow métier (important, a changé plusieurs fois pendant la conception)

1. Le chef de département crée une **affectation pédagogique** (matière + niveau + enseignant +
   chef de classe + volume horaire prévu) → une **fiche** est créée automatiquement, statut `EN_COURS`.
2. Le chef de classe enregistre des **séances** (date, horaire, contenu) → statut `EN_ATTENTE`.
3. L'enseignant valide (`VALIDEE`, incrémente le volume horaire réalisé de la fiche) ou refuse
   (`REFUSEE`, motif obligatoire, la séance reste visible dans l'historique, le chef de classe est
   notifié et peut corriger + resoumettre).
4. Quand `volume_horaire_realise >= volume_horaire_prevu` → la fiche passe à `PRETE_A_SIGNER`.
   Un PDF devient téléchargeable (voir plus bas).
5. **IMPORTANT — pas de signature électronique.** La fiche est imprimée et signée **à la main**
   par le chef de classe et l'enseignant, sur papier. Le système ne fait que tracer le
   téléchargement (qui, quand). Il n'y a AUCUNE route ou UI de "signature numérique".
6. Le papier signé est remis en main propre au chef de département, qui confirme sa réception dans
   EduSuivi (action manuelle) → la fiche passe à `VALIDEE_ARCHIVEE`. Le papier reste l'unique
   archive légale ; le système ne fait que suivre le statut.
7. **Clôture de fin de semestre** : si une fiche n'a pas atteint son volume horaire à la date de fin
   de semestre (paramétrable par filière/niveau), elle passe automatiquement à `INCOMPLETE` et se
   ferme à la saisie. Le chef de département doit statuer : clôturer avec justification, ou
   accorder une prolongation (la fiche redevient `EN_COURS` avec une nouvelle échéance).

## Statuts valides (ne jamais en inventer d'autres)

- Fiche : `EN_COURS`, `INCOMPLETE`, `PRETE_A_SIGNER`, `VALIDEE_ARCHIVEE`
- Séance : `EN_ATTENTE`, `VALIDEE`, `REFUSEE`

## Choix techniques tranchés

- Next.js (App Router) + TypeScript
- **PostgreSQL** (pas MySQL — tranché à cause des free tiers : PlanetScale MySQL n'a plus d'offre
  gratuite, alors que Neon Postgres reste gratuit et s'intègre bien à Vercel + Prisma)
- Prisma comme ORM
- Déploiement : Vercel (gratuit, tier Hobby) + base de données Neon (gratuit)
- **Pas de Tailwind CSS.** L'utilisateur ne le maîtrise pas — CSS classique uniquement (fichiers
  `.css` ou CSS Modules).
- Authentification : à garder aussi simple que possible vu le niveau de l'utilisateur (débutant en
  back-end). Éviter la sur-ingénierie ; privilégier une solution simple à comprendre plutôt que
  NextAuth si ça complique trop la compréhension.

## Charte graphique (à respecter dans tout le CSS)

- Encre `#1D3557` (couleur principale : en-têtes, navigation, boutons principaux)
- Sceau `#8B2635` (accent fort, réservé au badge/tampon du statut validé)
- Papier `#F7F5F0` (fond)
- Ardoise `#6B7280` (texte secondaire, bordures)
- Statuts : En attente ambre `#C77D2E`/`#FAEEDA`, Validée (séance) bleu `#2B6CB0`/`#E6F1FB`,
  Validée archivée vert `#2F7D5A`/`#EAF3DE`, Refusée/Incomplète rouge `#B0413E`/`#FCEBEB`
- Typographie : titres en serif (Source Serif 4 ou Lora), corps en sans-serif (Inter ou système),
  références/dates en monospace (IBM Plex Mono ou `monospace` système)
- Une couleur de statut = un seul usage. Ne jamais réutiliser le vert/rouge ailleurs.

## Niveau de l'utilisateur (important pour la façon d'écrire le code et de l'expliquer)

Maîtrise : HTML, CSS, JavaScript, composants React de base (props compris). Débutant en : API
routes, bases de données, Prisma, back-end en général. **Toujours expliquer brièvement le "pourquoi"
avant le "comment" quand tu ajoutes une notion nouvelle** (API route, middleware, requête Prisma...),
avec des phrases courtes, pas de jargon non expliqué. Garder le code simple et lisible plutôt
qu'optimisé — c'est un projet de soutenance, pas un produit en production.

## Structure du projet

Voir `README.md` à la racine pour l'arborescence complète et les instructions de démarrage.
