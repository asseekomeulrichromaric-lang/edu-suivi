// Ce script remplit la base de données avec quelques données de départ,
// pour ne pas avoir à tout créer à la main avant de pouvoir tester l'appli.
// Lancement : npm run prisma:migrate (une fois), puis npx prisma db seed

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const departement = await prisma.departement.create({
    data: { nom: "Informatique de Gestion" },
  });

  const filiere = await prisma.filiere.create({
    data: { nom: "Informatique de Gestion", departementId: departement.id },
  });

  const niveau = await prisma.niveau.create({
    data: { libelle: "Licence 3", filiereId: filiere.id },
  });

  const matieres = await prisma.matiere.createMany({
    data: [
      { nom: "Base de données avancées", volumeHoraireReference: 30, departementId: departement.id },
      { nom: "Analyse de données", volumeHoraireReference: 24, departementId: departement.id },
      { nom: "Algorithmique", volumeHoraireReference: 28, departementId: departement.id },
      { nom: "Statistiques inférentielles", volumeHoraireReference: 26, departementId: departement.id },
      { nom: "Programmation web", volumeHoraireReference: 24, departementId: departement.id },
      { nom: "Systèmes d'information", volumeHoraireReference: 20, departementId: departement.id },
      { nom: "Réseaux et sécurité", volumeHoraireReference: 22, departementId: departement.id },
      { nom: "Gestion de projet", volumeHoraireReference: 18, departementId: departement.id },
      { nom: "Mathématiques appliquées", volumeHoraireReference: 20, departementId: departement.id },
      { nom: "Marketing digital", volumeHoraireReference: 16, departementId: departement.id },
      { nom: "Structure de données", volumeHoraireReference: 24, departementId: departement.id },
      { nom: "Anglais", volumeHoraireReference: 16, departementId: departement.id },
      { nom: "Gestion de données massives", volumeHoraireReference: 20, departementId: departement.id },
    ],
  });

  const matiere = await prisma.matiere.findFirst({
    where: { nom: "Base de données avancées", departementId: departement.id },
  });

  const motDePasseHash = await bcrypt.hash("motdepasse123", 10);

  const admin = await prisma.utilisateur.create({
    data: {
      nom: "MBOKO",
      prenom: "Jean-Paul",
      email: "admin@insg.ga",
      motDePasseHash,
      role: "ADMINISTRATEUR",
      departementId: departement.id,
    },
  });

  const chefDept = await prisma.utilisateur.create({
    data: {
      nom: "KOUMBA",
      prenom: "Jean-Pierre",
      email: "chefdept@insg.ga",
      motDePasseHash,
      role: "CHEF_DEPARTEMENT",
      departementId: departement.id,
    },
  });

  const enseignant = await prisma.utilisateur.create({
    data: {
      nom: "ADJOVI",
      prenom: "Koffi",
      email: "enseignant@insg.ga",
      motDePasseHash,
      role: "ENSEIGNANT",
      departementId: departement.id,
    },
  });

  const chefClasse = await prisma.utilisateur.create({
    data: {
      nom: "TRAORE",
      prenom: "Aïcha",
      email: "chefclasse@insg.ga",
      motDePasseHash,
      role: "CHEF_CLASSE",
      departementId: departement.id,
    },
  });

  const affectation = await prisma.affectationPedagogique.create({
    data: {
      anneeAcademique: "2025-2026",
      enseignantId: enseignant.id,
      matiereId: matiere!.id,
      niveauId: niveau.id,
    },
  });

  await prisma.fiche.create({
    data: {
      reference: "EDU-2026-DINF-0001",
      affectationId: affectation.id,
      chefClasseId: chefClasse.id,
      volumeHorairePrevu: 30,
      dateLimiteSemestre: new Date("2026-06-30"),
    },
  });

  console.log("Données de démo créées. Comptes de test (mot de passe pour tous : motdepasse123) :");
  console.log("- admin@insg.ga (Administrateur)");
  console.log("- chefdept@insg.ga (Chef de département)");
  console.log("- enseignant@insg.ga (Enseignant)");
  console.log("- chefclasse@insg.ga (Chef de classe)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
