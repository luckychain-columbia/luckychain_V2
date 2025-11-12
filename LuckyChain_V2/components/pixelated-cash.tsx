"use client"

import { useEffect, useState } from "react"

interface CashBill {
  id: number
  x: number
  y: number
  rotation: number
  delay: number
  duration: number
}

export function PixelatedCash() {
  const [bills, setBills] = useState<CashBill[]>([])

  useEffect(() => {
    // Generate random cash bills
    const newBills: CashBill[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -20 - Math.random() * 50,
      rotation: Math.random() * 360,
      delay: Math.random() * 5,
      duration: 15 + Math.random() * 10,
    }))
    setBills(newBills)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {bills.map((bill) => (
        <div
          key={bill.id}
          className="pixelated-cash"
          style={{
            left: `${bill.x}%`,
            top: `${bill.y}%`,
            animationDelay: `${bill.delay}s`,
            animationDuration: `${bill.duration}s`,
            transform: `rotate(${bill.rotation}deg)`,
          }}
        >
          <svg width="48" height="24" viewBox="0 0 48 24" fill="none" className="pixelated">
            {/* Pixelated dollar bill */}
            <rect x="0" y="0" width="48" height="24" fill="#2DD881" />
            <rect x="2" y="2" width="44" height="20" fill="#1FB76B" />
            <rect x="4" y="4" width="40" height="16" fill="#2DD881" />
            {/* Dollar sign - pixelated */}
            <rect x="20" y="6" width="2" height="2" fill="#1FB76B" />
            <rect x="18" y="8" width="2" height="2" fill="#1FB76B" />
            <rect x="20" y="8" width="2" height="2" fill="#1FB76B" />
            <rect x="22" y="8" width="2" height="2" fill="#1FB76B" />
            <rect x="18" y="10" width="2" height="2" fill="#1FB76B" />
            <rect x="20" y="10" width="2" height="2" fill="#1FB76B" />
            <rect x="22" y="10" width="2" height="2" fill="#1FB76B" />
            <rect x="20" y="12" width="2" height="2" fill="#1FB76B" />
            <rect x="22" y="12" width="2" height="2" fill="#1FB76B" />
            <rect x="24" y="12" width="2" height="2" fill="#1FB76B" />
            <rect x="20" y="14" width="2" height="2" fill="#1FB76B" />
            {/* Corner decorations */}
            <rect x="6" y="6" width="2" height="2" fill="#1FB76B" />
            <rect x="40" y="6" width="2" height="2" fill="#1FB76B" />
            <rect x="6" y="16" width="2" height="2" fill="#1FB76B" />
            <rect x="40" y="16" width="2" height="2" fill="#1FB76B" />
          </svg>
        </div>
      ))}
    </div>
  )
}
