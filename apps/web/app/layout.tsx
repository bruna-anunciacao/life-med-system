import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";

import { ReactQueryProvider } from "./ReactQueryProvider";
import { Geist } from "next/font/google";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Life Med System",
  description:
    "Sistema de agendamento de consultas médicas e gestão de clínicas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={cn(
        "font-sans",
        geist.variable,
        plusJakarta.variable,
        jetbrainsMono.variable,
      )}
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} font-[var(--font-plus-jakarta)]`}
      >
        <ReactQueryProvider>
          <Toaster richColors position="top-center" />
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  );
}
