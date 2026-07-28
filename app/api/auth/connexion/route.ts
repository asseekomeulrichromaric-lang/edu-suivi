// Cette route répond aux requêtes POST envoyées à /api/auth/connexion
// C'est ici qu'on vérifie qu'un email + mot de passe correspondent à un utilisateur existant.

import { prisma } from "@/lib/prisma";
import { verifierMotDePasse, creerSession } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, motDePasse } = await request.json();

  if (!email || !motDePasse) {
    return Response.json({ erreur: "Email et mot de passe requis." }, { status: 400 });
  }

  // On cherche l'utilisateur par son email
  const utilisateur = await prisma.utilisateur.findUnique({ where: { email } });

  if (!utilisateur) {
    // Message volontairement vague : on ne dit pas si c'est l'email ou le mot de passe qui est faux,
    // pour ne pas donner d'indice à quelqu'un qui essaierait de deviner un compte.
    return Response.json({ erreur: "Identifiants incorrects." }, { status: 401 });
  }

  const motDePasseValide = await verifierMotDePasse(motDePasse, utilisateur.motDePasseHash);
  if (!motDePasseValide) {
    return Response.json({ erreur: "Identifiants incorrects." }, { status: 401 });
  }

  // Tout est bon : on crée la session (le cookie signé)
  await creerSession({ utilisateurId: utilisateur.id, role: utilisateur.role });

  return Response.json({
    id: utilisateur.id,
    nom: utilisateur.nom,
    prenom: utilisateur.prenom,
    role: utilisateur.role,
  });
}
