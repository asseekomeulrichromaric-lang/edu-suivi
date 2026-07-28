"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Types simples pour les listes reçues en props depuis la page serveur.
type Item = { id: string; nom?: string; libelle?: string; prenom?: string };

type Props = {
  matieres: Item[];
  niveaux: Item[];
  enseignants: Item[];
  chefsDeClasse: Item[];
};

export function FormulaireNouvelleAffectation({ matieres, niveaux, enseignants, chefsDeClasse }: Props) {
  const router = useRouter();
  const [matiereId, setMatiereId] = useState("");
  const [niveauId, setNiveauId] = useState("");
  const [enseignantId, setEnseignantId] = useState("");
  const [chefClasseId, setChefClasseId] = useState("");
  const [volumeHorairePrevu, setVolumeHorairePrevu] = useState("");
  const [dateLimiteSemestre, setDateLimiteSemestre] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setEnCours(true);

    const reponse = await fetch("/api/affectations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matiereId,
        niveauId,
        enseignantId,
        chefClasseId,
        volumeHorairePrevu,
        dateLimiteSemestre,
        anneeAcademique: "2025-2026",
      }),
    });

    setEnCours(false);
    if (!reponse.ok) {
      const data = await reponse.json();
      setErreur(data.erreur ?? "Une erreur est survenue.");
      return;
    }

    router.push("/chef-de-departement");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="carte">
      <div className="champ-formulaire">
        <label htmlFor="matiere">Matière</label>
        <select id="matiere" value={matiereId} onChange={(e) => setMatiereId(e.target.value)} required>
          <option value="">— Choisir —</option>
          {matieres.map((m) => (
            <option key={m.id} value={m.id}>{m.nom}</option>
          ))}
        </select>
      </div>

      <div className="champ-formulaire">
        <label htmlFor="niveau">Niveau</label>
        <select id="niveau" value={niveauId} onChange={(e) => setNiveauId(e.target.value)} required>
          <option value="">— Choisir —</option>
          {niveaux.map((n) => (
            <option key={n.id} value={n.id}>{n.libelle}</option>
          ))}
        </select>
      </div>

      <div className="champ-formulaire">
        <label htmlFor="enseignant">Enseignant référent</label>
        <select id="enseignant" value={enseignantId} onChange={(e) => setEnseignantId(e.target.value)} required>
          <option value="">— Choisir —</option>
          {enseignants.map((e) => (
            <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>
          ))}
        </select>
      </div>

      <div className="champ-formulaire">
        <label htmlFor="chefClasse">Chef de classe responsable</label>
        <select id="chefClasse" value={chefClasseId} onChange={(e) => setChefClasseId(e.target.value)} required>
          <option value="">— Choisir —</option>
          {chefsDeClasse.map((c) => (
            <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
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

      <div style={{ display: "flex", gap: 12 }}>
        <button type="submit" className="bouton-principal" disabled={enCours}>
          {enCours ? "Création..." : "Créer l'affectation et la fiche"}
        </button>
        <button type="button" className="bouton-secondaire" onClick={() => router.back()}>
          Annuler
        </button>
      </div>
    </form>
  );
}
