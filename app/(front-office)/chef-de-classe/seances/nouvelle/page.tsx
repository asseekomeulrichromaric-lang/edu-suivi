"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function FormulaireNouvelleSeance() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ficheId = searchParams.get("ficheId") ?? "";

  const [date, setDate] = useState("");
  const [heureDebut, setHeureDebut] = useState("08:00");
  const [heureFin, setHeureFin] = useState("10:00");
  const [contenu, setContenu] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setEnCours(true);

    const reponse = await fetch("/api/seances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ficheId, date, heureDebut, heureFin, contenu }),
    });

    setEnCours(false);

    if (!reponse.ok) {
      const data = await reponse.json();
      setErreur(data.erreur ?? "Une erreur est survenue.");
      return;
    }

    router.push("/chef-de-classe");
    router.refresh(); // force la page de destination à recharger ses données
  }

  if (!ficheId) {
    return (
      <p style={{ color: "var(--statut-refusee-fg)" }}>
        Aucune fiche sélectionnée. Reviens au tableau de bord et clique sur « Enregistrer une
        séance » depuis une fiche.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="carte">
      <p className="reference-mono" style={{ color: "var(--ardoise)", fontSize: 12 }}>
        Fiche : {ficheId}
      </p>

      <div className="champ-formulaire">
        <label htmlFor="date">Date de la séance</label>
        <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        <div className="champ-formulaire" style={{ flex: 1 }}>
          <label htmlFor="heureDebut">Heure de début</label>
          <input
            id="heureDebut"
            type="time"
            value={heureDebut}
            onChange={(e) => setHeureDebut(e.target.value)}
            required
          />
        </div>
        <div className="champ-formulaire" style={{ flex: 1 }}>
          <label htmlFor="heureFin">Heure de fin</label>
          <input id="heureFin" type="time" value={heureFin} onChange={(e) => setHeureFin(e.target.value)} required />
        </div>
      </div>

      <div className="champ-formulaire">
        <label htmlFor="contenu">Contenu de la séance</label>
        <textarea
          id="contenu"
          rows={5}
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          placeholder="Chapitres abordés, exercices, points importants..."
          required
        />
      </div>

      {erreur && <p style={{ color: "var(--statut-refusee-fg)", fontSize: 14 }}>{erreur}</p>}

      <div style={{ display: "flex", gap: 12 }}>
        <button type="submit" className="bouton-principal" disabled={enCours}>
          {enCours ? "Envoi..." : "Envoyer pour validation"}
        </button>
        <button type="button" className="bouton-secondaire" onClick={() => router.back()}>
          Annuler
        </button>
      </div>
    </form>
  );
}

export default function NouvelleSeancePage() {
  return (
    <div style={{ maxWidth: 560, margin: "40px auto", padding: "0 16px" }}>
      <h1>Enregistrer une séance</h1>
      {/* Suspense est requis par Next.js car useSearchParams lit l'URL, qu'on ne
          connaît qu'une fois arrivé dans le navigateur */}
      <Suspense fallback={<p>Chargement...</p>}>
        <FormulaireNouvelleSeance />
      </Suspense>
    </div>
  );
}
