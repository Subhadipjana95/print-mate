import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { PwaRegister } from "@/components/pwa-register";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://printmate.vercel.app";

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PrintMate | AI Passport Photo Generator",
    template: "%s | PrintMate",
  },
  description:
    "Create studio-style passport photos online. Remove background with AI, generate print-ready photo sheets, and download or print in seconds.",
  applicationName: "PrintMate",
  referrer: "origin-when-cross-origin",
  keywords: [
    "passport photo generator",
    "passport photo maker",
    "ai background remover",
    "visa photo tool",
    "printable passport photo",
    "4x6 passport photo sheet",
  ],
  authors: [{ name: "PrintMate" }],
  creator: "PrintMate",
  publisher: "PrintMate",
  category: "Photography",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "PrintMate | AI Passport Photo Generator",
    description:
      "Create studio-style passport photos online. Remove background with AI, generate print-ready photo sheets, and download or print in seconds.",
    siteName: "PrintMate",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PrintMate passport photo generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PrintMate | AI Passport Photo Generator",
    description:
      "Generate passport photos instantly with AI background removal and print-ready sheet export.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PrintMate",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased dark",
        fontMono.variable,
        "font-sans",
        geist.variable
      )}
    >
      <body>
        <PwaRegister />
        <ThemeProvider defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
