"use client"

import { cn } from "@/lib/utils"
import { Heart, Shield, Zap, Crown, ArrowUp } from "lucide-react"

// Chat safe zone offset - reserves space for GTA/RageMP chat box
// Adjust this value if chat size changes (160-200px recommended)
const HUD_LEFT_TOP_OFFSET = "top-[180px]"

interface KillFeedEntry {
  id: string
  killer: string
  victim: string
  weapon: string
  isHeadshot?: boolean
  tierUp?: boolean
}

interface GunGameHUDProps {
  currentTier: number
  totalTiers: number
  currentWeapon: string
  nextWeapon: string
  playerHealth: number
  playerArmor: number
  ammo: number
  reserveAmmo: number
  killfeed: KillFeedEntry[]
  leaderTier: number
  leaderName: string
}

export function GunGameHUD({
  currentTier = 8,
  totalTiers = 20,
  currentWeapon = "SHOTGUN BREACHER",
  nextWeapon = "SNIPER MK2",
  playerHealth = 100,
  playerArmor = 50,
  ammo = 8,
  reserveAmmo = 32,
  killfeed = [],
  leaderTier = 12,
  leaderName = "ProPlayer_X",
}: Partial<GunGameHUDProps>) {
  const progress = (currentTier / totalTiers) * 100

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* TOP CENTER - Tier Progress - compact, edge-positioned */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
        {/* Current tier */}
        <div className="glass-panel rounded px-4 py-2 flex flex-col items-center">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-warning" />
            <span className="text-3xl font-mono font-bold text-warning">{currentTier}</span>
            <span className="text-sm text-muted-foreground">/ {totalTiers}</span>
          </div>
          <span className="text-[9px] text-muted-foreground tracking-wider">CURRENT TIER</span>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-1.5 bg-surface-1 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-warning to-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Current/Next weapon */}
        <div className="glass-panel rounded px-3 py-1.5 flex items-center gap-2">
          <span className="text-xs font-bold text-foreground">{currentWeapon}</span>
          <ArrowUp className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs text-muted-foreground">{nextWeapon}</span>
        </div>
      </div>

      {/* LEFT SIDE - Leader info - positioned below chat safe zone */}
      <div className={cn("absolute left-2", HUD_LEFT_TOP_OFFSET)}>
        <div className="glass-panel rounded p-2">
          <h4 className="text-[10px] text-muted-foreground tracking-wider mb-1.5 flex items-center gap-1.5">
            <Crown className="w-3 h-3 text-warning" />
            LEADER
          </h4>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-foreground truncate max-w-[80px]">{leaderName}</span>
            <div className="flex items-center gap-0.5">
              <Zap className="w-3.5 h-3.5 text-warning" />
              <span className="text-xs font-mono font-bold text-warning">{leaderTier}</span>
            </div>
          </div>
          {currentTier < leaderTier && (
            <p className="text-[10px] text-muted-foreground mt-1">
              {leaderTier - currentTier} tiers behind
            </p>
          )}
        </div>
      </div>

      {/* TOP RIGHT - Kill Feed - strict edge */}
      <div className="absolute top-2 right-2 flex flex-col items-end gap-0.5 max-w-[240px]">
        {killfeed.slice(0, 5).map((entry) => (
          <div
            key={entry.id}
            className="glass-panel rounded px-2 py-1 flex items-center gap-1.5 text-xs animate-in slide-in-from-right-5"
          >
            <span className="font-medium text-warning truncate max-w-[60px]">{entry.killer}</span>
            <span className="text-muted-foreground text-[10px]">
              [{entry.weapon}]
              {entry.isHeadshot && <span className="text-warning ml-0.5">HS</span>}
            </span>
            <span className="font-medium text-foreground truncate max-w-[60px]">{entry.victim}</span>
            {entry.tierUp && (
              <span className="text-[10px] text-primary flex items-center gap-0.5">
                <ArrowUp className="w-2.5 h-2.5" />
                UP
              </span>
            )}
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
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 text-[9px] font-bold tracking-wider bg-warning/20 text-warning rounded">
                TIER {currentTier}
              </span>
              <span className="text-[10px] text-muted-foreground">{currentWeapon}</span>
            </div>
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
