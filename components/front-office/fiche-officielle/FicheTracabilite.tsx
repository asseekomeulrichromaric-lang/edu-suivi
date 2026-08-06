// Traçabilité du téléchargement

type Props = {
  reference: string;
  utilisateur: string;
  role: string;
  date: string;
};

export function FicheTracabilite({ reference, utilisateur, role, date }: Props) {
  return (
    <p className="fiche-tracabilite">
      Téléchargé le {date} par {utilisateur} ({role}) — Traçabilité : HIST-{reference}-DL
    </p>
  );
}