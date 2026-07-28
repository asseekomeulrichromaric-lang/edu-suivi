// POST /api/seances — appelée quand le chef de classe enregistre une séance.
// C'est LE fichier à relire si tu veux comprendre le trajet complet d'une action :
// 1. Le formulaire React envoie ces données avec fetch()
// 2. Cette fonction les reçoit, vérifie qu'elles sont valides
// 3. Prisma les écrit dans la base de données
// 4. On renvoie une réponse au formulaire

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { estChefDeClasse } from "@/lib/permissions";

export async function POST(request: Request) {
  const session = await getSession();

  // Étape 1 : est-on connecté, et avec le bon rôle ?
  if (!session || !estChefDeClasse(session.role as any)) {
    return Response.json({ erreur: "Action réservée au chef de classe." }, { status: 403 });
  }

  const { ficheId, date, heureDebut, heureFin, contenu } = await request.json();

  // Étape 2 : validation minimale des données reçues (jamais faire confiance au navigateur)
  if (!ficheId || !date || !heureDebut || !heureFin || !contenu) {
    return Response.json({ erreur: "Tous les champs sont obligatoires." }, { status: 400 });
  }

  // Étape 3 : on vérifie que la fiche existe et appartient bien à ce chef de classe
  const fiche = await prisma.fiche.findUnique({ where: { id: ficheId } });
  if (!fiche || fiche.chefClasseId !== session.utilisateurId) {
    return Response.json({ erreur: "Fiche introuvable." }, { status: 404 });
  }

  // Étape 4 : création de la séance, statut "en attente" par défaut
  const seance = await prisma.seance.create({
    data: {
      ficheId,
      date: new Date(date),
      heureDebut,
      heureFin,
      contenu,
      statut: "EN_ATTENTE",
    },
  });

  // Étape 5 : on trace l'événement dans l'historique (traçabilité demandée au cahier des charges)
  await prisma.historiqueEvenement.create({
    data: {
      ficheId,
      seanceId: seance.id,
      auteurId: session.utilisateurId,
      typeEvenement: "CREATION",
      details: `Séance du ${date} enregistrée.`,
    },
  });

  return Response.json(seance, { status: 201 });
}
