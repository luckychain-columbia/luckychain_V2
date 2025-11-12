import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Web3Provider } from './context/Web3Context'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'LuckyChain - Transparent Lottery Platform',
  description: 'Create and participate in provably fair lotteries on the Ethereum blockchain',
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
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  )
}
