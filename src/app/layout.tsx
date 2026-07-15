import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "Kevin Wedding Planner",
  description: "Persiapan pernikahan — vendor, budget, tamu, dan to-do.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full">
        <div className="min-h-screen flex flex-col md:flex-row">
          <Nav />
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8 max-w-5xl w-full mx-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
