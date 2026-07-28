import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getUtilisateurActuel } from "@/lib/utilisateur-connecte";
import { ActionsFicheIncomplete } from "@/components/front-office/ActionsFicheIncomplete";
import { StatutBadge } from "@/components/ui/StatutBadge";

export default async function TableauDeBordChefDeDepartement() {
  const utilisateur = await getUtilisateurActuel();
  if (!utilisateur || !utilisateur.departementId) return null;

  const toutesLesFiches = await prisma.fiche.findMany({
    where: { affectation: { matiere: { departementId: utilisateur.departementId } } },
    include: { affectation: { include: { matiere: true, niveau: true, enseignant: true } } },
  });

  const fichesIncompletes = toutesLesFiches.filter((f) => f.statut === "INCOMPLETE");
  const fichesPretes = toutesLesFiches.filter((f) => f.statut === "PRETE_A_SIGNER");
  const fichesValideesCeMois = toutesLesFiches.filter(
    (f) =>
      f.statut === "VALIDEE_ARCHIVEE" &&
      f.dateConfirmationArchivage &&
      new Date(f.dateConfirmationArchivage).getMonth() === new Date().getMonth()
  );

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px" }}>
      <h1>Bonjour, {utilisateur.prenom} {utilisateur.nom}</h1>
      <p style={{ color: "var(--ardoise)" }}>Chef de département</p>

      <div style={{ display: "flex", gap: 16, margin: "24px 0" }}>
        <div className="carte" style={{ flex: 1 }}>
          <p style={{ color: "var(--ardoise)", fontSize: 13, margin: 0 }}>Fiches en cours</p>
          <p style={{ fontSize: 24, margin: "4px 0" }}>{toutesLesFiches.length}</p>
        </div>
        <div className="carte" style={{ flex: 1, borderLeft: "3px solid var(--statut-refusee-fg)" }}>
          <p style={{ color: "var(--ardoise)", fontSize: 13, margin: 0 }}>Incomplètes</p>
          <p style={{ fontSize: 24, margin: "4px 0" }}>{fichesIncompletes.length}</p>
        </div>
        <div className="carte" style={{ flex: 1, borderLeft: "3px solid var(--statut-archivee-fg)" }}>
          <p style={{ color: "var(--ardoise)", fontSize: 13, margin: 0 }}>Validées ce mois</p>
          <p style={{ fontSize: 24, margin: "4px 0" }}>{fichesValideesCeMois.length}</p>
        </div>
      </div>

      <Link href="/chef-de-departement/affectations/nouvelle" className="bouton-principal" style={{ display: "inline-block", marginBottom: 24 }}>
        + Nouvelle affectation
      </Link>

      <h2>Fiches incomplètes — arbitrage requis ({fichesIncompletes.length})</h2>
      {fichesIncompletes.length === 0 && <p style={{ color: "var(--ardoise)" }}>Aucune fiche incomplète.</p>}
      {fichesIncompletes.map((f) => (
        <div key={f.id} className="carte" style={{ marginBottom: 12, borderLeft: "4px solid var(--statut-refusee-fg)" }}>
          <p style={{ fontWeight: 600, margin: "0 0 4px" }}>
            {f.affectation.matiere.nom} — {f.affectation.niveau.libelle}
          </p>
          <p style={{ fontSize: 13, color: "var(--ardoise)", margin: 0 }}>
            Enseignant : {f.affectation.enseignant.prenom} {f.affectation.enseignant.nom} —{" "}
            {f.volumeHoraireRealise}h / {f.volumeHorairePrevu}h réalisées
          </p>
          <ActionsFicheIncomplete ficheId={f.id} />
        </div>
      ))}

      <h2 style={{ marginTop: 32 }}>Fiches prêtes pour signature ({fichesPretes.length})</h2>
      {fichesPretes.length === 0 && <p style={{ color: "var(--ardoise)" }}>Aucune fiche en attente de réception.</p>}
      {fichesPretes.map((f) => (
        <Link
          key={f.id}
          href={`/fiches/${f.id}`}
          className="carte"
          style={{ display: "block", marginBottom: 12, borderLeft: "4px solid var(--statut-validee-fg)", textDecoration: "none", color: "inherit" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <p style={{ fontWeight: 600, margin: 0 }}>
              {f.affectation.matiere.nom} — {f.affectation.niveau.libelle}
            </p>
            <StatutBadge statut={f.statut} />
          </div>
        </Link>
      ))}
    </div>
  );
}
