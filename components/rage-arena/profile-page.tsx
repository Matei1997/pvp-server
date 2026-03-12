"use client"

import { cn } from "@/lib/utils"
import { Award, Trophy, Target, Crosshair, Clock, Calendar, TrendingUp, Star } from "lucide-react"
import { CharacterPreview } from "./character-preview"

interface ProfilePageProps {
  playerName?: string
  rank?: string
  mmr?: number
  prestige?: number
  seasonWins?: number
  seasonLosses?: number
  lifetimeKills?: number
  lifetimeDeaths?: number
  lifetimeWins?: number
  lifetimeMatches?: number
  hoursPlayed?: number
  recentMatches?: {
    id: string
    mode: string
    result: "win" | "loss"
    kills: number
    deaths: number
    date: string
  }[]
}

export function ProfilePage({
  playerName = "GHOST_001",
  rank = "Diamond II",
  mmr = 2847,
  prestige = 3,
  seasonWins = 127,
  seasonLosses = 89,
  lifetimeKills = 15847,
  lifetimeDeaths = 9234,
  lifetimeWins = 892,
  lifetimeMatches = 1456,
  hoursPlayed = 342,
  recentMatches = [],
}: ProfilePageProps) {
  const winRate = ((seasonWins / (seasonWins + seasonLosses)) * 100).toFixed(1)
  const kd = (lifetimeKills / lifetimeDeaths).toFixed(2)

  return (
    <div className="h-full flex flex-col bg-[#0a0f16] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black tracking-wider text-foreground">
            MY <span className="text-[#00e0c6]">PROFILE</span>
          </h1>
          <p className="text-sm text-muted-foreground">View your stats and progress</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-[#111922] border border-[rgba(255,255,255,0.05)] px-4 py-2 rounded-md">
            <div className="w-2 h-2 rounded-full bg-[#2ecc71] animate-pulse" />
            <span>Online</span>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        
        {/* LEFT - Character Preview (4 cols, full height) */}
        <div className="col-span-4 bg-[#111922] border border-[rgba(255,255,255,0.05)] rounded-md relative overflow-hidden flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <CharacterPreview characterName={playerName} title={rank} />
          </div>
          
          {/* Player header overlay */}
          <div className="absolute top-4 left-4 right-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-md bg-[#0a0f16] border border-[rgba(255,255,255,0.05)] flex items-center justify-center text-sm font-bold text-foreground">
              {playerName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{playerName}</h2>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#00e0c6] font-medium">{rank}</span>
                {prestige > 0 && (
                  <>
                    <span className="text-muted-foreground">|</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-[#f39c12]" />
                      <span className="text-[#f39c12] font-medium">P{prestige}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT - Stats Grid (8 cols) */}
        <div className="col-span-8 grid grid-cols-2 gap-4">
          {/* Competitive Rank */}
          <div className="bg-[#111922] border border-[rgba(255,255,255,0.05)] rounded-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#00e0c6] tracking-wider">COMPETITIVE RANK</h3>
              <Trophy className="w-4 h-4 text-[#00e0c6]" />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-md bg-[#00e0c6]/10 border border-[#00e0c6]/30 flex items-center justify-center flex-shrink-0">
                <Award className="w-8 h-8 text-[#00e0c6]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xl font-bold text-[#00e0c6] mb-0.5">{rank}</p>
                <p className="text-sm text-muted-foreground">{mmr} MMR</p>
                <div className="mt-2 w-full h-2 bg-[#0a0f16] rounded-full overflow-hidden">
                  <div className="h-full bg-[#00e0c6] w-3/4" />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">153 MMR to Diamond III</p>
              </div>
            </div>
          </div>

          {/* Season Stats */}
          <div className="bg-[#111922] border border-[rgba(255,255,255,0.05)] rounded-md p-5">
            <h3 className="text-xs font-bold text-[#00e0c6] tracking-wider mb-4">SEASON STATS</h3>
            <div className="grid grid-cols-3 gap-2">
              <StatCard icon={Trophy} label="WIN RATE" value={`${winRate}%`} color="text-[#2ecc71]" />
              <StatCard icon={Target} label="WINS" value={seasonWins.toString()} color="text-[#00e0c6]" />
              <StatCard icon={Crosshair} label="LOSSES" value={seasonLosses.toString()} color="text-[#e74c3c]" />
            </div>
          </div>

          {/* Lifetime Stats */}
          <div className="bg-[#111922] border border-[rgba(255,255,255,0.05)] rounded-md p-5">
            <h3 className="text-xs font-bold text-[#00e0c6] tracking-wider mb-4">LIFETIME STATS</h3>
            <div className="grid grid-cols-3 gap-2">
              <StatCard icon={Crosshair} label="KILLS" value={lifetimeKills.toLocaleString()} />
              <StatCard icon={Target} label="DEATHS" value={lifetimeDeaths.toLocaleString()} />
              <StatCard icon={TrendingUp} label="K/D" value={kd} color="text-[#00e0c6]" />
              <StatCard icon={Trophy} label="WINS" value={lifetimeWins.toLocaleString()} color="text-[#2ecc71]" />
              <StatCard icon={Calendar} label="MATCHES" value={lifetimeMatches.toLocaleString()} />
              <StatCard icon={Clock} label="HOURS" value={hoursPlayed.toString()} />
            </div>
          </div>

          {/* Recent Matches */}
          <div className="bg-[#111922] border border-[rgba(255,255,255,0.05)] rounded-md p-5 flex flex-col">
            <h3 className="text-xs font-bold text-[#00e0c6] tracking-wider mb-4">RECENT MATCHES</h3>
            <div className="flex-1 overflow-y-auto space-y-2">
              {(recentMatches.length > 0 ? recentMatches : mockRecentMatches).slice(0, 5).map((match) => (
                <div
                  key={match.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-md",
                    match.result === "win" ? "bg-[#2ecc71]/10" : "bg-[#e74c3c]/10"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-1 h-7 rounded-full",
                      match.result === "win" ? "bg-[#2ecc71]" : "bg-[#e74c3c]"
                    )} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{match.mode}</p>
                      <p className="text-[10px] text-muted-foreground">{match.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-xs font-bold",
                      match.result === "win" ? "text-[#2ecc71]" : "text-[#e74c3c]"
                    )}>
                      {match.result.toUpperCase()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {match.kills}K / {match.deaths}D
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color = "text-foreground",
}: {
  icon: React.ElementType
  label: string
  value: string
  color?: string
}) {
  return (
    <div className="bg-[#0a0f16] rounded-md p-3 border border-[rgba(255,255,255,0.05)]">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className="w-3 h-3 text-muted-foreground" />
        <span className="text-[9px] text-muted-foreground tracking-wider">{label}</span>
      </div>
      <p className={cn("text-lg font-bold", color)}>{value}</p>
    </div>
  )
}

const mockRecentMatches = [
  { id: "1", mode: "Hopouts 3v3", result: "win" as const, kills: 8, deaths: 3, date: "2 hours ago" },
  { id: "2", mode: "Free For All", result: "loss" as const, kills: 12, deaths: 8, date: "5 hours ago" },
  { id: "3", mode: "Hopouts 5v5", result: "win" as const, kills: 15, deaths: 6, date: "Yesterday" },
  { id: "4", mode: "Gun Game", result: "win" as const, kills: 20, deaths: 5, date: "Yesterday" },
  { id: "5", mode: "Hopouts 2v2", result: "loss" as const, kills: 4, deaths: 6, date: "2 days ago" },
]
