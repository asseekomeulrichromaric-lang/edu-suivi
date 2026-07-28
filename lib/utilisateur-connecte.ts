// Petit helper qui combine "lire la session" (le cookie) et "aller chercher
// la fiche complète de l'utilisateur en base de données" (nom, prénom, etc.),
// pour ne pas avoir à répéter ces deux étapes dans chaque page.

import { prisma } from "./prisma";
import { getSession } from "./auth";

export async function getUtilisateurActuel() {
  const session = await getSession();
  if (!session) return null;
  return prisma.utilisateur.findUnique({ where: { id: session.utilisateurId } });
}
