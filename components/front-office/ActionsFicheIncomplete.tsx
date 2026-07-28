"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ActionsFicheIncomplete({ ficheId }: { ficheId: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"repos" | "cloturer" | "prolonger">("repos");
  const [texte, setTexte] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function envoyer() {
    setEnCours(true);
    setErreur(null);

    const url = mode === "cloturer" ? `/api/fiches/${ficheId}/cloturer` : `/api/fiches/${ficheId}/prolonger`;
    const body = mode === "cloturer" ? { justification: texte } : { nouvelleDateLimite: texte };

    const reponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setEnCours(false);
    if (!reponse.ok) {
      const data = await reponse.json();
      setErreur(data.erreur ?? "Erreur.");
      return;
    }
    router.refresh();
    setMode("repos");
    setTexte("");
  }

  if (mode === "repos") {
    return (
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button className="bouton-secondaire" onClick={() => setMode("prolonger")}>
          Prolonger
        </button>
        <button
          className="bouton-secondaire"
          style={{ borderColor: "var(--statut-refusee-fg)", color: "var(--statut-refusee-fg)" }}
          onClick={() => setMode("cloturer")}
        >
          Clôturer
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 10 }}>
      {mode === "cloturer" ? (
        <textarea
          placeholder="Justification de la clôture (obligatoire)"
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          rows={2}
          style={{ width: "100%", marginBottom: 8 }}
        />
      ) : (
        <input
          type="date"
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          style={{ marginBottom: 8, display: "block" }}
        />
      )}
      {erreur && <p style={{ color: "var(--statut-refusee-fg)", fontSize: 13 }}>{erreur}</p>}
      <div style={{ display: "flex", gap: 8 }}>
        <button className="bouton-principal" onClick={envoyer} disabled={enCours || !texte}>
          Confirmer
        </button>
        <button className="bouton-secondaire" onClick={() => setMode("repos")}>
          Annuler
        </button>
      </div>
    </div>
  );
}
