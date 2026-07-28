import { prisma } from "@/lib/prisma";
import { getUtilisateurActuel } from "@/lib/utilisateur-connecte";
import { ActionsSeance } from "@/components/front-office/ActionsSeance";
import { FicheCard } from "@/components/front-office/FicheCard";

export default async function TableauDeBordEnseignant() {
  const utilisateur = await getUtilisateurActuel();
  if (!utilisateur) return null;

  // Toutes les séances en attente, pour toutes les fiches où cet enseignant est référent
  const seancesEnAttente = await prisma.seance.findMany({
    where: {
      statut: "EN_ATTENTE",
      fiche: { affectation: { enseignantId: utilisateur.id } },
    },
    include: { fiche: { include: { affectation: { include: { matiere: true, niveau: true } } } } },
    orderBy: { date: "asc" },
  });

  const fiches = await prisma.fiche.findMany({
    where: { affectation: { enseignantId: utilisateur.id }, statut: { not: "VALIDEE_ARCHIVEE" } },
    include: { affectation: { include: { matiere: true, niveau: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px" }}>
      <h1>Bonjour, {utilisateur.prenom} {utilisateur.nom}</h1>
      <p style={{ color: "var(--ardoise)" }}>Enseignant</p>

      <h2>Séances en attente de validation ({seancesEnAttente.length})</h2>

      {seancesEnAttente.length === 0 && (
        <p style={{ color: "var(--ardoise)" }}>Aucune séance en attente pour le moment.</p>
      )}

      {seancesEnAttente.map((s) => (
        <div key={s.id} className="carte" style={{ marginBottom: 12, borderLeft: "4px solid var(--statut-attente-fg)" }}>
          <p style={{ fontWeight: 600, margin: "0 0 4px" }}>
            {s.fiche.affectation.matiere.nom} — {s.fiche.affectation.niveau.libelle}
          </p>
          <p className="reference-mono" style={{ fontSize: 13, color: "var(--ardoise)", margin: "0 0 8px" }}>
            {new Date(s.date).toLocaleDateString("fr-FR")} • {s.heureDebut} – {s.heureFin}
          </p>
          <p style={{ fontSize: 14, margin: 0 }}>{s.contenu}</p>
          <ActionsSeance seanceId={s.id} />
        </div>
      ))}

      <h2 style={{ marginTop: 32 }}>Mes fiches en cours</h2>
      {fiches.map((f) => (
        <FicheCard
          key={f.id}
          id={f.id}
          reference={f.reference}
          matiere={f.affectation.matiere.nom}
          niveau={f.affectation.niveau.libelle}
          statut={f.statut}
          volumeHoraireRealise={f.volumeHoraireRealise}
          volumeHorairePrevu={f.volumeHorairePrevu}
        />
      ))}
    </div>
  );
}
