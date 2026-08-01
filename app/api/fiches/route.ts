import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { estChefDeClasse } from "@/lib/permissions";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session || !estChefDeClasse(session.role)) {
    return Response.json({ erreur: "Action réservée au chef de classe." }, { status: 403 });
  }

  try {
    const { affectationId, volumeHorairePrevu, dateLimiteSemestre } = await request.json();

    if (!affectationId || !volumeHorairePrevu || !dateLimiteSemestre) {
      return Response.json({ erreur: "Tous les champs sont obligatoires." }, { status: 400 });
    }

    const affectation = await prisma.affectationPedagogique.findUnique({
      where: { id: affectationId },
      include: { fiche: true },
    });

    if (!affectation) {
      return Response.json({ erreur: "Affectation introuvable." }, { status: 404 });
    }

    if (affectation.fiche) {
      return Response.json({ erreur: "Cette affectation possède déjà une fiche." }, { status: 409 });
    }

    const compteFiches = await prisma.fiche.count();
    const reference = `EDU-${new Date().getFullYear()}-DINF-${String(compteFiches + 1).padStart(4, "0")}`;

    const fiche = await prisma.fiche.create({
      data: {
        reference,
        affectationId,
        chefClasseId: session.utilisateurId,
        volumeHorairePrevu: Number(volumeHorairePrevu),
        dateLimiteSemestre: new Date(dateLimiteSemestre),
      },
    });

    await prisma.historiqueEvenement.create({
      data: {
        ficheId: fiche.id,
        auteurId: session.utilisateurId,
        typeEvenement: "CREATION",
        details: "Fiche créée par le chef de classe.",
      },
    });

    return Response.json(fiche, { status: 201 });
  } catch (erreur) {
    console.error("Erreur API fiches:", erreur);
    return Response.json({ erreur: "Erreur lors de la création de la fiche." }, { status: 500 });
  }
}
