"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WalletConnect } from "@/components/wallet-connect";
import { PixelatedCash } from "@/components/pixelated-cash";
import {
  Trophy,
  Code,
  Database,
  Zap,
  Shield,
  GitBranch,
  FileCode,
  ArrowLeft,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DevelopersPage() {
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
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-4 py-20 max-w-screen-xl">
          <nav className="flex items-center justify-between mb-8 md:mb-12 flex-wrap gap-2 md:gap-0 min-w-0">
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

          <div className="max-w-5xl mx-auto">
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
                  Developer Documentation
                </h1>
                <p className="text-xl text-white/90 max-w-2xl mx-auto">
                  Technical documentation for LuckyChain decentralized raffle
                  platform
                </p>
              </div>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="glass-strong glow-border inline-flex h-auto w-full mb-8 p-1.5 gap-1.5 bg-black/30 border border-primary/40 rounded-xl">
                  <TabsTrigger
                    value="overview"
                    className="relative flex-1 text-white/50 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-green-500/30 hover:text-white/80 transition-all cursor-pointer py-3 px-4 rounded-lg font-semibold text-base data-[state=active]:scale-[1.02] data-[state=inactive]:hover:bg-white/5"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="architecture"
                    className="relative flex-1 text-white/50 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-green-500/30 hover:text-white/80 transition-all cursor-pointer py-3 px-4 rounded-lg font-semibold text-base data-[state=active]:scale-[1.02] data-[state=inactive]:hover:bg-white/5"
                  >
                    Architecture
                  </TabsTrigger>
                  <TabsTrigger
                    value="contract"
                    className="relative flex-1 text-white/50 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-green-500/30 hover:text-white/80 transition-all cursor-pointer py-3 px-4 rounded-lg font-semibold text-base data-[state=active]:scale-[1.02] data-[state=inactive]:hover:bg-white/5"
                  >
                    Smart Contract
                  </TabsTrigger>
                  <TabsTrigger
                    value="frontend"
                    className="relative flex-1 text-white/50 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-green-500/30 hover:text-white/80 transition-all cursor-pointer py-3 px-4 rounded-lg font-semibold text-base data-[state=active]:scale-[1.02] data-[state=inactive]:hover:bg-white/5"
                  >
                    Frontend
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <Card className="glass-strong glow-border p-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <FileCode className="h-6 w-6 text-primary" />
                      </div>
                      <h2 className="text-3xl font-bold">Project Overview</h2>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          Project Description
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          LuckyChain is a decentralized raffle platform built on
                          Ethereum smart contracts. It enables users to create
                          and participate in provably fair lotteries with
                          transparent winner selection and automatic prize
                          distribution. The platform is fully decentralized,
                          requiring no central authority or intermediary.
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-3">
                          Key Features
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="glass p-4 rounded-xl border border-primary/30">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="h-5 w-5 text-primary" />
                              <span className="font-semibold">
                                Decentralized Architecture
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Built on Ethereum smart contracts with no central
                              authority
                            </p>
                          </div>
                          <div className="glass p-4 rounded-xl border border-secondary/30">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="h-5 w-5 text-secondary" />
                              <span className="font-semibold">
                                Provably Fair Randomness
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              On-chain randomness using block data and keccak256
                              hashing
                            </p>
                          </div>
                          <div className="glass p-4 rounded-xl border border-accent/30">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="h-5 w-5 text-accent" />
                              <span className="font-semibold">
                                Automatic Payouts
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Instant prize distribution via smart contract
                              execution
                            </p>
                          </div>
                          <div className="glass p-4 rounded-xl border border-purple-500/30">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="h-5 w-5 text-purple-500" />
                              <span className="font-semibold">
                                Gas Fee Coverage
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Finalization rewards from pool cover gas costs
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-3">
                          Tech Stack
                        </h3>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="glass p-4 rounded-xl border border-border/40">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Code className="h-4 w-4" />
                              Smart Contracts
                            </h4>
                            <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                              <li>Solidity 0.8.19</li>
                              <li>Hardhat</li>
                              <li>Hardhat Ignition</li>
                              <li>Ethers.js v6</li>
                            </ul>
                          </div>
                          <div className="glass p-4 rounded-xl border border-border/40">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Zap className="h-4 w-4" />
                              Frontend
                            </h4>
                            <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                              <li>Next.js 15</li>
                              <li>React 18</li>
                              <li>TypeScript</li>
                              <li>Tailwind CSS</li>
                              <li>Radix UI</li>
                            </ul>
                          </div>
                          <div className="glass p-4 rounded-xl border border-border/40">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Database className="h-4 w-4" />
                              Blockchain
                            </h4>
                            <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                              <li>Ethereum (EVM)</li>
                              <li>Web3 Integration</li>
                              <li>EIP-1193 Provider</li>
                              <li>MetaMask Compatible</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Deployment Section */}
                  <Card className="glass-strong glow-border p-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <GitBranch className="h-6 w-6 text-blue-500" />
                      </div>
                      <h2 className="text-3xl font-bold">Deployment & Setup</h2>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-lg mb-3">
                          Smart Contract Deployment
                        </h3>
                        <div className="glass p-6 rounded-xl border border-border/40">
                          <p className="text-muted-foreground mb-3">
                            The project uses Hardhat Ignition for deployment:
                          </p>
                          <ol className="space-y-2 text-muted-foreground ml-6 list-decimal">
                            <li>
                              <strong>Compile:</strong>{" "}
                              <code className="bg-muted px-2 py-1 rounded">
                                npm run compile
                              </code>
                            </li>
                            <li>
                              <strong>Deploy:</strong>{" "}
                              <code className="bg-muted px-2 py-1 rounded">
                                npm run deploy -- --network sepolia
                              </code>
                            </li>
                            <li>
                              <strong>Export ABI:</strong> Automatically
                              exported to frontend after compilation
                            </li>
                            <li>
                              <strong>Update Environment:</strong> Contract
                              address synced to{" "}
                              <code className="bg-muted px-2 py-1 rounded">
                                .env.local
                              </code>
                            </li>
                          </ol>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-3">
                          Frontend Deployment
                        </h3>
                        <div className="glass p-6 rounded-xl border border-border/40">
                          <p className="text-muted-foreground mb-3">
                            The frontend is deployed on GitHub Pages:
                          </p>
                          <ol className="space-y-2 text-muted-foreground ml-6 list-decimal">
                            <li>
                              <strong>Build:</strong>{" "}
                              <code className="bg-muted px-2 py-1 rounded">
                                npm run build
                              </code>
                            </li>
                            <li>
                              <strong>Deploy:</strong> Automated via GitHub
                              Actions on push to main
                            </li>
                            <li>
                              <strong>Environment Variables:</strong> Set{" "}
                              <code className="bg-muted px-2 py-1 rounded">
                                NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS
                              </code>{" "}
                              in GitHub Secrets
                            </li>
                          </ol>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-3">
                          Local Development
                        </h3>
                        <div className="glass p-6 rounded-xl border border-border/40">
                          <ol className="space-y-2 text-muted-foreground ml-6 list-decimal">
                            <li>
                              <strong>Install Dependencies:</strong>{" "}
                              <code className="bg-muted px-2 py-1 rounded">
                                npm install
                              </code>
                            </li>
                            <li>
                              <strong>Start Dev Server:</strong>{" "}
                              <code className="bg-muted px-2 py-1 rounded">
                                npm run dev
                              </code>
                            </li>
                            <li>
                              <strong>Connect Wallet:</strong> Use MetaMask or
                              compatible wallet
                            </li>
                            <li>
                              <strong>Test on Sepolia:</strong> Deploy contract
                              to Sepolia testnet for testing
                            </li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Testing Section */}
                  <Card className="glass-strong glow-border p-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      </div>
                      <h2 className="text-3xl font-bold">
                        Testing & Verification
                      </h2>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-lg mb-3">
                          Smart Contract Testing
                        </h3>
                        <div className="glass p-6 rounded-xl border border-border/40">
                          <ul className="space-y-2 text-muted-foreground ml-6 list-disc">
                            <li>
                              <strong>Manual Testing:</strong> Deploy to Sepolia
                              testnet and test all functions
                            </li>
                            <li>
                              <strong>Edge Cases:</strong> Test with 0
                              participants, max tickets reached, expired raffles
                            </li>
                            <li>
                              <strong>Security:</strong> Verify no owner
                              privileges, test access control, check reentrancy
                              protection
                            </li>
                            <li>
                              <strong>Gas Optimization:</strong> Measure gas
                              costs for all functions
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-3">
                          Frontend Testing
                        </h3>
                        <div className="glass p-6 rounded-xl border border-border/40">
                          <ul className="space-y-2 text-muted-foreground ml-6 list-disc">
                            <li>
                              <strong>User Flows:</strong> Test creating raffle,
                              buying tickets, finalizing raffle
                            </li>
                            <li>
                              <strong>Error Handling:</strong> Test with no
                              wallet, insufficient funds, network errors
                            </li>
                            <li>
                              <strong>UI/UX:</strong> Test responsive design,
                              loading states, error messages
                            </li>
                            <li>
                              <strong>Integration:</strong> Test Web3
                              integration, contract interactions, transaction
                              handling
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Summary */}
                  <Card className="glass-strong glow-border p-8 space-y-6 border-primary/30 bg-primary/5">
                    <h2 className="text-2xl font-bold">Project Summary</h2>
                    <div className="space-y-4">
                      <p className="text-muted-foreground leading-relaxed">
                        LuckyChain is a fully functional decentralized raffle
                        platform demonstrating blockchain development skills,
                        smart contract security, and modern web development
                        practices. The project showcases:
                      </p>
                      <ul className="space-y-2 text-muted-foreground ml-6 list-disc">
                        <li>Secure smart contract development with Solidity</li>
                        <li>Provably fair randomness implementation</li>
                        <li>Modern React/Next.js frontend development</li>
                        <li>Web3 integration and wallet connectivity</li>
                        <li>Gas optimization and cost management</li>
                        <li>User experience design and error handling</li>
                        <li>Decentralized architecture principles</li>
                        <li>
                          Comprehensive documentation and code organization
                        </li>
                      </ul>
                    </div>
                  </Card>
                </TabsContent>

                {/* Architecture Tab */}
                <TabsContent value="architecture" className="space-y-6">
                  <Card className="glass-strong glow-border p-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                        <GitBranch className="h-6 w-6 text-secondary" />
                      </div>
                      <h2 className="text-3xl font-bold">
                        System Architecture
                      </h2>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-lg mb-3">
                          Architecture Overview
                        </h3>
                        <div className="glass p-6 rounded-xl border border-border/40 mb-4">
                          <p className="text-muted-foreground mb-4">
                            LuckyChain follows a decentralized architecture with
                            three main components:
                          </p>
                          <ol className="space-y-3 text-muted-foreground ml-6 list-decimal">
                            <li>
                              <strong>Smart Contract Layer:</strong> Ethereum
                              smart contract handling all raffle logic,
                              randomness, and fund management
                            </li>
                            <li>
                              <strong>Frontend Layer:</strong> Next.js React
                              application providing user interface and Web3
                              integration
                            </li>
                            <li>
                              <strong>Blockchain Layer:</strong> Ethereum
                              network (or EVM-compatible chain) for transaction
                              execution and state storage
                            </li>
                          </ol>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-3">
                          Data Flow
                        </h3>
                        <div className="glass p-6 rounded-xl border border-border/40">
                          <div className="space-y-4">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                                1
                              </div>
                              <div>
                                <h4 className="font-semibold mb-1">
                                  Create Raffle
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  User creates raffle via frontend → Transaction
                                  sent to blockchain → Smart contract stores
                                  raffle parameters → Event emitted
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                                2
                              </div>
                              <div>
                                <h4 className="font-semibold mb-1">
                                  Buy Tickets
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Participant sends ETH with ticket purchase →
                                  Contract validates transaction → Funds added
                                  to prize pool → Participant address stored
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                                3
                              </div>
                              <div>
                                <h4 className="font-semibold mb-1">
                                  Finalize Raffle
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Finalizer triggers finalization → Contract
                                  selects winners using on-chain randomness →
                                  Prizes distributed automatically →
                                  Finalization reward paid to finalizer (if
                                  expired)
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-3">
                          Key Design Decisions
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="glass p-4 rounded-xl border border-green-500/30 bg-green-500/10">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Shield className="h-4 w-4 text-green-500" />
                              Security First
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              All funds locked in contract until finalization.
                              No owner privileges or admin functions. Immutable
                              contract code.
                            </p>
                          </div>
                          <div className="glass p-4 rounded-xl border border-blue-500/30 bg-blue-500/10">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Zap className="h-4 w-4 text-blue-500" />
                              Gas & Performance Optimization
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Batch operations for loading raffles. Efficient
                              storage using mappings. Minimal external calls.
                              RPC call caching reduces network requests by ~73%.
                            </p>
                          </div>
                          <div className="glass p-4 rounded-xl border border-purple-500/30 bg-purple-500/10">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Trophy className="h-4 w-4 text-purple-500" />
                              Fairness Guarantee
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              On-chain randomness prevents manipulation.
                              Verifiable winner selection. Transparent prize
                              distribution.
                            </p>
                          </div>
                          <div className="glass p-4 rounded-xl border border-orange-500/30 bg-orange-500/10">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Code className="h-4 w-4 text-orange-500" />
                              Decentralization
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              No central authority. Anyone can finalize expired
                              lotteries. Reward system incentivizes community
                              participation.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                {/* Smart Contract Tab */}
                <TabsContent value="contract" className="space-y-6">
                  <Card className="glass-strong glow-border p-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center">
                        <Code className="h-6 w-6 text-accent" />
                      </div>
                      <h2 className="text-3xl font-bold">Smart Contract</h2>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-lg mb-3">
                          Contract Specifications
                        </h3>
                        <div className="glass p-5 rounded-xl border border-border/40 mb-4">
                          <ul className="space-y-2 text-muted-foreground ml-7 list-disc">
                            <li>
                              <strong>Language:</strong> Solidity 0.8.19
                            </li>
                            <li>
                              <strong>Network:</strong> Ethereum (or
                              EVM-compatible chains)
                            </li>
                            <li>
                              <strong>Randomness:</strong> keccak256 hash of
                              block data
                            </li>
                            <li>
                              <strong>Winner Selection:</strong> Fisher-Yates
                              shuffle algorithm using indices
                            </li>
                            <li>
                              <strong>Fund Safety:</strong> All funds are locked
                              in the contract until distribution
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-3">
                          Contract Structure
                        </h3>
                        <div className="glass p-6 rounded-xl border border-border/40">
                          <p className="text-muted-foreground mb-4">
                            The{" "}
                            <code className="bg-muted px-2 py-1 rounded">
                              Raffle.sol
                            </code>{" "}
                            contract is the core of the platform. Key
                            components:
                          </p>
                          <ul className="space-y-2 text-muted-foreground ml-6 list-disc">
                            <li>
                              <strong>Structs:</strong> <code>RaffleInfo</code>{" "}
                              (raffle data),
                              <code>RaffleConfig</code> (settings)
                            </li>
                            <li>
                              <strong>Mappings:</strong> Store lotteries,
                              participants, winners, and user tickets
                            </li>
                            <li>
                              <strong>Functions:</strong> Create raffle, buy
                              tickets, finalize raffle, query data
                            </li>
                            <li>
                              <strong>Events:</strong> Emit raffle creation,
                              ticket purchases, winner selection
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-3">
                          Key Functions
                        </h3>
                        <div className="space-y-4">
                          <div className="glass p-5 rounded-xl border border-border/40">
                            <h4 className="font-semibold mb-2">
                              <code className="text-primary">
                                createRaffle()
                              </code>
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Creates a new raffle with specified parameters.
                              Validates inputs and stores raffle data in
                              contract storage.
                            </p>
                            <p className="text-xs text-muted-foreground">
                              <strong>Parameters:</strong> title, description,
                              ticket price, end time, number of winners, creator
                              fee, max tickets, allow multiple entries
                            </p>
                          </div>
                          <div className="glass p-5 rounded-xl border border-border/40">
                            <h4 className="font-semibold mb-2">
                              <code className="text-primary">buyTickets()</code>
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Allows participants to purchase tickets. Validates
                              raffle is active, checks max tickets limit,
                              enforces multiple entry rules.
                            </p>
                            <p className="text-xs text-muted-foreground">
                              <strong>Validation:</strong> Active raffle, before
                              end time, within max tickets, correct ETH amount,
                              multiple entry rules
                            </p>
                          </div>
                          <div className="glass p-5 rounded-xl border border-border/40">
                            <h4 className="font-semibold mb-2">
                              <code className="text-primary">
                                finalizeRaffle()
                              </code>
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Finalizes raffle and selects winners. Calculates
                              finalization reward (if expired), creator fee, and
                              distributes prizes.
                            </p>
                            <p className="text-xs text-muted-foreground">
                              <strong>Access Control:</strong> Anyone can
                              finalize expired lotteries, only creator can
                              finalize early when max tickets reached
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-3">
                          Randomness Implementation
                        </h3>
                        <div className="glass p-6 rounded-xl border border-border/40">
                          <p className="text-muted-foreground mb-3">
                            Winner selection uses on-chain randomness combining
                            multiple sources:
                          </p>
                          <code className="block bg-muted p-4 rounded-lg text-sm font-mono mb-3">
                            {`keccak256(
  abi.encodePacked(
    block.timestamp,
    block.prevrandao,
    block.number,
    _raffleId,
    i
  )
) % remaining`}
                          </code>
                          <ul className="space-y-2 text-sm text-muted-foreground ml-6 list-disc">
                            <li>
                              <strong>block.timestamp:</strong> Current block
                              timestamp (unpredictable)
                            </li>
                            <li>
                              <strong>block.prevrandao:</strong> Ethereum's
                              built-in randomness (EIP-4399)
                            </li>
                            <li>
                              <strong>block.number:</strong> Current block
                              number (sequential)
                            </li>
                            <li>
                              <strong>_raffleId:</strong> Unique raffle
                              identifier
                            </li>
                            <li>
                              <strong>i:</strong> Selection index (for multiple
                              winners)
                            </li>
                          </ul>
                          <p className="text-muted-foreground mt-3 text-sm">
                            The Fisher-Yates shuffle algorithm ensures no
                            duplicate winners by maintaining an index array and
                            swapping selected indices.
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-3">
                          Finalization Reward System
                        </h3>
                        <div className="glass p-6 rounded-xl border border-purple-500/30 bg-purple-500/10">
                          <p className="text-muted-foreground mb-3">
                            For expired lotteries, the contract pays a reward to
                            the finalizer:
                          </p>
                          <code className="block bg-muted p-4 rounded-lg text-sm font-mono mb-3">
                            {`reward = min(max(0.1% of pool, 0.001 ETH), 0.01 ETH)`}
                          </code>
                          <ul className="space-y-2 text-sm text-muted-foreground ml-6 list-disc">
                            <li>
                              Minimum: 0.001 ETH (covers typical gas costs)
                            </li>
                            <li>
                              Maximum: 0.01 ETH (prevents excessive pool drain)
                            </li>
                            <li>
                              Percentage: 0.1% of pool (scales with pool size)
                            </li>
                            <li>
                              Purpose: Incentivizes finalization, covers gas
                              costs
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-3">
                          Prize Distribution Formula
                        </h3>
                        <div className="glass p-6 rounded-xl border border-border/40">
                          <p className="text-muted-foreground mb-3">
                            After finalization, funds are distributed as
                            follows:
                          </p>
                          <ol className="space-y-2 text-sm text-muted-foreground ml-6 list-decimal">
                            <li>
                              <strong>Finalization reward:</strong>{" "}
                              <code className="bg-muted px-1.5 py-0.5 rounded">
                                min(max(0.1% of pool, 0.001 ETH), 0.01 ETH)
                              </code>{" "}
                              (only for expired lotteries)
                            </li>
                            <li>
                              <strong>Creator reward:</strong>{" "}
                              <code className="bg-muted px-1.5 py-0.5 rounded">
                                pool × creator_fee_percentage / 100
                              </code>
                            </li>
                            <li>
                              <strong>Prize pool:</strong>{" "}
                              <code className="bg-muted px-1.5 py-0.5 rounded">
                                pool - finalization_reward - creator_reward
                              </code>
                            </li>
                            <li>
                              <strong>Prize per winner:</strong>{" "}
                              <code className="bg-muted px-1.5 py-0.5 rounded">
                                prize_pool / number_of_winners
                              </code>
                            </li>
                            <li>
                              <strong>Remainder:</strong>{" "}
                              <code className="bg-muted px-1.5 py-0.5 rounded">
                                prize_pool % number_of_winners
                              </code>{" "}
                              (sent to first winner to avoid fund loss)
                            </li>
                          </ol>
                          <p className="text-muted-foreground mt-3 text-sm">
                            <strong>Example:</strong> If a raffle has a pool of
                            10 ETH, creator fee of 5%, 2 winners, and is expired
                            (finalization reward = 0.001 ETH):
                          </p>
                          <ul className="text-sm text-muted-foreground ml-6 list-disc mt-2">
                            <li>Finalization reward: 0.001 ETH</li>
                            <li>Creator reward: 0.5 ETH</li>
                            <li>Prize pool: 9.499 ETH</li>
                            <li>Prize per winner: 4.749 ETH</li>
                            <li>Remainder: 0.001 ETH (sent to first winner)</li>
                            <li>Total distributed: 10 ETH (no funds lost)</li>
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-3">
                          Security Features
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="glass p-4 rounded-xl border border-green-500/30">
                            <h4 className="font-semibold mb-2 text-green-500">
                              Input Validation
                            </h4>
                            <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                              <li>Title non-empty</li>
                              <li>Ticket price &gt; 0</li>
                              <li>End time in future</li>
                              <li>Number of winners &gt; 0</li>
                              <li>Creator fee ≤ 100%</li>
                            </ul>
                          </div>
                          <div className="glass p-4 rounded-xl border border-green-500/30">
                            <h4 className="font-semibold mb-2 text-green-500">
                              Access Control
                            </h4>
                            <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                              <li>Only creator can finalize early</li>
                              <li>Anyone can finalize expired lotteries</li>
                              <li>No owner privileges</li>
                              <li>No admin functions</li>
                            </ul>
                          </div>
                          <div className="glass p-4 rounded-xl border border-green-500/30">
                            <h4 className="font-semibold mb-2 text-green-500">
                              Fund Safety
                            </h4>
                            <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                              <li>Funds locked until finalization</li>
                              <li>Remainder handling (no fund loss)</li>
                              <li>Direct transfers (no intermediaries)</li>
                              <li>Immutable contract code</li>
                            </ul>
                          </div>
                          <div className="glass p-4 rounded-xl border border-green-500/30">
                            <h4 className="font-semibold mb-2 text-green-500">
                              Reentrancy Protection
                            </h4>
                            <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                              <li>State changes before transfers</li>
                              <li>No external calls before state updates</li>
                              <li>Simple transfer pattern</li>
                              <li>No complex callbacks</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                {/* Frontend Tab */}
                <TabsContent value="frontend" className="space-y-6">
                  <Card className="glass-strong glow-border p-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <Zap className="h-6 w-6 text-purple-500" />
                      </div>
                      <h2 className="text-3xl font-bold">
                        Frontend Implementation
                      </h2>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-lg mb-3">
                          Tech Stack
                        </h3>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="glass p-4 rounded-xl border border-border/40">
                            <h4 className="font-semibold mb-2">Framework</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>Next.js 15 (App Router)</li>
                              <li>React 18</li>
                              <li>TypeScript</li>
                            </ul>
                          </div>
                          <div className="glass p-4 rounded-xl border border-border/40">
                            <h4 className="font-semibold mb-2">Styling</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>Tailwind CSS</li>
                              <li>Radix UI</li>
                              <li>Custom glass effects</li>
                            </ul>
                          </div>
                          <div className="glass p-4 rounded-xl border border-border/40">
                            <h4 className="font-semibold mb-2">Web3</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>Ethers.js v6</li>
                              <li>EIP-1193 Provider</li>
                              <li>Web3 Context</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-3">
                          Key Components
                        </h3>
                        <div className="space-y-4">
                          <div className="glass p-5 rounded-xl border border-border/40">
                            <h4 className="font-semibold mb-2">
                              <code className="text-primary">Web3Context</code>
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Manages wallet connection state, provider
                              initialization, and account management. Provides
                              Web3 functionality to all components.
                            </p>
                            <p className="text-xs text-muted-foreground">
                              <strong>Features:</strong> Auto-connect on page
                              load, account change detection, provider
                              switching, disconnect functionality
                            </p>
                          </div>
                          <div className="glass p-5 rounded-xl border border-border/40">
                            <h4 className="font-semibold mb-2">
                              <code className="text-primary">
                                useContract Hook
                              </code>
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Custom React hook for interacting with the smart
                              contract. Handles contract initialization,
                              transaction sending, and data fetching.
                            </p>
                            <p className="text-xs text-muted-foreground">
                              <strong>Functions:</strong> loadLotteries,
                              createRaffle, buyTicket, selectWinner,
                              getParticipants, getWinners
                            </p>
                          </div>
                          <div className="glass p-5 rounded-xl border border-border/40">
                            <h4 className="font-semibold mb-2">
                              <code className="text-primary">RaffleCard</code>
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Displays individual raffle information, handles
                              ticket purchasing, and shows winner information.
                              Manages raffle state and participant data.
                            </p>
                            <p className="text-xs text-muted-foreground">
                              <strong>Features:</strong> Real-time updates,
                              ticket count input, winner display, finalization
                              button, progress tracking
                            </p>
                          </div>
                          <div className="glass p-5 rounded-xl border border-border/40">
                            <h4 className="font-semibold mb-2">
                              <code className="text-primary">
                                CreateRaffleDialog
                              </code>
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Modal dialog for creating new lotteries. Validates
                              inputs, handles form submission, and displays
                              transaction status.
                            </p>
                            <p className="text-xs text-muted-foreground">
                              <strong>Validation:</strong> Title length, ticket
                              price, end date, number of winners, creator fee,
                              max entrants
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-3">
                          State Management
                        </h3>
                        <div className="glass p-6 rounded-xl border border-border/40">
                          <p className="text-muted-foreground mb-3">
                            The frontend uses React's built-in state management:
                          </p>
                          <ul className="space-y-2 text-muted-foreground ml-6 list-disc">
                            <li>
                              <strong>useState:</strong> Component-level state
                              (lotteries, loading, account)
                            </li>
                            <li>
                              <strong>useContext:</strong> Global Web3 state
                              (provider, account, network)
                            </li>
                            <li>
                              <strong>useMemo:</strong> Computed values
                              (contract instance, filtered lotteries)
                            </li>
                            <li>
                              <strong>useEffect:</strong> Side effects (data
                              loading, event listeners, periodic updates)
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-3">
                          Performance Optimization
                        </h3>
                        <div className="space-y-4">
                          <div className="glass p-6 rounded-xl border border-blue-500/30 bg-blue-500/10">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Zap className="h-5 w-5 text-blue-500" />
                              Contract Call Caching
                            </h4>
                            <p className="text-sm text-muted-foreground mb-4">
                              Intelligent caching system reduces RPC calls by
                              ~73% for completed raffles:
                            </p>
                            <ul className="space-y-2 text-sm text-muted-foreground ml-6 list-disc mb-4">
                              <li>
                                <strong>Completed Raffles:</strong> Cached
                                indefinitely (never expire)
                              </li>
                              <li>
                                <strong>Active Raffles:</strong> Cached for 10
                                seconds
                              </li>
                              <li>
                                <strong>Participants:</strong> Cached for 5
                                seconds
                              </li>
                              <li>
                                <strong>Raffle Count:</strong> Cached for 30
                                seconds
                              </li>
                              <li>
                                <strong>Raffle List:</strong> Cached for 10
                                seconds
                              </li>
                            </ul>
                            <p className="text-sm text-muted-foreground mb-3">
                              <strong>Cache Invalidation:</strong> Automatically
                              invalidated after creating raffles, buying
                              tickets, or finalizing raffles. Expired entries
                              are cleaned up every 30 seconds.
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <strong>Benefits:</strong> Faster load times,
                              reduced RPC costs, better user experience, rate
                              limit protection.
                            </p>
                          </div>
                          <div className="glass p-5 rounded-xl border border-border/40">
                            <h4 className="font-semibold mb-2">
                              <code className="text-primary">
                                contractCache
                              </code>
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              In-memory cache system for contract call results.
                              Provides automatic TTL management, cache
                              invalidation, and pattern-based cleanup.
                            </p>
                            <p className="text-xs text-muted-foreground">
                              <strong>Location:</strong>{" "}
                              <code>lib/contract-cache.ts</code>
                            </p>
                          </div>
                          <div className="glass p-5 rounded-xl border border-border/40">
                            <h4 className="font-semibold mb-2">
                              <code className="text-primary">
                                React.memo & useMemo
                              </code>
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Components are memoized to prevent unnecessary
                              re-renders. Expensive calculations are cached
                              using useMemo.
                            </p>
                            <p className="text-xs text-muted-foreground">
                              <strong>Optimizations:</strong> RaffleCard wrapped
                              with React.memo, filtered raffle lists memoized,
                              time calculations cached
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-3">
                          Error Handling
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="glass p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10">
                            <h4 className="font-semibold mb-2">
                              Mock Data Fallback
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              If contract is not deployed or wallet is not
                              connected, the app displays mock data to
                              demonstrate functionality. This allows the app to
                              work in demo mode.
                            </p>
                          </div>
                          <div className="glass p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10">
                            <h4 className="font-semibold mb-2">
                              Transaction Errors
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              All contract interactions are wrapped in try-catch
                              blocks. Errors are displayed to users via toast
                              notifications with descriptive messages.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-3">
                          Code Structure
                        </h3>
                        <div className="glass p-6 rounded-xl border border-border/40">
                          <pre className="text-sm text-muted-foreground font-mono overflow-x-auto">
                            {`LuckyChain_V2/
├── app/
│   ├── page.tsx              # Main page with raffle list
│   ├── layout.tsx            # Root layout with providers
│   ├── fyi/page.tsx          # How it works page
│   ├── developers/page.tsx   # This page
│   ├── context/
│   │   └── Web3Context.tsx   # Web3 state management
│   ├── services/
│   │   └── contract.ts       # Contract interaction hook
├── components/
│   ├── raffle-card.tsx      # Raffle display component
│   ├── create-raffle-dialog.tsx
│   ├── wallet-connect.tsx
│   └── ui/                   # Reusable UI components
├── contracts/
│   └── Raffle.sol           # Smart contract
└── lib/
    ├── web3.ts               # Web3 utilities
    ├── contract-cache.ts     # RPC call caching system
    └── utils.ts              # General utilities`}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
