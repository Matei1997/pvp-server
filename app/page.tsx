"use client"

import { useState } from "react"
import { Navigation, type NavTab } from "@/components/rage-arena/navigation"
import { PlayHub } from "@/components/rage-arena/play-hub"
import { CustomGamesPage } from "@/components/rage-arena/custom-games-page"
import { LoadoutPage } from "@/components/rage-arena/loadout-page"
import { ProfilePage } from "@/components/rage-arena/profile-page"
import { RankingPage } from "@/components/rage-arena/ranking-page"
import { ChallengesPage } from "@/components/rage-arena/challenges-page"
import { SeasonPage } from "@/components/rage-arena/season-page"
import { SettingsPage } from "@/components/rage-arena/settings-page"
import { AdminPanel } from "@/components/rage-arena/admin-panel"
import { PartyPanel } from "@/components/rage-arena/party-panel"
import { HopoutsHUD } from "@/components/rage-arena/hud/hopouts-hud"
import { FFAHUD } from "@/components/rage-arena/hud/ffa-hud"
import { GunGameHUD } from "@/components/rage-arena/hud/gungame-hud"
import { FreeRoamHUD } from "@/components/rage-arena/hud/freeroam-hud"
import { RoundScoreboard } from "@/components/rage-arena/hud/round-scoreboard"
import {
  RoundStartOverlay,
  RoundWonOverlay,
  RoundLostOverlay,
  MatchResultOverlay,
  QueueScreen,
  MatchFoundScreen,
  LoadingScreen,
} from "@/components/rage-arena/hud/round-overlays"
import { cn } from "@/lib/utils"

// Demo mode for showcasing UI states
type DemoMode = 
  | "menu" 
  | "hud-hopouts" 
  | "hud-ffa" 
  | "hud-gungame" 
  | "hud-freeroam"
  | "overlay-round-start"
  | "overlay-round-won"
  | "overlay-round-lost"
  | "overlay-match-result"
  | "overlay-queue"
  | "overlay-match-found"
  | "overlay-loading"
  | "scoreboard"

