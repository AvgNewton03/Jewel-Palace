import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import CartDrawer from "@/components/CartDrawer";
import MobileMenu from "@/components/MobileMenu";
import { UIProvider } from "@/context/UIContext";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jewel Palace | Exquisite Imitation Jewellery",
  description: "Discover our festive and vibrant collection of imitation jewellery. Shop wedding, heavy, and casual pieces.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} ${playfair.variable} antialiased min-h-screen flex flex-col relative`}
      >
        <UIProvider>
          <Navbar />
          <MobileMenu />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
          <WhatsAppButton />
          <CartDrawer />
        </UIProvider>
      </body>
    </html>
  );
}
