// Petites fonctions qui répondent juste "oui" ou "non" à une question de droit d'accès.
// On les utilise dans les routes API et le middleware pour éviter de dupliquer
// des "if (role === ...)" partout dans le code.
//
// NOTE : on utilise ici le type "string" plutôt que le type "Role" généré par
// Prisma, pour que ce fichier n'ait pas besoin que la base de données soit déjà
// connectée pour être compilé — plus simple à ce stade du projet.

export type RoleUtilisateur =
  | "ADMINISTRATEUR"
  | "CHEF_DEPARTEMENT"
  | "ENSEIGNANT"
  | "CHEF_CLASSE";

export function estAdministrateur(role: string): boolean {
  return role === "ADMINISTRATEUR";
}

export function estChefDeDepartement(role: string): boolean {
  return role === "CHEF_DEPARTEMENT";
}

export function estEnseignant(role: string): boolean {
  return role === "ENSEIGNANT";
}

export function estChefDeClasse(role: string): boolean {
  return role === "CHEF_CLASSE";
}

// Le back-office (gestion de la plateforme) est réservé à l'administrateur.
export function peutAccederBackOffice(role: string): boolean {
  return estAdministrateur(role);
}
