import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft, FiDownload } from "react-icons/fi";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { estChefDeDepartement, estChefDeClasse, estEnseignant } from "@/lib/permissions";
import { calculerDureeHeures, calculerProgression } from "@/lib/volume-horaire";
import {
  FicheEnTete,
  FicheTitre,
  FicheBandeau,
  FicheInfos,
  FicheSeances,
  FicheSignatures,
  FicheProcedure,
  FicheTracabilite,
} from "@/components/front-office/fiche-officielle";
import "@/app/(front-office)/styles/fiche-officielle.css";

const LIBELLES_ROLE: Record<string, string> = {
  ADMINISTRATEUR: "Administrateur",
  CHEF_DEPARTEMENT: "Chef de département",
  ENSEIGNANT: "Enseignant",
  CHEF_CLASSE: "Chef de classe",
};

export default async function DetailFichePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();

  const fiche = await prisma.fiche.findUnique({
    where: { id },
    include: {
      affectation: {
        include: {
          matiere: true,
          niveau: { include: { filiere: true } },
          enseignant: true,
        },
      },
      chefClasse: true,
      seances: { orderBy: { date: "asc" } },
    },
  });

  if (!fiche) notFound();

  const peutAcceder =
    estChefDeDepartement(session?.role ?? "") ||
    (estChefDeClasse(session?.role ?? "") && fiche.chefClasseId === session?.utilisateurId) ||
    (estEnseignant(session?.role ?? "") && fiche.affectation.enseignantId === session?.utilisateurId);

  if (!peutAcceder) {
    return (
      <div style={{ textAlign: "center", marginTop: 80 }}>
        <h1>Accès refusé</h1>
        <p style={{ color: "var(--ardoise)" }}>
          {`Vous n'avez pas accès à cette fiche.`}
        </p>
        <Link href="/fiches" className="bouton-principal">Retour aux fiches</Link>
      </div>
    );
  }

  const anneeAcademique = fiche.affectation.anneeAcademique.replace("-", " – ");
  const progression = calculerProgression(fiche.volumeHoraireRealise, fiche.volumeHorairePrevu);
  const seancesValidees = fiche.seances.filter((s) => s.statut === "VALIDEE");
  const totalDuree = seancesValidees.reduce(
    (total, s) => total + calculerDureeHeures(s.heureDebut, s.heureFin),
    0
  );
  const volumeAtteint = fiche.volumeHoraireRealise >= fiche.volumeHorairePrevu;

  const statutTexte =
    fiche.statut === "PRETE_A_SIGNER"
      ? "PRÊTE POUR SIGNATURE — VOLUME HORAIRE ATTEINT"
      : fiche.statut === "VALIDEE_ARCHIVEE"
      ? "VALIDÉE ET ARCHIVÉE"
      : fiche.statut === "INCOMPLETE"
      ? "CLÔTURÉE (INCOMPLÈTE)"
      : "EN COURS";

  const dateTelechargement = new Date().toLocaleDateString("fr-FR");
  const heureTelechargement = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="fiche-officielle">
      {/* Barre d'actions */}
      <div className="fiche-actions">
        <Link href="/fiches" className="btn-retour">
          <FiArrowLeft /> Retour aux fiches
        </Link>
        {volumeAtteint && (
          <a
            href={`/api/fiches/${fiche.id}/pdf`}
            download={`${fiche.reference}.pdf`}
            className="bouton-principal"
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <FiDownload /> Télécharger en PDF
          </a>
        )}
      </div>

      {/* Document officiel */}
      <div style={{ background: "white", border: "1px solid #e5e3dc", borderRadius: 4, padding: "40px 48px" }}>
        <FicheEnTete anneeAcademique={anneeAcademique} filiere={fiche.affectation.niveau.filiere.nom} />
        <FicheTitre reference={fiche.reference} />
        <FicheBandeau statutTexte={statutTexte} />
        <FicheInfos
          filiere={fiche.affectation.niveau.filiere.nom}
          niveau={fiche.affectation.niveau.libelle}
          matiere={fiche.affectation.matiere.nom}
          enseignant={`${fiche.affectation.enseignant.prenom} ${fiche.affectation.enseignant.nom}`}
          chefClasse={`${fiche.chefClasse.prenom} ${fiche.chefClasse.nom}`}
          volumePrevu={fiche.volumeHorairePrevu}
          volumeRealise={fiche.volumeHoraireRealise}
          progression={progression}
        />
        <FicheSeances
          seances={fiche.seances}
          seancesValidees={seancesValidees.length}
          totalDuree={totalDuree}
          volumePrevu={fiche.volumeHorairePrevu}
          progression={progression}
        />
        <FicheSignatures
          chefClasse={`${fiche.chefClasse.prenom} ${fiche.chefClasse.nom}`}
          enseignant={`${fiche.affectation.enseignant.prenom} ${fiche.affectation.enseignant.nom}`}
        />
        <FicheProcedure />
        <FicheTracabilite
          reference={fiche.reference}
          utilisateur={`${fiche.chefClasse.prenom} ${fiche.chefClasse.nom}`}
          role={LIBELLES_ROLE[fiche.chefClasse.role] ?? "Utilisateur"}
          date={`${dateTelechargement} à ${heureTelechargement}`}
        />
      </div>
    </div>
  );
}