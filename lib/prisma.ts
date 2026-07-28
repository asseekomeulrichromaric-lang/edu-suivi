// Ce fichier crée UNE SEULE connexion à la base de données, réutilisée partout.
// Sans ça, chaque route API ouvrirait sa propre connexion, ce qui finirait par
// épuiser la base de données. C'est un fichier "utilitaire" que tu n'as jamais
// besoin de modifier — tu l'importes juste dans tes routes API.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
