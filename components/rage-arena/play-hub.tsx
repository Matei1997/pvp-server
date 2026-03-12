"use client"

import { useState, useEffect } from "react"
import { ModeCard, type GameMode } from "./mode-card"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export type TeamSize = "2v2" | "3v3" | "4v4" | "5v5"

interface PlayHubProps {
  onStartQueue?: (mode: GameMode, teamSize?: TeamSize) => void
  onEnterFreeroam?: () => void
}

export function PlayHub({ onStartQueue, onEnterFreeroam }: PlayHubProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null)
  const [selectedTeamSize, setSelectedTeamSize] = useState<TeamSize | null>(null)
  const [isQueuing, setIsQueuing] = useState(false)
  const [queueTime, setQueueTime] = useState(0)

  // Queue timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isQueuing) {
      interval = setInterval(() => {
        setQueueTime((t) => t + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isQueuing])

  const handleModeSelect = (mode: GameMode) => {
    if (selectedMode === mode) {
      setSelectedMode(null)
      setSelectedTeamSize(null)
      setIsQueuing(false)
      setQueueTime(0)
      return
    }
    
    setSelectedMode(mode)
    setSelectedTeamSize(null)
    setIsQueuing(false)
    setQueueTime(0)
  }

  const handlePlay = () => {
    if (isQueuing) {
      setIsQueuing(false)
      setQueueTime(0)
      return
    }

    if (selectedMode === "freeroam") {
      onEnterFreeroam?.()
      return
    }

    if (selectedMode === "hopouts" && selectedTeamSize) {
      setIsQueuing(true)
      onStartQueue?.(selectedMode, selectedTeamSize)
    } else if (selectedMode && selectedMode !== "hopouts") {
      setIsQueuing(true)
      onStartQueue?.(selectedMode)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const canPlay = selectedMode && (selectedMode !== "hopouts" || selectedTeamSize)

  return (
    <div className="h-full flex flex-col bg-[#0a0f16]">
      {/* Content Area */}
      <div className="flex-1 p-4 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-black tracking-wider text-foreground">
              SELECT <span className="text-[#00e0c6]">MODE</span>
            </h1>
            <p className="text-[11px] text-muted-foreground">Choose your battleground</p>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-[#111922] border border-[rgba(255,255,255,0.05)] px-3 py-1.5 rounded-md">
            <div className="w-2 h-2 rounded-full bg-[#2ecc71] animate-pulse" />
            <span>494 players online</span>
          </div>
        </div>

        {/* Mode Cards Grid - Structured layout with 16px gaps */}
        <div className="grid grid-rows-[1.5fr_1fr_1fr] gap-4 flex-1 min-h-0">
          {/* Row 1: Hopouts (large) + Deathmatch */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-7">
              <ModeCard
                mode="hopouts"
                size="large"
                isSelected={selectedMode === "hopouts"}
                playersOnline={127}
                onClick={() => handleModeSelect("hopouts")}
              />
            </div>
            <div className="col-span-5">
              <ModeCard
                mode="ffa"
                size="large"
                isSelected={selectedMode === "ffa"}
                playersOnline={84}
                onClick={() => handleModeSelect("ffa")}
              />
            </div>
          </div>

          {/* Row 2: Gun Game */}
          <div>
            <ModeCard
              mode="gungame"
              size="medium"
              isSelected={selectedMode === "gungame"}
              playersOnline={52}
              onClick={() => handleModeSelect("gungame")}
            />
          </div>

          {/* Row 3: FreeRoam */}
          <div>
            <ModeCard
              mode="freeroam"
              size="medium"
              isSelected={selectedMode === "freeroam"}
              playersOnline={231}
              onClick={() => handleModeSelect("freeroam")}
            />
          </div>
        </div>
      </div>

      {/* Action Bar - Fixed at bottom */}
      <div className="bg-[#111922] border-t border-[rgba(255,255,255,0.05)]">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left - Mode info */}
            <div className="flex-1">
              {selectedMode ? (
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Selected mode</span>
                  <h4 className="text-sm font-black text-[#00e0c6] tracking-wider">
                    {selectedMode.toUpperCase()}
                  </h4>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Select a game mode to continue</span>
              )}
            </div>

            {/* Center - Team Size (for Hopouts) */}
            {selectedMode === "hopouts" && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Team Size:</span>
                {(["2v2", "3v3", "4v4", "5v5"] as TeamSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedTeamSize(size)}
                    disabled={isQueuing}
                    className={cn(
                      "px-3 py-1.5 rounded-md font-bold text-xs transition-all border",
                      selectedTeamSize === size
                        ? "bg-[#00e0c6]/10 border-[#00e0c6] text-[#00e0c6]"
                        : "bg-[#111922] border-[rgba(255,255,255,0.05)] text-foreground hover:border-[rgba(255,255,255,0.1)]",
                      isQueuing && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}

            {/* Right - Play Button */}
            <Button
              onClick={handlePlay}
              disabled={!canPlay}
              className={cn(
                "h-10 px-8 text-xs font-bold tracking-wider rounded-md transition-all",
                isQueuing
                  ? "bg-[#e74c3c]/20 text-[#e74c3c] border border-[#e74c3c]/30 hover:bg-[#e74c3c]/30"
                  : "bg-[#00e0c6] text-[#0a0f16] hover:bg-[#00e0c6]/90 disabled:opacity-40 disabled:bg-[#1a2332] disabled:text-muted-foreground"
              )}
              style={!isQueuing && canPlay ? { boxShadow: '0 0 18px rgba(0, 224, 198, 0.3)' } : undefined}
            >
              {isQueuing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>SEARCHING {formatTime(queueTime)}</span>
                </div>
              ) : selectedMode === "freeroam" ? (
                "ENTER FREEROAM"
              ) : (
                "FIND MATCH"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
