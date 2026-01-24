import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stack Daily Member Card",
  description: "Create your Stack Daily member card and flex your crypto skills",
  openGraph: {
    title: "Stack Daily Member Card",
    description: "Create your Stack Daily member card and flex your crypto skills",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stack Daily Member Card",
    description: "Create your Stack Daily member card and flex your crypto skills",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
