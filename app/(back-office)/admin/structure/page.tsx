import Link from "next/link";
import { prisma } from "@/lib/prisma";
import "@/app/(back-office)/styles/structure.css";

export default async function StructureAcademique() {
  const departements = await prisma.departement.findMany({
    include: { filieres: true },
  });

  return (
    <div>
      <div className="structure-header">
        <h1>Structure Académique</h1>
        <p>Gestion des départements et filières de l'INSG</p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Link href="/admin/structure/nouveau" className="add-button">
          + Ajouter un Département
        </Link>
      </div>

      <div className="departments-grid">
        {departements.map((dept) => (
          <div key={dept.id} className="dept-card">
            <h3>Dpt. {dept.nom}</h3>
            <p>{dept.filieres.length} filière(s)</p>
            <p style={{ fontSize: "11px", marginTop: "8px", color: "var(--ardoise)" }}>
              <Link href={`/admin/structure/${dept.id}`} style={{ color: "var(--encre)" }}>
                Gérer →
              </Link>
            </p>
          </div>
        ))}
      </div>

      {departements.length === 0 && (
        <div className="empty-message">
          Aucun département créé. Commencez par ajouter un département.
        </div>
      )}
    </div>
  );
}
