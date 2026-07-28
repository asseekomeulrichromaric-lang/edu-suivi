import Link from "next/link";
import { prisma } from "@/lib/prisma";

const LIBELLES_ROLE: Record<string, string> = {
  ADMINISTRATEUR: "Administrateur",
  CHEF_DEPARTEMENT: "Chef de département",
  ENSEIGNANT: "Enseignant",
  CHEF_CLASSE: "Chef de classe",
};

export default async function GestionUtilisateursPage() {
  const utilisateurs = await prisma.utilisateur.findMany({
    include: { departement: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Gestion des utilisateurs</h1>
        <Link href="/admin/utilisateurs/nouveau" className="bouton-principal">
          + Nouvel utilisateur
        </Link>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
        <thead>
          <tr style={{ background: "var(--encre)", color: "white", textAlign: "left" }}>
            <th style={{ padding: 10 }}>Nom</th>
            <th style={{ padding: 10 }}>E-mail</th>
            <th style={{ padding: 10 }}>Rôle</th>
            <th style={{ padding: 10 }}>Département</th>
          </tr>
        </thead>
        <tbody>
          {utilisateurs.map((u) => (
            <tr key={u.id} style={{ borderBottom: "1px solid #e5e3dc" }}>
              <td style={{ padding: 10 }}>{u.prenom} {u.nom}</td>
              <td style={{ padding: 10 }} className="reference-mono">{u.email}</td>
              <td style={{ padding: 10 }}>{LIBELLES_ROLE[u.role]}</td>
              <td style={{ padding: 10 }}>{u.departement?.nom ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
