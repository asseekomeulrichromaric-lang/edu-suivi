import Link from "next/link";
import { getUtilisateurActuel } from "@/lib/utilisateur-connecte";
import "@/app/(back-office)/styles/layout.css";

export default async function BackOfficeLayout({ children }: { children: React.ReactNode }) {
  const utilisateur = await getUtilisateurActuel();

  if (!utilisateur || utilisateur.role !== "ADMINISTRATEUR") {
    return <div>Accès refusé</div>;
  }

  return (
    <div className="back-office-container">
      {/* Barre latérale */}
      <nav className="sidebar-back">
        <div className="logo-section">
          <div className="logo-icon-back">⚙️</div>
          <div>
            <h3>EduSuivi</h3>
            <p>Administration</p>
          </div>
        </div>

        <ul className="menu-back">
          <li>
            <Link href="/admin">
              📊 Accueil
            </Link>
          </li>
          <li>
            <Link href="/admin/structure">
              🏢 Structure Académique
            </Link>
          </li>
          <li>
            <Link href="/admin/utilisateurs">
              👥 Gestion du Personnel
            </Link>
          </li>
        </ul>

        <div className="user-section">
          <Link href="/profil">
            👤 {utilisateur.prenom} {utilisateur.nom}
          </Link>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="main-content-back">{children}</main>
    </div>
  );
}
