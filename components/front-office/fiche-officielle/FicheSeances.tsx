// Tableau des séances de la fiche

import { calculerDureeHeures } from "@/lib/volume-horaire";

type Seance = {
  id: string;
  date: Date;
  heureDebut: string;
  heureFin: string;
  contenu: string;
  statut: string;
};

type Props = {
  seances: Seance[];
  seancesValidees: number;
  totalDuree: number;
  volumePrevu: number;
  progression: number;
};

const LIBELLES_STATUT: Record<string, string> = {
  EN_ATTENTE: "En attente",
  VALIDEE: "Validée",
  REFUSEE: "Refusée",
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("fr-FR");
}

export function FicheSeances({
  seances,
  seancesValidees,
  totalDuree,
  volumePrevu,
  progression,
}: Props) {
  return (
    <div className="fiche-seances">
      <h3>Détail des séances réalisées</h3>
      {seances.length === 0 ? (
        <p style={{ color: "var(--ardoise)" }}>Aucune séance enregistrée.</p>
      ) : (
        <>
          <table className="fiche-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Horaire</th>
                <th>Contenu de la séance</th>
                <th>Durée</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {seances.map((seance) => {
                const duree = calculerDureeHeures(seance.heureDebut, seance.heureFin);
                const statut = LIBELLES_STATUT[seance.statut] ?? seance.statut;
                const classeStatut =
                  seance.statut === "VALIDEE"
                    ? "statut-validee"
                    : seance.statut === "REFUSEE"
                    ? "statut-refusee"
                    : "statut-attente";

                return (
                  <tr key={seance.id}>
                    <td>{formatDate(seance.date)}</td>
                    <td>
                      {seance.heureDebut}–{seance.heureFin}
                    </td>
                    <td>{seance.contenu}</td>
                    <td>{duree}h</td>
                    <td className={classeStatut}>{statut}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="fiche-total">
            Total : {seancesValidees} séances validées — {totalDuree} heures réalisées sur{" "}
            {volumePrevu} heures prévues ({progression}%).
          </p>
        </>
      )}
    </div>
  );
}
