// POST /api/fiches/[id]/cloturer
// Le chef de département clôture définitivement une fiche INCOMPLETE, avec
// une justification obligatoire (ex : jours fériés, grève...).

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { estChefDeDepartement } from "@/lib/permissions";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getSession();
  if (!session || !estChefDeDepartement(session.role)) {
    return Response.json({ erreur: "Action réservée au chef de département." }, { status: 403 });
  }

  const { justification } = await request.json();
  if (!justification || justification.trim().length === 0) {
    return Response.json({ erreur: "La justification est obligatoire." }, { status: 400 });
  }

  const fiche = await prisma.fiche.findUnique({ where: { id } });
  if (!fiche || fiche.statut !== "INCOMPLETE") {
    return Response.json({ erreur: "Cette fiche n'est pas au statut Incomplète." }, { status: 400 });
  }

  // On clôture la fiche : elle reste "INCOMPLETE" (elle ne sera jamais "VALIDEE_ARCHIVEE"
  // puisque le volume horaire n'a pas été atteint), mais on trace la décision définitive.
  await prisma.historiqueEvenement.create({
    data: {
      ficheId: id,
      auteurId: session.utilisateurId,
      typeEvenement: "CLOTURE_INCOMPLETE",
      details: justification,
    },
  });

  return Response.json({ succes: true });
}
