import { RaffleDetailClient } from "./raffle-detail-client"

// For static export, we need to generate params at build time
// Since we can't know all raffle IDs at build time, we'll generate a reasonable range
export async function generateStaticParams() {
  // Generate params for raffles 0-99 (you can adjust this range)
  // In a real app, you might fetch this from an API or contract
  return Array.from({ length: 100 }, (_, i) => ({
    id: i.toString(),
  }))
}

interface RaffleDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function RaffleDetailPage({ params }: RaffleDetailPageProps) {
  const { id } = await params
  const raffleId = id ? parseInt(id) : null
  
  if (raffleId === null || isNaN(raffleId)) {
    return <RaffleDetailClient raffleId={-1} />
  }
  
  return <RaffleDetailClient raffleId={raffleId} />
}
