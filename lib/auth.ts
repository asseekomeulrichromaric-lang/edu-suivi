// Authentification "maison", volontairement simple à comprendre plutôt que
// d'utiliser une librairie comme NextAuth qui ajoute beaucoup de concepts nouveaux.
//
// Le principe : quand quelqu'un se connecte, on met dans son navigateur un
// "cookie" (un petit fichier texte) qui contient son identifiant et son rôle,
// signé avec une clé secrète pour que personne ne puisse le falsifier.
// À chaque requête, on relit ce cookie pour savoir qui parle.
//
// NOTE TECHNIQUE : on utilise l'API Web Crypto (crypto.subtle) plutôt que le
// module "crypto" de Node, car ce fichier est aussi utilisé par le middleware,
// qui tourne dans un environnement ("Edge Runtime") où seul Web Crypto est
// disponible. C'est une API un peu plus verbeuse mais standard du navigateur.

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export const NOM_COOKIE = "edusuivi_session";
const SECRET = process.env.SESSION_SECRET ?? "secret-de-developpement-a-changer";

export type DonneesSession = {
  utilisateurId: string;
  role: string;
};

// --- Mots de passe ---

export async function hashMotDePasse(motDePasse: string): Promise<string> {
  return bcrypt.hash(motDePasse, 10);
}

export async function verifierMotDePasse(motDePasse: string, hash: string): Promise<boolean> {
  return bcrypt.compare(motDePasse, hash);
}

// --- Signature du cookie avec Web Crypto (compatible Edge Runtime) ---

async function importerCle() {
  const encodeur = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encodeur.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function signer(valeur: string): Promise<string> {
  const cle = await importerCle();
  const signatureBuffer = await crypto.subtle.sign("HMAC", cle, new TextEncoder().encode(valeur));
  return Buffer.from(signatureBuffer).toString("hex");
}

async function creerJeton(donnees: DonneesSession): Promise<string> {
  const payload = Buffer.from(JSON.stringify(donnees)).toString("base64url");
  const signature = await signer(payload);
  return `${payload}.${signature}`;
}

// Fonction "pure" (pas de dépendance à next/headers) : utilisable aussi bien
// dans une route API/page (runtime Node) que dans le middleware (Edge Runtime).
export async function verifierJeton(jeton: string | undefined): Promise<DonneesSession | null> {
  if (!jeton) return null;
  const [payload, signature] = jeton.split(".");
  if (!payload || !signature) return null;

  const signatureAttendue = await signer(payload);
  if (signatureAttendue !== signature) return null; // le cookie a été modifié : on refuse

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString());
  } catch {
    return null;
  }
}

// --- Session (utilisées dans les routes API / pages, PAS dans le middleware) ---

// Appelée par la route de connexion, une fois l'e-mail/mot de passe vérifiés.
export async function creerSession(donnees: DonneesSession) {
  const jeton = await creerJeton(donnees);
  const store = await cookies();
  store.set(NOM_COOKIE, jeton, {
    httpOnly: true, // inaccessible au JavaScript du navigateur, donc plus sûr
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  });
}

// Utilisée dans les routes API et les pages pour savoir qui est connecté.
export async function getSession(): Promise<DonneesSession | null> {
  const store = await cookies();
  const jeton = store.get(NOM_COOKIE)?.value;
  return verifierJeton(jeton);
}

export async function detruireSession() {
  const store = await cookies();
  store.delete(NOM_COOKIE);
}
