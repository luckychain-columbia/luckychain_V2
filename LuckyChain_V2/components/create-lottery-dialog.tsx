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

interface CreateLotteryDialogProps {
  onSuccess?: () => void
}

export function CreateLotteryDialog({ onSuccess }: CreateLotteryDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { createLottery } = useContract()
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
    
    if (!account) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to create a lottery",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      if (!formData.endDateTime) {
        throw new Error("Please select an end date and time")
      }

      const endDate = new Date(formData.endDateTime)
      const endTimestamp = Math.floor(endDate.getTime() / 1000)
      const nowSeconds = Math.floor(Date.now() / 1000)

      if (endTimestamp <= nowSeconds) {
        throw new Error("End date must be in the future")
      }

      const maxEntrants =
        formData.maxEntrants.trim().length > 0
          ? parseInt(formData.maxEntrants, 10)
          : null

      const numWinners = Math.max(1, parseInt(formData.numberOfWinners, 10) || 1)

      await createLottery({
        title: formData.title,
        description: formData.description || formData.title,
        entryFee: formData.entryFee,
        endDateTime: endTimestamp,
        numWinners,
        creatorFeePct: formData.creatorFee,
        maxEntrants,
        allowMultipleEntries: formData.allowMultipleEntries,
      })

      toast({
        title: "Success!",
        description: "Lottery created successfully",
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
      toast({
        title: "Error",
        description: error.message || "Failed to create lottery",
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
          Create Lottery
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black/80 backdrop-blur-xl border-white/20 sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-4xl font-bold text-white">Create New Lottery</DialogTitle>
          <DialogDescription className="text-gray-300 text-base">
            Set up your lottery parameters. All fields are stored on the blockchain.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white font-medium">
              Lottery Title <span className="text-red-400">*</span>
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
              placeholder="Describe your lottery..."
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
              step="0.01"
              placeholder="0.01"
              value={formData.entryFee}
              onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
            <p className="text-sm text-gray-400">How much ETH to enter the lottery</p>
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
              placeholder="1"
              value={formData.numberOfWinners}
              onChange={(e) => setFormData({ ...formData, numberOfWinners: e.target.value })}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
            <p className="text-sm text-gray-400">Prize pool will be split equally among winners</p>
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
            <p className="text-sm text-gray-400">When the lottery will automatically end and select winners</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxEntrants" className="text-white font-medium">
              Maximum Entrants (Optional)
            </Label>
            <Input
              id="maxEntrants"
              type="number"
              placeholder="Leave empty for unlimited"
              value={formData.maxEntrants}
              onChange={(e) => setFormData({ ...formData, maxEntrants: e.target.value })}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
            <p className="text-sm text-gray-400">Leave empty for unlimited participants</p>
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
              <p className="text-sm text-gray-400">If checked, users can buy multiple tickets for this lottery</p>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium"
              size="lg"
            >
              {isLoading ? "Creating..." : "Create Lottery"}
            </Button>
            <p className="text-sm text-gray-400 text-center">
              This will create a transaction in MetaMask for you to approve
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
