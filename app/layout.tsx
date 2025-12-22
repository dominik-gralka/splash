import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Splash - Das Impostor-Kartenspiel",
  description: "Spiele Splash, das spannende Impostor-Kartenspiel online mit Freunden",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
