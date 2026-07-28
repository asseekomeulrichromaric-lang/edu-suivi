import { getUtilisateurActuel } from "@/lib/utilisateur-connecte";
import { FormulaireProfil } from "./FormulaireProfil";

const LIBELLES_ROLE: Record<string, string> = {
  ADMINISTRATEUR: "Administrateur",
  CHEF_DEPARTEMENT: "Chef de département",
  ENSEIGNANT: "Enseignant",
  CHEF_CLASSE: "Chef de classe",
};

export default async function ProfilPage() {
  const utilisateur = await getUtilisateurActuel();
  if (!utilisateur) return null;

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: "0 16px" }}>
      <h1>Mon profil</h1>
      <p style={{ color: "var(--ardoise)" }}>{LIBELLES_ROLE[utilisateur.role]}</p>
      <FormulaireProfil nom={utilisateur.nom} prenom={utilisateur.prenom} email={utilisateur.email} />
    </div>
  );
}
