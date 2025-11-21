import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "./context/Web3Context";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/error-boundary";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Background from "@/components/background";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LuckyChain - Transparent Raffle Platform",
  description:
    "Create and participate in provably fair raffles on the Ethereum blockchain",
  generator: "v0.app",
  icons: {
    icon: "/luckychain_V2/p_heart.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <ErrorBoundary>
          <Web3Provider>
            <div className="min-h-screen relative overflow-hidden">
              <Background />
              <Header />
              {children}
              <Footer />
            </div>
            <Toaster />
          </Web3Provider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
