import Link from "next/link";
import { getUtilisateurActuel } from "@/lib/utilisateur-connecte";
import "@/app/(front-office)/styles/layout.css";

export default async function FrontOfficeLayout({ children }: { children: React.ReactNode }) {
  const utilisateur = await getUtilisateurActuel();

  if (!utilisateur) return null;

  // Déterminer le lien actif en fonction du rôle
  const rolePaths: Record<string, string> = {
    CHEF_DE_CLASSE: "/chef-de-classe",
    ENSEIGNANT: "/enseignant",
    CHEF_DE_DEPARTEMENT: "/chef-de-departement",
    ADMINISTRATEUR: "/admin",
  };

  const cheminPrincipal = rolePaths[utilisateur.role] || "/";

  return (
    <div className="front-office-container">
      {/* Barre latérale */}
      <nav className="sidebar-front">
        <div className="logo-section">
          <div className="logo-icon">🎓</div>
          <div>
            <h3>EduSuivi</h3>
            <p>Portail Académique</p>
          </div>
        </div>

        <ul className="menu-principal">
          <li>
            <Link href={cheminPrincipal}>
              📊 Accueil
            </Link>
          </li>
          <li>
            <Link href="/fiches">
              📄 Fiches
            </Link>
          </li>

          {utilisateur.role === "CHEF_DE_CLASSE" && (
            <>
              <li>
                <Link href="/chef-de-classe">
                  📋 Tableau de bord
                </Link>
              </li>
            </>
          )}

          {utilisateur.role === "ENSEIGNANT" && (
            <>
              <li>
                <Link href="/enseignant">
                  ✓ Validations
                </Link>
              </li>
            </>
          )}

          {utilisateur.role === "CHEF_DE_DEPARTEMENT" && (
            <>
              <li>
                <Link href="/chef-de-departement">
                  📊 Tableau de bord
                </Link>
              </li>
              <li>
                <Link href="/affectations">
                  📌 Affectations
                </Link>
              </li>
            </>
          )}

          {utilisateur.role === "ADMINISTRATEUR" && (
            <>
              <li>
                <Link href="/admin">
                  ⚙️ Administration
                </Link>
              </li>
            </>
          )}
        </ul>

        <div className="user-profile">
          <Link href="/profil">
            👤 {utilisateur.prenom} {utilisateur.nom}
          </Link>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="main-content">{children}</main>
    </div>
  );
}
