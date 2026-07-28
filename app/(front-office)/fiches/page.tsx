import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getUtilisateurActuel } from "@/lib/utilisateur-connecte";
import { StatutBadge } from "@/components/ui/StatutBadge";
import { ProgressionVolumeHoraire } from "@/components/ui/ProgressionVolumeHoraire";
import "@/app/(front-office)/styles/fiches.css";

export default async function ListeFichesPage() {
  const utilisateur = await getUtilisateurActuel();
  if (!utilisateur) return null;

  let fiches: any[] = [];

  // Récupérer les fiches selon le rôle
  if (utilisateur.role === "CHEF_CLASSE") {
    fiches = await prisma.fiche.findMany({
      where: { chefClasseId: utilisateur.id },
      include: {
        affectation: { include: { matiere: true, niveau: { include: { filiere: true } }, enseignant: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } else if (utilisateur.role === "ENSEIGNANT") {
    fiches = await prisma.fiche.findMany({
      where: { affectation: { enseignantId: utilisateur.id } },
      include: {
        affectation: { include: { matiere: true, niveau: { include: { filiere: true } }, enseignant: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } else if (utilisateur.role === "CHEF_DEPARTEMENT") {
    fiches = await prisma.fiche.findMany({
      where: { affectation: { matiere: { departementId: utilisateur.departementId! } } },
      include: {
        affectation: { include: { matiere: true, niveau: { include: { filiere: true } }, enseignant: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // Regrouper les fiches par statut
  const groupes = {
    EN_COURS: fiches.filter((f) => f.statut === "EN_COURS"),
    INCOMPLETE: fiches.filter((f) => f.statut === "INCOMPLETE"),
    PRETE_A_SIGNER: fiches.filter((f) => f.statut === "PRETE_A_SIGNER"),
    VALIDEE_ARCHIVEE: fiches.filter((f) => f.statut === "VALIDEE_ARCHIVEE"),
  };

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", padding: "0 16px" }}>
      <h1>Mes fiches de suivi</h1>
      <p style={{ color: "var(--ardoise)", marginBottom: 24 }}>
        {fiches.length} fiche(s) — Filtrées selon votre rôle et département
      </p>

      {/* Fiches en cours */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 16 }}>
          En cours ({groupes.EN_COURS.length})
        </h2>
        {groupes.EN_COURS.length === 0 ? (
          <p style={{ color: "var(--ardoise)" }}>Aucune fiche en cours.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {groupes.EN_COURS.map((fiche) => (
              <Link
                key={fiche.id}
                href={`/fiches/${fiche.id}`}
                className="carte"
                style={{
                  display: "block",
                  textDecoration: "none",
                  color: "inherit",
                  borderLeft: "4px solid var(--statut-attente-fg)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{ margin: "0 0 4px" }}>{fiche.affectation.matiere.nom}</h3>
                    <p style={{ fontSize: 13, color: "var(--ardoise)", margin: 0 }}>
                      {fiche.affectation.niveau.filiere.nom} — {fiche.affectation.niveau.libelle}
                    </p>
                    <p style={{ fontSize: 12, color: "var(--ardoise)", margin: "4px 0 0" }}>
                      {fiche.affectation.enseignant.prenom} {fiche.affectation.enseignant.nom}
                    </p>
                  </div>
                  <StatutBadge statut={fiche.statut} />
                </div>
                <div style={{ marginTop: 12 }}>
                  <ProgressionVolumeHoraire realise={fiche.volumeHoraireRealise} prevu={fiche.volumeHorairePrevu} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Fiches incomplètes */}
      {utilisateur.role === "CHEF_DEPARTEMENT" && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ marginBottom: 16 }}>
            Incomplètes — Arbitrage requis ({groupes.INCOMPLETE.length})
          </h2>
          {groupes.INCOMPLETE.length === 0 ? (
            <p style={{ color: "var(--ardoise)" }}>Aucune fiche incomplète.</p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {groupes.INCOMPLETE.map((fiche) => (
                <Link
                  key={fiche.id}
                  href={`/fiches/${fiche.id}`}
                  className="carte"
                  style={{
                    display: "block",
                    textDecoration: "none",
                    color: "inherit",
                    borderLeft: "4px solid var(--statut-refusee-fg)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <h3 style={{ margin: "0 0 4px" }}>{fiche.affectation.matiere.nom}</h3>
                      <p style={{ fontSize: 13, color: "var(--ardoise)", margin: 0 }}>
                        {fiche.volumeHoraireRealise}h / {fiche.volumeHorairePrevu}h réalisées
                      </p>
                    </div>
                    <StatutBadge statut={fiche.statut} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Fiches prêtes pour signature */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 16 }}>
          Prêtes pour signature ({groupes.PRETE_A_SIGNER.length})
        </h2>
        {groupes.PRETE_A_SIGNER.length === 0 ? (
          <p style={{ color: "var(--ardoise)" }}>Aucune fiche en attente de signature.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {groupes.PRETE_A_SIGNER.map((fiche) => (
              <Link
                key={fiche.id}
                href={`/fiches/${fiche.id}`}
                className="carte"
                style={{
                  display: "block",
                  textDecoration: "none",
                  color: "inherit",
                  borderLeft: "4px solid var(--statut-validee-fg)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <h3 style={{ margin: "0 0 4px" }}>{fiche.affectation.matiere.nom}</h3>
                    <p style={{ fontSize: 13, color: "var(--ardoise)", margin: 0 }}>
                      {fiche.affectation.niveau.filiere.nom} — {fiche.affectation.niveau.libelle}
                    </p>
                  </div>
                  <StatutBadge statut={fiche.statut} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Fiches validées et archivées */}
      <section>
        <h2 style={{ marginBottom: 16 }}>
          Validées et archivées ({groupes.VALIDEE_ARCHIVEE.length})
        </h2>
        {groupes.VALIDEE_ARCHIVEE.length === 0 ? (
          <p style={{ color: "var(--ardoise)" }}>Aucune fiche archivée.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {groupes.VALIDEE_ARCHIVEE.map((fiche) => (
              <Link
                key={fiche.id}
                href={`/fiches/${fiche.id}`}
                className="carte"
                style={{
                  display: "block",
                  textDecoration: "none",
                  color: "inherit",
                  borderLeft: "4px solid var(--statut-archivee-fg)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <h3 style={{ margin: "0 0 4px" }}>{fiche.affectation.matiere.nom}</h3>
                    <p style={{ fontSize: 13, color: "var(--ardoise)", margin: 0 }}>
                      {fiche.affectation.niveau.filiere.nom} — {fiche.affectation.niveau.libelle}
                    </p>
                  </div>
                  <StatutBadge statut={fiche.statut} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
