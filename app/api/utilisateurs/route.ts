// GET /api/utilisateurs — liste (réservé à l'administrateur)
// POST /api/utilisateurs — création d'un compte (réservé à l'administrateur)

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { estAdministrateur } from "@/lib/permissions";
import { hashMotDePasse } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || !estAdministrateur(session.role)) {
    return Response.json({ erreur: "Action réservée à l'administrateur." }, { status: 403 });
  }

  const utilisateurs = await prisma.utilisateur.findMany({
    include: { departement: true },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(utilisateurs);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !estAdministrateur(session.role)) {
    return Response.json({ erreur: "Action réservée à l'administrateur." }, { status: 403 });
  }

  const { nom, prenom, email, motDePasse, role, departementId } = await request.json();

  const rolesValides = ["ADMINISTRATEUR", "CHEF_DEPARTEMENT", "ENSEIGNANT", "CHEF_CLASSE"];
  if (!nom || !prenom || !email || !motDePasse || !rolesValides.includes(role)) {
    return Response.json({ erreur: "Champs manquants ou rôle invalide." }, { status: 400 });
  }

  const emailExistant = await prisma.utilisateur.findUnique({ where: { email } });
  if (emailExistant) {
    return Response.json({ erreur: "Cet e-mail est déjà utilisé." }, { status: 409 });
  }

  const motDePasseHash = await hashMotDePasse(motDePasse);

  const utilisateur = await prisma.utilisateur.create({
    data: { nom, prenom, email, motDePasseHash, role, departementId: departementId || null },
  });

  return Response.json(utilisateur, { status: 201 });
}
