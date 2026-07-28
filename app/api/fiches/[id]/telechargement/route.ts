// POST /api/fiches/[id]/telechargement
// Appelée juste avant de générer le PDF à imprimer et signer à la main.
// Ne fait qu'enregistrer une trace — aucune signature n'est créée ici.

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const session = await getSession();
  if (!session) {
    return Response.json({ erreur: "Non connecté." }, { status: 401 });
  }

  const fiche = await prisma.fiche.findUnique({ where: { id } });
  if (!fiche) {
    return Response.json({ erreur: "Fiche introuvable." }, { status: 404 });
  }

  await prisma.fiche.update({
    where: { id },
    data: { dateTelechargementPdf: new Date() },
  });

  await prisma.historiqueEvenement.create({
    data: {
      ficheId: fiche.id,
      auteurId: session.utilisateurId,
      typeEvenement: "TELECHARGEMENT_PDF",
      details: "PDF téléchargé pour impression et signature manuscrite.",
    },
  });

  return Response.json({ succes: true });
}
