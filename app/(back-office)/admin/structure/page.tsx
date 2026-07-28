import { prisma } from "@/lib/prisma";

export default async function StructureAcademiquePage() {
  const departements = await prisma.departement.findMany({
    include: {
      filieres: { include: { niveaux: true } },
      matieres: true,
    },
  });

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px" }}>
      <h1>Structure académique</h1>
      <p style={{ color: "var(--ardoise)" }}>
        Départements, filières, niveaux et matières de l'INSG.
      </p>

      {departements.map((dep) => (
        <div key={dep.id} className="carte" style={{ marginBottom: 16 }}>
          <h2 style={{ marginTop: 0 }}>{dep.nom}</h2>

          <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Filières et niveaux</p>
          {dep.filieres.map((f) => (
            <p key={f.id} style={{ fontSize: 14, margin: "4px 0" }}>
              {f.nom} — {f.niveaux.map((n) => n.libelle).join(", ") || "aucun niveau"}
            </p>
          ))}

          <p style={{ fontWeight: 600, fontSize: 14, marginTop: 14, marginBottom: 6 }}>Matières</p>
          {dep.matieres.map((m) => (
            <p key={m.id} style={{ fontSize: 14, margin: "4px 0" }}>
              {m.nom} <span className="reference-mono" style={{ color: "var(--ardoise)" }}>({m.volumeHoraireReference}h de référence)</span>
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}
