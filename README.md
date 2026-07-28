# EduSuivi

Plateforme de gestion des fiches de suivi pédagogique — INSG, département pilote Informatique de
Gestion.

Ce projet a été initialisé avec l'outil officiel `create-next-app` (Next.js, TypeScript, App
Router, ESLint, pas de Tailwind), puis complété avec la structure front office / back office,
les routes API et le schéma Prisma qu'on a conçus ensemble.

**État de vérification :** le code a été compilé avec succès (`npm run build`, TypeScript sans
erreur). Seule l'étape `prisma generate` n'a pas pu être testée dans l'environnement de conception
(pas d'accès réseau à `binaries.prisma.sh` dans ce bac à sable) — elle fonctionnera normalement
sur ta machine avec un accès internet standard, c'est la toute première commande ci-dessous.

> Si tu utilises Claude Code dans VS Code, lis d'abord `CLAUDE.md` — il contient tout le contexte
> du projet (rôles, workflow, décisions prises) pour que Claude Code comprenne le projet sans que
> tu aies à tout réexpliquer.

## Démarrage en local, étape par étape

### 1. Installer les dépendances

```bash
npm install
```

### 2. Créer une base de données PostgreSQL gratuite sur Neon

1. Va sur [neon.tech](https://neon.tech), crée un compte gratuit.
2. Crée un nouveau projet → Neon te donne une adresse de connexion (`postgresql://...`).
3. Copie `.env.example` en `.env` :
   ```bash
   cp .env.example .env
   ```
4. Colle l'adresse Neon dans `DATABASE_URL` à l'intérieur de `.env`.

### 3. Créer les tables dans la base de données

```bash
npx prisma migrate dev --name init
```

Cette commande lit `prisma/schema.prisma`, crée toutes les tables chez Neon, ET génère
automatiquement le client Prisma (l'étape qui n'a pas pu être testée pendant la conception).

### 4. Remplir la base avec des données de test

```bash
npx prisma db seed
```

Ça crée 4 comptes de test (un par rôle), avec le mot de passe `motdepasse123` pour tous :
- `admin@insg.ga`
- `chefdept@insg.ga`
- `enseignant@insg.ga`
- `chefclasse@insg.ga`

### 5. Lancer le site en local

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000) (redirige automatiquement vers `/connexion`)
et connecte-toi avec un des comptes ci-dessus.

## Envoyer le projet sur GitHub

```bash
git init
git add .
git commit -m "Structure initiale du projet EduSuivi"
git remote add origin https://github.com/TON-COMPTE/edusuivi.git
git push -u origin main
```

Le fichier `.env` ne sera jamais envoyé (il est dans `.gitignore`) — c'est normal et voulu, il
contient des mots de passe.

## Déployer gratuitement (Vercel + Neon)

1. Sur [vercel.com](https://vercel.com), connecte-toi avec ton compte GitHub.
2. "Add New Project" → choisis le dépôt `edusuivi`.
3. Dans les paramètres du projet Vercel, section "Environment Variables", ajoute `DATABASE_URL`
   et `SESSION_SECRET` avec les mêmes valeurs que ton fichier `.env` local.
4. Clique "Deploy". À chaque `git push` sur `main` par la suite, Vercel redéploiera automatiquement.

## Ce qui est déjà fonctionnel dans ce squelette

- Connexion (`/connexion`) → vraie vérification en base de données, session par cookie signé
- Enregistrement d'une séance (`/chef-de-classe/seances/nouvelle`) → vraie route API
- Validation / refus d'une séance → recalcule automatiquement le volume horaire de la fiche
- Confirmation d'archivage par le chef de département (workflow signature-papier)
- Middleware qui protège la zone `/admin` (back-office) selon le rôle

## Ce qu'il reste à construire

Toutes les pages marquées `// TODO` dans le code. Elles ont volontairement un contenu minimal pour
que le projet se lance sans erreur — à toi (ou à Claude Code, avec `CLAUDE.md` comme contexte) de
les compléter en suivant le même modèle que les pages déjà connectées.

## Remarque sur les versions

Next.js 16 a changé la façon de recevoir les paramètres d'URL dynamiques (`[id]`) : ils sont
maintenant fournis sous forme de `Promise`, à "dérouler" avec `await`. Toutes les routes de ce
projet suivent déjà cette nouvelle syntaxe — à garder à l'esprit si tu ajoutes de nouvelles routes
avec des paramètres dynamiques.
