"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiLogOut } from "react-icons/fi";

// Bouton de déconnexion : détruit la session côté serveur puis redirige vers la page de connexion.
export function BoutonDeconnexion() {
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);

  async function seDeconnecter() {
    setEnCours(true);
    await fetch("/api/auth/deconnexion", { method: "POST" });
    router.push("/connexion");
    router.refresh();
  }

  return (
    <button
      onClick={seDeconnecter}
      disabled={enCours}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "transparent",
        border: "1px solid var(--ardoise)",
        color: "var(--encre)",
        padding: "6px 12px",
        borderRadius: 6,
        fontSize: 13,
        cursor: "pointer",
        fontWeight: 500,
      }}
    >
      <FiLogOut />
      {enCours ? "Déconnexion..." : "Se déconnecter"}
    </button>
  );
}