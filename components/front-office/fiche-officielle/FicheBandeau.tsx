// Bandeau de statut de la fiche

type Props = {
  statutTexte: string;
};

export function FicheBandeau({ statutTexte }: Props) {
  return (
    <div className="fiche-bandeau">
      <h2>{statutTexte}</h2>
      <p>
        {`Ce document doit être imprimé, signé à la main par le chef de classe et l'enseignant,
        puis remis au chef de département pour archivage officiel.`}
      </p>
    </div>
  );
}