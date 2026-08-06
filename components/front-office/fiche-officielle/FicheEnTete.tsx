// En-tête du document officiel de la fiche de suivi pédagogique

type Props = {
  anneeAcademique: string;
  filiere: string;
};

export function FicheEnTete({ anneeAcademique, filiere }: Props) {
  return (
    <div className="fiche-header">
      <p className="fiche-generateur">
        Document généré par la plateforme EduSuivi — Institut National de Sciences de Gestion —
        page 1/1
      </p>
      <h1 className="fiche-institution">INSTITUT NATIONAL DE SCIENCES DE GESTION</h1>
      <p className="fiche-institution-ligne">Département — Filière {filiere}</p>
      <p className="fiche-plateforme">Plateforme EduSuivi — Système de suivi pédagogique</p>
      <p className="fiche-annee">Année académique {anneeAcademique}</p>
    </div>
  );
}