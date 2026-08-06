// Informations principales de la fiche (2 colonnes)

type Props = {
  filiere: string;
  niveau: string;
  matiere: string;
  enseignant: string;
  chefClasse: string;
  volumePrevu: number;
  volumeRealise: number;
  progression: number;
};

export function FicheInfos({
  filiere,
  niveau,
  matiere,
  enseignant,
  chefClasse,
  volumePrevu,
  volumeRealise,
  progression,
}: Props) {
  return (
    <div className="fiche-infos">
      <div className="fiche-info-bloc">
        <h4>Filière / Niveau</h4>
        <p>
          {filiere} — {niveau}
        </p>
        <h4>Matière</h4>
        <p>{matiere}</p>
        <h4>Enseignant</h4>
        <p>{enseignant}</p>
        <h4>Chef de classe</h4>
        <p>{chefClasse}</p>
      </div>
      <div className="fiche-info-bloc">
        <h4>Volume horaire prévu</h4>
        <p>{volumePrevu} heures</p>
        <h4>Volume horaire réalisé</h4>
        <p>
          {volumeRealise} heures ({progression}%)
        </p>
      </div>
    </div>
  );
}