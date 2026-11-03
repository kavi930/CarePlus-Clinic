import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIChatWidget from "@/components/AIChatWidget";
import DemoBanner from "@/components/DemoBanner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Apex Health Clinic — Doctor Consultation | Vaishali, Ghaziabad",
    template: "%s | Apex Health Clinic",
  },
  description:
    "Apex Health Clinic in Vaishali, Ghaziabad. Outpatient primary healthcare, clinical diagnostics, and preventive medicine under Dr. Kavita Goswami (MBBS, MD). Call 8861608612 or book an appointment online.",
  keywords: [
    "Apex Health Clinic",
    "Dr. Kavita Goswami",
    "MBBS MD doctor Vaishali",
    "clinic in Vaishali Ghaziabad",
    "doctor consultation Vaishali",
    "book appointment doctor Ghaziabad",
    "primary healthcare clinic",
  ],
  openGraph: {
    title: "Apex Health Clinic — Dr. Kavita Goswami (MBBS, MD)",
    description:
      "Accessible, quality healthcare in Vaishali, Ghaziabad. Consultations with Dr. Kavita Goswami.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-slate-900 selection:bg-teal-600 selection:text-white">
        <DemoBanner />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <AIChatWidget />
      </body>
    </html>
  );
}
