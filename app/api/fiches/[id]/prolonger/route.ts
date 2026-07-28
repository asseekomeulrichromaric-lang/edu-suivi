// POST /api/fiches/[id]/prolonger
// Le chef de département accorde un délai supplémentaire : la fiche redevient
// EN_COURS avec une nouvelle date limite de semestre.

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { estChefDeDepartement } from "@/lib/permissions";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getSession();
  if (!session || !estChefDeDepartement(session.role)) {
    return Response.json({ erreur: "Action réservée au chef de département." }, { status: 403 });
  }

  const { nouvelleDateLimite } = await request.json();
  if (!nouvelleDateLimite) {
    return Response.json({ erreur: "La nouvelle date limite est obligatoire." }, { status: 400 });
  }

  const fiche = await prisma.fiche.findUnique({ where: { id } });
  if (!fiche || fiche.statut !== "INCOMPLETE") {
    return Response.json({ erreur: "Cette fiche n'est pas au statut Incomplète." }, { status: 400 });
  }

  const ficheMiseAJour = await prisma.fiche.update({
    where: { id },
    data: { statut: "EN_COURS", dateLimiteSemestre: new Date(nouvelleDateLimite) },
  });

  await prisma.historiqueEvenement.create({
    data: {
      ficheId: id,
      auteurId: session.utilisateurId,
      typeEvenement: "PROLONGATION",
      details: `Nouvelle échéance : ${nouvelleDateLimite}`,
    },
  });

  return Response.json(ficheMiseAJour);
}
