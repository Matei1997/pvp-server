"use client"

import { cn } from "@/lib/utils"
import { Heart, Shield, Mic, MicOff, Radio } from "lucide-react"

// Chat safe zone offset - reserves space for GTA/RageMP chat box
// Adjust this value if chat size changes (160-200px recommended)
const HUD_LEFT_TOP_OFFSET = "top-[180px]"

interface Teammate {
  id: string
  name: string
  health: number
  armor: number
  isAlive: boolean
  isSpeaking?: boolean
}

interface KillFeedEntry {
  id: string
  killer: string
  killerTeam: "red" | "blue"
  victim: string
  victimTeam: "red" | "blue"
  weapon: string
  isHeadshot?: boolean
  timestamp: number
}

interface HopoutsHUDProps {
  roundNumber: number
  totalRounds: number
  roundTime: number
  redScore: number
  blueScore: number
  teammates: Teammate[]
  killfeed: KillFeedEntry[]
  playerHealth: number
  playerArmor: number
  currentWeapon: string
  ammo: number
  reserveAmmo: number
  items: { medkit: number; armor: number }
  voipActive?: boolean
}

export function HopoutsHUD({
  roundNumber = 3,
  totalRounds = 5,
  roundTime = 87,
  redScore = 1,
  blueScore = 2,
  teammates = [],
  killfeed = [],
  playerHealth = 85,
  playerArmor = 50,
  currentWeapon = "ASSAULT RIFLE",
  ammo = 24,
  reserveAmmo = 90,
  items = { medkit: 1, armor: 2 },
  voipActive = false,
}: Partial<HopoutsHUDProps>) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* TOP CENTER - Round Info & Compass - positioned at top edge */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
        {/* Compass */}
        <div className="glass-panel rounded px-4 py-1 flex items-center gap-3">
          <span className="text-[10px] text-muted-foreground">W</span>
          <span className="text-[10px] text-muted-foreground">NW</span>
          <span className="text-xs font-bold text-primary">N</span>
          <span className="text-[10px] text-muted-foreground">NE</span>
          <span className="text-[10px] text-muted-foreground">E</span>
        </div>

        {/* Round score - compact */}
        <div className="glass-panel rounded px-3 py-1.5 flex items-center gap-4">
          {/* Red team score */}
          <span className="text-xl font-bold text-team-red">{redScore}</span>

          {/* Round info */}
          <div className="flex flex-col items-center">
            <span className="text-xl font-mono font-bold text-foreground">{formatTime(roundTime)}</span>
            <span className="text-[9px] text-muted-foreground tracking-wider">
              ROUND {roundNumber}/{totalRounds}
            </span>
          </div>

          {/* Blue team score */}
          <span className="text-xl font-bold text-team-blue">{blueScore}</span>
        </div>
      </div>

      {/* LEFT SIDE - Teammates - positioned below chat safe zone */}
      <div className={cn("absolute left-2 flex flex-col gap-2 max-w-[280px]", HUD_LEFT_TOP_OFFSET)}>
        {/* Teammates */}
        <div className="flex flex-col gap-0.5">
          {teammates.map((teammate) => (
            <TeammateStatus key={teammate.id} teammate={teammate} />
          ))}
        </div>
      </div>

      {/* TOP RIGHT - Kill Feed & VOIP - strict edge positioning */}
      <div className="absolute top-2 right-2 flex flex-col items-end gap-2 max-w-[260px]">
        {/* VOIP indicator - compact */}
        <div className="glass-panel rounded px-2 py-1 flex items-center gap-1.5">
          {voipActive ? (
            <>
              <Radio className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span className="text-[10px] text-primary font-medium">TRANSMITTING</span>
            </>
          ) : (
            <>
              <MicOff className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">PTT</span>
            </>
          )}
        </div>

        {/* Kill feed */}
        <div className="flex flex-col gap-0.5">
          {killfeed.slice(0, 5).map((entry) => (
            <KillFeedItem key={entry.id} entry={entry} />
          ))}
        </div>
      </div>

      {/* BOTTOM LEFT - Minimap - strict edge positioning */}
      <div className="absolute bottom-2 left-2">
        <div className="glass-panel rounded w-36 h-36 flex items-center justify-center">
          <div className="w-28 h-28 border border-border/50 rounded bg-surface-1/50 relative">
            <span className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground">
              MINIMAP
            </span>
            {/* Player position indicator */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
          </div>
        </div>
      </div>

      {/* BOTTOM RIGHT - Weapon & Items - strict edge positioning */}
      <div className="absolute bottom-2 right-2 flex flex-col items-end gap-2">
        {/* Items - compact */}
        <div className="flex gap-1.5">
          <ItemSlot type="medkit" count={items.medkit} />
          <ItemSlot type="armor" count={items.armor} />
        </div>

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
          {/* Weapon icon placeholder */}
          <div className="w-20 h-8 bg-surface-2 rounded flex items-center justify-center">
            <div className="w-16 h-3 bg-surface-3 rounded" />
          </div>
        </div>

        {/* Health & Armor - compact horizontal layout */}
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

function TeammateStatus({ teammate }: { teammate: Teammate }) {
  return (
    <div className={cn(
      "glass-panel rounded px-2 py-1 flex items-center gap-2 min-w-[180px]",
      !teammate.isAlive && "opacity-40"
    )}>
      {/* Speaking indicator */}
      {teammate.isSpeaking ? (
        <Mic className="w-3 h-3 text-primary animate-pulse" />
      ) : (
        <div className="w-3 h-3" />
      )}

      {/* Name */}
      <span className={cn(
        "text-xs font-medium flex-1 truncate",
        teammate.isAlive ? "text-foreground" : "text-muted-foreground line-through"
      )}>
        {teammate.name}
      </span>

      {/* Health/Armor bars */}
      {teammate.isAlive ? (
        <div className="flex flex-col gap-0.5">
          <div className="w-12 h-1 bg-surface-1 rounded-full overflow-hidden">
            <div
              className="h-full bg-team-red"
              style={{ width: `${teammate.health}%` }}
            />
          </div>
          <div className="w-12 h-1 bg-surface-1 rounded-full overflow-hidden">
            <div
              className="h-full bg-team-blue"
              style={{ width: `${teammate.armor}%` }}
            />
          </div>
        </div>
      ) : (
        <span className="text-[10px] text-destructive font-medium">DEAD</span>
      )}
    </div>
  )
}

function KillFeedItem({ entry }: { entry: KillFeedEntry }) {
  return (
    <div className="glass-panel rounded px-2 py-1 flex items-center gap-1.5 text-xs animate-in slide-in-from-right-5">
      <span className={cn(
        "font-medium truncate max-w-[70px]",
        entry.killerTeam === "red" ? "text-team-red" : "text-team-blue"
      )}>
        {entry.killer}
      </span>
      <span className="text-muted-foreground text-[10px]">
        [{entry.weapon}]
        {entry.isHeadshot && <span className="text-warning ml-0.5">HS</span>}
      </span>
      <span className={cn(
        "font-medium truncate max-w-[70px]",
        entry.victimTeam === "red" ? "text-team-red" : "text-team-blue"
      )}>
        {entry.victim}
      </span>
    </div>
  )
}

function ItemSlot({ type, count }: { type: "medkit" | "armor"; count: number }) {
  return (
    <div className={cn(
      "glass-panel rounded w-11 h-11 flex flex-col items-center justify-center gap-0.5",
      count === 0 && "opacity-40"
    )}>
      {type === "medkit" ? (
        <div className="w-5 h-5 rounded bg-team-red/30 flex items-center justify-center text-team-red text-sm font-bold">
          +
        </div>
      ) : (
        <Shield className="w-5 h-5 text-team-blue" />
      )}
      <span className="text-[10px] font-mono font-bold text-foreground">{count}</span>
    </div>
  )
}
