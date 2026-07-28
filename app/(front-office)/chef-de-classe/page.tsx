// Page "serveur" (pas de "use client" ici) : elle peut interroger directement
// la base de données avec Prisma, sans passer par une route API, parce
// qu'elle s'exécute sur le serveur avant d'être envoyée au navigateur.

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getUtilisateurActuel } from "@/lib/utilisateur-connecte";
import { FicheCard } from "@/components/front-office/FicheCard";

export default async function TableauDeBordChefDeClasse() {
  const utilisateur = await getUtilisateurActuel();
  if (!utilisateur) return null; // le middleware nous protège déjà, ceci est une sécurité en plus

  const fiches = await prisma.fiche.findMany({
    where: { chefClasseId: utilisateur.id },
    include: { affectation: { include: { matiere: true, niveau: true } } },
    orderBy: { createdAt: "desc" },
  });

  const heuresRealisees = fiches.reduce((total, f) => total + f.volumeHoraireRealise, 0);
  const heuresPrevues = fiches.reduce((total, f) => total + f.volumeHorairePrevu, 0);
  const fichesActives = fiches.filter((f) => f.statut !== "VALIDEE_ARCHIVEE").length;

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px" }}>
      <h1>Bonjour, {utilisateur.prenom} {utilisateur.nom}</h1>
      <p style={{ color: "var(--ardoise)" }}>Chef de classe</p>

      <div style={{ display: "flex", gap: 16, margin: "24px 0" }}>
        <div className="carte" style={{ flex: 1 }}>
          <p style={{ color: "var(--ardoise)", fontSize: 13, margin: 0 }}>Heures réalisées</p>
          <p className="reference-mono" style={{ fontSize: 24, margin: "4px 0", color: "var(--encre)" }}>
            {heuresRealisees} / {heuresPrevues}h
          </p>
        </div>
        <div className="carte" style={{ flex: 1 }}>
          <p style={{ color: "var(--ardoise)", fontSize: 13, margin: 0 }}>Fiches actives</p>
          <p style={{ fontSize: 24, margin: "4px 0", color: "var(--encre)" }}>{fichesActives}</p>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Mes fiches</h2>
      </div>

      {fiches.length === 0 && (
        <p style={{ color: "var(--ardoise)" }}>
          Aucune fiche ne t'est encore assignée. Le chef de département doit d'abord créer une
          affectation pédagogique.
        </p>
      )}

      {fiches.map((f) => (
        <div key={f.id}>
          <FicheCard
            id={f.id}
            reference={f.reference}
            matiere={f.affectation.matiere.nom}
            niveau={f.affectation.niveau.libelle}
            statut={f.statut}
            volumeHoraireRealise={f.volumeHoraireRealise}
            volumeHorairePrevu={f.volumeHorairePrevu}
          />
          {f.statut !== "VALIDEE_ARCHIVEE" && (
            <div style={{ marginTop: -6, marginBottom: 16 }}>
              <Link href={`/chef-de-classe/seances/nouvelle?ficheId=${f.id}`} className="bouton-secondaire">
                + Enregistrer une séance
              </Link>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
