// PATCH /api/utilisateurs/moi — permet à l'utilisateur connecté de modifier
// ses propres informations (nom, prénom, e-mail). Pas de gestion de rôle ici :
// ça reste une action de l'administrateur uniquement (voir /api/utilisateurs).

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ erreur: "Non connecté." }, { status: 401 });
  }

  const { nom, prenom, email } = await request.json();
  if (!nom || !prenom || !email) {
    return Response.json({ erreur: "Tous les champs sont obligatoires." }, { status: 400 });
  }

  const utilisateur = await prisma.utilisateur.update({
    where: { id: session.utilisateurId },
    data: { nom, prenom, email },
  });

  return Response.json(utilisateur);
}
