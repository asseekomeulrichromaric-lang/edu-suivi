import Link from "next/link";
import { FiBookOpen, FiFileText, FiClipboard, FiCheckCircle, FiSettings, FiUser, FiLayers, FiBarChart2 } from "react-icons/fi";
import { getUtilisateurActuel } from "@/lib/utilisateur-connecte";
import "@/app/(front-office)/styles/layout.css";

export default async function FrontOfficeLayout({ children }: { children: React.ReactNode }) {
  const utilisateur = await getUtilisateurActuel();

  if (!utilisateur) return null;

  // Déterminer le lien actif en fonction du rôle
  const rolePaths: Record<string, string> = {
    CHEF_CLASSE: "/chef-de-classe",
    ENSEIGNANT: "/enseignant",
    CHEF_DEPARTEMENT: "/chef-de-departement",
    ADMINISTRATEUR: "/admin",
  };

  const cheminPrincipal = rolePaths[utilisateur.role] || "/";

  return (
    <div className="front-office-container">
      {/* Barre latérale */}
      <nav className="sidebar-front">
        <div className="logo-section">
          <div className="logo-icon"><FiBookOpen /></div>
          <div>
            <h3>EduSuivi</h3>
            <p>Portail Académique</p>
          </div>
        </div>

        <ul className="menu-principal">
          <li>
            <Link href={cheminPrincipal}>
              <FiBarChart2 /> Accueil
            </Link>
          </li>
          <li>
            <Link href="/fiches">
              <FiFileText /> Fiches
            </Link>
          </li>

          {utilisateur.role === "CHEF_CLASSE" && (
            <>
              <li>
                <Link href="/chef-de-classe">
                  <FiClipboard /> Tableau de bord
                </Link>
              </li>
            </>
          )}

          {utilisateur.role === "ENSEIGNANT" && (
            <>
              <li>
                <Link href="/enseignant">
                  <FiCheckCircle /> Validations
                </Link>
              </li>
            </>
          )}

          {utilisateur.role === "CHEF_DEPARTEMENT" && (
            <>
              <li>
                <Link href="/chef-de-departement">
                  <FiBarChart2 /> Tableau de bord
                </Link>
              </li>
              <li>
                <Link href="/chef-de-departement/affectations">
                  <FiLayers /> Affectations
                </Link>
              </li>
            </>
          )}

          {utilisateur.role === "ADMINISTRATEUR" && (
            <>
              <li>
                <Link href="/admin">
                  <FiSettings /> Administration
                </Link>
              </li>
            </>
          )}
        </ul>

        <div className="user-profile">
          <Link href="/profil">
            <FiUser /> {utilisateur.prenom} {utilisateur.nom}
          </Link>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="main-content">{children}</main>
    </div>
  );
}
