// POST /api/fiches/[id]/confirmer-archivage
// Appelée quand le chef de département a reçu physiquement le papier signé
// à la main, et confirme dans EduSuivi. C'est CETTE action, et uniquement
// elle, qui fait passer la fiche au statut final VALIDEE_ARCHIVEE.

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { estChefDeDepartement } from "@/lib/permissions";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const session = await getSession();
  if (!session || !estChefDeDepartement(session.role as any)) {
    return Response.json({ erreur: "Action réservée au chef de département." }, { status: 403 });
  }

  const fiche = await prisma.fiche.findUnique({ where: { id } });
  if (!fiche) {
    return Response.json({ erreur: "Fiche introuvable." }, { status: 404 });
  }

  if (fiche.statut !== "PRETE_A_SIGNER") {
    return Response.json(
      { erreur: "Cette fiche n'est pas au statut 'Prête à signer'." },
      { status: 400 }
    );
  }

  const ficheMiseAJour = await prisma.fiche.update({
    where: { id },
    data: {
      statut: "VALIDEE_ARCHIVEE",
      dateConfirmationArchivage: new Date(),
    },
  });

  await prisma.historiqueEvenement.create({
    data: {
      ficheId: fiche.id,
      auteurId: session.utilisateurId,
      typeEvenement: "CONFIRMATION_ARCHIVAGE",
      details: "Réception du document signé à la main confirmée par le chef de département.",
    },
  });

  return Response.json(ficheMiseAJour);
}
