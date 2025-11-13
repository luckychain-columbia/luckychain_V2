import { Card } from "@/components/ui/card"

export function RaffleCardSkeleton() {
  return (
    <Card className="glass-strong glow-border overflow-hidden border-0 shadow-2xl h-full flex flex-col animate-pulse">
      <div className="p-7 pb-0 flex flex-col flex-1 min-h-0 gap-6">
        {/* Header */}
        <div className="space-y-3 flex-shrink-0">
          <div className="h-6 w-20 bg-muted/50 rounded-full" />
          <div className="h-8 w-full bg-muted/50 rounded" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted/50 rounded" />
            <div className="h-4 w-3/4 bg-muted/50 rounded" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="h-4 w-16 bg-muted/50 rounded" />
            <div className="h-4 w-24 bg-muted/50 rounded" />
          </div>
          <div className="h-2.5 w-full bg-muted/50 rounded-full" />
        </div>

        {/* Ticket + Prize Info */}
        <div className="grid grid-cols-2 gap-4 flex-shrink-0">
          <div className="h-24 bg-muted/50 rounded-2xl" />
          <div className="h-24 bg-muted/50 rounded-2xl" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-shrink-0">
          <div className="h-20 bg-muted/50 rounded-2xl" />
          <div className="h-20 bg-muted/50 rounded-2xl" />
          <div className="h-20 bg-muted/50 rounded-2xl" />
        </div>

        {/* Time + Participants */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="h-4 w-24 bg-muted/50 rounded" />
          <div className="h-4 w-20 bg-muted/50 rounded" />
        </div>
      </div>

      {/* Button */}
      <div className="flex-shrink-0 px-7 pb-7 pt-1.5 border-t border-border/20">
        <div className="h-12 w-full bg-muted/50 rounded-lg" />
      </div>
    </Card>
  )
}