export default function RageArenaPage() {
  const [activeTab, setActiveTab] = useState<NavTab>("play")
  const [demoMode, setDemoMode] = useState<DemoMode>("menu")
  const [showScoreboard, setShowScoreboard] = useState(false)

  // Mock data for demos
  const mockTeammates = [
    { id: "1", name: "TeamMate_01", health: 85, armor: 50, isAlive: true },
    { id: "2", name: "FragMaster", health: 100, armor: 100, isAlive: true, isSpeaking: true },
    { id: "3", name: "SniperElite", health: 0, armor: 0, isAlive: false },
  ]

  const mockKillfeed = [
    { id: "1", killer: "YOU", killerTeam: "blue" as const, victim: "EnemyPlayer", victimTeam: "red" as const, weapon: "AK47", isHeadshot: true, timestamp: Date.now() },
    { id: "2", killer: "RedTeam_02", killerTeam: "red" as const, victim: "SniperElite", victimTeam: "blue" as const, weapon: "SNIPER", timestamp: Date.now() - 5000 },
    { id: "3", killer: "FragMaster", killerTeam: "blue" as const, victim: "RedTeam_01", victimTeam: "red" as const, weapon: "SMG", timestamp: Date.now() - 10000 },
  ]

  const mockRedTeam = [
    { id: "r1", name: "RedLeader", kills: 8, deaths: 3, damage: 1240, headshotPercent: 45, rankBadge: "diamond" },
    { id: "r2", name: "RedTeam_02", kills: 5, deaths: 4, damage: 890, headshotPercent: 30 },
    { id: "r3", name: "RedTeam_03", kills: 3, deaths: 5, damage: 650, headshotPercent: 25 },
  ]

  const mockBlueTeam = [
    { id: "b1", name: "YOU", kills: 12, deaths: 2, damage: 1890, headshotPercent: 58, rankBadge: "diamond", isPlayer: true },
    { id: "b2", name: "FragMaster", kills: 7, deaths: 3, damage: 1120, headshotPercent: 40, rankBadge: "platinum" },
    { id: "b3", name: "SniperElite", kills: 4, deaths: 5, damage: 780, headshotPercent: 65 },
  ]

  const mockFFALeaderboard = [
    { name: "YOU", score: 12, isPlayer: true },
    { name: "ProPlayer", score: 11 },
    { name: "Sniper_X", score: 9 },
    { name: "NoobSlayer", score: 8 },
    { name: "RandomGuy", score: 6 },
  ]

  const renderContent = () => {
    // If in a HUD/overlay demo mode, show that instead
    if (demoMode !== "menu") {
      return (
        <div className="h-full flex items-center justify-center relative">
          {/* Demo scene background */}
          <div className="absolute inset-0 hex-pattern opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50" />

          {/* HUD overlays based on demo mode */}
          {demoMode === "hud-hopouts" && (
            <HopoutsHUD
              teammates={mockTeammates}
              killfeed={mockKillfeed}
            />
          )}
          {demoMode === "hud-ffa" && (
            <FFAHUD
              killfeed={mockKillfeed.map(k => ({ ...k, killer: k.killer, victim: k.victim, weapon: k.weapon, id: k.id, isHeadshot: k.isHeadshot, timestamp: k.timestamp }))}
              leaderboard={mockFFALeaderboard}
            />
          )}
          {demoMode === "hud-gungame" && <GunGameHUD />}
          {demoMode === "hud-freeroam" && <FreeRoamHUD />}
          {demoMode === "overlay-round-start" && <RoundStartOverlay roundNumber={3} totalRounds={5} />}
          {demoMode === "overlay-round-won" && <RoundWonOverlay isClutch />}
          {demoMode === "overlay-round-lost" && <RoundLostOverlay />}
          {demoMode === "overlay-match-result" && (
            <MatchResultOverlay
              won
              redScore={2}
              blueScore={3}
              playerTeam="blue"
              mvpName="YOU"
              mvpKills={12}
            />
          )}
          {demoMode === "overlay-queue" && (
            <QueueScreen mode="hopouts" teamSize="3v3" queueTime={45} playersInQueue={127} />
          )}
          {demoMode === "overlay-match-found" && <MatchFoundScreen />}
          {demoMode === "overlay-loading" && <LoadingScreen mapName="INDUSTRIAL ZONE" />}
          {demoMode === "scoreboard" && (
            <HopoutsHUD teammates={mockTeammates} killfeed={mockKillfeed} />
          )}

          {showScoreboard && (
            <RoundScoreboard
              redTeam={mockRedTeam}
              blueTeam={mockBlueTeam}
              redScore={2}
              blueScore={2}
              roundNumber={5}
              totalRounds={5}
              isOpen={showScoreboard}
              onClose={() => setShowScoreboard(false)}
            />
          )}

          {/* Demo controls floating panel */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
            <div className="bg-[#111922] border border-[rgba(255,255,255,0.05)] rounded-md p-3 flex items-center gap-3">
              <span className="text-xs text-muted-foreground mr-2">DEMO:</span>
              <button
                onClick={() => setDemoMode("menu")}
                className="px-4 py-2 text-xs font-bold rounded-md bg-[#00e0c6]/10 text-[#00e0c6] hover:bg-[#00e0c6]/20 transition-colors"
              >
                Back to Menu
              </button>
              {demoMode.startsWith("hud") && (
                <button
                  onClick={() => setShowScoreboard(!showScoreboard)}
                  className="px-4 py-2 text-xs font-bold rounded-md bg-[#1a2332] text-foreground hover:bg-[#232d3f] transition-colors"
                >
                  Toggle Scoreboard (TAB)
                </button>
              )}
            </div>
          </div>
        </div>
      )
    }

    // Regular menu content
    switch (activeTab) {
      case "play":
        return <PlayHub />
      case "custom":
        return <CustomGamesPage />
      case "loadout":
        return <LoadoutPage />
      case "profile":
        return <ProfilePage />
      case "ranking":
        return <RankingPage />
      case "challenges":
        return <ChallengesPage />
      case "season":
        return <SeasonPage />
      case "settings":
        return <SettingsPage />
      case "admin":
        return <AdminPanel />
      default:
        return <PlayHub />
    }
  }

  // Check if party panel should be shown on this tab
  const showPartyPanel = demoMode === "menu" && ["play", "custom", "loadout"].includes(activeTab)

  return (
    <main className="h-screen flex flex-col bg-[#0a0f16] overflow-hidden">
      {/* Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        adminLevel={3}
        playerName="GHOST_001"
        playerRank="Diamond II"
      />

      {/* Main Content with Party Panel */}
      <div className="flex-1 pt-12 overflow-hidden flex">
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
        
        {/* Party Panel - visible on Play, Custom, Loadout */}
        {showPartyPanel && <PartyPanel />}
      </div>
    </main>
  )
}


