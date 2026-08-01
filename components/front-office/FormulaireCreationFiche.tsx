"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AffectationOption = {
  id: string;
  matiere: { nom: string };
  niveau: { libelle: string };
  enseignant: { prenom: string; nom: string };
};

type Props = {
  affectations: AffectationOption[];
};

export function FormulaireCreationFiche({ affectations }: Props) {
  const router = useRouter();
  const [affectationId, setAffectationId] = useState("");
  const [volumeHorairePrevu, setVolumeHorairePrevu] = useState("30");
  const [dateLimiteSemestre, setDateLimiteSemestre] = useState("2026-06-30");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setEnCours(true);

    const reponse = await fetch("/api/fiches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        affectationId,
        volumeHorairePrevu,
        dateLimiteSemestre,
      }),
    });

    setEnCours(false);

    if (!reponse.ok) {
      const data = await reponse.json();
      setErreur(data.erreur ?? "Une erreur est survenue.");
      return;
    }

    const data = await reponse.json();
    router.push(`/fiches/${data.id}`);
    router.refresh();
  }

  if (affectations.length === 0) {
    return (
      <div className="carte" style={{ background: "#F7F5F0" }}>
        <p style={{ margin: 0, color: "var(--ardoise)" }}>
          Aucune affectation disponible pour le moment. Demandez au chef de département de créer une nouvelle affectation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="carte">
      <div className="champ-formulaire">
        <label htmlFor="affectation">Affectation concernée</label>
        <select
          id="affectation"
          value={affectationId}
          onChange={(e) => setAffectationId(e.target.value)}
          required
        >
          <option value="">— Choisir une matière —</option>
          {affectations.map((item) => (
            <option key={item.id} value={item.id}>
              {item.matiere.nom} • {item.niveau.libelle} • {item.enseignant.prenom} {item.enseignant.nom}
            </option>
          ))}
        </select>
      </div>

      <div className="champ-formulaire">
        <label htmlFor="volumeHoraire">Volume horaire prévu (heures)</label>
        <input
          id="volumeHoraire"
          type="number"
          min={1}
          value={volumeHorairePrevu}
          onChange={(e) => setVolumeHorairePrevu(e.target.value)}
          required
        />
      </div>

      <div className="champ-formulaire">
        <label htmlFor="dateLimite">Date limite du semestre</label>
        <input
          id="dateLimite"
          type="date"
          value={dateLimiteSemestre}
          onChange={(e) => setDateLimiteSemestre(e.target.value)}
          required
        />
      </div>

      {erreur && <p style={{ color: "var(--statut-refusee-fg)", fontSize: 14 }}>{erreur}</p>}

      <button type="submit" className="bouton-principal" disabled={enCours}>
        {enCours ? "Création..." : "Créer la fiche"}
      </button>
    </form>
  );
}
