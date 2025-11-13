"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import useContract from "@/app/services/contract"
import { useWeb3 } from "@/app/context/Web3Context"
import { extractErrorMessage } from "@/app/services/contract-utils"

interface CreateRaffleDialogProps {
  onSuccess?: () => void
}

export function CreateRaffleDialog({ onSuccess }: CreateRaffleDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { createRaffle } = useContract()
  const { account } = useWeb3()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    entryFee: "",
    creatorFee: 5,
    numberOfWinners: "1",
    endDateTime: "",
    maxEntrants: "",
    allowMultipleEntries: true,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Prevent multiple simultaneous submissions
    if (isLoading) {
      return
    }
    
    if (!account) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to create a raffle",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Validate title
      if (!formData.title?.trim()) {
        throw new Error("Please enter a raffle title")
      }

      // Validate entry fee
      const entryFee = parseFloat(formData.entryFee)
      if (isNaN(entryFee) || entryFee <= 0) {
        throw new Error("Please enter a valid ticket price (greater than 0)")
      }
      if (entryFee > 1000) {
        throw new Error("Ticket price cannot exceed 1000 ETH")
      }
      if (!Number.isFinite(entryFee)) {
        throw new Error("Ticket price must be a valid number")
      }

      // Validate end date
      if (!formData.endDateTime) {
        throw new Error("Please select an end date and time")
      }

      const endDate = new Date(formData.endDateTime)
      if (isNaN(endDate.getTime())) {
        throw new Error("Invalid end date format")
      }

      const endTimestamp = Math.floor(endDate.getTime() / 1000)
      const nowSeconds = Math.floor(Date.now() / 1000)
      const minEndTime = nowSeconds + 60 // At least 1 minute in the future

      if (endTimestamp < minEndTime) {
        throw new Error("End date must be at least 1 minute in the future")
      }

      // Validate number of winners
      const numWinnersValue = formData.numberOfWinners.trim()
      if (!numWinnersValue) {
        throw new Error("Number of winners is required")
      }
      const numWinners = parseInt(numWinnersValue, 10)
      if (isNaN(numWinners) || numWinners < 1 || numWinners > 100 || !Number.isInteger(numWinners)) {
        throw new Error("Number of winners must be an integer between 1 and 100")
      }

      // Validate max entrants (matches contract MAX_TICKETS_PER_RAFFLE = 10,000)
      const maxEntrants =
        formData.maxEntrants.trim().length > 0
          ? (() => {
              const parsed = parseInt(formData.maxEntrants, 10)
              if (isNaN(parsed) || parsed < 1 || !Number.isInteger(parsed)) {
                throw new Error("Max entrants must be a positive integer")
              }
              if (parsed < numWinners) {
                throw new Error(`Max entrants (${parsed}) cannot be less than number of winners (${numWinners})`)
              }
              if (parsed > 10000) {
                throw new Error("Max entrants cannot exceed 10,000")
              }
              return parsed
            })()
          : null

      // Validate creator fee
      const creatorFee = Math.max(0, Math.min(100, formData.creatorFee))

      await createRaffle({
        title: formData.title.trim(),
        description: (formData.description || formData.title).trim(),
        entryFee: formData.entryFee,
        endDateTime: endTimestamp,
        numWinners,
        creatorFeePct: creatorFee,
        maxEntrants,
        allowMultipleEntries: formData.allowMultipleEntries,
      })

      toast({
        title: "Success!",
        description: "Raffle created successfully",
      })

      setOpen(false)
      setFormData({
        title: "",
        description: "",
        entryFee: "",
        creatorFee: 5,
        numberOfWinners: "1",
        endDateTime: "",
        maxEntrants: "",
        allowMultipleEntries: true,
      })
      onSuccess?.()
    } catch (error: any) {
      // Extract user-friendly error message
      const errorMessage = extractErrorMessage(error, "Failed to create raffle")
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="glass-strong font-medium text-white">
          <Plus className="mr-2 h-4 w-4" />
          Create Raffle
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black/80 backdrop-blur-xl border-white/20 sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-4xl font-bold text-white">Create New Raffle</DialogTitle>
          <DialogDescription className="text-gray-300 text-base">
            Set up your raffle parameters. All fields are stored on the blockchain.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white font-medium">
              Raffle Title <span className="text-red-400">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Weekly Mega Jackpot"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value.slice(0, 50) })}
              required
              maxLength={50}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
            <p className="text-sm text-gray-400">{formData.title.length}/50 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white font-medium">
              Description
            </Label>
            <Input
              id="description"
              placeholder="Describe your raffle..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="entryFee" className="text-white font-medium">
              Entry Fee (ETH) <span className="text-red-400">*</span>
            </Label>
            <Input
              id="entryFee"
              type="number"
              step="0.0001"
              min="0.0001"
              max="1000"
              placeholder="0.01"
              value={formData.entryFee}
              onChange={(e) => {
                const value = e.target.value
                // Allow empty input for user experience
                if (value === "") {
                  setFormData({ ...formData, entryFee: "" })
                  return
                }
                const numValue = parseFloat(value)
                // Validate: must be positive and finite
                if (!isNaN(numValue) && numValue > 0 && numValue <= 1000 && Number.isFinite(numValue)) {
                  setFormData({ ...formData, entryFee: value })
                }
              }}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
            <p className="text-sm text-gray-400">How much ETH to enter the raffle</p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="creatorFee" className="text-white font-medium">
              Creator Fee (%)
            </Label>
            <div className="flex items-center gap-4">
              <input
                id="creatorFee"
                type="range"
                min="0"
                max="50"
                value={formData.creatorFee}
                onChange={(e) => setFormData({ ...formData, creatorFee: Number(e.target.value) })}
                className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <span className="text-2xl font-bold text-purple-400 min-w-[80px] text-right">{formData.creatorFee}%</span>
            </div>
            <p className="text-sm text-gray-400">
              Creator keeps {formData.creatorFee}% of the total pot. Winners share {100 - formData.creatorFee}% evenly.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numberOfWinners" className="text-white font-medium">
              Number of Winners <span className="text-red-400">*</span>
            </Label>
            <Input
              id="numberOfWinners"
              type="number"
              min="1"
              max="100"
              step="1"
              placeholder="1"
              value={formData.numberOfWinners}
              onChange={(e) => {
                const value = e.target.value
                // Allow empty input temporarily
                if (value === "") {
                  setFormData({ ...formData, numberOfWinners: "" })
                  return
                }
                const numValue = parseInt(value, 10)
                // Validate: must be positive integer between 1 and 100
                if (!isNaN(numValue) && numValue >= 1 && numValue <= 100 && Number.isInteger(numValue)) {
                  setFormData({ ...formData, numberOfWinners: value })
                }
              }}
              onBlur={(e) => {
                // Ensure value is valid on blur
                const value = parseInt(e.target.value, 10)
                if (isNaN(value) || value < 1) {
                  setFormData({ ...formData, numberOfWinners: "1" })
                } else if (value > 100) {
                  setFormData({ ...formData, numberOfWinners: "100" })
                }
              }}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
            <p className="text-sm text-gray-400">Prize pool will be split equally among winners (1-100)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDateTime" className="text-white font-medium">
              End Date & Time <span className="text-red-400">*</span>
            </Label>
            <Input
              id="endDateTime"
              type="datetime-local"
              value={formData.endDateTime}
              onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
              required
              className="bg-white/10 border-white/20 text-white"
            />
            <p className="text-sm text-gray-400">When the raffle will automatically end and select winners</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxEntrants" className="text-white font-medium">
              Maximum Entrants (Optional)
            </Label>
            <Input
              id="maxEntrants"
              type="number"
              min="1"
              step="1"
              max="10000"
              placeholder="Leave empty for unlimited"
              value={formData.maxEntrants}
              onChange={(e) => {
                const value = e.target.value
                // Allow empty input for unlimited
                if (value === "") {
                  setFormData({ ...formData, maxEntrants: "" })
                  return
                }
                const numValue = parseInt(value, 10)
                // Validate: must be positive integer between 1 and 10,000
                if (!isNaN(numValue) && numValue >= 1 && numValue <= 10000 && Number.isInteger(numValue)) {
                  setFormData({ ...formData, maxEntrants: value })
                }
              }}
              onBlur={(e) => {
                // Ensure value is valid on blur and at least equal to number of winners
                const value = e.target.value
                if (value === "") {
                  return
                }
                const numValue = parseInt(value, 10)
                const numWinnersValue = parseInt(formData.numberOfWinners.trim() || "1", 10)
                const minWinners = isNaN(numWinnersValue) ? 1 : numWinnersValue
                
                if (isNaN(numValue) || numValue < 1 || numValue > 10000) {
                  setFormData({ ...formData, maxEntrants: "" })
                  return
                }
                // Validate against number of winners
                if (numValue < minWinners) {
                  // Auto-adjust to minimum required value
                  setFormData({ ...formData, maxEntrants: minWinners.toString() })
                }
              }}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
            <p className="text-sm text-gray-400">
              Leave empty for unlimited participants. Must be at least {formData.numberOfWinners.trim() || "1"} (number of winners) and cannot exceed 10,000.
            </p>
          </div>

          <div className="flex items-start space-x-3 p-4 rounded-lg border border-white/20 bg-white/10">
            <Checkbox
              id="allowMultipleEntries"
              checked={formData.allowMultipleEntries}
              onCheckedChange={(checked) => setFormData({ ...formData, allowMultipleEntries: checked as boolean })}
              className="mt-1"
            />
            <div className="space-y-1">
              <Label htmlFor="allowMultipleEntries" className="text-white font-medium cursor-pointer">
                Allow Multiple Entries Per Wallet
              </Label>
              <p className="text-sm text-gray-400">If checked, users can buy multiple tickets for this raffle</p>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium"
              size="lg"
            >
              {isLoading ? "Creating..." : "Create Raffle"}
            </Button>
            <p className="text-sm text-gray-400 text-center">
              This will create a transaction in your wallet for you to approve
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
