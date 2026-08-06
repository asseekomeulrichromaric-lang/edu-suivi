// Bloc des signatures manuscrites

type Props = {
  chefClasse: string;
  enseignant: string;
};

export function FicheSignatures({ chefClasse, enseignant }: Props) {
  return (
    <div className="fiche-signatures">
      <h3>Signatures manuscrites</h3>
      <p className="fiche-signature-intro">
        {`Le volume horaire prévu pour cet enseignement a été intégralement réalisé et les séances
        ci-dessus dûment validées. Les parties ci-dessous attestent, par leur signature manuscrite,
        de l'exactitude des informations consignées dans la présente fiche.`}
      </p>
      <div className="fiche-signature-grid">
        <div className="fiche-signature-bloc">
          <h4>Chef de classe</h4>
          <p className="nom">{chefClasse}</p>
          <p className="ligne">Signature : ________________________</p>
          <p className="ligne">Date : _____ / _____ / _________</p>
        </div>
        <div className="fiche-signature-bloc">
          <h4>Enseignant</h4>
          <p className="nom">{enseignant}</p>
          <p className="ligne">Signature : ________________________</p>
          <p className="ligne">Date : _____ / _____ / _________</p>
        </div>
      </div>
    </div>
  );
}