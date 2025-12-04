import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paradas Caldeira",
  description:
    "Dashboard simplificado para gestão de ordens de serviço em pacotes e subpacotes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
