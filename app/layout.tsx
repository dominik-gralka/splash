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
    <html lang="de" className="dark">
      <body className="antialiased min-h-screen bg-background font-sans">
        {children}
      </body>
    </html>
  );
}
