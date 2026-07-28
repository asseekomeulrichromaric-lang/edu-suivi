"use client"; // obligatoire dès qu'on utilise useState/onClick dans Next.js App Router

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PageConnexion() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // empêche le rechargement de page par défaut d'un <form>
    setErreur(null);
    setEnCours(true);

    // C'est ici qu'on appelle l'API : on envoie un message à /api/auth/connexion
    const reponse = await fetch("/api/auth/connexion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, motDePasse }),
    });

    setEnCours(false);

    if (!reponse.ok) {
      const data = await reponse.json();
      setErreur(data.erreur ?? "Une erreur est survenue.");
      return;
    }

    const utilisateur = await reponse.json();

    // Redirection selon le rôle reçu
    const destinations: Record<string, string> = {
      ADMINISTRATEUR: "/admin",
      CHEF_DEPARTEMENT: "/chef-de-departement",
      ENSEIGNANT: "/enseignant",
      CHEF_CLASSE: "/chef-de-classe",
    };
    router.push(destinations[utilisateur.role] ?? "/");
  }

  return (
    <div style={{ maxWidth: 380, margin: "80px auto", padding: "0 16px" }}>
      <h1 style={{ textAlign: "center", fontSize: 26 }}>EduSuivi</h1>
      <p style={{ textAlign: "center", color: "var(--ardoise)", fontStyle: "italic" }}>
        « Le suivi pédagogique, sans papier ni oubli. »
      </p>

      <form onSubmit={handleSubmit} className="carte" style={{ marginTop: 24 }}>
        <div className="champ-formulaire">
          <label htmlFor="email">Adresse e-mail institutionnelle</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="p.nom@insg.ga"
            required
          />
        </div>

        <div className="champ-formulaire">
          <label htmlFor="motDePasse">Mot de passe</label>
          <input
            id="motDePasse"
            type="password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            required
          />
        </div>

        {erreur && <p style={{ color: "var(--statut-refusee-fg)", fontSize: 14 }}>{erreur}</p>}

        <button type="submit" className="bouton-principal" style={{ width: "100%" }} disabled={enCours}>
          {enCours ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
