import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "./globals.css";

import { Inter } from "next/font/google";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Medico",
  description:
    "The Doctor App is designed to enhance the workflow of medical professionals by providing tools for appointment management, professional networking, research sharing, and peer collaboration.",
  icons: {
    icon: [
      {
        // media: "(prefers-color-scheme: light)",
        url: "/logos/medico-logo.svg",
        href: "/logos/medico-logo.svg",
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <ReactQueryProvider>{children}</ReactQueryProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
