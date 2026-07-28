-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMINISTRATEUR', 'CHEF_DEPARTEMENT', 'ENSEIGNANT', 'CHEF_CLASSE');

-- CreateEnum
CREATE TYPE "StatutFiche" AS ENUM ('EN_COURS', 'INCOMPLETE', 'PRETE_A_SIGNER', 'VALIDEE_ARCHIVEE');

-- CreateEnum
CREATE TYPE "StatutSeance" AS ENUM ('EN_ATTENTE', 'VALIDEE', 'REFUSEE');

-- CreateEnum
CREATE TYPE "TypeEvenement" AS ENUM ('CREATION', 'VALIDATION_SEANCE', 'REFUS_SEANCE', 'TELECHARGEMENT_PDF', 'CONFIRMATION_ARCHIVAGE', 'CLOTURE_INCOMPLETE', 'PROLONGATION');

-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasseHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "departementId" TEXT,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Departement" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "Departement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Filiere" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "departementId" TEXT NOT NULL,

    CONSTRAINT "Filiere_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Niveau" (
    "id" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "filiereId" TEXT NOT NULL,

    CONSTRAINT "Niveau_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Matiere" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "volumeHoraireReference" INTEGER NOT NULL,
    "departementId" TEXT NOT NULL,

    CONSTRAINT "Matiere_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffectationPedagogique" (
    "id" TEXT NOT NULL,
    "anneeAcademique" TEXT NOT NULL,
    "enseignantId" TEXT NOT NULL,
    "matiereId" TEXT NOT NULL,
    "niveauId" TEXT NOT NULL,

    CONSTRAINT "AffectationPedagogique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fiche" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "statut" "StatutFiche" NOT NULL DEFAULT 'EN_COURS',
    "volumeHorairePrevu" INTEGER NOT NULL,
    "volumeHoraireRealise" INTEGER NOT NULL DEFAULT 0,
    "dateLimiteSemestre" TIMESTAMP(3) NOT NULL,
    "affectationId" TEXT NOT NULL,
    "chefClasseId" TEXT NOT NULL,
    "dateTelechargementPdf" TIMESTAMP(3),
    "dateConfirmationArchivage" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fiche_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seance" (
    "id" TEXT NOT NULL,
    "ficheId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "heureDebut" TEXT NOT NULL,
    "heureFin" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "statut" "StatutSeance" NOT NULL DEFAULT 'EN_ATTENTE',
    "motifRefus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Seance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoriqueEvenement" (
    "id" TEXT NOT NULL,
    "typeEvenement" "TypeEvenement" NOT NULL,
    "horodatage" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" TEXT,
    "ficheId" TEXT NOT NULL,
    "seanceId" TEXT,
    "auteurId" TEXT NOT NULL,

    CONSTRAINT "HistoriqueEvenement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Departement_nom_key" ON "Departement"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "AffectationPedagogique_enseignantId_matiereId_niveauId_anne_key" ON "AffectationPedagogique"("enseignantId", "matiereId", "niveauId", "anneeAcademique");

-- CreateIndex
CREATE UNIQUE INDEX "Fiche_reference_key" ON "Fiche"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Fiche_affectationId_key" ON "Fiche"("affectationId");

-- AddForeignKey
ALTER TABLE "Utilisateur" ADD CONSTRAINT "Utilisateur_departementId_fkey" FOREIGN KEY ("departementId") REFERENCES "Departement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Filiere" ADD CONSTRAINT "Filiere_departementId_fkey" FOREIGN KEY ("departementId") REFERENCES "Departement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Niveau" ADD CONSTRAINT "Niveau_filiereId_fkey" FOREIGN KEY ("filiereId") REFERENCES "Filiere"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matiere" ADD CONSTRAINT "Matiere_departementId_fkey" FOREIGN KEY ("departementId") REFERENCES "Departement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffectationPedagogique" ADD CONSTRAINT "AffectationPedagogique_enseignantId_fkey" FOREIGN KEY ("enseignantId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffectationPedagogique" ADD CONSTRAINT "AffectationPedagogique_matiereId_fkey" FOREIGN KEY ("matiereId") REFERENCES "Matiere"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffectationPedagogique" ADD CONSTRAINT "AffectationPedagogique_niveauId_fkey" FOREIGN KEY ("niveauId") REFERENCES "Niveau"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fiche" ADD CONSTRAINT "Fiche_affectationId_fkey" FOREIGN KEY ("affectationId") REFERENCES "AffectationPedagogique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fiche" ADD CONSTRAINT "Fiche_chefClasseId_fkey" FOREIGN KEY ("chefClasseId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seance" ADD CONSTRAINT "Seance_ficheId_fkey" FOREIGN KEY ("ficheId") REFERENCES "Fiche"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoriqueEvenement" ADD CONSTRAINT "HistoriqueEvenement_ficheId_fkey" FOREIGN KEY ("ficheId") REFERENCES "Fiche"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoriqueEvenement" ADD CONSTRAINT "HistoriqueEvenement_seanceId_fkey" FOREIGN KEY ("seanceId") REFERENCES "Seance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoriqueEvenement" ADD CONSTRAINT "HistoriqueEvenement_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
