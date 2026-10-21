import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getSiteUrl } from "@/lib/siteUrl";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteDescription =
  "あなたが元首ならどうする！？国家運営シミュレーション Nation";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Nation",
  description: siteDescription,
  openGraph: {
    title: "Nation",
    description: siteDescription,
    type: "website",
    locale: "ja_JP",
    images: [
      {
        url: "/images/og.jpg",
        width: 1024,
        height: 576,
        alt: "Nation — 国家運営シミュレーション",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nation",
    description: siteDescription,
    images: ["/images/og.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
