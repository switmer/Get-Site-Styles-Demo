import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Get-Site-Styles Demo",
  description: "Extract design tokens from any website and convert them to your preferred format",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`try{var t=localStorage.getItem('theme');var d=t? t==='dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark', d);}catch(e){}`}
        </Script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
