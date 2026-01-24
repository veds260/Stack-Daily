import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stack Daily",
  description: "Join the Stack Daily talent network",
  openGraph: {
    title: "Stack Daily",
    description: "Join the Stack Daily talent network",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stack Daily",
    description: "Join the Stack Daily talent network",
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
