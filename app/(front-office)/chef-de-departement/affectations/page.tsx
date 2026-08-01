import Link from "next/link";
import { FiArrowLeft, FiPlusCircle, FiBookOpen } from "react-icons/fi";
import { prisma } from "@/lib/prisma";
import { getUtilisateurActuel } from "@/lib/utilisateur-connecte";

export default async function ListeAffectationsPage() {
  const utilisateur = await getUtilisateurActuel();
  if (!utilisateur || !utilisateur.departementId) return null;

  const affectations = await prisma.affectationPedagogique.findMany({
    where: { matiere: { departementId: utilisateur.departementId } },
    include: {
      matiere: true,
      niveau: true,
      enseignant: true,
      fiche: true,
    },
    orderBy: { anneeAcademique: "desc" },
  });

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", padding: "0 16px" }}>
      <Link href="/chef-de-departement" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16, color: "var(--encre)" }}>
        <FiArrowLeft /> Retour au tableau de bord
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1><FiBookOpen /> Liste des affectations</h1>
          <p style={{ color: "var(--ardoise)", margin: 0 }}>Toutes les affectations pédagogiques de votre département</p>
        </div>
        <Link href="/chef-de-departement/affectations/nouvelle" className="bouton-principal">
          <FiPlusCircle /> Nouvelle affectation
        </Link>
      </div>

      {affectations.length === 0 ? (
        <div className="carte">
          <p style={{ margin: 0, color: "var(--ardoise)" }}>Aucune affectation enregistrée pour le moment.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {affectations.map((affectation) => (
            <div key={affectation.id} className="carte" style={{ borderLeft: "4px solid var(--statut-validee-fg)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div>
                  <h3 style={{ margin: "0 0 6px" }}>{affectation.matiere.nom}</h3>
                  <p style={{ margin: "2px 0", color: "var(--ardoise)" }}>
                    Niveau : {affectation.niveau.libelle} • Année : {affectation.anneeAcademique}
                  </p>
                  <p style={{ margin: "2px 0", color: "var(--ardoise)" }}>
                    Enseignant : {affectation.enseignant.prenom} {affectation.enseignant.nom}
                  </p>
                  <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--ardoise)" }}>
                    Statut : {affectation.fiche ? "Fiche associée" : "Aucune fiche"}
                  </p>
                </div>
                <span className="badge" style={{ background: "#E6F1FB", color: "var(--statut-validee-fg)", padding: "6px 10px", borderRadius: 999 }}>
                  {affectation.fiche ? "Active" : "En attente"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
