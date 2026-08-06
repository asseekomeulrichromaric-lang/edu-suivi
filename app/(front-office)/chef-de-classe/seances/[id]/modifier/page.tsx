"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

function FormulaireModifierSeance() {
  const router = useRouter();
  const params = useParams();
  const seanceId = params.id as string;

  const [date, setDate] = useState("");
  const [heureDebut, setHeureDebut] = useState("08:00");
  const [heureFin, setHeureFin] = useState("10:00");
  const [contenu, setContenu] = useState("");
  const [motifRefus, setMotifRefus] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [chargement, setChargement] = useState(true);

  // Charger la séance existante
  useEffect(() => {
    async function chargerSeance() {
      try {
        const reponse = await fetch(`/api/seances/${seanceId}`);
        if (!reponse.ok) {
          const data = await reponse.json();
          setErreur(data.erreur ?? "Impossible de charger la séance.");
          setChargement(false);
          return;
        }
        const seance = await reponse.json();
        setDate(new Date(seance.date).toISOString().split("T")[0]);
        setHeureDebut(seance.heureDebut);
        setHeureFin(seance.heureFin);
        setContenu(seance.contenu);
        setMotifRefus(seance.motifRefus ?? "");
        setChargement(false);
      } catch {
        setErreur("Erreur réseau lors du chargement.");
        setChargement(false);
      }
    }
    chargerSeance();
  }, [seanceId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setEnCours(true);

    const reponse = await fetch(`/api/seances/${seanceId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, heureDebut, heureFin, contenu }),
    });

    setEnCours(false);

    if (!reponse.ok) {
      const data = await reponse.json();
      setErreur(data.erreur ?? "Une erreur est survenue.");
      return;
    }

    router.push("/chef-de-classe");
    router.refresh();
  }

  if (chargement) {
    return <p>Chargement de la séance...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="carte">
      {motifRefus && (
        <div
          style={{
            background: "var(--statut-refusee-bg)",
            borderLeft: "4px solid var(--statut-refusee-fg)",
            padding: "12px 16px",
            borderRadius: 6,
            marginBottom: 20,
          }}
        >
          <p style={{ margin: 0, fontSize: 13, color: "var(--statut-refusee-fg)", fontWeight: 600 }}>
            Motif du refus de l'enseignant :
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--encre)", fontStyle: "italic" }}>
            {motifRefus}
          </p>
        </div>
      )}

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
          {enCours ? "Envoi..." : "Enregistrer les modifications"}
        </button>
        <button type="button" className="bouton-secondaire" onClick={() => router.back()}>
          Annuler
        </button>
      </div>
    </form>
  );
}

export default function ModifierSeancePage() {
  return (
    <div style={{ maxWidth: 560, margin: "40px auto", padding: "0 16px" }}>
      <h1>Modifier la séance</h1>
      <Suspense fallback={<p>Chargement...</p>}>
        <FormulaireModifierSeance />
      </Suspense>
    </div>
  );
}