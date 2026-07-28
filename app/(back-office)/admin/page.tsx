import Link from "next/link";
import { prisma } from "@/lib/prisma";
import "@/app/(back-office)/styles/admin.css";

export default async function AdminDashboard() {
  // Statistiques
  const totalUtilisateurs = await prisma.utilisateur.count();
  const totalDepartements = await prisma.departement.count();
  const totalFilieres = await prisma.filiere.count();
  const totalFiches = await prisma.fiche.count();
  
  // Fiches incomplètes
  const fichesIncompletes = await prisma.fiche.count({
    where: { statut: "INCOMPLETE" },
  });

  // Audit log (dernières actions)
  const auditLog = [
    { action: "Admin a modifié les permissions de Dr. Sylvie ONDO", timestamp: new Date(Date.now() - 3600000) },
    { action: "Système a sauvegardé automatiquement l'historique", timestamp: new Date(Date.now() - 7200000) },
    { action: "Admin a créé un nouvel utilisateur", timestamp: new Date(Date.now() - 86400000) },
  ];

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Gestion de l'Infrastructure</h1>
          <p>Contrôle centralisé des paramètres système et des comptes utilisateurs</p>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="stats-row">
        <div className="stat-card-admin">
          <h3>Total Utilisateurs</h3>
          <p className="value">{totalUtilisateurs}</p>
        </div>
        <div className="stat-card-admin">
          <h3>Départements</h3>
          <p className="value">{totalDepartements}</p>
        </div>
        <div className="stat-card-admin">
          <h3>Filières Actives</h3>
          <p className="value">{totalFilieres}</p>
        </div>
        <div className="stat-card-admin" style={{ borderTopColor: "var(--statut-refusee-fg)" }}>
          <h3>Fiches Incomplètes</h3>
          <p className="value" style={{ color: "var(--statut-refusee-fg)" }}>{fichesIncompletes}</p>
        </div>
      </div>

      {/* Section Gestion du Personnel */}
      <div className="content-section">
        <h2>
          Gestion du Personnel & Rôles
          <Link href="/admin/utilisateurs/nouveau" className="add-button">
            + Nouvel Utilisateur
          </Link>
        </h2>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Identité</th>
                <th>Rôle Principal</th>
                <th>Département</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Pr. Alain MOUNDOUNGA</td>
                <td>Chef de département</td>
                <td>Sciences Comptables</td>
                <td><span className="badge actif">Actif</span></td>
                <td><button className="action-link">Éditer</button></td>
              </tr>
              <tr>
                <td>Dr. Sylvie ONDO</td>
                <td>Enseignant</td>
                <td>Marketing & Digital</td>
                <td><span className="badge actif">Actif</span></td>
                <td><button className="action-link">Éditer</button></td>
              </tr>
              <tr>
                <td>Bertrand KOUMBA</td>
                <td>Administrateur</td>
                <td>Scolarité Centrale</td>
                <td><span className="badge suspendu">Suspendu</span></td>
                <td><button className="action-link">Éditer</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: "12px", color: "var(--ardoise)", marginTop: "12px" }}>
          Affichage de l'10 sur 142 membres du personnel
        </p>
      </div>

      {/* Section Structure Académique */}
      <div className="content-section">
        <h2>
          Structure Académique
          <Link href="/admin/structure" className="add-button">
            → Gérer
          </Link>
        </h2>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Département</th>
                <th>Filières</th>
                <th>Enseignants</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sciences Comptables</td>
                <td>4 Filières • 12 Enseignants</td>
                <td>5 actifs</td>
                <td><span className="badge actif">Actif</span></td>
              </tr>
              <tr>
                <td>Gestion Management</td>
                <td>3 Filières • 8 Enseignants</td>
                <td>3 actifs</td>
                <td><span className="badge actif">Actif</span></td>
              </tr>
              <tr>
                <td>Marketing & Digital</td>
                <td>2 Filières • 6 Enseignants</td>
                <td>2 actifs</td>
                <td><span className="badge actif">Actif</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Journal d'audit administratif */}
      <div className="content-section">
        <h2>Journal d'Audit Administratif</h2>
        <div>
          {auditLog.map((log, idx) => (
            <div key={idx} className="audit-log">
              <p>
                <strong>{log.action}</strong>
              </p>
              <p className="timestamp">
                {log.timestamp.toLocaleString("fr-FR")}
              </p>
            </div>
          ))}
          <Link href="/admin/audit" style={{ fontSize: "12px", color: "var(--encre)" }}>
            → Voir le log complet
          </Link>
        </div>
      </div>
    </div>
  );
}
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
