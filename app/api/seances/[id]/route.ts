// PUT /api/seances/[id] — appelée quand le chef de classe modifie une séance refusée.
// La séance repasse en statut "EN_ATTENTE" pour que l'enseignant puisse la re-valider.

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { estChefDeClasse } from "@/lib/permissions";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const session = await getSession();
  if (!session || !estChefDeClasse(session.role as any)) {
    return Response.json({ erreur: "Action réservée au chef de classe." }, { status: 403 });
  }

  const seance = await prisma.seance.findUnique({
    where: { id },
    include: { fiche: true },
  });
  if (!seance || seance.fiche.chefClasseId !== session.utilisateurId) {
    return Response.json({ erreur: "Séance introuvable." }, { status: 404 });
  }

  return Response.json(seance);
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const session = await getSession();
  if (!session || !estChefDeClasse(session.role as any)) {
    return Response.json({ erreur: "Action réservée au chef de classe." }, { status: 403 });
  }

  const { date, heureDebut, heureFin, contenu } = await request.json();

  // Validation minimale des données
  if (!date || !heureDebut || !heureFin || !contenu) {
    return Response.json({ erreur: "Tous les champs sont obligatoires." }, { status: 400 });
  }

  // Vérifier que la séance existe et appartient bien à ce chef de classe
  const seance = await prisma.seance.findUnique({
    where: { id },
    include: { fiche: true },
  });
  if (!seance || seance.fiche.chefClasseId !== session.utilisateurId) {
    return Response.json({ erreur: "Séance introuvable." }, { status: 404 });
  }

  // Mettre à jour la séance : nouvelles données + retour au statut EN_ATTENTE
  const seanceMiseAJour = await prisma.seance.update({
    where: { id },
    data: {
      date: new Date(date),
      heureDebut,
      heureFin,
      contenu,
      statut: "EN_ATTENTE",
      motifRefus: null, // on efface le motif de refus puisqu'elle est corrigée
    },
  });

  // Tracer l'événement dans l'historique
  await prisma.historiqueEvenement.create({
    data: {
      ficheId: seance.ficheId,
      seanceId: seance.id,
      auteurId: session.utilisateurId,
      typeEvenement: "CREATION",
      details: `Séance modifiée après refus, renvoyée pour validation.`,
    },
  });

  return Response.json(seanceMiseAJour);
}