import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Iron Makers & AI - Cursos de IA y Robótica",
  description: "Plataforma educativa con cursos de Inteligencia Artificial y Robótica",
  icons: {
    icon: "https://zksisjytdffzxjtplwsd.supabase.co/storage/v1/object/public/images/team/logo_oficial.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
