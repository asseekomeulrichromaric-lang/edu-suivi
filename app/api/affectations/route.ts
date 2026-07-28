// POST /api/affectations
// Créée par le chef de département : une affectation pédagogique ET sa fiche
// de suivi associée sont créées en une seule opération (comme précisé dans
// le cahier des charges : "une fiche de suivi sera automatiquement créée").

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { estChefDeDepartement } from "@/lib/permissions";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !estChefDeDepartement(session.role)) {
    return Response.json({ erreur: "Action réservée au chef de département." }, { status: 403 });
  }

  const { matiereId, niveauId, enseignantId, chefClasseId, volumeHorairePrevu, anneeAcademique, dateLimiteSemestre } =
    await request.json();

  if (!matiereId || !niveauId || !enseignantId || !chefClasseId || !volumeHorairePrevu || !dateLimiteSemestre) {
    return Response.json({ erreur: "Tous les champs sont obligatoires." }, { status: 400 });
  }

  // On génère une référence lisible, ex: EDU-2026-DINF-0007
  const compteFiches = await prisma.fiche.count();
  const reference = `EDU-${new Date().getFullYear()}-DINF-${String(compteFiches + 1).padStart(4, "0")}`;

  const affectation = await prisma.affectationPedagogique.create({
    data: {
      matiereId,
      niveauId,
      enseignantId,
      anneeAcademique: anneeAcademique || "2025-2026",
      fiche: {
        create: {
          reference,
          chefClasseId,
          volumeHorairePrevu: Number(volumeHorairePrevu),
          dateLimiteSemestre: new Date(dateLimiteSemestre),
        },
      },
    },
    include: { fiche: true },
  });

  await prisma.historiqueEvenement.create({
    data: {
      ficheId: affectation.fiche!.id,
      auteurId: session.utilisateurId,
      typeEvenement: "CREATION",
      details: "Affectation pédagogique et fiche créées.",
    },
  });

  return Response.json(affectation, { status: 201 });
}
