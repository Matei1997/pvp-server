"use client"

import { cn } from "@/lib/utils"
import { Crosshair, Skull, Target, Zap, Award } from "lucide-react"

interface Player {
  id: string
  name: string
  kills: number
  deaths: number
  damage: number
  headshotPercent: number
  rankBadge?: string
  isPlayer?: boolean
}

interface RoundScoreboardProps {
  redTeam: Player[]
  blueTeam: Player[]
  redScore: number
  blueScore: number
  roundNumber: number
  totalRounds: number
  isOpen: boolean
  onClose?: () => void
}

const rankColors: Record<string, string> = {
  bronze: "text-orange-600",
  silver: "text-gray-400",
  gold: "text-yellow-500",
  platinum: "text-cyan",
  diamond: "text-purple",
  champion: "text-warning",
}

export function RoundScoreboard({
  redTeam,
  blueTeam,
  redScore,
  blueScore,
  roundNumber,
  totalRounds,
  isOpen,
  onClose,
}: RoundScoreboardProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-[70%] max-w-6xl min-w-[800px] mx-4 flex flex-col items-center">
        {/* Centered Score Header - Above scoreboard */}
        <div className="mb-4 text-center">
          <p className="text-sm text-muted-foreground tracking-widest mb-2">
            ROUND {roundNumber}
          </p>
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-team-red tracking-wider">RED</span>
              <span className="text-4xl font-black text-team-red">{redScore}</span>
            </div>
            <span className="text-2xl text-muted-foreground font-light">—</span>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-black text-team-blue">{blueScore}</span>
              <span className="text-sm font-bold text-team-blue tracking-wider">BLUE</span>
            </div>
          </div>
        </div>

        {/* Scoreboard Panel */}
        <div className="glass-panel rounded-xl w-full overflow-hidden">
          {/* Header bar */}
          <div className="bg-surface-2 px-6 py-3 flex items-center justify-between">
            <p className="text-sm font-bold text-foreground tracking-wider">SCOREBOARD</p>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              Press TAB to close
            </button>
          </div>

        {/* Teams */}
        <div className="grid grid-cols-2 divide-x divide-border">
          {/* Red Team */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4 px-3">
              <div className="w-3 h-3 rounded-full bg-team-red" />
              <span className="text-sm font-bold text-team-red tracking-wider">RED TEAM</span>
            </div>
            <div className="space-y-1">
              <ScoreboardHeader />
              {redTeam.map((player) => (
                <PlayerRow key={player.id} player={player} team="red" />
              ))}
            </div>
          </div>

          {/* Blue Team */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4 px-3">
              <div className="w-3 h-3 rounded-full bg-team-blue" />
              <span className="text-sm font-bold text-team-blue tracking-wider">BLUE TEAM</span>
            </div>
            <div className="space-y-1">
              <ScoreboardHeader />
              {blueTeam.map((player) => (
                <PlayerRow key={player.id} player={player} team="blue" />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
          <div className="bg-surface-1 px-6 py-3 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Crosshair className="w-3.5 h-3.5" />
                <span>Kills</span>
              </div>
              <div className="flex items-center gap-1">
                <Skull className="w-3.5 h-3.5" />
                <span>Deaths</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="w-3.5 h-3.5" />
                <span>Damage</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                <span>HS%</span>
              </div>
            </div>
            <span>HOPOUTS - COMPETITIVE</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScoreboardHeader() {
  return (
    <div className="grid grid-cols-[1fr_50px_50px_60px_50px] gap-2 px-3 py-1 text-xs text-muted-foreground">
      <span>PLAYER</span>
      <span className="text-center">K</span>
      <span className="text-center">D</span>
      <span className="text-center">DMG</span>
      <span className="text-center">HS%</span>
    </div>
  )
}

function PlayerRow({ player, team }: { player: Player; team: "red" | "blue" }) {
  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_50px_50px_60px_50px] gap-2 px-3 py-2 rounded-lg transition-colors",
        player.isPlayer
          ? team === "red"
            ? "bg-team-red/20 border border-team-red/30"
            : "bg-team-blue/20 border border-team-blue/30"
          : "hover:bg-surface-2"
      )}
    >
      <div className="flex items-center gap-2">
        {player.rankBadge && (
          <Award className={cn("w-4 h-4", rankColors[player.rankBadge] || "text-muted-foreground")} />
        )}
        <span className={cn(
          "font-medium truncate",
          player.isPlayer ? "text-primary" : "text-foreground"
        )}>
          {player.name}
        </span>
      </div>
      <span className="text-center font-mono font-bold text-foreground">{player.kills}</span>
      <span className="text-center font-mono text-muted-foreground">{player.deaths}</span>
      <span className="text-center font-mono text-foreground">{player.damage}</span>
      <span className={cn(
        "text-center font-mono",
        player.headshotPercent >= 50 ? "text-warning" : "text-muted-foreground"
      )}>
        {player.headshotPercent}%
      </span>
    </div>
  )
}

// Final Scoreboard (used at end of match)
export function FinalScoreboard({
  redTeam,
  blueTeam,
  redScore,
  blueScore,
  isOpen,
  onContinue,
}: Omit<RoundScoreboardProps, "roundNumber" | "totalRounds" | "onClose"> & {
  onContinue?: () => void
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md">
      <div className="w-[70%] max-w-6xl min-w-[800px] mx-4 flex flex-col items-center">
        {/* Centered Score Header - Above scoreboard */}
        <div className="mb-4 text-center">
          <p className="text-sm text-muted-foreground tracking-widest mb-2">
            MATCH COMPLETE
          </p>
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-team-red tracking-wider">RED</span>
              <span className="text-5xl font-black text-team-red">{redScore}</span>
            </div>
            <span className="text-2xl text-muted-foreground font-light">—</span>
            <div className="flex items-center gap-3">
              <span className="text-5xl font-black text-team-blue">{blueScore}</span>
              <span className="text-sm font-bold text-team-blue tracking-wider">BLUE</span>
            </div>
          </div>
        </div>

        {/* Scoreboard Panel */}
        <div className="glass-panel rounded-xl w-full overflow-hidden">
          {/* Teams */}
          <div className="grid grid-cols-2 divide-x divide-border">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3 px-3">
                <div className="w-3 h-3 rounded-full bg-team-red" />
                <span className="text-sm font-bold text-team-red tracking-wider">RED TEAM</span>
              </div>
              <div className="space-y-1">
                <ScoreboardHeader />
                {redTeam.map((player) => (
                  <PlayerRow key={player.id} player={player} team="red" />
                ))}
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3 px-3">
                <div className="w-3 h-3 rounded-full bg-team-blue" />
                <span className="text-sm font-bold text-team-blue tracking-wider">BLUE TEAM</span>
              </div>
              <div className="space-y-1">
                <ScoreboardHeader />
                {blueTeam.map((player) => (
                  <PlayerRow key={player.id} player={player} team="blue" />
                ))}
              </div>
            </div>
          </div>

          {/* Continue button */}
          <div className="bg-surface-1 px-6 py-4 flex justify-center">
            <button
              onClick={onContinue}
              className="px-8 py-3 bg-primary text-primary-foreground font-bold tracking-wider rounded-lg hover:bg-primary/90 transition-colors"
            >
              CONTINUE
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
