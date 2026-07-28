import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduSuivi — INSG",
  description: "Suivi pédagogique des séances de cours",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
