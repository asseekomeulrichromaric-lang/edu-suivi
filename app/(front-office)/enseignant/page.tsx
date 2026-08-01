import Link from "next/link";
import { FiCheckSquare, FiXCircle } from "react-icons/fi";
import { prisma } from "@/lib/prisma";
import { getUtilisateurActuel } from "@/lib/utilisateur-connecte";
import "@/app/(front-office)/styles/enseignant.css";

export default async function TableauDeBordEnseignant() {
  const utilisateur = await getUtilisateurActuel();
  if (!utilisateur) return null;

  // Récupérer les fiches de l'enseignant avec les séances en attente
  const fiches = await prisma.fiche.findMany({
    where: { affectation: { enseignantId: utilisateur.id } },
    include: {
      affectation: { include: { matiere: true, niveau: true } },
      chefClasse: true,
      seances: { orderBy: { date: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Récupérer les séances en attente de validation
  const seancesEnAttente = await prisma.seance.findMany({
    where: {
      statut: "EN_ATTENTE",
      fiche: { affectation: { enseignantId: utilisateur.id } },
    },
    include: { fiche: { include: { affectation: { include: { matiere: true, niveau: true } } } } },
    orderBy: { date: "desc" },
  });

  const heuresValidees = fiches.reduce((total, f) => total + f.volumeHoraireRealise, 0);
  const heuresPrevues = fiches.reduce((total, f) => total + f.volumeHorairePrevu, 0);

  return (
    <div className="enseignant-container">
      <div className="header-section">
        <div>
          <h1>Bonjour, Dr. {utilisateur.nom}</h1>
          <p className="semestre-info">Semestre 2 • Session Normale • 2023-2024</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card attente">
          <p className="stat-label">Séances en attente</p>
          <p className="stat-value">{seancesEnAttente.length}</p>
          <p className="stat-detail">À valider avant vendredi</p>
        </div>
        <div className="stat-card validee">
          <p className="stat-label">Heures validées</p>
          <p className="stat-value">
            {heuresValidees}
            <span className="stat-unit">/ {heuresPrevues}h</span>
          </p>
          <p className="stat-detail">78% de la charge annuelle</p>
        </div>
        <div className="stat-card active">
          <p className="stat-label">Fiches actives</p>
          <p className="stat-value">{fiches.filter((f) => f.statut !== "VALIDEE_ARCHIVEE").length}</p>
          <p className="stat-detail">Cours magistraux en cours</p>
        </div>
      </div>

      <div className="main-grid">
        <div className="main-col">
          {seancesEnAttente.length > 0 && (
            <section className="section-seances">
              <div className="section-header">
                <h2>Séances en attente de validation</h2>
                <span className="alert-badge">{seancesEnAttente.length}</span>
              </div>
              <div className="seances-list">
                {seancesEnAttente.map((seance) => (
                  <div key={seance.id} className="seance-item attente">
                    <div className="seance-info">
                      <p className="seance-matiere">
                        <FiCheckSquare /> {seance.fiche.affectation.matiere.nom}
                      </p>
                      <p className="seance-time">
                        {new Date(seance.date).toLocaleDateString("fr-FR")} • {seance.heureDebut} – {seance.heureFin}
                      </p>
                      <p className="seance-contenu">{seance.contenu}</p>
                    </div>
                    <div className="seance-actions">
                      <button className="btn-refuse"><FiXCircle /> REFUSER</button>
                      <button className="btn-valider"><FiCheckSquare /> VALIDER</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="section-fiches">
            <h2>Mes fiches en cours</h2>
            {fiches.filter((f) => f.statut !== "VALIDEE_ARCHIVEE").length === 0 ? (
              <p className="empty-state">Aucune fiche en cours.</p>
            ) : (
              <div className="fiches-list">
                {fiches
                  .filter((f) => f.statut !== "VALIDEE_ARCHIVEE")
                  .map((fiche) => (
                    <div key={fiche.id} className="fiche-card">
                      <div className="fiche-header">
                        <h3>{fiche.affectation.matiere.nom}</h3>
                        <Link href={`/fiches/${fiche.id}`} className="link-open">
                          Ouvrir la fiche →
                        </Link>
                      </div>
                      <p className="fiche-meta">
                        {fiche.affectation.niveau.libelle} • Chef de classe :{" "}
                        {fiche.chefClasse.prenom} {fiche.chefClasse.nom}
                      </p>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${
                              fiche.volumeHorairePrevu > 0
                                ? (fiche.volumeHoraireRealise / fiche.volumeHorairePrevu) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <p className="progress-text">
                        {fiche.volumeHoraireRealise} / {fiche.volumeHorairePrevu} heures
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </section>
        </div>

        <aside className="sidebar-right">
          <h3>Fiches validées</h3>
          <div className="completed-fiches">
            {fiches.filter((f) => f.statut === "VALIDEE_ARCHIVEE").length === 0 ? (
              <p className="empty-text">Aucune fiche validée pour le moment.</p>
            ) : (
              fiches
                .filter((f) => f.statut === "VALIDEE_ARCHIVEE")
                .map((fiche) => (
                  <div key={fiche.id} className="completed-item">
                    <p className="fiche-name">{fiche.affectation.matiere.nom}</p>
                    <p className="fiche-level">{fiche.affectation.niveau.libelle}</p>
                  </div>
                ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
