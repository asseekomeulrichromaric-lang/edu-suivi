// Ce fichier s'exécute AVANT chaque page, automatiquement (Next.js le détecte
// grâce à son nom "middleware.ts" à la racine de src/). C'est le "videur à
// l'entrée" : il vérifie les droits avant même que la page ne s'affiche.
//
// NOTE TECHNIQUE : le middleware tourne dans un environnement allégé ("Edge
// Runtime") qui n'a pas accès à next/headers de la même façon que les pages.
// On lit donc le cookie directement depuis "request.cookies", et on réutilise
// la fonction "verifierJeton" (compatible Edge Runtime) plutôt que "getSession".

import { NextRequest, NextResponse } from "next/server";
import { NOM_COOKIE, verifierJeton } from "@/lib/auth";
import { peutAccederBackOffice } from "@/lib/permissions";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Les pages publiques (connexion) ne demandent aucune vérification
  if (pathname.startsWith("/connexion")) {
    return NextResponse.next();
  }

  const jeton = request.cookies.get(NOM_COOKIE)?.value;
  const session = await verifierJeton(jeton);

  // Pas connecté du tout → on renvoie vers la page de connexion
  if (!session) {
    return NextResponse.redirect(new URL("/connexion", request.url));
  }

  // Zone back-office (administration) → réservée à l'administrateur
  if (pathname.startsWith("/admin") && !peutAccederBackOffice(session.role as any)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// On indique à Next.js sur quelles routes appliquer ce contrôle
// (on exclut les fichiers statiques et les routes API, qui gèrent leurs propres vérifications)
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
