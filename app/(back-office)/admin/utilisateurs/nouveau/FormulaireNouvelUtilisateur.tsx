"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Departement = { id: string; nom: string };

const ROLES = [
  { valeur: "ADMINISTRATEUR", libelle: "Administrateur" },
  { valeur: "CHEF_DEPARTEMENT", libelle: "Chef de département" },
  { valeur: "ENSEIGNANT", libelle: "Enseignant" },
  { valeur: "CHEF_CLASSE", libelle: "Chef de classe" },
];

export function FormulaireNouvelUtilisateur({ departements }: { departements: Departement[] }) {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [role, setRole] = useState("");
  const [departementId, setDepartementId] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setEnCours(true);

    const reponse = await fetch("/api/utilisateurs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom, prenom, email, motDePasse, role, departementId }),
    });

    setEnCours(false);
    if (!reponse.ok) {
      const data = await reponse.json();
      setErreur(data.erreur ?? "Une erreur est survenue.");
      return;
    }

    router.push("/admin/utilisateurs");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="carte">
      <div className="champ-formulaire">
        <label htmlFor="prenom">Prénom</label>
        <input id="prenom" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
      </div>
      <div className="champ-formulaire">
        <label htmlFor="nom">Nom</label>
        <input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
      </div>
      <div className="champ-formulaire">
        <label htmlFor="email">E-mail</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="champ-formulaire">
        <label htmlFor="motDePasse">Mot de passe temporaire</label>
        <input
          id="motDePasse"
          type="text"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          required
        />
      </div>
      <div className="champ-formulaire">
        <label htmlFor="role">Rôle</label>
        <select id="role" value={role} onChange={(e) => setRole(e.target.value)} required>
          <option value="">— Choisir —</option>
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

      {erreur && <p style={{ color: "var(--statut-refusee-fg)", fontSize: 14 }}>{erreur}</p>}

      <button type="submit" className="bouton-principal" disabled={enCours}>
        {enCours ? "Création..." : "Créer l'utilisateur"}
      </button>
    </form>
  );
}
