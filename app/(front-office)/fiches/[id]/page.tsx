import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { estChefDeDepartement } from "@/lib/permissions";
import { StatutBadge } from "@/components/ui/StatutBadge";
import { ProgressionVolumeHoraire } from "@/components/ui/ProgressionVolumeHoraire";
import { BoutonTelechargerEtConfirmer } from "@/components/front-office/BoutonTelechargerEtConfirmer";

const LIBELLES_EVENEMENT: Record<string, string> = {
  CREATION: "Création",
  VALIDATION_SEANCE: "Séance validée",
  REFUS_SEANCE: "Séance refusée",
  TELECHARGEMENT_PDF: "PDF téléchargé pour signature",
  CONFIRMATION_ARCHIVAGE: "Archivage confirmé",
  CLOTURE_INCOMPLETE: "Fiche clôturée (incomplète)",
  PROLONGATION: "Prolongation accordée",
};

export default async function DetailFichePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();

  const fiche = await prisma.fiche.findUnique({
    where: { id },
    include: {
      affectation: { include: { matiere: true, niveau: { include: { filiere: true } }, enseignant: true } },
      chefClasse: true,
      seances: { orderBy: { date: "desc" } },
      evenements: { orderBy: { horodatage: "desc" }, include: { auteur: true } },
    },
  });

  if (!fiche) notFound();

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px" }}>
      <p className="reference-mono" style={{ color: "var(--ardoise)", fontSize: 13 }}>{fiche.reference}</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ margin: "0 0 4px" }}>{fiche.affectation.matiere.nom}</h1>
          <p style={{ color: "var(--ardoise)", margin: 0 }}>
            {fiche.affectation.niveau.filiere.nom} — {fiche.affectation.niveau.libelle}
          </p>
        </div>
        <StatutBadge statut={fiche.statut} />
      </div>

      <div className="carte" style={{ margin: "20px 0" }}>
        <p style={{ margin: "0 0 4px", fontSize: 13, color: "var(--ardoise)" }}>
          Enseignant : {fiche.affectation.enseignant.prenom} {fiche.affectation.enseignant.nom} — Chef de
          classe : {fiche.chefClasse.prenom} {fiche.chefClasse.nom}
        </p>
        <div style={{ marginTop: 12 }}>
          <ProgressionVolumeHoraire realise={fiche.volumeHoraireRealise} prevu={fiche.volumeHorairePrevu} />
        </div>
      </div>

      {fiche.statut === "PRETE_A_SIGNER" && session && (
        <div className="carte" style={{ marginBottom: 20, background: "#FAEEDA", borderColor: "#C77D2E" }}>
          <p style={{ margin: "0 0 12px" }}>
            Le volume horaire est atteint. Cette fiche doit être imprimée, signée à la main par le
            chef de classe et l'enseignant, puis remise au chef de département.
          </p>
          <BoutonTelechargerEtConfirmer
            ficheId={fiche.id}
            peutConfirmerArchivage={estChefDeDepartement(session.role)}
          />
        </div>
      )}

      <h2>Séances ({fiche.seances.length})</h2>
      {fiche.seances.map((s) => (
        <div key={s.id} className="carte" style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <p className="reference-mono" style={{ margin: 0, fontSize: 13 }}>
              {new Date(s.date).toLocaleDateString("fr-FR")} • {s.heureDebut}–{s.heureFin}
            </p>
            <StatutBadge statut={s.statut} />
          </div>
          <p style={{ margin: "6px 0 0", fontSize: 14 }}>{s.contenu}</p>
          {s.motifRefus && (
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--statut-refusee-fg)" }}>
              Motif du refus : {s.motifRefus}
            </p>
          )}
        </div>
      ))}

      <h2 style={{ marginTop: 32 }}>Historique</h2>
      <div className="carte">
        {fiche.evenements.map((e) => (
          <div key={e.id} style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>
              {LIBELLES_EVENEMENT[e.typeEvenement] ?? e.typeEvenement}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "var(--ardoise)" }}>
              {new Date(e.horodatage).toLocaleString("fr-FR")} — {e.auteur.prenom} {e.auteur.nom}
            </p>
            {e.details && <p style={{ margin: "4px 0 0", fontSize: 13 }}>{e.details}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
