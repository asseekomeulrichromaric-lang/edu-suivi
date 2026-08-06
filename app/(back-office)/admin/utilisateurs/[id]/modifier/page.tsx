import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { prisma } from "@/lib/prisma";
import { FormulaireModifierUtilisateur } from "./FormulaireModifierUtilisateur";
import "@/app/(back-office)/styles/forms.css";

export default async function ModifierUtilisateurPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const utilisateur = await prisma.utilisateur.findUnique({
    where: { id },
    include: { departement: true },
  });

  if (!utilisateur) notFound();

  const departements = await prisma.departement.findMany();

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <Link
        href={`/admin/utilisateurs/${utilisateur.id}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          textDecoration: "none",
          marginBottom: 12,
        }}
      >
        <FiArrowLeft /> Retour au détail du compte
      </Link>
      <h1>Modifier {"l'utilisateur"}</h1>
      <p style={{ color: "var(--ardoise)", fontSize: 14, marginTop: 0 }}>
        {utilisateur.prenom} {utilisateur.nom} — {utilisateur.email}
      </p>

      <FormulaireModifierUtilisateur
        utilisateur={utilisateur}
        departements={departements}
      />
    </div>
  );
}