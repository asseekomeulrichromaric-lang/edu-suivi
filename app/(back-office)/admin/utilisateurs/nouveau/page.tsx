import { prisma } from "@/lib/prisma";
import { FormulaireNouvelUtilisateur } from "./FormulaireNouvelUtilisateur";

export default async function NouvelUtilisateurPage() {
  const departements = await prisma.departement.findMany();

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: "0 16px" }}>
      <h1>Nouvel utilisateur</h1>
      <FormulaireNouvelUtilisateur departements={departements} />
    </div>
  );
}
