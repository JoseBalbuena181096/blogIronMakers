import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blog Educativo - Cursos de IA y Robótica",
  description: "Plataforma educativa con cursos de Inteligencia Artificial y Robótica",
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
