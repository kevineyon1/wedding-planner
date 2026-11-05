import type { Metadata } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

// Di-host sendiri: build di droplet pernah gagal saat mengunduh font ini dari Google.
const cormorant = localFont({
  src: "../assets/fonts/CormorantGaramond-latin.woff2",
  weight: "300 700",
  display: "swap",
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: "Wedding Plan",
  description: "Persiapan pernikahan — vendor, budget, tamu, dan to-do.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${geist.variable} ${cormorant.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
