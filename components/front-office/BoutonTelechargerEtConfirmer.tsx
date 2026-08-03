"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Deux boutons différents selon le rôle et le statut :
// - Tout le monde peut "télécharger" une fiche PRETE_A_SIGNER (trace l'action, ouvre le PDF)
// - Seul le chef de département peut "confirmer l'archivage" une fois le papier signé reçu
type Props = {
  ficheId: string;
  peutConfirmerArchivage: boolean;
};

export function BoutonTelechargerEtConfirmer({ ficheId, peutConfirmerArchivage }: Props) {
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function telecharger() {
    setEnCours(true);
    setErreur(null);

    try {
      const reponse = await fetch(`/api/fiches/${ficheId}/telechargement`, { method: "POST" });
      if (!reponse.ok) {
        setErreur("Erreur lors de la trace de téléchargement.");
        return;
      }

      const lien = document.createElement("a");
      lien.href = `/api/fiches/${ficheId}/pdf`;
      lien.target = "_blank";
      lien.rel = "noopener noreferrer";
      document.body.appendChild(lien);
      lien.click();
      document.body.removeChild(lien);

      router.refresh();
    } finally {
      setEnCours(false);
    }
  }

  async function confirmerArchivage() {
    setEnCours(true);
    setErreur(null);
    const reponse = await fetch(`/api/fiches/${ficheId}/confirmer-archivage`, { method: "POST" });
    setEnCours(false);
    if (!reponse.ok) {
      const data = await reponse.json();
      setErreur(data.erreur ?? "Erreur.");
      return;
    }
    router.refresh();
  }

  return (
    <div style={{ display: "flex", gap: 12, flexDirection: "column", alignItems: "flex-start" }}>
      <button className="bouton-principal" onClick={telecharger} disabled={enCours}>
        Télécharger la fiche pour signature
      </button>
      {peutConfirmerArchivage && (
        <button className="bouton-secondaire" onClick={confirmerArchivage} disabled={enCours}>
          Confirmer la réception du document signé
        </button>
      )}
      {erreur && <p style={{ color: "var(--statut-refusee-fg)", fontSize: 13 }}>{erreur}</p>}
    </div>
  );
}
