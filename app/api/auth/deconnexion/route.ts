// POST /api/auth/deconnexion — détruit la session (le cookie) et renvoie vers la page de connexion

import { detruireSession } from "@/lib/auth";

export async function POST() {
  await detruireSession();
  return Response.json({ message: "Déconnecté." });
}