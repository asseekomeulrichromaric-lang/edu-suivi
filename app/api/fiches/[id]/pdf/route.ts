import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { estChefDeDepartement, estChefDeClasse } from "@/lib/permissions";
import PDFDocument from "pdfkit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  const session = await getSession();

  // Vérifier que l'utilisateur est autorisé à télécharger cette fiche
  if (!session || (!estChefDeDepartement(session.role) && !estChefDeClasse(session.role))) {
    return new Response("Accès refusé", { status: 403 });
  }

  const fiche = await prisma.fiche.findUnique({
    where: { id },
    include: {
      affectation: { include: { matiere: true, niveau: { include: { filiere: true } }, enseignant: true } },
      chefClasse: true,
      seances: { orderBy: { date: "desc" } },
    },
  });

  if (!fiche) {
    return new Response("Fiche introuvable", { status: 404 });
  }

  // Vérifier que l'utilisateur peut voir cette fiche
  if (estChefDeClasse(session.role) && fiche.chefClasseId !== session.utilisateurId) {
    return new Response("Accès refusé à cette fiche", { status: 403 });
  }

  try {
    return new Promise((resolve) => {
      const doc = new PDFDocument({
        margin: 40,
        size: "A4",
      });

      const buffer: Buffer[] = [];
      doc.on("data", (chunk) => buffer.push(chunk));

      // En-tête
      doc
        .fontSize(10)
        .text("INSG - Fiche de Suivi", { align: "center" })
        .moveDown(0.5);

      // Référence de fiche
      doc
        .fontSize(9)
        .fillColor("#6B7280")
        .text(`REF : ${fiche.reference}`, { align: "left" })
        .moveDown(0.5)
        .fillColor("#000");

      // Titre principal
      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .text(fiche.affectation.matiere.nom, { align: "left" })
        .moveDown(0.3);

      // Sous-titre
      doc
        .fontSize(11)
        .font("Helvetica")
        .fillColor("#6B7280")
        .text(
          `${fiche.affectation.niveau.filiere.nom} — ${fiche.affectation.niveau.libelle}`,
          { align: "left" }
        )
        .moveDown(1)
        .fillColor("#000");

      // Section Statut
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor("#2F7D5A")
        .text("✓ Validée et archivée", { align: "left" })
        .moveDown(1)
        .fillColor("#000");

      // Section Volume horaire
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("VOLUME HORAIRE RÉALISÉ", { align: "left" })
        .moveDown(0.3);

      doc
        .fontSize(11)
        .font("Helvetica")
        .text(`${fiche.volumeHoraireRealise} / ${fiche.volumeHorairePrevu} Heures`, {
          align: "left",
        })
        .moveDown(0.5);

      // Barre de progression simple
      const barWidth = 200;
      const filledWidth = (fiche.volumeHoraireRealise / fiche.volumeHorairePrevu) * barWidth;
      doc
        .strokeColor("#2B6CB0")
        .lineWidth(2)
        .moveTo(40, doc.y)
        .lineTo(40 + filledWidth, doc.y)
        .stroke();
      doc
        .strokeColor("#E0E0E0")
        .lineWidth(2)
        .moveTo(40 + filledWidth, doc.y)
        .lineTo(40 + barWidth, doc.y)
        .stroke();
      doc.moveDown(1.5);

      // Informations principales
      doc
        .fontSize(9)
        .fillColor("#6B7280")
        .text(
          `Enseignant : ${fiche.affectation.enseignant.prenom} ${fiche.affectation.enseignant.nom}`,
          { align: "left" }
        )
        .text(
          `Chef de classe : ${fiche.chefClasse.prenom} ${fiche.chefClasse.nom}`,
          { align: "left" }
        )
        .text(`Date limite : ${new Date(fiche.dateLimiteSemestre).toLocaleDateString("fr-FR")}`, {
          align: "left",
        })
        .moveDown(1)
        .fillColor("#000");

      // Section Journal des séances
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("Journal des Séances", { align: "left" })
        .moveDown(0.5);

      if (fiche.seances.length === 0) {
        doc
          .fontSize(10)
          .fillColor("#6B7280")
          .text("Aucune séance enregistrée.", { align: "left" })
          .moveDown(1)
          .fillColor("#000");
      } else {
        fiche.seances.forEach((seance, index) => {
          if (index > 0) doc.moveDown(0.3);

          doc
            .fontSize(9)
            .font("Helvetica-Bold")
            .text(
              `${new Date(seance.date).toLocaleDateString("fr-FR")} • ${seance.heureDebut} – ${seance.heureFin}`,
              { align: "left" }
            )
            .fontSize(9)
            .font("Helvetica")
            .fillColor("#6B7280")
            .text(seance.contenu, { align: "left", width: 400 })
            .fillColor("#000");

          if (seance.statut === "VALIDEE") {
            doc
              .fontSize(8)
              .fillColor("#2B6CB0")
              .text("✓ VALIDÉE", { align: "left" })
              .fillColor("#000");
          } else if (seance.statut === "REFUSEE") {
            doc
              .fontSize(8)
              .fillColor("#B0413E")
              .text("✗ REFUSÉE", { align: "left" })
              .fillColor("#000");
          }
        });

        doc.moveDown(1);
      }

      // Footer
      doc
        .fontSize(8)
        .fillColor("#6B7280")
        .text("© 2024 Institut National de Sciences de Gestion (INSG) • EduSuivi v2.4.0", {
          align: "center",
        })
        .text(`Généré le ${new Date().toLocaleString("fr-FR")}`, {
          align: "center",
        });

      doc.end();

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
    });
  } catch (erreur) {
    console.error("Erreur génération PDF:", erreur);
    return new Response("Erreur lors de la génération du PDF", { status: 500 });
  }
}
