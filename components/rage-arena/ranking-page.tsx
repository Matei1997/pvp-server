"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Trophy, Medal, Award, ChevronUp, ChevronDown, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface LeaderboardPlayer {
  rank: number
  previousRank: number
  name: string
  mmr: number
  wins: number
  losses: number
  tier: string
}

const mockLeaderboard: LeaderboardPlayer[] = [
  { rank: 1, previousRank: 1, name: "xShadowMaster", mmr: 4521, wins: 342, losses: 89, tier: "Champion" },
  { rank: 2, previousRank: 3, name: "ProSniper_X", mmr: 4389, wins: 298, losses: 102, tier: "Champion" },
  { rank: 3, previousRank: 2, name: "NightHunter", mmr: 4356, wins: 287, losses: 98, tier: "Champion" },
  { rank: 4, previousRank: 5, name: "GhostRecon99", mmr: 4201, wins: 265, losses: 112, tier: "Champion" },
  { rank: 5, previousRank: 4, name: "DeadlyViper", mmr: 4156, wins: 254, losses: 118, tier: "Diamond I" },
  { rank: 6, previousRank: 6, name: "StealthKing", mmr: 4089, wins: 241, losses: 127, tier: "Diamond I" },
  { rank: 7, previousRank: 9, name: "RageQuitter", mmr: 4012, wins: 236, losses: 134, tier: "Diamond I" },
  { rank: 8, previousRank: 7, name: "SilentStrike", mmr: 3987, wins: 228, losses: 141, tier: "Diamond II" },
  { rank: 9, previousRank: 8, name: "PhantomBlade", mmr: 3945, wins: 221, losses: 148, tier: "Diamond II" },
  { rank: 10, previousRank: 12, name: "IronFist", mmr: 3912, wins: 215, losses: 152, tier: "Diamond II" },
]

const rankTiers = [
  { name: "Champion", color: "text-amber-400", bgColor: "bg-amber-400/10", borderColor: "border-amber-400/20", minMmr: 4000 },
  { name: "Diamond", color: "text-purple-400", bgColor: "bg-purple-400/10", borderColor: "border-purple-400/20", minMmr: 3000 },
  { name: "Platinum", color: "text-cyan", bgColor: "bg-cyan/10", borderColor: "border-cyan/20", minMmr: 2000 },
  { name: "Gold", color: "text-yellow-500", bgColor: "bg-yellow-500/10", borderColor: "border-yellow-500/20", minMmr: 1500 },
  { name: "Silver", color: "text-gray-400", bgColor: "bg-gray-400/10", borderColor: "border-gray-400/20", minMmr: 1000 },
  { name: "Bronze", color: "text-orange-600", bgColor: "bg-orange-600/10", borderColor: "border-orange-600/20", minMmr: 0 },
]

type GameMode = "hopouts" | "ffa" | "gungame"

