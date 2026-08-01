// Page "serveur" : on va chercher en base les listes (matières, niveaux, enseignants,
// chefs de classe) pour remplir les menus déroulants, PUIS on affiche un formulaire
// "client" (interactif) pour la saisie et l'envoi.

import { FiBookOpen, FiPlusCircle } from "react-icons/fi";
import { prisma } from "@/lib/prisma";
import { getUtilisateurActuel } from "@/lib/utilisateur-connecte";
import { FormulaireNouvelleAffectation } from "./FormulaireNouvelleAffectation";

export default async function NouvelleAffectationPage() {
  const utilisateur = await getUtilisateurActuel();
  if (!utilisateur || !utilisateur.departementId) return null;

  const [matieres, niveaux, enseignants, chefsDeClasse] = await Promise.all([
    prisma.matiere.findMany({ where: { departementId: utilisateur.departementId } }),
    prisma.niveau.findMany({ where: { filiere: { departementId: utilisateur.departementId } } }),
    prisma.utilisateur.findMany({ where: { departementId: utilisateur.departementId, role: "ENSEIGNANT" } }),
    prisma.utilisateur.findMany({ where: { departementId: utilisateur.departementId, role: "CHEF_CLASSE" } }),
  ]);

  return (
    <div style={{ maxWidth: 560, margin: "40px auto", padding: "0 16px" }}>
      <h1><FiPlusCircle /> Nouvelle affectation pédagogique</h1>
      <p style={{ color: "var(--ardoise)" }}>
        <FiBookOpen /> Une fiche de suivi sera automatiquement créée pour cette affectation.
      </p>
      <FormulaireNouvelleAffectation
        matieres={matieres}
        niveaux={niveaux}
        enseignants={enseignants}
        chefsDeClasse={chefsDeClasse}
      />
    </div>
  );
}
