// Titre et référence de la fiche

type Props = {
  reference: string;
};

export function FicheTitre({ reference }: Props) {
  return (
    <div className="fiche-titre">
      <h1>FICHE DE SUIVI PÉDAGOGIQUE</h1>
      <p className="fiche-reference">N° de référence : {reference}</p>
    </div>
  );
}