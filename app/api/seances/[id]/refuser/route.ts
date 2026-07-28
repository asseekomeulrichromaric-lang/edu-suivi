// POST /api/seances/[id]/refuser
// Différence importante avec "valider" : le volume horaire de la fiche N'EST PAS
// modifié ici, puisque la séance est rejetée.

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { estEnseignant } from "@/lib/permissions";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const session = await getSession();
  if (!session || !estEnseignant(session.role as any)) {
    return Response.json({ erreur: "Action réservée à l'enseignant." }, { status: 403 });
  }

  const { motif } = await request.json();

  // Le motif est obligatoire — c'est une règle explicite du cahier des charges.
  if (!motif || motif.trim().length === 0) {
    return Response.json({ erreur: "Le motif de refus est obligatoire." }, { status: 400 });
  }

  const seance = await prisma.seance.findUnique({ where: { id } });
  if (!seance) {
    return Response.json({ erreur: "Séance introuvable." }, { status: 404 });
  }

  const seanceMiseAJour = await prisma.seance.update({
    where: { id },
    data: { statut: "REFUSEE", motifRefus: motif },
  });

  await prisma.historiqueEvenement.create({
    data: {
      ficheId: seance.ficheId,
      seanceId: seance.id,
      auteurId: session.utilisateurId,
      typeEvenement: "REFUS_SEANCE",
      details: motif,
    },
  });

  return Response.json(seanceMiseAJour);
}
