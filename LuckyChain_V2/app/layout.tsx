import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Web3Provider } from './context/Web3Context'
import { Toaster } from "@/components/ui/toaster"
import { ErrorBoundary } from "@/components/error-boundary"

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'LuckyChain - Transparent Raffle Platform',
  description: 'Create and participate in provably fair raffles on the Ethereum blockchain',
  generator: 'v0.app',
  icons: {
    icon: '/p_heart.webp',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <ErrorBoundary>
          <Web3Provider>
            {children}
            <Toaster />
          </Web3Provider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
