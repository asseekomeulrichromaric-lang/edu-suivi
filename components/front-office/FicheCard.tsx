import Link from "next/link";
import { StatutBadge } from "@/components/ui/StatutBadge";
import { ProgressionVolumeHoraire } from "@/components/ui/ProgressionVolumeHoraire";

// Props : les infos minimales nécessaires pour afficher une carte de fiche.
// On les type précisément pour que TypeScript t'aide si tu oublies un champ.
type Props = {
  id: string;
  reference: string;
  matiere: string;
  niveau: string;
  statut: "EN_COURS" | "INCOMPLETE" | "PRETE_A_SIGNER" | "VALIDEE_ARCHIVEE";
  volumeHoraireRealise: number;
  volumeHorairePrevu: number;
};

export function FicheCard({ id, reference, matiere, niveau, statut, volumeHoraireRealise, volumeHorairePrevu }: Props) {
  const couleurBande: Record<string, string> = {
    EN_COURS: "var(--statut-attente-fg)",
    INCOMPLETE: "var(--statut-refusee-fg)",
    PRETE_A_SIGNER: "var(--statut-validee-fg)",
    VALIDEE_ARCHIVEE: "var(--statut-archivee-fg)",
  };

  return (
    <Link
      href={`/fiches/${id}`}
      className="carte"
      style={{
        display: "block",
        borderLeft: `4px solid ${couleurBande[statut]}`,
        textDecoration: "none",
        color: "inherit",
        marginBottom: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <p className="reference-mono" style={{ fontSize: 12, margin: 0 }}>{reference}</p>
          <p style={{ fontWeight: 600, margin: "2px 0" }}>{matiere}</p>
          <p style={{ fontSize: 13, color: "var(--ardoise)", margin: 0 }}>{niveau}</p>
        </div>
        <StatutBadge statut={statut} />
      </div>
      <ProgressionVolumeHoraire realise={volumeHoraireRealise} prevu={volumeHorairePrevu} />
    </Link>
  );
}
