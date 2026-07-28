// Composant réutilisable : une barre de progression du volume horaire.
// Props reçus : le nombre d'heures réalisées et le nombre d'heures prévues.
type Props = {
  realise: number;
  prevu: number;
};

export function ProgressionVolumeHoraire({ realise, prevu }: Props) {
  const pourcentage = prevu > 0 ? Math.min(100, Math.round((realise / prevu) * 100)) : 0;
  const couleur = pourcentage >= 100 ? "var(--statut-archivee-fg)" : "var(--encre)";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
        <span style={{ color: "var(--ardoise)" }}>Progression</span>
        <span className="reference-mono">
          {realise}h / {prevu}h ({pourcentage}%)
        </span>
      </div>
      <div style={{ background: "#e5e3dc", borderRadius: 20, height: 8, overflow: "hidden" }}>
        <div style={{ width: `${pourcentage}%`, background: couleur, height: "100%" }} />
      </div>
    </div>
  );
}
