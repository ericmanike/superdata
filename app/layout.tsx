import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hubsitedata.com"),
  title: {
    default: "hubsitedata | Buy Data Bundles Instantly",
    template: "%s | hubsitedata"
  },
  description: "Affordable mobile data bundles for MTN, Telecel, and AirtelTigo with instant delivery and secure wallet payments.",
  keywords: ["buy data", "ghana data bundles", "cheap data", "MTN data", "Telecel data", "AirtelTigo data", "hubsitedata"],
  authors: [{ name: "hubsitedata" }],
  creator: "hubsitedata",
  publisher: "hubsitedata",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_GH",
    url: "https://hubsitedata.com",
    siteName: "hubsitedata",
    title: "hubsitedata | Buy Data Bundles Instantly",
    description: "Instant delivery of affordable data bundles across all networks in Ghana.",
    images: [
      {
        url: "/og-image.png", // Ensure this image exists in public folder
        width: 1200,
        height: 630,
        alt: "hubsitedata Dashboard preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "hubsitedata | Affordable Data Bundles",
    description: "Buy data bundles instantly across all networks in Ghana.",
    images: ["/og-image.png"],
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
  verification: {
    google: "google-site-verification-id", // User should replace with actual ID
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <ToastContainer position="top-right" autoClose={5000} theme="light" />
        </AuthProvider>
      </body>
    </html>
  );
}
