"use client"

import { cn } from "@/lib/utils"
import { Users, Skull, Zap, Map } from "lucide-react"

export type GameMode = "hopouts" | "ffa" | "gungame" | "freeroam"

interface ModeCardProps {
  mode: GameMode
  isSelected?: boolean
  onClick?: () => void
  playersOnline?: number
  size?: "large" | "medium" | "small"
}

const modeConfig: Record<GameMode, {
  title: string
  subtitle: string
  description: string
  icon: React.ElementType
  accentColor: string
  glowColor: string
}> = {
  hopouts: {
    title: "HOPOUTS",
    subtitle: "TACTICAL TEAM COMBAT",
    description: "Round-based team elimination. Coordinate with your squad to dominate.",
    icon: Users,
    accentColor: "text-[#00e0c6]",
    glowColor: "rgba(0, 224, 198, 0.1)",
  },
  ffa: {
    title: "DEATHMATCH",
    subtitle: "FREE FOR ALL",
    description: "Every player for themselves. Get the most kills to win.",
    icon: Skull,
    accentColor: "text-[#e74c3c]",
    glowColor: "rgba(231, 76, 60, 0.1)",
  },
  gungame: {
    title: "GUN GAME",
    subtitle: "WEAPON PROGRESSION",
    description: "Climb weapon tiers with each kill. First to finish wins.",
    icon: Zap,
    accentColor: "text-[#f39c12]",
    glowColor: "rgba(243, 156, 18, 0.1)",
  },
  freeroam: {
    title: "FREEROAM",
    subtitle: "SANDBOX MODE",
    description: "Spawn weapons, vehicles, and explore freely.",
    icon: Map,
    accentColor: "text-[#2ecc71]",
    glowColor: "rgba(46, 204, 113, 0.1)",
  },
}

export function ModeCard({
  mode,
  isSelected = false,
  onClick,
  playersOnline = 0,
  size = "medium",
}: ModeCardProps) {
  const config = modeConfig[mode]
  const Icon = config.icon

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative group w-full h-full text-left overflow-hidden transition-all duration-200",
        "rounded-md",
        "bg-[#111922]",
        isSelected 
          ? "border border-[#00e0c6]" 
          : "border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)]",
      )}
      style={{
        boxShadow: isSelected ? '0 0 18px rgba(0, 224, 198, 0.1)' : 'none',
      }}
    >
      {/* Content */}
      <div className="relative h-full flex flex-col p-4">
        {/* Top row: Icon + Player count */}
        <div className="flex items-start justify-between mb-3">
          <div className={cn(
            "w-10 h-10 rounded-md flex items-center justify-center",
            "bg-[#0a0f16] border border-[rgba(255,255,255,0.05)]"
          )}>
            <Icon className={cn("w-5 h-5", config.accentColor)} />
          </div>
          
          {/* Player count badge */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#0a0f16] border border-[rgba(255,255,255,0.05)]">
            <div className="w-2 h-2 rounded-full bg-[#2ecc71] animate-pulse" />
            <span className="text-[11px] font-medium text-white/80">{playersOnline}</span>
          </div>
        </div>

        {/* Title and subtitle */}
        <div className="flex-1">
          <h3 className={cn(
            "text-lg font-black tracking-wider mb-0.5",
            isSelected ? "text-white" : "text-white/90"
          )}>
            {config.title}
          </h3>
          <p className="text-[10px] text-muted-foreground tracking-wider uppercase mb-2">
            {config.subtitle}
          </p>
          
          {/* Description - show on large cards */}
          {size === "large" && (
            <p className="text-[11px] text-white/50 leading-relaxed">
              {config.description}
            </p>
          )}
        </div>

        {/* Select button */}
        <div className={cn(
          "mt-auto px-4 py-2 rounded-md text-[11px] font-bold tracking-wider text-center transition-all duration-200",
          "border",
          isSelected
            ? "bg-[#00e0c6]/10 border-[#00e0c6]/40 text-[#00e0c6]"
            : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)] text-white/60 group-hover:bg-[rgba(255,255,255,0.06)] group-hover:text-white/80"
        )}>
          {isSelected ? "SELECTED" : "SELECT MODE"}
        </div>
      </div>

      {/* Hover glow effect */}
      {!isSelected && (
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-md"
          style={{ boxShadow: `0 0 18px ${config.glowColor}` }}
        />
      )}
    </button>
  )
}
