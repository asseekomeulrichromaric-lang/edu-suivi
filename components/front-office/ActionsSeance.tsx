"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Composant client (interactif) : les boutons Valider / Refuser d'une séance.
// Reçoit juste l'identifiant de la séance en props — c'est tout ce dont il a besoin.
export function ActionsSeance({ seanceId }: { seanceId: string }) {
  const router = useRouter();
  const [afficherMotif, setAfficherMotif] = useState(false);
  const [motif, setMotif] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function valider() {
    setEnCours(true);
    setErreur(null);
    const reponse = await fetch(`/api/seances/${seanceId}/valider`, { method: "POST" });
    setEnCours(false);
    if (!reponse.ok) {
      const data = await reponse.json();
      setErreur(data.erreur ?? "Erreur lors de la validation.");
      return;
    }
    router.refresh(); // recharge les données de la page sans recharger tout le navigateur
  }

  async function confirmerRefus() {
    if (motif.trim().length === 0) {
      setErreur("Le motif est obligatoire.");
      return;
    }
    setEnCours(true);
    setErreur(null);
    const reponse = await fetch(`/api/seances/${seanceId}/refuser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motif }),
    });
    setEnCours(false);
    if (!reponse.ok) {
      const data = await reponse.json();
      setErreur(data.erreur ?? "Erreur lors du refus.");
      return;
    }
    router.refresh();
  }

  if (afficherMotif) {
    return (
      <div style={{ marginTop: 10 }}>
        <textarea
          placeholder="Motif du refus (obligatoire)"
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          rows={2}
          style={{ width: "100%", marginBottom: 8, border: "1px solid var(--statut-refusee-fg)", borderRadius: 4, padding: 8, fontSize: 13, fontFamily: "var(--font-corps)" }}
        />
        {erreur && <p style={{ color: "var(--statut-refusee-fg)", fontSize: 13 }}>{erreur}</p>}
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-refuse" onClick={confirmerRefus} disabled={enCours}>
            Confirmer le refus
          </button>
          <button className="btn-valider" onClick={() => setAfficherMotif(false)}>
            Annuler
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button className="btn-valider" onClick={valider} disabled={enCours}>
        VALIDER
      </button>
      <button className="btn-refuse" onClick={() => setAfficherMotif(true)} disabled={enCours}>
        REFUSER
      </button>
      {erreur && <p style={{ color: "var(--statut-refusee-fg)", fontSize: 13, marginLeft: 8 }}>{erreur}</p>}
    </div>
  );
}
