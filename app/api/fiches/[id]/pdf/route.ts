import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { estChefDeDepartement, estChefDeClasse, estEnseignant } from "@/lib/permissions";
import { calculerDureeHeures, calculerProgression } from "@/lib/volume-horaire";
import PDFDocument from "pdfkit";

export const runtime = "nodejs";

const LIBELLES_STATUT_SEANCE: Record<string, string> = {
  EN_ATTENTE: "En attente",
  VALIDEE: "Validée",
  REFUSEE: "Refusée",
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  const session = await getSession();

  // Vérifier que l'utilisateur est autorisé à télécharger cette fiche
  if (!session) {
    return Response.json({ erreur: "Accès refusé : session introuvable." }, { status: 403 });
  }

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

  if (!fiche) {
    return new Response("Fiche introuvable", { status: 404 });
  }

  // Vérifier que l'utilisateur peut voir cette fiche
  const peutAcceder =
    estChefDeDepartement(session.role) ||
    (estChefDeClasse(session.role) && fiche.chefClasseId === session.utilisateurId) ||
    (estEnseignant(session.role) && fiche.affectation.enseignantId === session.utilisateurId);

  if (!peutAcceder) {
    return new Response("Accès refusé à cette fiche", { status: 403 });
  }

  try {
    return new Promise((resolve) => {
      const doc = new PDFDocument({
        margin: 50,
        size: "A4",
        bufferPages: true,
      });

      const buffer: Buffer[] = [];
      doc.on("data", (chunk) => buffer.push(chunk));

      const largeurPage = doc.page.width - 100; // marges gauche + droite
      const anneeAcademique = fiche.affectation.anneeAcademique.replace("-", " – ");
      const progression = calculerProgression(fiche.volumeHoraireRealise, fiche.volumeHorairePrevu);
      const seancesValidees = fiche.seances.filter((s) => s.statut === "VALIDEE");
      const totalDuree = seancesValidees.reduce(
        (total, s) => total + calculerDureeHeures(s.heureDebut, s.heureFin),
        0
      );

      // ===== EN-TÊTE =====
      doc
        .fontSize(7)
        .fillColor("#6B7280")
        .text(
          "Document généré par la plateforme EduSuivi — Institut National de Sciences de Gestion — page 1/1",
          { align: "center" }
        )
        .moveDown(1.5);

      // Nom de l'institution
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .fillColor("#1D3557")
        .text("INSTITUT NATIONAL DE SCIENCES DE GESTION", { align: "center" })
        .moveDown(0.3);

      // Département et filière
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#6B7280")
        .text(
          `Département — Filière ${fiche.affectation.niveau.filiere.nom}`,
          { align: "center" }
        )
        .moveDown(0.2);

      // Plateforme
      doc
        .fontSize(8)
        .fillColor("#6B7280")
        .text("Plateforme EduSuivi — Système de suivi pédagogique", { align: "center" })
        .moveDown(0.5);

      // Année académique
      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor("#1D3557")
        .text(`Année académique ${anneeAcademique}`, { align: "center" })
        .moveDown(1);

      // Ligne de séparation
      doc
        .strokeColor("#1D3557")
        .lineWidth(1.5)
        .moveTo(50, doc.y)
        .lineTo(50 + largeurPage, doc.y)
        .stroke()
        .moveDown(1);

      // ===== TITRE =====
      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .fillColor("#1D3557")
        .text("FICHE DE SUIVI PÉDAGOGIQUE", { align: "center" })
        .moveDown(0.5);

      // Référence
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#6B7280")
        .text(`N° de référence : ${fiche.reference}`, { align: "center" })
        .moveDown(1);

      // ===== BANDEAU STATUT =====
      const statutTexte =
        fiche.statut === "PRETE_A_SIGNER"
          ? "PRÊTE POUR SIGNATURE — VOLUME HORAIRE ATTEINT"
          : fiche.statut === "VALIDEE_ARCHIVEE"
          ? "VALIDÉE ET ARCHIVÉE"
          : fiche.statut === "INCOMPLETE"
          ? "CLÔTURÉE (INCOMPLÈTE)"
          : "EN COURS";

      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor("#2F7D5A")
        .text(statutTexte, { align: "center" })
        .moveDown(0.3);

      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#6B7280")
        .text(
          "Ce document doit être imprimé, signé à la main par le chef de classe et l'enseignant, puis remis au chef de département pour archivage officiel.",
          { align: "center", width: largeurPage }
        )
        .moveDown(1.5);

      // ===== INFORMATIONS PRINCIPALES =====
      const infoY = doc.y;
      const colGaucheX = 50;
      const colDroiteX = 50 + largeurPage / 2;

      // Colonne gauche
      doc
        .fontSize(8)
        .font("Helvetica-Bold")
        .fillColor("#1D3557")
        .text("FILIÈRE / NIVEAU", colGaucheX, infoY)
        .font("Helvetica")
        .fillColor("#000")
        .text(
          `${fiche.affectation.niveau.filiere.nom} — ${fiche.affectation.niveau.libelle}`,
          colGaucheX,
          doc.y + 2
        )
        .moveDown(0.8)
        .font("Helvetica-Bold")
        .fillColor("#1D3557")
        .text("MATIÈRE", colGaucheX)
        .font("Helvetica")
        .fillColor("#000")
        .text(fiche.affectation.matiere.nom, colGaucheX, doc.y + 2)
        .moveDown(0.8)
        .font("Helvetica-Bold")
        .fillColor("#1D3557")
        .text("ENSEIGNANT", colGaucheX)
        .font("Helvetica")
        .fillColor("#000")
        .text(
          `${fiche.affectation.enseignant.prenom} ${fiche.affectation.enseignant.nom}`,
          colGaucheX,
          doc.y + 2
        )
        .moveDown(0.8)
        .font("Helvetica-Bold")
        .fillColor("#1D3557")
        .text("CHEF DE CLASSE", colGaucheX)
        .font("Helvetica")
        .fillColor("#000")
        .text(
          `${fiche.chefClasse.prenom} ${fiche.chefClasse.nom}`,
          colGaucheX,
          doc.y + 2
        );

      // Colonne droite
      doc
        .fontSize(8)
        .font("Helvetica-Bold")
        .fillColor("#1D3557")
        .text("VOLUME HORAIRE PRÉVU", colDroiteX, infoY)
        .font("Helvetica")
        .fillColor("#000")
        .text(`${fiche.volumeHorairePrevu} heures`, colDroiteX, doc.y + 2)
        .moveDown(0.8)
        .font("Helvetica-Bold")
        .fillColor("#1D3557")
        .text("VOLUME HORAIRE RÉALISÉ", colDroiteX)
        .font("Helvetica")
        .fillColor("#000")
        .text(
          `${fiche.volumeHoraireRealise} heures (${progression}%)`,
          colDroiteX,
          doc.y + 2
        );

      doc.moveDown(2);

      // ===== DÉTAIL DES SÉANCES =====
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor("#1D3557")
        .text("Détail des séances réalisées", { align: "left" })
        .moveDown(0.5);

      // En-tête du tableau
      const tableY = doc.y;
      const colDateX = 50;
      const colHoraireX = 110;
      const colContenuX = 180;
      const colDureeX = 400;
      const colStatutX = 450;
      const colFinX = 50 + largeurPage;

      doc
        .fontSize(8)
        .font("Helvetica-Bold")
        .fillColor("#1D3557")
        .text("Date", colDateX, tableY)
        .text("Horaire", colHoraireX, tableY)
        .text("Contenu de la séance", colContenuX, tableY)
        .text("Durée", colDureeX, tableY)
        .text("Statut", colStatutX, tableY);

      // Ligne sous l'en-tête
      doc
        .strokeColor("#1D3557")
        .lineWidth(0.5)
        .moveTo(colDateX, tableY + 14)
        .lineTo(colFinX, tableY + 14)
        .stroke();

      let yCourant = tableY + 20;

      if (fiche.seances.length === 0) {
        doc
          .fontSize(9)
          .font("Helvetica")
          .fillColor("#6B7280")
          .text("Aucune séance enregistrée.", colDateX, yCourant);
      } else {
        fiche.seances.forEach((seance) => {
          const duree = calculerDureeHeures(seance.heureDebut, seance.heureFin);
          const statut = LIBELLES_STATUT_SEANCE[seance.statut] ?? seance.statut;

          doc
            .fontSize(8)
            .font("Helvetica")
            .fillColor("#000")
            .text(new Date(seance.date).toLocaleDateString("fr-FR"), colDateX, yCourant)
            .text(
              `${seance.heureDebut}–${seance.heureFin}`,
              colHoraireX,
              yCourant
            )
            .text(seance.contenu, colContenuX, yCourant, { width: colDureeX - colContenuX - 10 })
            .text(`${duree}h`, colDureeX, yCourant)
            .text(statut, colStatutX, yCourant);

          // Ligne de séparation
          doc
            .strokeColor("#E0E0E0")
            .lineWidth(0.3)
            .moveTo(colDateX, yCourant + 14)
            .lineTo(colFinX, yCourant + 14)
            .stroke();

          yCourant += 20;
        });
      }

      doc.y = yCourant + 10;

      // ===== TOTAL =====
      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor("#1D3557")
        .text(
          `Total : ${seancesValidees.length} séances validées — ${totalDuree} heures réalisées sur ${fiche.volumeHorairePrevu} heures prévues (${progression}%).`,
          { align: "left" }
        )
        .moveDown(2);

      // ===== SIGNATURES =====
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor("#1D3557")
        .text("Signatures manuscrites", { align: "left" })
        .moveDown(0.5);

      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#000")
        .text(
          "Le volume horaire prévu pour cet enseignement a été intégralement réalisé et les séances ci-dessus dûment validées. Les parties ci-dessous attestent, par leur signature manuscrite, de l'exactitude des informations consignées dans la présente fiche.",
          { width: largeurPage }
        )
        .moveDown(1.5);

      // Deux blocs de signature côte à côte
      const sigY = doc.y;
      const sigGaucheX = 50;
      const sigDroiteX = 50 + largeurPage / 2;

      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor("#1D3557")
        .text("CHEF DE CLASSE", sigGaucheX, sigY)
        .font("Helvetica")
        .fillColor("#000")
        .text(
          `${fiche.chefClasse.prenom} ${fiche.chefClasse.nom}`,
          sigGaucheX,
          doc.y + 2
        )
        .moveDown(0.5)
        .text("Signature : ________________________", sigGaucheX)
        .moveDown(0.3)
        .text("Date : _____ / _____ / _________", sigGaucheX);

      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor("#1D3557")
        .text("ENSEIGNANT", sigDroiteX, sigY)
        .font("Helvetica")
        .fillColor("#000")
        .text(
          `${fiche.affectation.enseignant.prenom} ${fiche.affectation.enseignant.nom}`,
          sigDroiteX,
          doc.y + 2
        )
        .moveDown(0.5)
        .text("Signature : ________________________", sigDroiteX)
        .moveDown(0.3)
        .text("Date : _____ / _____ / _________", sigDroiteX);

      doc.moveDown(2);

      // ===== PROCÉDURE D'ARCHIVAGE =====
      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#6B7280")
        .text(
          "Procédure d'archivage : une fois signée par les deux parties, remettre ce document en main propre au chef de département, qui confirmera sa réception dans EduSuivi pour l'archiver officiellement. Le présent exemplaire papier est l'unique archive officielle.",
          { width: largeurPage }
        )
        .moveDown(1);

      // ===== TRACABILITÉ =====
      doc
        .fontSize(7)
        .fillColor("#9CA3AF")
        .text(
          `Téléchargé le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} par ${fiche.chefClasse.prenom} ${fiche.chefClasse.nom} (${fiche.chefClasse.role === "CHEF_CLASSE" ? "Chef de classe" : "Utilisateur"}) — Traçabilité : HIST-${fiche.reference}-DL`,
          { align: "center" }
        );

      // IMPORTANT : enregistrer le listener "end" AVANT d'appeler doc.end(),
      // sinon l'événement peut se déclencher avant que le listener soit attaché.
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffer);
        resolve(
          new Response(pdfBuffer, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="${fiche.reference}.pdf"`,
            },
          })
        );
      });

      doc.end();
    });
  } catch (erreur) {
    console.error("Erreur génération PDF:", erreur);
    return new Response("Erreur lors de la génération du PDF", { status: 500 });
  }
}