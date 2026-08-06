// GET /api/utilisateurs/[id] — détails d'un compte (réservé à l'administrateur)
// PATCH /api/utilisateurs/[id] — modification des informations d'un utilisateur (réservé à l'administrateur)
// DELETE /api/utilisateurs/[id] — suppression d'un compte (réservé à l'administrateur)

import { prisma } from "@/lib/prisma";
import { getSession, hashMotDePasse } from "@/lib/auth";
import { estAdministrateur } from "@/lib/permissions";
import { Prisma } from "@prisma/client";

// Next.js 16 : les paramètres dynamiques sont fournis sous forme de Promise
type ContexteRoute = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: ContexteRoute) {
  const session = await getSession();
  if (!session || !estAdministrateur(session.role)) {
    return Response.json({ erreur: "Action réservée à l'administrateur." }, { status: 403 });
  }

  const { id } = await params;

  const utilisateur = await prisma.utilisateur.findUnique({
    where: { id },
    include: { departement: true },
  });

  if (!utilisateur) {
    return Response.json({ erreur: "Utilisateur introuvable." }, { status: 404 });
  }

  return Response.json(utilisateur);
}

export async function PATCH(request: Request, { params }: ContexteRoute) {
  const session = await getSession();
  if (!session || !estAdministrateur(session.role)) {
    return Response.json({ erreur: "Action réservée à l'administrateur." }, { status: 403 });
  }

  const { id } = await params;

  const utilisateurExistant = await prisma.utilisateur.findUnique({ where: { id } });
  if (!utilisateurExistant) {
    return Response.json({ erreur: "Utilisateur introuvable." }, { status: 404 });
  }

  const { nom, prenom, email, role, departementId, motDePasse } = await request.json();

  // On construit l'objet "data" uniquement avec les champs fournis
  const data: Prisma.UtilisateurUpdateInput = {};

  if (nom !== undefined) {
    if (!nom.trim()) {
      return Response.json({ erreur: "Le nom ne peut pas être vide." }, { status: 400 });
    }
    data.nom = nom.trim();
  }

  if (prenom !== undefined) {
    if (!prenom.trim()) {
      return Response.json({ erreur: "Le prénom ne peut pas être vide." }, { status: 400 });
    }
    data.prenom = prenom.trim();
  }

  if (email !== undefined) {
    if (!email.trim()) {
      return Response.json({ erreur: "L'e-mail ne peut pas être vide." }, { status: 400 });
    }
    const emailNormalise = email.trim().toLowerCase();

    const emailExistant = await prisma.utilisateur.findUnique({ where: { email: emailNormalise } });
    if (emailExistant && emailExistant.id !== id) {
      return Response.json({ erreur: "Cet e-mail est déjà utilisé." }, { status: 409 });
    }

    data.email = emailNormalise;
  }

  if (role !== undefined) {
    const rolesValides = ["ADMINISTRATEUR", "CHEF_DEPARTEMENT", "ENSEIGNANT", "CHEF_CLASSE"];
    if (!rolesValides.includes(role)) {
      return Response.json({ erreur: "Rôle invalide." }, { status: 400 });
    }
    data.role = role;
  }

  if (departementId !== undefined) {
    if (departementId === "") {
      // Utiliser "disconnect" pour retirer le département (FK = null)
      data.departement = { disconnect: true };
    } else {
      const departement = await prisma.departement.findUnique({ where: { id: departementId } });
      if (!departement) {
        return Response.json({ erreur: "Département introuvable." }, { status: 400 });
      }
      // Utiliser "connect" pour associer le département
      data.departement = { connect: { id: departementId } };
    }
  }

  if (motDePasse !== undefined && motDePasse !== "") {
    if (motDePasse.length < 6) {
      return Response.json({ erreur: "Le mot de passe doit contenir au moins 6 caractères." }, { status: 400 });
    }
    data.motDePasseHash = await hashMotDePasse(motDePasse);
  }

  // Aucun champ fourni → rien à mettre à jour
  if (Object.keys(data).length === 0) {
    return Response.json({ erreur: "Aucune information à mettre à jour." }, { status: 400 });
  }

  const utilisateur = await prisma.utilisateur.update({
    where: { id },
    data,
    include: { departement: true },
  });

  return Response.json(utilisateur);
}

export async function DELETE(_request: Request, { params }: ContexteRoute) {
  const session = await getSession();
  if (!session || !estAdministrateur(session.role)) {
    return Response.json({ erreur: "Action réservée à l'administrateur." }, { status: 403 });
  }

  const { id } = await params;

  // Empêcher l'administrateur de supprimer son propre compte
  if (session.utilisateurId === id) {
    return Response.json({ erreur: "Vous ne pouvez pas supprimer votre propre compte." }, { status: 400 });
  }

  const utilisateurExistant = await prisma.utilisateur.findUnique({ where: { id } });
  if (!utilisateurExistant) {
    return Response.json({ erreur: "Utilisateur introuvable." }, { status: 404 });
  }

  await prisma.utilisateur.delete({ where: { id } });

  return Response.json({ message: "Utilisateur supprimé." });
}