import { prisma } from "@/lib/prisma";

export default async function TableauDeBordAdmin() {
  const [totalUtilisateurs, totalDepartements, totalFilieres, totalFiches] = await Promise.all([
    prisma.utilisateur.count(),
    prisma.departement.count(),
    prisma.filiere.count(),
    prisma.fiche.count(),
  ]);

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px" }}>
      <h1>Panneau d'administration</h1>
      <p style={{ color: "var(--ardoise)" }}>Vue d'ensemble de la plateforme EduSuivi.</p>

      <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
        <div className="carte" style={{ flex: 1 }}>
          <p style={{ color: "var(--ardoise)", fontSize: 13, margin: 0 }}>Utilisateurs</p>
          <p style={{ fontSize: 24, margin: "4px 0" }}>{totalUtilisateurs}</p>
        </div>
        <div className="carte" style={{ flex: 1 }}>
          <p style={{ color: "var(--ardoise)", fontSize: 13, margin: 0 }}>Départements</p>
          <p style={{ fontSize: 24, margin: "4px 0" }}>{totalDepartements}</p>
        </div>
        <div className="carte" style={{ flex: 1 }}>
          <p style={{ color: "var(--ardoise)", fontSize: 13, margin: 0 }}>Filières</p>
          <p style={{ fontSize: 24, margin: "4px 0" }}>{totalFilieres}</p>
        </div>
        <div className="carte" style={{ flex: 1 }}>
          <p style={{ color: "var(--ardoise)", fontSize: 13, margin: 0 }}>Fiches</p>
          <p style={{ fontSize: 24, margin: "4px 0" }}>{totalFiches}</p>
        </div>
      </div>
    </div>
  );
}
