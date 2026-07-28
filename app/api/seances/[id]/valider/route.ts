// POST /api/seances/[id]/valider — appelée quand l'enseignant clique "Valider"
// Le [id] dans le nom du dossier veut dire que cette route s'adapte à n'importe quel
// identifiant de séance : /api/seances/abc123/valider, /api/seances/xyz999/valider, etc.

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { estEnseignant } from "@/lib/permissions";
import { calculerDureeHeures, volumeHoraireAtteint } from "@/lib/volume-horaire";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; // depuis Next.js 15+, params est une Promise à "dérouler"

  const session = await getSession();
  if (!session || !estEnseignant(session.role as any)) {
    return Response.json({ erreur: "Action réservée à l'enseignant." }, { status: 403 });
  }

  const seance = await prisma.seance.findUnique({
    where: { id },
    include: { fiche: true },
  });
  if (!seance) {
    return Response.json({ erreur: "Séance introuvable." }, { status: 404 });
  }

  const dureeSeance = calculerDureeHeures(seance.heureDebut, seance.heureFin);
  const nouveauVolumeRealise = seance.fiche.volumeHoraireRealise + dureeSeance;
  const estComplete = volumeHoraireAtteint(nouveauVolumeRealise, seance.fiche.volumeHorairePrevu);

  // On fait les trois mises à jour (séance + fiche + historique) comme une seule opération
  // atomique : soit tout réussit, soit rien n'est appliqué.
  const [seanceMiseAJour] = await prisma.$transaction([
    prisma.seance.update({
      where: { id },
      data: { statut: "VALIDEE" },
    }),
    prisma.fiche.update({
      where: { id: seance.ficheId },
      data: {
        volumeHoraireRealise: nouveauVolumeRealise,
        statut: estComplete ? "PRETE_A_SIGNER" : seance.fiche.statut,
      },
    }),
    prisma.historiqueEvenement.create({
      data: {
        ficheId: seance.ficheId,
        seanceId: seance.id,
        auteurId: session.utilisateurId,
        typeEvenement: "VALIDATION_SEANCE",
        details: `Séance validée, +${dureeSeance}h.`,
      },
    }),
  ]);

  return Response.json(seanceMiseAJour);
}
