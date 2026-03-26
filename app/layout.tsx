import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { PwaRegister } from "@/components/pwa-register";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://print-syte.vercel.app";

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PrintSyte | AI Passport Photo Generator",
    template: "%s | PrintSyte",
  },
  description:
    "Create professional studio-style passport photos, visa photos, and ID photos online for free. AI-powered background removal, automatic cropping, and print-ready 4x6 sheets.",
  applicationName: "PrintSyte",
  keywords: [
    "passport photo generator",
    "passport photo maker",
    "id photo creator",
    "visa photo tool",
    "free passport photo",
    "ai background remover",
    "printable passport photo",
    "4x6 passport photo sheet",
    "cv photo maker",
  ],
  authors: [{ name: "PrintSyte" }],
  creator: "PrintSyte",
  publisher: "PrintSyte",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // Verification
  verification: {
    google: "lISWjTh46MqNlbfazsCt_20uXcu06S6HAGk0POEYpT4",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "PrintSyte | AI Passport Photo Generator",
    description:
      "Create professional studio-style passport photos online. Remove background with AI, generate print-ready photo sheets, and download or print in seconds.",
    siteName: "PrintSyte",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "PrintSyte | AI Passport Photo Generator",
    description:
      "Generate passport photos instantly with AI background removal and print-ready sheet export.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PrintSyte",
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
