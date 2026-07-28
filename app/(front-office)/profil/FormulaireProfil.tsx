"use client";

import { useState } from "react";

type Props = { nom: string; prenom: string; email: string };

export function FormulaireProfil({ nom: nomInitial, prenom: prenomInitial, email: emailInitial }: Props) {
  const [nom, setNom] = useState(nomInitial);
  const [prenom, setPrenom] = useState(prenomInitial);
  const [email, setEmail] = useState(emailInitial);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setMessage(null);
    setEnCours(true);

    const reponse = await fetch("/api/utilisateurs/moi", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom, prenom, email }),
    });

    setEnCours(false);
    if (!reponse.ok) {
      const data = await reponse.json();
      setErreur(data.erreur ?? "Une erreur est survenue.");
      return;
    }
    setMessage("Profil mis à jour.");
  }

  return (
    <form onSubmit={handleSubmit} className="carte" style={{ marginTop: 20 }}>
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

      {message && <p style={{ color: "var(--statut-archivee-fg)", fontSize: 14 }}>{message}</p>}
      {erreur && <p style={{ color: "var(--statut-refusee-fg)", fontSize: 14 }}>{erreur}</p>}

      <button type="submit" className="bouton-principal" disabled={enCours}>
        {enCours ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
