"use client"

import { cn } from "@/lib/utils"
import { Trophy, Skull, Star, ChevronUp, ChevronDown } from "lucide-react"

// Round Start Overlay
export function RoundStartOverlay({
  roundNumber,
  totalRounds,
}: {
  roundNumber: number
  totalRounds: number
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="text-center">
        <p className="text-lg text-muted-foreground tracking-widest mb-2">ROUND</p>
        <h1 className="text-8xl font-black text-primary text-glow-cyan">{roundNumber}</h1>
        <p className="text-lg text-muted-foreground mt-2">OF {totalRounds}</p>
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: totalRounds }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-3 h-3 rounded-full",
                i + 1 === roundNumber ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Round Won Overlay
export function RoundWonOverlay({ isClutch = false }: { isClutch?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-success/10 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="text-center">
        {isClutch && (
          <div className="flex items-center justify-center gap-2 mb-4 animate-in zoom-in duration-500">
            <Star className="w-8 h-8 text-warning" />
            <span className="text-2xl font-bold text-warning tracking-wider">CLUTCH!</span>
            <Star className="w-8 h-8 text-warning" />
          </div>
        )}
        <div className="flex items-center justify-center gap-4">
          <ChevronUp className="w-12 h-12 text-success animate-bounce" />
          <h1 className="text-6xl font-black text-success">ROUND WON</h1>
          <ChevronUp className="w-12 h-12 text-success animate-bounce" />
        </div>
        <p className="text-lg text-success/70 mt-4 tracking-wider">EXCELLENT WORK, TEAM</p>
      </div>
    </div>
  )
}

// Round Lost Overlay
export function RoundLostOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-destructive/10 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="text-center">
        <div className="flex items-center justify-center gap-4">
          <ChevronDown className="w-12 h-12 text-destructive" />
          <h1 className="text-6xl font-black text-destructive">ROUND LOST</h1>
          <ChevronDown className="w-12 h-12 text-destructive" />
        </div>
        <p className="text-lg text-destructive/70 mt-4 tracking-wider">REGROUP AND TRY AGAIN</p>
      </div>
    </div>
  )
}

// Match Result Overlay
export function MatchResultOverlay({
  won,
  redScore,
  blueScore,
  playerTeam,
  mvpName,
  mvpKills,
}: {
  won: boolean
  redScore: number
  blueScore: number
  playerTeam: "red" | "blue"
  mvpName: string
  mvpKills: number
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md animate-in fade-in duration-500">
      <div className="text-center max-w-2xl w-full px-6">
        {/* Result */}
        <div className="mb-8">
          {won ? (
            <div className="flex items-center justify-center gap-4">
              <Trophy className="w-16 h-16 text-warning animate-bounce" />
              <h1 className="text-7xl font-black text-success">VICTORY</h1>
              <Trophy className="w-16 h-16 text-warning animate-bounce" />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4">
              <Skull className="w-16 h-16 text-destructive" />
              <h1 className="text-7xl font-black text-destructive">DEFEAT</h1>
              <Skull className="w-16 h-16 text-destructive" />
            </div>
          )}
        </div>

        {/* Final Score */}
        <div className="glass-panel rounded-xl p-6 mb-8">
          <p className="text-sm text-muted-foreground tracking-wider mb-4">FINAL SCORE</p>
          <div className="flex items-center justify-center gap-8">
            <div className={cn(
              "text-center",
              playerTeam === "red" && "ring-2 ring-team-red rounded-lg p-4"
            )}>
              <p className="text-sm text-team-red mb-1">RED TEAM</p>
              <p className="text-5xl font-black text-team-red">{redScore}</p>
            </div>
            <span className="text-3xl text-muted-foreground">-</span>
            <div className={cn(
              "text-center",
              playerTeam === "blue" && "ring-2 ring-team-blue rounded-lg p-4"
            )}>
              <p className="text-sm text-team-blue mb-1">BLUE TEAM</p>
              <p className="text-5xl font-black text-team-blue">{blueScore}</p>
            </div>
          </div>
        </div>

        {/* MVP */}
        <div className="glass-panel rounded-lg p-4 inline-block">
          <div className="flex items-center gap-3">
            <Star className="w-6 h-6 text-warning" />
            <div className="text-left">
              <p className="text-xs text-muted-foreground tracking-wider">MATCH MVP</p>
              <p className="text-lg font-bold text-foreground">{mvpName}</p>
            </div>
            <div className="text-right ml-4">
              <p className="text-2xl font-bold text-warning">{mvpKills}</p>
              <p className="text-xs text-muted-foreground">KILLS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Queue Screen
export function QueueScreen({
  mode,
  teamSize,
  queueTime,
  playersInQueue,
}: {
  mode: string
  teamSize?: string
  queueTime: number
  playersInQueue: number
}) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md">
      <div className="text-center max-w-md w-full px-6">
        <div className="relative mb-8">
          {/* Spinning ring */}
          <div className="w-32 h-32 mx-auto rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-mono font-bold text-primary">{formatTime(queueTime)}</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-2">SEARCHING FOR MATCH</h2>
        <p className="text-muted-foreground mb-6">
          {mode.toUpperCase()} {teamSize && `• ${teamSize}`}
        </p>

        <div className="glass-panel rounded-lg p-4 inline-block">
          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-bold">{playersInQueue}</span> players in queue
          </p>
        </div>
      </div>
    </div>
  )
}

// Match Found Screen
export function MatchFoundScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md animate-in zoom-in duration-300">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center glow-cyan">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
            <span className="text-3xl text-primary-foreground font-bold">!</span>
          </div>
        </div>
        <h1 className="text-5xl font-black text-primary text-glow-cyan mb-4">MATCH FOUND</h1>
        <p className="text-lg text-muted-foreground">Preparing arena...</p>
      </div>
    </div>
  )
}

// Loading Screen
export function LoadingScreen({ mapName = "INDUSTRIAL ZONE" }: { mapName?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      {/* Background pattern */}
      <div className="absolute inset-0 hex-pattern opacity-50" />
      
      <div className="relative z-10 text-center max-w-lg w-full px-6">
        <h2 className="text-3xl font-bold text-foreground mb-2">LOADING</h2>
        <p className="text-lg text-primary mb-8">{mapName}</p>
        
        {/* Progress bar */}
        <div className="w-full h-2 bg-surface-1 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-gradient-to-r from-primary via-cyan to-primary animate-pulse w-3/4" />
        </div>
        
        <p className="text-sm text-muted-foreground">Preparing arena assets...</p>
      </div>
    </div>
  )
}
