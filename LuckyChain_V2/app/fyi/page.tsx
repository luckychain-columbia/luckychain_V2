"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WalletConnect } from "@/components/wallet-connect"
import { PixelatedCash } from "@/components/pixelated-cash"
import {
  Trophy,
  Shield,
  Zap,
  Coins,
  Clock,
  Users,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function FYIPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-purple-400/15 liquid-blob" />
        <div
          className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-cyan-400/12 liquid-blob"
          style={{ animationDelay: "-5s" }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-[700px] h-[700px] bg-pink-400/10 liquid-blob"
          style={{ animationDelay: "-10s" }}
        />
        <div className="absolute inset-0 grid-pattern" />
        <PixelatedCash />
      </div>

      <section className="relative">
        <div className="relative container mx-auto px-4 py-20">
          <nav className="flex items-center justify-between mb-12">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/50 relative z-10">
                <Trophy className="h-8 w-8 text-white drop-shadow-lg" />
              </div>
              <span className="text-3xl font-bold tracking-tight text-white relative z-10">
                LuckyChain
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/fyi">
                <Button
                  variant="ghost"
                  className="text-white hover:text-white hover:bg-white/10 hidden md:flex"
                >
                  How It Works
                </Button>
              </Link>
              <Link href="/developers">
                <Button
                  variant="ghost"
                  className="text-white hover:text-white hover:bg-white/10 hidden md:flex"
                >
                  Developers
                </Button>
              </Link>
              <WalletConnect />
            </div>
          </nav>

          <div className="max-w-4xl mx-auto">
            <Link href="/">
              <Button
                variant="ghost"
                className="mb-8 text-white hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>

            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                  How It Works
                </h1>
                <p className="text-xl text-white/90 max-w-2xl mx-auto">
                  Everything you need to know about LuckyChain decentralized lotteries
                </p>
              </div>

              {/* FAQ Section */}
              <Card className="glass-strong glow-border p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <HelpCircle className="h-6 w-6 text-blue-500" />
                  </div>
                  <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
                </div>
                <Accordion type="single" collapsible className="w-full space-y-2">
                  <AccordionItem value="what-is-luckychain" className="glass-strong glow-border rounded-xl px-6 border-border/40">
                    <AccordionTrigger className="text-left text-lg font-semibold !no-underline">
                      What is LuckyChain?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground space-y-3 pt-2">
                      <p>
                        LuckyChain is a decentralized lottery platform built on Ethereum smart contracts.
                        Anyone can create a lottery, set the rules, and participants can buy tickets to enter.
                        Winners are selected randomly and fairly when the lottery ends, with prizes distributed
                        automatically through the smart contract.
                      </p>
                      <div className="grid md:grid-cols-3 gap-4 mt-4">
                        <div className="glass p-4 rounded-xl border border-primary/30">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="h-5 w-5 text-primary" />
                            <span className="font-semibold">Provably Fair</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            All randomness is generated on-chain and verifiable
                          </p>
                        </div>
                        <div className="glass p-4 rounded-xl border border-secondary/30">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="h-5 w-5 text-secondary" />
                            <span className="font-semibold">Automatic Payouts</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Winners receive prizes instantly via smart contracts
                          </p>
                        </div>
                        <div className="glass p-4 rounded-xl border border-accent/30">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="h-5 w-5 text-accent" />
                            <span className="font-semibold">Decentralized</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            No central authority controls the lotteries
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="how-to-create" className="glass-strong glow-border rounded-xl px-6 border-border/40">
                    <AccordionTrigger className="text-left text-lg font-semibold !no-underline">
                      How do I create a lottery?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground space-y-3 pt-2">
                      <p>
                        Creating a lottery is simple and only takes a few steps:
                      </p>
                      <div className="space-y-3">
                        <div>
                          <p className="font-semibold text-white mb-1">Step 1: Connect Your Wallet</p>
                          <p className="text-sm">
                            Connect your Web3 wallet (like MetaMask) to create a lottery. You'll need ETH to
                            pay for the transaction gas fee.
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold text-white mb-1">Step 2: Set Lottery Parameters</p>
                          <ul className="text-sm ml-5 list-disc space-y-1">
                            <li><strong>Title & Description:</strong> Name and describe your lottery</li>
                            <li><strong>Ticket Price:</strong> How much each ticket costs in ETH</li>
                            <li><strong>End Date:</strong> When the lottery ends (must be in the future)</li>
                            <li><strong>Number of Winners:</strong> How many winners to select (1-100)</li>
                            <li><strong>Creator Fee:</strong> Your percentage of the prize pool (0-100%)</li>
                            <li><strong>Max Entrants:</strong> Maximum number of participants (optional, leave blank for unlimited)</li>
                            <li><strong>Multiple Entries:</strong> Whether participants can buy multiple tickets</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold text-white mb-1">Step 3: Deploy to Blockchain</p>
                          <p className="text-sm">
                            Click "Create Lottery" and approve the transaction in your wallet. Once confirmed,
                            your lottery is live on the blockchain and ready for participants!
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="how-to-participate" className="glass-strong glow-border rounded-xl px-6 border-border/40">
                    <AccordionTrigger className="text-left text-lg font-semibold !no-underline">
                      How do I participate in a lottery?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground space-y-3 pt-2">
                      <p>
                        To participate in a lottery, simply connect your wallet and click "Buy Ticket" on
                        any active lottery card. You'll need:
                      </p>
                      <ul className="ml-5 list-disc space-y-1">
                        <li>ETH in your wallet to pay for the ticket price</li>
                        <li>Additional ETH to cover the transaction gas fee</li>
                        <li>A Web3 wallet installed (like MetaMask)</li>
                      </ul>
                      <div className="mt-3">
                        <p className="font-semibold text-white mb-1">Multiple Tickets</p>
                        <p className="text-sm">
                          If a lottery allows multiple entries, you can buy multiple tickets at once by
                          entering the desired quantity. This increases your chances of winning!
                        </p>
                      </div>
                      <div className="glass p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 mt-3">
                        <p className="font-semibold text-yellow-500 mb-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Important Notes
                        </p>
                        <ul className="text-sm ml-5 list-disc space-y-1">
                          <li>Each lottery ticket is a separate transaction on the blockchain</li>
                          <li>You can view your tickets in the "My Lotteries" tab</li>
                          <li>Once a lottery ends, you cannot buy more tickets</li>
                          <li>All transactions are permanent and cannot be reversed</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="how-winners-selected" className="glass-strong glow-border rounded-xl px-6 border-border/40">
                    <AccordionTrigger className="text-left text-lg font-semibold !no-underline">
                      How are winners selected?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground space-y-3 pt-2">
                      <p>
                        Winners are selected using on-chain randomness that combines multiple sources to ensure fairness and unpredictability.
                      </p>
                      <div>
                        <p className="font-semibold text-white mb-2">Randomness Sources:</p>
                        <ul className="ml-5 list-disc space-y-1 text-sm">
                          <li><strong>Block Timestamp:</strong> Current block's timestamp (unpredictable)</li>
                          <li><strong>Block Prevrandao:</strong> Ethereum's built-in randomness (EIP-4399)</li>
                          <li><strong>Block Number:</strong> Current block number (sequential)</li>
                          <li><strong>Lottery ID:</strong> Unique identifier for each lottery</li>
                          <li><strong>Selection Index:</strong> Which winner is being selected (for multiple winners)</li>
                        </ul>
                        <p className="text-sm mt-2">
                          All of these values are combined using the <code className="bg-muted px-1.5 py-0.5 rounded">keccak256</code> hash
                          function to ensure fairness and unpredictability.
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-white mb-2">Multiple Winners</p>
                        <p className="text-sm">
                          When a lottery has multiple winners, each winner is selected independently using the
                          same random process. The selection algorithm ensures no duplicate winners and
                          maintains fairness across all participants.
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-white mb-2">Prize Distribution</p>
                        <p className="text-sm mb-2">After winners are selected, prizes are distributed automatically:</p>
                        <ol className="ml-5 list-decimal space-y-1 text-sm">
                          <li>Creator fee is calculated and sent to the lottery creator</li>
                          <li>Finalization reward is calculated and sent to whoever finalized the lottery (if expired)</li>
                          <li>Remaining prize pool is divided equally among all winners</li>
                          <li>Any remainder from division is sent to the first winner</li>
                        </ol>
                        <p className="text-sm mt-2">
                          <strong>Note:</strong> All funds are sent directly from the smart contract - no intermediary required!
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="how-finalization-works" className="glass-strong glow-border rounded-xl px-6 border-border/40">
                    <AccordionTrigger className="text-left text-lg font-semibold !no-underline">
                      How does finalization work?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground space-y-3 pt-2">
                      <p>
                        A lottery can end in two ways:
                      </p>
                      <ul className="ml-5 list-disc space-y-1">
                        <li><strong>Time Expired:</strong> The end date and time have passed</li>
                        <li><strong>Max Tickets Reached:</strong> All available tickets have been sold (if a max was set)</li>
                      </ul>
                      <div className="glass p-4 rounded-xl border border-purple-500/30 bg-purple-500/10 mt-3">
                        <p className="font-semibold text-purple-500 mb-2 flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Finalization Reward System
                        </p>
                        <p className="text-sm mb-2">
                          <strong>For Expired Lotteries:</strong> Anyone can finalize an expired lottery, and
                          the pool pays a reward to cover gas costs:
                        </p>
                        <ul className="text-sm ml-5 list-disc space-y-1">
                          <li><strong>Reward Amount:</strong> 0.001-0.01 ETH (or 0.1% of pool, whichever is higher, capped at 0.01 ETH)</li>
                          <li><strong>Purpose:</strong> Covers the gas fee for finalizing the lottery</li>
                          <li><strong>Who Pays:</strong> The reward comes from the lottery pool, so participants effectively pay for finalization</li>
                          <li><strong>Incentive:</strong> This ensures someone will always finalize expired lotteries, even if the creator is unavailable</li>
                        </ul>
                        <p className="text-sm mt-2">
                          <strong>Example:</strong> If a lottery has 1 ETH in the pool, the finalizer receives
                          0.001 ETH (0.1% of pool, but minimum 0.001 ETH), which covers their gas costs. The
                          remaining 0.999 ETH is distributed to winners and the creator.
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-white mb-1">Early Finalization</p>
                        <p className="text-sm">
                          If a lottery reaches its maximum number of tickets before the end date, only the
                          creator can finalize it early. No reward is paid in this case - the creator pays
                          their own gas fee.
                        </p>
                      </div>
                      <div className="glass p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 mt-3">
                        <p className="font-semibold text-yellow-500 mb-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Why Manual Finalization?
                        </p>
                        <p className="text-sm mb-2">
                          Smart contracts cannot automatically execute functions - they require a transaction
                          to be sent. However, the reward system ensures:
                        </p>
                        <ul className="text-sm ml-5 list-disc space-y-1">
                          <li>Someone will always finalize expired lotteries (they get rewarded)</li>
                          <li>The pool pays for finalization (not the finalizer)</li>
                          <li>Lotteries won't get stuck if the creator is unavailable</li>
                          <li>The system is decentralized and trustless</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="is-it-secure" className="glass-strong glow-border rounded-xl px-6 border-border/40">
                    <AccordionTrigger className="text-left text-lg font-semibold !no-underline">
                      Is it secure and fair?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground space-y-3 pt-2">
                      <p>
                        Yes! LuckyChain is designed with security and fairness as top priorities.
                      </p>
                      <div>
                        <p className="font-semibold text-white mb-2">Smart Contract Security</p>
                        <ul className="ml-5 list-disc space-y-1 text-sm">
                          <li><strong>Immutable:</strong> Once deployed, the contract code cannot be changed</li>
                          <li><strong>Transparent:</strong> All code is open-source and verifiable on Etherscan</li>
                          <li><strong>No Central Authority:</strong> No one can manipulate results or steal funds</li>
                          <li><strong>Funds Locked:</strong> Prize pool is locked in the contract until winners are selected</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-white mb-2">Provably Fair Randomness</p>
                        <p className="text-sm mb-2">
                          The randomness used for winner selection combines multiple on-chain values that
                          cannot be manipulated:
                        </p>
                        <ul className="ml-5 list-disc space-y-1 text-sm">
                          <li>Block timestamp (determined by miners/validators)</li>
                          <li>Block prevrandao (Ethereum's built-in randomness)</li>
                          <li>Block number (sequential and predictable)</li>
                          <li>Lottery ID (unique per lottery)</li>
                        </ul>
                        <p className="text-sm mt-2">
                          Since these values are determined at finalization time, neither the creator nor
                          participants can predict or manipulate the results.
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-white mb-1">Verification</p>
                        <p className="text-sm">
                          All lottery data, transactions, and winner selections are permanently recorded on the
                          Ethereum blockchain. Anyone can verify the fairness of any lottery by examining the
                          contract code and transaction history on Etherscan.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="gas-fees" className="glass-strong glow-border rounded-xl px-6 border-border/40">
                    <AccordionTrigger className="text-left text-lg font-semibold !no-underline">
                      How much do gas fees cost?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground space-y-2 pt-2">
                      <p>
                        Gas fees vary based on network congestion and transaction complexity. On Ethereum
                        mainnet, they can range from $1-50+ depending on network activity. However, for
                        expired lotteries, you don't need to worry about gas costs!
                      </p>
                      <p>
                        <strong>Finalization Reward System:</strong> When you finalize an expired lottery,
                        the pool automatically pays you a reward (0.001-0.01 ETH) that covers your gas
                        costs. This reward comes from the lottery pool, so participants effectively pay for
                        finalization, not you.
                      </p>
                      <p>
                        <strong>Testnets:</strong> On testnets like Sepolia, gas fees are minimal since
                        testnet ETH has no real value. You can test the platform without any real costs.
                      </p>
                      <p>
                        <strong>Regular Transactions:</strong> For buying tickets or creating lotteries, you
                        pay gas fees like any other blockchain transaction. The gas fee depends on current
                        network conditions.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="multiple-winners" className="glass-strong glow-border rounded-xl px-6 border-border/40">
                    <AccordionTrigger className="text-left text-lg font-semibold !no-underline">
                      How are multiple winners selected?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground space-y-2 pt-2">
                      <p>
                        When a lottery has multiple winners, each winner is selected independently using the
                        same random process. The selection algorithm uses the Fisher-Yates shuffle to ensure
                        fairness and prevent duplicate selections.
                      </p>
                      <p>
                        <strong>Selection Process:</strong>
                      </p>
                      <ol className="ml-6 list-decimal space-y-1">
                        <li>All participants are assigned an index (0, 1, 2, 3, ...)</li>
                        <li>For each winner slot, a random index is generated using on-chain randomness</li>
                        <li>The selected participant becomes a winner and is removed from the pool</li>
                        <li>This continues until all winner slots are filled</li>
                        <li>No participant can be selected twice</li>
                      </ol>
                      <p>
                        <strong>Prize Distribution:</strong> The prize pool (after creator fee and
                        finalization reward) is divided equally among all winners. Any remainder from
                        integer division is sent to the first winner to ensure no funds are lost.
                      </p>
                      <p>
                        <strong>Example:</strong> If a lottery has 100 participants, 3 winners, and a prize
                        pool of 1 ETH, each winner receives 0.33 ETH, and the first winner receives an
                        additional 0.01 ETH (the remainder).
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="creator-fee" className="glass-strong glow-border rounded-xl px-6 border-border/40">
                    <AccordionTrigger className="text-left text-lg font-semibold !no-underline">
                      What is the creator fee?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground space-y-2 pt-2">
                      <p>
                        The creator fee is a percentage of the prize pool that goes to the lottery creator
                        as compensation for creating and managing the lottery. This fee is set when creating
                        the lottery and can range from 0% to 100%.
                      </p>
                      <p>
                        <strong>How it works:</strong>
                      </p>
                      <ul className="ml-6 list-disc space-y-1">
                        <li>The creator sets the fee percentage when creating the lottery</li>
                        <li>The fee is calculated from the total prize pool (sum of all ticket purchases)</li>
                        <li>Creator receives: <code className="bg-muted px-1 rounded">pool × creator_fee% / 100</code></li>
                        <li>Winners receive: <code className="bg-muted px-1 rounded">(pool - creator_fee - finalization_reward) / number_of_winners</code></li>
                      </ul>
                      <p>
                        <strong>Example:</strong> If a lottery has a prize pool of 10 ETH, a creator fee of
                        5%, and 2 winners, the creator receives 0.5 ETH, and each winner receives
                        approximately 4.75 ETH (after finalization reward if applicable).
                      </p>
                      <p>
                        <strong>Transparency:</strong> The creator fee is displayed on each lottery card, so
                        participants know exactly how much goes to the creator before participating.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="no-participants" className="glass-strong glow-border rounded-xl px-6 border-border/40">
                    <AccordionTrigger className="text-left text-lg font-semibold !no-underline">
                      What happens if no one participates?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground space-y-2 pt-2">
                      <p>
                        If a lottery expires with no participants, the lottery cannot be finalized because
                        the smart contract requires at least one participant to select winners. In this
                        case:
                      </p>
                      <ul className="ml-6 list-disc space-y-1">
                        <li>
                          <strong>No funds are locked:</strong> Since no one bought tickets, there are no
                          funds in the prize pool to lock
                        </li>
                        <li>
                          <strong>No creator fee:</strong> With no ticket sales, there's no prize pool, so
                          the creator fee is zero
                        </li>
                        <li>
                          <strong>Lottery remains inactive:</strong> The lottery simply ends with no
                          participants and no winners
                        </li>
                        <li>
                          <strong>No action required:</strong> There's nothing to finalize, so no
                          transaction is needed
                        </li>
                      </ul>
                      <p>
                        <strong>Important:</strong> This scenario is different from a lottery with
                        participants but no winners selected. If a lottery has participants but hasn't been
                        finalized yet, anyone can finalize it (even if expired) to select winners and
                        distribute prizes.
                      </p>
                      <p>
                        <strong>Best Practice:</strong> To avoid this situation, creators should promote
                        their lotteries to attract participants before the end date.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="finalization-reward" className="glass-strong glow-border rounded-xl px-6 border-border/40">
                    <AccordionTrigger className="text-left text-lg font-semibold !no-underline">
                      Who gets the finalization reward?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground space-y-2 pt-2">
                      <p>
                        The finalization reward (0.001-0.01 ETH) is paid to whoever finalizes an expired
                        lottery. This reward comes from the lottery pool and is designed to cover gas costs
                        and incentivize finalization.
                      </p>
                      <p>
                        <strong>Reward Calculation:</strong>
                      </p>
                      <ul className="ml-6 list-disc space-y-1">
                        <li>Minimum: 0.001 ETH (covers typical gas costs)</li>
                        <li>Maximum: 0.01 ETH (prevents excessive pool drain)</li>
                        <li>Formula: <code className="bg-muted px-1 rounded">min(max(0.1% of pool, 0.001 ETH), 0.01 ETH)</code></li>
                        <li>The reward scales with pool size but is capped to protect participants</li>
                      </ul>
                      <p>
                        <strong>Who can finalize:</strong>
                      </p>
                      <ul className="ml-6 list-disc space-y-1">
                        <li>
                          <strong>Expired lotteries:</strong> Anyone can finalize and receive the reward
                        </li>
                        <li>
                          <strong>Early finalization:</strong> Only the creator can finalize when max
                          tickets are reached (no reward paid)
                        </li>
                      </ul>
                      <p>
                        <strong>Why this system:</strong> The reward system ensures that expired lotteries
                        can always be finalized, even if the creator is unavailable. The pool pays for
                        finalization, so participants effectively share the cost, making the system fully
                        decentralized and resilient.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="can-creator-cheat" className="glass-strong glow-border rounded-xl px-6 border-border/40">
                    <AccordionTrigger className="text-left text-lg font-semibold !no-underline">
                      Can the creator cheat or manipulate results?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground space-y-2 pt-2">
                      <p>
                        <strong>No, the creator cannot cheat or manipulate results.</strong> The winner
                        selection uses on-chain randomness that cannot be predicted or manipulated by
                        anyone, including the creator.
                      </p>
                      <p>
                        <strong>How randomness works:</strong>
                      </p>
                      <ul className="ml-6 list-disc space-y-1">
                        <li>
                          <strong>Block timestamp:</strong> Current block's timestamp (unpredictable)
                        </li>
                        <li>
                          <strong>Block prevrandao:</strong> Ethereum's built-in randomness (EIP-4399)
                        </li>
                        <li>
                          <strong>Block number:</strong> Current block number (sequential)
                        </li>
                        <li>
                          <strong>Lottery ID:</strong> Unique identifier for each lottery
                        </li>
                        <li>
                          <strong>Selection index:</strong> Which winner is being selected (for multiple
                          winners)
                        </li>
                      </ul>
                      <p>
                        These values are combined using the <code className="bg-muted px-1 rounded">keccak256</code> hash function at
                        finalization time. Since block data is determined by miners/validators and cannot
                        be predicted in advance, even the creator cannot know who will win until the
                        lottery is finalized.
                      </p>
                      <p>
                        <strong>Verification:</strong> All code is open-source and verifiable on the
                        blockchain. Anyone can examine the smart contract code on Etherscan to verify the
                        fairness of the randomness algorithm.
                      </p>
                      <p>
                        <strong>No special privileges:</strong> The creator has no special permissions or
                        admin functions. They cannot change lottery parameters after creation, cannot
                        withdraw funds prematurely, and cannot influence winner selection.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="what-if-creator-disappears" className="glass-strong glow-border rounded-xl px-6 border-border/40">
                    <AccordionTrigger className="text-left text-lg font-semibold !no-underline">
                      What if the creator disappears or loses their wallet?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground space-y-2 pt-2">
                      <p>
                        <strong>Don't worry!</strong> The system is designed to be fully decentralized and
                        resilient. Even if the creator disappears or loses their wallet, expired lotteries
                        can still be finalized.
                      </p>
                      <p>
                        <strong>How it works:</strong>
                      </p>
                      <ul className="ml-6 list-disc space-y-1">
                        <li>
                          <strong>Anyone can finalize:</strong> For expired lotteries, anyone can finalize
                          them (not just the creator)
                        </li>
                        <li>
                          <strong>Reward incentive:</strong> The finalizer receives a reward (0.001-0.01
                          ETH) from the pool, which covers gas costs and provides a small incentive
                        </li>
                        <li>
                          <strong>Automatic distribution:</strong> Once finalized, prizes are automatically
                          distributed to winners via the smart contract
                        </li>
                        <li>
                          <strong>No creator needed:</strong> The creator doesn't need to be present for
                          finalization or prize distribution
                        </li>
                      </ul>
                      <p>
                        <strong>Early finalization:</strong> If a lottery reaches max tickets before the
                        end date, only the creator can finalize it early. However, if the creator is
                        unavailable, participants can simply wait until the end date, at which point anyone
                        can finalize it.
                      </p>
                      <p>
                        <strong>Creator fee:</strong> If the creator loses their wallet, they won't be able
                        to access their creator fee. However, the fee is still paid to the creator's
                        address on the blockchain. If they recover their wallet (via seed phrase), they can
                        access the funds.
                      </p>
                      <p>
                        <strong>Best Practice:</strong> Creators should securely store their wallet seed
                        phrase to ensure they can always access their creator fees.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="multiple-tickets" className="glass-strong glow-border rounded-xl px-6 border-border/40">
                    <AccordionTrigger className="text-left text-lg font-semibold !no-underline">
                      Does buying multiple tickets increase my chances?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground space-y-2 pt-2">
                      <p>
                        <strong>Yes! Buying multiple tickets increases your chances of winning.</strong>
                        Each ticket gives you one entry into the lottery, so more tickets = more chances.
                      </p>
                      <p>
                        <strong>How it works:</strong>
                      </p>
                      <ul className="ml-6 list-disc space-y-1">
                        <li>
                          <strong>Each ticket = one entry:</strong> If you buy 10 tickets, you have 10
                          entries in the lottery
                        </li>
                        <li>
                          <strong>Independent selection:</strong> Each ticket has an equal chance of being
                          selected, so buying more tickets multiplies your chances
                        </li>
                        <li>
                          <strong>Multiple winners possible:</strong> If a lottery has multiple winners,
                          you could potentially win multiple times (if the lottery allows it)
                        </li>
                      </ul>
                      <p>
                        <strong>Example:</strong> If a lottery has 100 participants and 1 winner:
                      </p>
                      <ul className="ml-6 list-disc space-y-1">
                        <li>1 ticket = 1% chance of winning</li>
                        <li>10 tickets = 10% chance of winning</li>
                        <li>50 tickets = 50% chance of winning</li>
                      </ul>
                      <p>
                        <strong>Important restrictions:</strong>
                      </p>
                      <ul className="ml-6 list-disc space-y-1">
                        <li>
                          <strong>Multiple entries allowed:</strong> The lottery must allow multiple
                          entries (this is set when creating the lottery)
                        </li>
                        <li>
                          <strong>Single entry lotteries:</strong> Some lotteries restrict participants to
                          one ticket each to ensure fairness
                        </li>
                        <li>
                          <strong>Max tickets limit:</strong> If a lottery has a max tickets limit, you
                          cannot buy more tickets than available
                        </li>
                      </ul>
                      <p>
                        <strong>Cost vs. Benefit:</strong> While buying more tickets increases your
                        chances, it also increases your cost. Consider your budget and the lottery's prize
                        pool when deciding how many tickets to buy.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="when-do-i-get-paid" className="glass-strong glow-border rounded-xl px-6 border-border/40">
                    <AccordionTrigger className="text-left text-lg font-semibold !no-underline">
                      When do winners receive their prizes?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground space-y-2 pt-2">
                      <p>
                        <strong>Prizes are distributed automatically and instantly</strong> when the lottery
                        is finalized. There's no waiting period, no manual processing, and no intermediary
                        required.
                      </p>
                      <p>
                        <strong>Distribution process:</strong>
                      </p>
                      <ol className="ml-6 list-decimal space-y-1">
                        <li>
                          <strong>Finalization triggered:</strong> Someone (creator or anyone for expired
                          lotteries) calls the finalize function
                        </li>
                        <li>
                          <strong>Winners selected:</strong> The smart contract uses on-chain randomness to
                          select winners
                        </li>
                        <li>
                          <strong>Prizes calculated:</strong> The contract calculates prize amounts (after
                          creator fee and finalization reward)
                        </li>
                        <li>
                          <strong>Automatic transfer:</strong> Prizes are sent directly to winner addresses
                          via the smart contract
                        </li>
                        <li>
                          <strong>Transaction confirmed:</strong> Once the transaction is confirmed on the
                          blockchain, prizes are in winners' wallets
                        </li>
                      </ol>
                      <p>
                        <strong>Timeline:</strong>
                      </p>
                      <ul className="ml-6 list-disc space-y-1">
                        <li>
                          <strong>Transaction confirmation:</strong> Usually takes 12-15 seconds on
                          Ethereum (depending on network)
                        </li>
                        <li>
                          <strong>Prize receipt:</strong> Prizes appear in winners' wallets immediately
                          after confirmation
                        </li>
                        <li>
                          <strong>No waiting period:</strong> Unlike traditional lotteries, there's no
                          claim period or processing delay
                        </li>
                      </ul>
                      <p>
                        <strong>How to check:</strong> Winners can check their wallet balance or view the
                        transaction on Etherscan to confirm receipt of prizes. The lottery card will also
                        show winner addresses once the lottery is finalized.
                      </p>
                      <p>
                        <strong>Multiple winners:</strong> If a lottery has multiple winners, all winners
                        receive their prizes in the same transaction. The prize pool is divided equally
                        among all winners, with any remainder going to the first winner.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="what-network" className="glass-strong glow-border rounded-xl px-6 border-border/40">
                    <AccordionTrigger className="text-left text-lg font-semibold !no-underline">
                      Which blockchain network does this use?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground space-y-2 pt-2">
                      <p>
                        LuckyChain is built on Ethereum and is compatible with any Ethereum Virtual
                        Machine (EVM) compatible network. This means it can run on multiple blockchain
                        networks.
                      </p>
                      <p>
                        <strong>Supported Networks:</strong>
                      </p>
                      <ul className="ml-6 list-disc space-y-1">
                        <li>
                          <strong>Ethereum Mainnet:</strong> The primary network for production use (real
                          ETH)
                        </li>
                        <li>
                          <strong>Sepolia Testnet:</strong> A test network for development and testing
                          (free testnet ETH)
                        </li>
                        <li>
                          <strong>Other EVM Chains:</strong> Polygon, Arbitrum, Optimism, Base, and other
                          EVM-compatible networks
                        </li>
                      </ul>
                      <p>
                        <strong>Network Requirements:</strong>
                      </p>
                      <ul className="ml-6 list-disc space-y-1">
                        <li>
                          <strong>EVM Compatibility:</strong> The network must support Ethereum smart
                          contracts
                        </li>
                        <li>
                          <strong>Web3 Wallet:</strong> You need a compatible wallet (MetaMask, WalletConnect, etc.)
                        </li>
                        <li>
                          <strong>Network Connection:</strong> Your wallet must be connected to the same
                          network where the contract is deployed
                        </li>
                        <li>
                          <strong>Native Token:</strong> You need the network's native token (ETH on
                          Ethereum, MATIC on Polygon, etc.) to pay for gas fees
                        </li>
                      </ul>
                      <p>
                        <strong>Important Notes:</strong>
                      </p>
                      <ul className="ml-6 list-disc space-y-1">
                        <li>
                          <strong>Network Mismatch:</strong> If your wallet is on a different network than
                          the contract, transactions will fail
                        </li>
                        <li>
                          <strong>Testnet vs. Mainnet:</strong> Testnet ETH has no real value and is used
                          for testing. Mainnet ETH has real value
                        </li>
                        <li>
                          <strong>Contract Address:</strong> Each network has its own contract address.
                          Make sure you're interacting with the correct contract on the correct network
                        </li>
                        <li>
                          <strong>Gas Fees:</strong> Gas fees vary by network. Ethereum mainnet is more
                          expensive, while Layer 2 networks (Polygon, Arbitrum) are cheaper
                        </li>
                      </ul>
                      <p>
                        <strong>How to Switch Networks:</strong> Use your wallet's network switcher to
                        switch between networks. Most wallets will prompt you to switch if you try to
                        interact with a contract on a different network.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>

              {/* Call to Action */}
              <div className="text-center space-y-4 pt-8">
                <Link href="/">
                  <Button
                    size="lg"
                    className="glass-strong glow-border font-semibold text-base h-12 px-8 gradient-iridescent hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
                  >
                    <Trophy className="mr-2 h-5 w-5" />
                    Start Participating
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground">
                  Ready to create or join a lottery? Head back to the home page to get started!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

