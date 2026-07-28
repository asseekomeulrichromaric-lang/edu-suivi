// Exemple concret de "props" : au lieu d'écrire le badge coloré à la main
// à chaque endroit de l'appli, on écrit une seule fois ce composant, et on
// lui passe le statut à afficher. Le composant décide lui-même de la couleur.
//
// Utilisation ailleurs dans le code :
//   <StatutBadge statut="EN_ATTENTE" />
//   <StatutBadge statut="VALIDEE_ARCHIVEE" />

type StatutConnu =
  | "EN_ATTENTE"
  | "VALIDEE"
  | "REFUSEE"
  | "EN_COURS"
  | "INCOMPLETE"
  | "PRETE_A_SIGNER"
  | "VALIDEE_ARCHIVEE";

// "props" ici est un objet avec une seule propriété : "statut".
// Le type ci-dessus liste toutes les valeurs autorisées — si tu tapes une valeur
// qui n'existe pas dans la liste, TypeScript te préviendra tout de suite.
type Props = {
  statut: StatutConnu;
};

const STYLES: Record<StatutConnu, { texte: string; fg: string; bg: string }> = {
  EN_ATTENTE: { texte: "En attente", fg: "var(--statut-attente-fg)", bg: "var(--statut-attente-bg)" },
  EN_COURS: { texte: "En cours", fg: "var(--statut-attente-fg)", bg: "var(--statut-attente-bg)" },
  VALIDEE: { texte: "Validée", fg: "var(--statut-validee-fg)", bg: "var(--statut-validee-bg)" },
  PRETE_A_SIGNER: { texte: "Prête à signer", fg: "var(--statut-validee-fg)", bg: "var(--statut-validee-bg)" },
  VALIDEE_ARCHIVEE: { texte: "Validée et archivée", fg: "var(--statut-archivee-fg)", bg: "var(--statut-archivee-bg)" },
  REFUSEE: { texte: "Refusée", fg: "var(--statut-refusee-fg)", bg: "var(--statut-refusee-bg)" },
  INCOMPLETE: { texte: "Incomplète", fg: "var(--statut-refusee-fg)", bg: "var(--statut-refusee-bg)" },
};

export function StatutBadge({ statut }: Props) {
  const style = STYLES[statut];
  return (
    <span
      style={{
        color: style.fg,
        background: style.bg,
        borderRadius: 20,
        padding: "3px 10px",
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {style.texte}
    </span>
  );
}
