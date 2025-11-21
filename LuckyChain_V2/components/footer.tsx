import { Trophy } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/30 mt-24 relative">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
      <div className="container mx-auto px-4 py-10 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/30 relative z-10">
              <Trophy className="h-6 w-6 text-white drop-shadow-lg" />
            </div>
            <span className="font-semibold text-lg text-white relative z-10">
              LuckyChain
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Powered by Ethereum • Built with Solidity
          </p>
        </div>
      </div>
    </footer>
  );
}