export function RankingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMode, setSelectedMode] = useState<GameMode>("hopouts")

  const filteredPlayers = mockLeaderboard.filter((player) =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-full flex flex-col bg-[#0a0f16] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black tracking-wider text-foreground">
            GLOBAL <span className="text-[#00e0c6]">RANKING</span>
          </h1>
          <p className="text-sm text-muted-foreground">Leaderboards and rankings</p>
        </div>
        
        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search player..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9 bg-[#111922] border-[rgba(255,255,255,0.05)] rounded-md text-sm"
          />
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {(["hopouts", "ffa", "gungame"] as GameMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setSelectedMode(mode)}
            className={cn(
              "px-4 py-2 rounded-md text-xs font-bold tracking-wider transition-all border",
              selectedMode === mode
                ? "bg-[#00e0c6]/10 border-[#00e0c6] text-[#00e0c6]"
                : "bg-[#111922] border-[rgba(255,255,255,0.05)] text-muted-foreground hover:text-foreground hover:border-[rgba(255,255,255,0.1)]"
            )}
          >
            {mode === "hopouts" ? "HOPOUTS" : mode === "ffa" ? "DEATHMATCH" : "GUN GAME"}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        {/* Leaderboard (8 cols) */}
        <div className="col-span-8 bg-[#111922] border border-[rgba(255,255,255,0.05)] rounded-md overflow-hidden flex flex-col">
          {/* Top 3 Podium */}
          <div className="p-6 bg-[#0a0f16] border-b border-[rgba(255,255,255,0.05)]">
            <div className="flex items-end justify-center gap-4">
              {/* 2nd place */}
              <PodiumCard player={filteredPlayers[1]} position={2} />
              {/* 1st place */}
              <PodiumCard player={filteredPlayers[0]} position={1} />
              {/* 3rd place */}
              <PodiumCard player={filteredPlayers[2]} position={3} />
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2.5 bg-[#0a0f16] text-[10px] font-bold text-muted-foreground tracking-wider border-b border-[rgba(255,255,255,0.05)]">
            <div className="col-span-1">RANK</div>
            <div className="col-span-4">PLAYER</div>
            <div className="col-span-2">TIER</div>
            <div className="col-span-2">MMR</div>
            <div className="col-span-3">W/L</div>
          </div>

          {/* Leaderboard List */}
          <ScrollArea className="flex-1">
            <div className="divide-y divide-[rgba(255,255,255,0.05)]">
              {filteredPlayers.slice(3).map((player) => (
                <LeaderboardRow key={player.rank} player={player} />
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Rank Tiers Sidebar (4 cols) */}
        <div className="col-span-4 bg-[#111922] border border-[rgba(255,255,255,0.05)] rounded-md p-5">
          <h3 className="text-xs font-bold text-[#00e0c6] tracking-wider mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-[#00e0c6]" />
            RANK TIERS
          </h3>
          <div className="space-y-2">
            {rankTiers.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  "flex items-center justify-between p-3 rounded-md border",
                  tier.bgColor,
                  tier.borderColor
                )}
              >
                <span className={cn("font-bold text-sm", tier.color)}>{tier.name}</span>
                <span className="text-xs text-muted-foreground">{tier.minMmr}+ MMR</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function PodiumCard({ player, position }: { player?: LeaderboardPlayer; position: number }) {
  if (!player) return null

  const positionStyles = {
    1: { height: "h-32", icon: Trophy, color: "text-amber-400", bg: "bg-cyan/20" },
    2: { height: "h-24", icon: Medal, color: "text-gray-400", bg: "bg-black/30" },
    3: { height: "h-20", icon: Medal, color: "text-orange-600", bg: "bg-black/30" },
  }

  const style = positionStyles[position as keyof typeof positionStyles]
  const Icon = style.icon

  return (
    <div className="flex flex-col items-center">
      <div className={cn(
        "w-14 h-14 rounded-md border flex items-center justify-center mb-2",
        position === 1 ? "border-amber-400/30 bg-amber-400/10" : "border-white/10 bg-black/30"
      )}>
        <Icon className={cn("w-7 h-7", style.color)} />
      </div>
      <p className="font-bold text-foreground text-sm text-center truncate max-w-[100px]">{player.name}</p>
      <p className="text-xs text-cyan font-mono">{player.mmr} MMR</p>
      <div className={cn(
        "w-20 rounded-t-md mt-2 flex items-end justify-center pb-2",
        style.height,
        style.bg
      )}>
        <span className={cn("text-2xl font-black", style.color)}>#{position}</span>
      </div>
    </div>
  )
}

function LeaderboardRow({ player }: { player: LeaderboardPlayer }) {
  const rankChange = player.previousRank - player.rank

  return (
    <div className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-white/[0.02] transition-colors">
      {/* Rank */}
      <div className="col-span-1 flex items-center gap-1">
        <span className="text-sm font-bold text-foreground">#{player.rank}</span>
        {rankChange > 0 && <ChevronUp className="w-3 h-3 text-emerald-400" />}
        {rankChange < 0 && <ChevronDown className="w-3 h-3 text-rose-400" />}
      </div>

      {/* Player name */}
      <div className="col-span-4">
        <span className="font-medium text-foreground text-sm truncate">{player.name}</span>
      </div>

      {/* Tier */}
      <div className="col-span-2">
        <span className={cn(
          "text-xs font-medium",
          player.tier.includes("Champion") && "text-amber-400",
          player.tier.includes("Diamond") && "text-purple-400",
          player.tier.includes("Platinum") && "text-cyan"
        )}>
          {player.tier}
        </span>
      </div>

      {/* MMR */}
      <div className="col-span-2">
        <span className="text-sm font-mono text-cyan">{player.mmr}</span>
      </div>

      {/* W/L */}
      <div className="col-span-3">
        <span className="text-xs text-muted-foreground">
          {player.wins}W / {player.losses}L
        </span>
      </div>
    </div>
  )
}
