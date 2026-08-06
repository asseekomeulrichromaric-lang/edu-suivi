import Link from "next/link";
import { notFound } from "next/navigation";
import { FiEdit, FiArrowLeft } from "react-icons/fi";
import { prisma } from "@/lib/prisma";
import "@/app/(back-office)/styles/structure.css";

const LIBELLES_ROLE: Record<string, string> = {
  ADMINISTRATEUR: "Administrateur",
  CHEF_DEPARTEMENT: "Chef de département",
  ENSEIGNANT: "Enseignant",
  CHEF_CLASSE: "Chef de classe",
};

const COULEURS_ROLE: Record<string, { fg: string; bg: string }> = {
  ADMINISTRATEUR: { fg: "#b0413e", bg: "#fcebeb" },
  CHEF_DEPARTEMENT: { fg: "#2b6cb0", bg: "#e6f1fb" },
  ENSEIGNANT: { fg: "#2f7d5a", bg: "#eaf3de" },
  CHEF_CLASSE: { fg: "#c77d2e", bg: "#faeeda" },
};

function formaterDate(date: Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function DetailUtilisateurPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const utilisateur = await prisma.utilisateur.findUnique({
    where: { id },
    include: {
      departement: true,
      affectationsEnseignant: { include: { matiere: true, niveau: { include: { filiere: true } } } },
      fichesChefClasse: { include: { affectation: { include: { matiere: true, niveau: { include: { filiere: true } } } } } },
      evenements: { orderBy: { horodatage: "desc" }, take: 5, include: { fiche: true } },
    },
  });

  if (!utilisateur) notFound();

  const couleurRole = COULEURS_ROLE[utilisateur.role] ?? { fg: "#6b7280", bg: "#f7f5f0" };

  return (
    <div>
      <div className="personnel-header">
        <Link
          href="/admin/utilisateurs"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            textDecoration: "none",
            marginBottom: 12,
          }}
        >
          <FiArrowLeft /> Retour à la liste
        </Link>
        <h1>Détail du compte</h1>
        <p>Informations complètes {"de l'utilisateur"}</p>
      </div>

      <div className="carte" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div
            className="personnel-avatar"
            style={{ width: 56, height: 56, fontSize: 24 }}
          >
            {utilisateur.prenom[0]}
            {utilisateur.nom[0]}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 22 }}>
              {utilisateur.prenom} {utilisateur.nom}
            </h2>
            <p style={{ margin: "4px 0 0", color: "var(--ardoise)", fontSize: 14 }}>
              {utilisateur.email}
            </p>
          </div>
          <span
            style={{
              padding: "6px 12px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              color: couleurRole.fg,
              background: couleurRole.bg,
            }}
          >
            {LIBELLES_ROLE[utilisateur.role] ?? utilisateur.role}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 20,
            paddingTop: 16,
            borderTop: "1px solid #e5e3dc",
            flexWrap: "wrap",
          }}
        >
          <Link href={`/admin/utilisateurs/${utilisateur.id}/modifier`} className="add-button">
            <FiEdit style={{ verticalAlign: "middle", marginRight: 4 }} />
            Modifier les informations
          </Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div className="carte">
          <h3 style={{ margin: "0 0 12px", fontSize: 14, textTransform: "uppercase", color: "var(--encre)" }}>
            Informations générales
          </h3>
          <table style={{ width: "100%", fontSize: 13 }}>
            <tbody>
              <tr>
                <td style={{ padding: "6px 0", color: "var(--ardoise)" }}>Nom complet</td>
                <td style={{ padding: "6px 0", textAlign: "right" }}>
                  {utilisateur.prenom} {utilisateur.nom}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: "var(--ardoise)" }}>E-mail</td>
                <td style={{ padding: "6px 0", textAlign: "right" }}>{utilisateur.email}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: "var(--ardoise)" }}>Rôle</td>
                <td style={{ padding: "6px 0", textAlign: "right" }}>
                  {LIBELLES_ROLE[utilisateur.role] ?? utilisateur.role}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: "var(--ardoise)" }}>Département</td>
                <td style={{ padding: "6px 0", textAlign: "right" }}>
                  {utilisateur.departement?.nom ?? "—"}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: "var(--ardoise)" }}>Membre depuis</td>
                <td style={{ padding: "6px 0", textAlign: "right" }}>
                  {formaterDate(utilisateur.createdAt)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="carte">
          <h3 style={{ margin: "0 0 12px", fontSize: 14, textTransform: "uppercase", color: "var(--encre)" }}>
            Affectations pédagogiques
          </h3>
          {utilisateur.affectationsEnseignant.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: "var(--ardoise)" }}>
              Aucune affectation enregistrée.
            </p>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {utilisateur.affectationsEnseignant.map((a) => (
                <li
                  key={a.id}
                  style={{
                    padding: "8px 0",
                    borderBottom: "1px solid #eee",
                    fontSize: 13,
                  }}
                >
                  {a.matiere.nom} — {a.niveau.filiere.nom} {a.niveau.libelle}
                  <span style={{ color: "var(--ardoise)", fontSize: 12 }}> • {a.anneeAcademique}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="carte">
          <h3 style={{ margin: "0 0 12px", fontSize: 14, textTransform: "uppercase", color: "var(--encre)" }}>
            Fiches (chef de classe)
          </h3>
          {utilisateur.fichesChefClasse.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: "var(--ardoise)" }}>
              Aucune fiche en tant que chef de classe.
            </p>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {utilisateur.fichesChefClasse.map((fiche) => (
                <li
                  key={fiche.id}
                  style={{
                    padding: "8px 0",
                    borderBottom: "1px solid #eee",
                    fontSize: 13,
                  }}
                >
                  <Link href={`/fiches/${fiche.id}`} style={{ textDecoration: "none" }}>
                    {fiche.reference}
                  </Link>
                  <span style={{ color: "var(--ardoise)", fontSize: 12 }}>
                    {" "}
                    — {fiche.affectation.matiere.nom}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="carte">
        <h3 style={{ margin: "0 0 12px", fontSize: 14, textTransform: "uppercase", color: "var(--encre)" }}>
          Activité récente
        </h3>
        {utilisateur.evenements.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: "var(--ardoise)" }}>
            Aucune activité récente.
          </p>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {utilisateur.evenements.map((e) => (
              <li
                key={e.id}
                style={{
                  padding: "8px 0",
                  borderBottom: "1px solid #eee",
                  fontSize: 13,
                }}
              >
                <span style={{ fontWeight: 600 }}>{e.typeEvenement}</span>
                <span style={{ color: "var(--ardoise)", fontSize: 12 }}>
                  {" "}
                  — {e.fiche.reference} —{" "}
                  {new Date(e.horodatage).toLocaleString("fr-FR")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}