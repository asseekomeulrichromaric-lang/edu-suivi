// Ce fichier ne parle JAMAIS à la base de données — il ne fait que des calculs.
// On l'isole exprès : ça permet de vérifier facilement que le calcul est juste,
// sans avoir besoin d'une vraie base de données pour tester.

/**
 * Calcule le nombre d'heures d'une séance à partir de son heure de début et de fin.
 * Exemple : calculerDureeHeures("08:00", "10:00") renvoie 2
 */
export function calculerDureeHeures(heureDebut: string, heureFin: string): number {
  const [hDebut, mDebut] = heureDebut.split(":").map(Number);
  const [hFin, mFin] = heureFin.split(":").map(Number);
  const minutesDebut = hDebut * 60 + mDebut;
  const minutesFin = hFin * 60 + mFin;
  return (minutesFin - minutesDebut) / 60;
}

/**
 * Calcule le pourcentage de progression du volume horaire d'une fiche.
 * Exemple : calculerProgression(18, 45) renvoie 40
 */
export function calculerProgression(volumeRealise: number, volumePrevu: number): number {
  if (volumePrevu <= 0) return 0;
  const pourcentage = (volumeRealise / volumePrevu) * 100;
  return Math.min(100, Math.round(pourcentage));
}

/**
 * Détermine si une fiche a atteint son volume horaire prévu
 * (donc si elle devient "prête à signer").
 */
export function volumeHoraireAtteint(volumeRealise: number, volumePrevu: number): boolean {
  return volumeRealise >= volumePrevu;
}
