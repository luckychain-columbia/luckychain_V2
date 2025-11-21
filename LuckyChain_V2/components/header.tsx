import Link from "next/link";
import { WalletConnect } from "@/components/wallet-connect";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <nav className="flex container mx-auto py-8 items-center justify-between flex-wrap gap-2 md:gap-0 min-w-0">
      <Link
        href="/"
        className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity flex-shrink-0 min-w-0"
      >
        <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/50 relative z-10 flex-shrink-0">
          <Trophy className="h-5 w-5 md:h-8 md:w-8 text-white drop-shadow-lg" />
        </div>
        <span className="text-xl md:text-3xl font-bold tracking-tight text-white relative z-10 truncate">
          LuckyChain
        </span>
      </Link>
      <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0 min-w-0">
        <Link href="/fyi">
          <Button
            variant="ghost"
            className="text-white hover:text-white hover:bg-white/10 text-xs md:text-base px-2 md:px-4"
          >
            How It Works
          </Button>
        </Link>
        <Link href="/developers">
          <Button
            variant="ghost"
            className="text-white hover:text-white hover:bg-white/10 text-xs md:text-base px-2 md:px-4"
          >
            Developers
          </Button>
        </Link>
        <WalletConnect />
      </div>
    </nav>
  );
}
