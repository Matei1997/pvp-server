"use client"

import { cn } from "@/lib/utils"
import { Heart, Shield, Trophy, Clock } from "lucide-react"

// Chat safe zone offset - reserves space for GTA/RageMP chat box
// Adjust this value if chat size changes (160-200px recommended)
const HUD_LEFT_TOP_OFFSET = "top-[180px]"

interface KillFeedEntry {
  id: string
  killer: string
  victim: string
  weapon: string
  isHeadshot?: boolean
  timestamp: number
}

interface FFAHUDProps {
  playerScore: number
  targetScore: number
  timeRemaining: number
  playerHealth: number
  playerArmor: number
  currentWeapon: string
  ammo: number
  reserveAmmo: number
  killfeed: KillFeedEntry[]
  leaderboard: { name: string; score: number; isPlayer?: boolean }[]
}

export function FFAHUD({
  playerScore = 12,
  targetScore = 30,
  timeRemaining = 245,
  playerHealth = 100,
  playerArmor = 75,
  currentWeapon = "SMG COMPACT",
  ammo = 32,
  reserveAmmo = 128,
  killfeed = [],
  leaderboard = [],
}: Partial<FFAHUDProps>) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* TOP CENTER - Score & Time - compact, edge-positioned */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {/* Player score */}
        <div className="glass-panel rounded px-4 py-2 flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-2xl font-mono font-bold text-primary">{playerScore}</span>
            <span className="text-sm text-muted-foreground">/ {targetScore}</span>
          </div>
          <span className="text-[9px] text-muted-foreground tracking-wider">YOUR SCORE</span>
        </div>

        {/* Timer */}
        <div className="glass-panel rounded px-3 py-2 flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xl font-mono font-bold text-foreground">{formatTime(timeRemaining)}</span>
          </div>
          <span className="text-[9px] text-muted-foreground tracking-wider">TIME LEFT</span>
        </div>
      </div>

      {/* LEFT SIDE - Leaderboard - positioned below chat safe zone */}
      <div className={cn("absolute left-2", HUD_LEFT_TOP_OFFSET)}>
        <div className="glass-panel rounded p-2 min-w-[160px]">
          <h4 className="text-[10px] text-muted-foreground tracking-wider mb-1.5">LEADERBOARD</h4>
          <div className="flex flex-col gap-0.5">
            {leaderboard.slice(0, 5).map((player, index) => (
              <div
                key={player.name}
                className={cn(
                  "flex items-center justify-between px-1.5 py-0.5 rounded",
                  player.isPlayer && "bg-primary/20"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    "text-[10px] font-bold w-3",
                    index === 0 && "text-warning",
                    index === 1 && "text-muted-foreground",
                    index === 2 && "text-warning/60"
                  )}>
                    {index + 1}
                  </span>
                  <span className={cn(
                    "text-xs truncate max-w-[80px]",
                    player.isPlayer ? "text-primary font-medium" : "text-foreground"
                  )}>
                    {player.name}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-foreground">{player.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TOP RIGHT - Kill Feed - strict edge */}
      <div className="absolute top-2 right-2 flex flex-col items-end gap-0.5 max-w-[240px]">
        {killfeed.slice(0, 5).map((entry) => (
          <div
            key={entry.id}
            className="glass-panel rounded px-2 py-1 flex items-center gap-1.5 text-xs animate-in slide-in-from-right-5"
          >
            <span className="font-medium text-purple truncate max-w-[70px]">{entry.killer}</span>
            <span className="text-muted-foreground text-[10px]">
              [{entry.weapon}]
              {entry.isHeadshot && <span className="text-warning ml-0.5">HS</span>}
            </span>
            <span className="font-medium text-foreground truncate max-w-[70px]">{entry.victim}</span>
          </div>
        ))}
      </div>

      {/* BOTTOM LEFT - Minimap - strict edge */}
      <div className="absolute bottom-2 left-2">
        <div className="glass-panel rounded w-36 h-36 flex items-center justify-center">
          <div className="w-28 h-28 border border-border/50 rounded bg-surface-1/50 relative">
            <span className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground">
              MINIMAP
            </span>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
          </div>
        </div>
      </div>

      {/* BOTTOM RIGHT - Weapon & Health - strict edge */}
      <div className="absolute bottom-2 right-2 flex flex-col items-end gap-2">
        {/* Weapon info - compact */}
        <div className="glass-panel rounded px-3 py-2 flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-muted-foreground tracking-wider">{currentWeapon}</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-mono font-bold text-foreground">{ammo}</span>
              <span className="text-sm text-muted-foreground">/</span>
              <span className="text-sm text-muted-foreground">{reserveAmmo}</span>
            </div>
          </div>
          <div className="w-20 h-8 bg-surface-2 rounded flex items-center justify-center">
            <div className="w-16 h-3 bg-surface-3 rounded" />
          </div>
        </div>

        {/* Health & Armor - compact */}
        <div className="glass-panel rounded px-3 py-2 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-team-red" />
            <div className="w-24 h-2.5 bg-surface-1 rounded-full overflow-hidden">
              <div
                className="h-full bg-team-red transition-all duration-300"
                style={{ width: `${playerHealth}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-foreground w-7">{playerHealth}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-team-blue" />
            <div className="w-16 h-2.5 bg-surface-1 rounded-full overflow-hidden">
              <div
                className="h-full bg-team-blue transition-all duration-300"
                style={{ width: `${playerArmor}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-foreground w-7">{playerArmor}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
