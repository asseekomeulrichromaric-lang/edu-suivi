"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Departement = { id: string; nom: string };

type UtilisateurInitial = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  departementId: string | null;
};

const ROLES = [
  { valeur: "ADMINISTRATEUR", libelle: "Administrateur" },
  { valeur: "CHEF_DEPARTEMENT", libelle: "Chef de département" },
  { valeur: "ENSEIGNANT", libelle: "Enseignant" },
  { valeur: "CHEF_CLASSE", libelle: "Chef de classe" },
];

export function FormulaireModifierUtilisateur({
  utilisateur,
  departements,
}: {
  utilisateur: UtilisateurInitial;
  departements: Departement[];
}) {
  const router = useRouter();
  const [nom, setNom] = useState(utilisateur.nom);
  const [prenom, setPrenom] = useState(utilisateur.prenom);
  const [email, setEmail] = useState(utilisateur.email);
  const [role, setRole] = useState(utilisateur.role);
  const [departementId, setDepartementId] = useState(utilisateur.departementId ?? "");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setMessage(null);
    setEnCours(true);

    // On n'envoie le mot de passe que si l'administrateur a saisi un nouveau
    const corps: Record<string, string | null> = {
      nom,
      prenom,
      email,
      role,
      departementId: departementId || null,
    };
    if (motDePasse) {
      corps.motDePasse = motDePasse;
    }

    const reponse = await fetch(`/api/utilisateurs/${utilisateur.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corps),
    });

    setEnCours(false);
    if (!reponse.ok) {
      const data = await reponse.json();
      setErreur(data.erreur ?? "Une erreur est survenue.");
      return;
    }

    setMessage("Informations mises à jour.");
    setMotDePasse("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="carte">
      <div className="form-row">
        <div className="champ-formulaire">
          <label htmlFor="prenom">Prénom</label>
          <input id="prenom" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
        </div>
        <div className="champ-formulaire">
          <label htmlFor="nom">Nom</label>
          <input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
        </div>
      </div>

      <div className="champ-formulaire">
        <label htmlFor="email">E-mail</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>

      <div className="form-row">
        <div className="champ-formulaire">
          <label htmlFor="role">Rôle</label>
          <select id="role" value={role} onChange={(e) => setRole(e.target.value)} required>
            {ROLES.map((r) => (
              <option key={r.valeur} value={r.valeur}>{r.libelle}</option>
            ))}
          </select>
        </div>
        <div className="champ-formulaire">
          <label htmlFor="departement">Département</label>
          <select id="departement" value={departementId} onChange={(e) => setDepartementId(e.target.value)}>
            <option value="">— Aucun —</option>
            {departements.map((d) => (
              <option key={d.id} value={d.id}>{d.nom}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="champ-formulaire">
        <label htmlFor="motDePasse">Nouveau mot de passe (optionnel)</label>
        <input
          id="motDePasse"
          type="password"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          placeholder="Laisser vide pour ne pas changer"
          minLength={6}
        />
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--ardoise)" }}>
          Minimum 6 caractères. Laissez vide pour conserver le mot de passe actuel.
        </p>
      </div>

      {message && <p style={{ color: "var(--statut-archivee-fg)", fontSize: 14 }}>{message}</p>}
      {erreur && <p style={{ color: "var(--statut-refusee-fg)", fontSize: 14 }}>{erreur}</p>}

      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <button type="submit" className="bouton-principal" disabled={enCours}>
          {enCours ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
        <a
          href={`/admin/utilisateurs/${utilisateur.id}`}
          className="bouton-secondaire"
          style={{ textDecoration: "none", display: "inline-block" }}
        >
          Annuler
        </a>
      </div>
    </form>
  );
}