import Link from "next/link";
import { prisma } from "@/lib/prisma";
import "@/app/(back-office)/styles/structure.css";

const LIBELLES_ROLE: Record<string, string> = {
  ADMINISTRATEUR: "Administrateur",
  CHEF_DEPARTEMENT: "Chef de département",
  ENSEIGNANT: "Enseignant",
  CHEF_CLASSE: "Chef de classe",
};

export default async function GestionUtilisateurs() {
  const utilisateurs = await prisma.utilisateur.findMany({
    include: { departement: true },
    orderBy: { nom: "asc" },
  });

  return (
    <div>
      <div className="personnel-header">
        <h1>Gestion du Personnel</h1>
        <p>Gestion centralisée des comptes utilisateurs et des rôles</p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Link href="/admin/utilisateurs/nouveau" className="add-button">
          + Nouvel Utilisateur
        </Link>
      </div>

      {utilisateurs.length === 0 ? (
        <div className="empty-message">
          Aucun utilisateur créé. Commencez par ajouter un utilisateur.
        </div>
      ) : (
        <div className="personnel-list">
          {utilisateurs.map((user) => (
            <div key={user.id} className="personnel-item">
              <div className="personnel-avatar">
                {user.prenom[0]}{user.nom[0]}
              </div>
              <div className="personnel-info">
                <h4>{user.prenom} {user.nom}</h4>
                <p>{LIBELLES_ROLE[user.role]} • {user.departement?.nom || "—"}</p>
              </div>
              <div className="personnel-actions">
                <Link href={`/admin/utilisateurs/${user.id}`} className="btn-mini">
                  Détails
                </Link>
                <Link href={`/admin/utilisateurs/${user.id}/modifier`} className="btn-mini">
                  Modifier
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <p style={{ fontSize: "12px", color: "var(--ardoise)", marginTop: "16px" }}>
        Affichage de {utilisateurs.length} membres du personnel
      </p>
    </div>
  );
}
