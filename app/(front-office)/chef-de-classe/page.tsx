import Link from "next/link";
import { FiCheckSquare, FiCheckCircle, FiEdit3, FiAlertTriangle, FiXCircle } from "react-icons/fi";
import { prisma } from "@/lib/prisma";
import { getUtilisateurActuel } from "@/lib/utilisateur-connecte";
import { ProgressionVolumeHoraire } from "@/components/ui/ProgressionVolumeHoraire";
import { FormulaireCreationFiche } from "@/components/front-office/FormulaireCreationFiche";
import "@/app/(front-office)/styles/chef-de-classe.css";

export default async function TableauDeBordChefDeClasse() {
  const utilisateur = await getUtilisateurActuel();
  if (!utilisateur) return null;

  // Récupérer les fiches du chef de classe
  const fiches = await prisma.fiche.findMany({
    where: { chefClasseId: utilisateur.id },
    include: {
      affectation: { include: { matiere: true, niveau: true, enseignant: true } },
      seances: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  const affectationsDisponibles = await prisma.affectationPedagogique.findMany({
    where: {
      fiche: null,
      enseignant: { departementId: utilisateur.departementId },
    },
    include: {
      matiere: true,
      niveau: true,
      enseignant: true,
    },
  });

  // Récupérer les séances en attente de validation
  const seancesEnAttente = await prisma.seance.findMany({
    where: {
      statut: "EN_ATTENTE",
      fiche: { chefClasseId: utilisateur.id },
    },
    include: { fiche: { include: { affectation: { include: { enseignant: true, matiere: true } } } } },
    orderBy: { date: "desc" },
  });

  // Récupérer les séances refusées (renvoyées par l'enseignant)
  const seancesRefusees = await prisma.seance.findMany({
    where: {
      statut: "REFUSEE",
      fiche: { chefClasseId: utilisateur.id },
    },
    include: { fiche: { include: { affectation: { include: { enseignant: true, matiere: true } } } } },
    orderBy: { date: "desc" },
  });

  // Statistiques
  const heuresRealisees = fiches.reduce((total, f) => total + f.volumeHoraireRealise, 0);
  const heuresPrevues = fiches.reduce((total, f) => total + f.volumeHorairePrevu, 0);
  const fichesActives = fiches.filter((f) => f.statut !== "VALIDEE_ARCHIVEE").length;
  const fichesIncompletes = fiches.filter((f) => f.statut === "INCOMPLETE").length;

  return (
    <div className="chef-de-classe-container">
      {/* Header */}
      <div className="header-section">
        <div>
          <h1>Bonjour, {utilisateur.prenom} {utilisateur.nom}</h1>
          <p className="semestre-info">Semestre 2 • Session Normale • 2023-2024</p>
        </div>
        <Link href="/chef-de-classe/seances/nouvelle" className="bouton-principal">
          + Nouvelle Fiche
        </Link>
      </div>

      {/* Cartes de statistiques */}
      <div className="stats-grid">
        <div className="stat-card attente">
          <p className="stat-label">Séances en attente</p>
          <p className="stat-value">{seancesEnAttente.length}</p>
          <p className="stat-detail">À valider avant vendredi</p>
        </div>
        <div className="stat-card validee">
          <p className="stat-label">Heures validées</p>
          <p className="stat-value">
            {heuresRealisees}
            <span className="stat-unit">/ {heuresPrevues}h</span>
          </p>
          <p className="stat-detail">{heuresPrevues > 0 ? Math.round((heuresRealisees / heuresPrevues) * 100) : 0}% de la charge annuelle</p>
        </div>
        <div className="stat-card active">
          <p className="stat-label">Fiches actives</p>
          <p className="stat-value">{fichesActives}</p>
          <p className="stat-detail">Cours magistraux en cours</p>
        </div>
      </div>

      <div className="main-grid">
        {/* Colonne gauche : séances et fiches */}
        <div className="main-col">
          <section className="section-seances" style={{ marginBottom: 20 }}>
            <div className="section-header">
              <h2>Créer une fiche</h2>
            </div>
            <FormulaireCreationFiche affectations={affectationsDisponibles} />
          </section>
          {/* Séances en attente */}
          {seancesEnAttente.length > 0 && (
            <section className="section-seances">
              <div className="section-header">
                <h2>Séances en attente de validation</h2>
                {seancesEnAttente.length > 0 && (
                  <span className="alert-badge">{seancesEnAttente.length}</span>
                )}
              </div>
              <div className="seances-list">
                {seancesEnAttente.map((seance) => (
                  <div key={seance.id} className="seance-item attente">
                    <div className="seance-content">
                      <p className="seance-matiere">
                        <FiCheckSquare /> {seance.fiche.affectation.matiere.nom}
                      </p>
                      <p className="seance-time">
                        {new Date(seance.date).toLocaleDateString("fr-FR")} •{" "}
                        {seance.heureDebut} – {seance.heureFin}
                      </p>
                      <p className="seance-contenu" style={{ margin: "4px 0 0", fontSize: 12, color: "var(--ardoise)" }}>
                        {seance.contenu}
                      </p>
                    </div>
                    <div className="seance-actions">
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 600,
                          background: "var(--statut-attente-bg)",
                          color: "var(--statut-attente-fg)",
                          border: "1px solid var(--statut-attente-fg)",
                        }}
                      >
                        En cours
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Séances refusées par l'enseignant */}
          {seancesRefusees.length > 0 && (
            <section className="section-seances">
              <div className="section-header">
                <h2>Séances refusées par l'enseignant</h2>
                <span className="alert-badge" style={{ background: "var(--statut-refusee-fg)" }}>
                  {seancesRefusees.length}
                </span>
              </div>
              <div className="seances-list">
                {seancesRefusees.map((seance) => (
                  <div key={seance.id} className="seance-item" style={{ borderLeftColor: "var(--statut-refusee-fg)", background: "var(--statut-refusee-bg)" }}>
                    <div className="seance-content">
                      <p className="seance-matiere">
                        <FiXCircle /> {seance.fiche.affectation.matiere.nom}
                      </p>
                      <p className="seance-time">
                        {new Date(seance.date).toLocaleDateString("fr-FR")} •{" "}
                        {seance.heureDebut} – {seance.heureFin}
                      </p>
                      <p className="seance-contenu" style={{ margin: "4px 0 0", fontSize: 12, color: "var(--ardoise)" }}>
                        {seance.contenu}
                      </p>
                      {seance.motifRefus && (
                        <p className="seance-motif-refus" style={{ margin: "8px 0 0", fontSize: 12, color: "var(--statut-refusee-fg)", fontStyle: "italic" }}>
                          Motif du refus : {seance.motifRefus}
                        </p>
                      )}
                    </div>
                    <div className="seance-actions">
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 600,
                          background: "var(--statut-refusee-bg)",
                          color: "var(--statut-refusee-fg)",
                          border: "1px solid var(--statut-refusee-fg)",
                        }}
                      >
                        Refusée
                      </span>
                      <Link
                        href={`/chef-de-classe/seances/${seance.id}/modifier`}
                        className="bouton-principal"
                        style={{
                          padding: "8px 16px",
                          fontSize: 13,
                          textDecoration: "none",
                          display: "inline-block",
                        }}
                      >
                        Modifier
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Fiches actives */}
          <section className="section-fiches">
            <h2>Fiches de suivi actives</h2>
            {fiches.filter((f) => f.statut !== "VALIDEE_ARCHIVEE").length === 0 ? (
              <p className="empty-state">
                Aucune fiche active. Le chef de département va vous en assigner.
              </p>
            ) : (
              <div className="fiches-list">
                {fiches
                  .filter((f) => f.statut !== "VALIDEE_ARCHIVEE")
                  .map((fiche) => (
                    <div key={fiche.id} className="fiche-item">
                      <div className="fiche-header">
                        <h3 className="fiche-title">{fiche.affectation.matiere.nom}</h3>
                        <Link
                          href={`/fiches/${fiche.id}`}
                          className="link-subtle"
                        >
                          Ouvrir →
                        </Link>
                        <Link
                          href={`/chef-de-classe/seances/nouvelle?ficheId=${fiche.id}`}
                          className="link-subtle"
                          style={{ marginLeft: 8 }}
                        >
                          Enregistrer une séance
                        </Link>
                      </div>
                      <p className="fiche-meta">
                        {fiche.affectation.niveau.libelle} • Séance du{" "}
                        {fiche.seances.length > 0
                          ? new Date(fiche.seances[0].date).toLocaleDateString("fr-FR")
                          : "—"}
                      </p>
                      <div className="progression-container">
                        <ProgressionVolumeHoraire
                          realise={fiche.volumeHoraireRealise}
                          prevu={fiche.volumeHorairePrevu}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>
        </div>

        {/* Colonne droite : activité récente */}
        <aside className="sidebar-right">
          <h3>Activité récente</h3>
          <div className="activity-feed">
            <div className="activity-item">
              <span className="activity-icon"><FiCheckCircle /></span>
              <div>
                <p className="activity-title">Fiche validée par l&apos;Administration</p>
                <p className="activity-meta">Micro-économie • 8 h 2 heures</p>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon"><FiEdit3 /></span>
              <div>
                <p className="activity-title">Nouvelle séance enregistrée</p>
                <p className="activity-meta">GES-402 • Hier, 18:45</p>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon"><FiAlertTriangle /></span>
              <div>
                <p className="activity-title">Modification requise</p>
                <p className="activity-meta">INF-201 • 23 Octobre</p>
              </div>
            </div>
          </div>

          {fichesIncompletes > 0 && (
            <div className="warning-box">
              <p>
                <strong>{fichesIncompletes} fiche(s) incomplète(s)</strong>
              </p>
              <p>
                Le volume horaire n&apos;a pas atteint l&apos;objectif. Consultez le chef de département
                pour la clôturation.
              </p>
            </div>
          )}

          <div className="class-summary">
            <h4>Résumé de la classe</h4>
            <div className="summary-item">
              <span>Effectif Total</span>
              <strong>42 Étudiants</strong>
            </div>
            <div className="summary-item">
              <span>Délégué adjoint</span>
              <strong>Sarah M.</strong>
            </div>
            <div className="summary-item">
              <span>Prochaine séance</span>
              <strong>Vendredi, 14:00</strong>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
