"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Plus,
  Search,
  Users,
  Lock,
  Play,
  RefreshCw,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type GameMode = "hopouts" | "ffa" | "gungame"

interface Lobby {
  id: string
  host: string
  mode: GameMode
  map: string
  players: number
  maxPlayers: number
  isPrivate: boolean
}

const MOCK_LOBBIES: Lobby[] = [
  { id: "1", host: "ProGamer_01", mode: "hopouts", map: "Industrial Zone", players: 6, maxPlayers: 8, isPrivate: false },
  { id: "2", host: "FragMaster", mode: "ffa", map: "Downtown", players: 8, maxPlayers: 12, isPrivate: false },
  { id: "3", host: "TeamLeader", mode: "hopouts", map: "Harbor District", players: 4, maxPlayers: 8, isPrivate: true },
  { id: "4", host: "GunGameKing", mode: "gungame", map: "Warehouse", players: 10, maxPlayers: 16, isPrivate: false },
  { id: "5", host: "xShadowX", mode: "ffa", map: "Industrial Zone", players: 5, maxPlayers: 12, isPrivate: false },
  { id: "6", host: "NightWolf", mode: "hopouts", map: "Downtown", players: 7, maxPlayers: 8, isPrivate: false },
]

const modeLabels: Record<GameMode, string> = {
  hopouts: "Hopouts",
  ffa: "Deathmatch",
  gungame: "Gun Game",
}

const modeColors: Record<GameMode, string> = {
  hopouts: "text-[#00e0c6]",
  ffa: "text-[#e74c3c]",
  gungame: "text-[#f39c12]",
}

export function CustomGamesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)

  const filteredLobbies = MOCK_LOBBIES.filter(
    (lobby) =>
      lobby.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lobby.map.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-full flex flex-col bg-[#0a0f16] p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-black tracking-wider text-foreground">
            CUSTOM <span className="text-[#00e0c6]">GAMES</span>
          </h1>
          <p className="text-[11px] text-muted-foreground">Browse and join custom lobbies</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search lobbies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10 h-9 bg-[#111922] border-[rgba(255,255,255,0.05)] rounded-md text-sm"
            />
          </div>

          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3 rounded-md bg-[#111922] border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)]"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>

          {/* Create Game */}
          <Button
            onClick={() => setShowCreateModal(true)}
            className="h-9 px-4 bg-[#00e0c6] text-[#0a0f16] hover:bg-[#00e0c6]/90 font-bold text-xs tracking-wider rounded-md"
            style={{ boxShadow: '0 0 18px rgba(0, 224, 198, 0.3)' }}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            CREATE GAME
          </Button>
        </div>
      </div>

      {/* Lobbies Table */}
      <div className="flex-1 bg-[#111922] border border-[rgba(255,255,255,0.05)] rounded-md overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-2.5 bg-[#0a0f16] border-b border-[rgba(255,255,255,0.05)] text-[10px] font-bold text-muted-foreground tracking-wider">
          <div className="col-span-3">HOST</div>
          <div className="col-span-2">MODE</div>
          <div className="col-span-3">MAP</div>
          <div className="col-span-2">PLAYERS</div>
          <div className="col-span-2 text-right">ACTION</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-[rgba(255,255,255,0.05)]">
          {filteredLobbies.map((lobby) => (
            <div
              key={lobby.id}
              className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-[rgba(255,255,255,0.02)] transition-colors"
            >
              {/* Host */}
              <div className="col-span-3 flex items-center gap-2">
                {lobby.isPrivate && <Lock className="w-3.5 h-3.5 text-[#f39c12]" />}
                <span className="text-sm font-medium text-foreground">{lobby.host}</span>
              </div>

              {/* Mode */}
              <div className="col-span-2">
                <span className={cn("text-xs font-medium", modeColors[lobby.mode])}>
                  {modeLabels[lobby.mode]}
                </span>
              </div>

              {/* Map */}
              <div className="col-span-3">
                <span className="text-xs text-muted-foreground">{lobby.map}</span>
              </div>

              {/* Players */}
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-foreground">
                    {lobby.players}/{lobby.maxPlayers}
                  </span>
                </div>
              </div>

              {/* Action */}
              <div className="col-span-2 text-right">
                <Button
                  size="sm"
                  className="h-7 px-3 bg-[#00e0c6]/10 text-[#00e0c6] border border-[#00e0c6]/30 hover:bg-[#00e0c6]/20 text-[10px] font-bold tracking-wider rounded-md"
                >
                  <Play className="w-3 h-3 mr-1" />
                  JOIN
                </Button>
              </div>
            </div>
          ))}

          {filteredLobbies.length === 0 && (
            <div className="px-4 py-12 text-center text-muted-foreground">
              <Users className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No lobbies found</p>
              <p className="text-xs mt-1">Try a different search or create your own game</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Game Modal */}
      {showCreateModal && (
        <CreateGameModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  )
}

// Create Game Modal Component
function CreateGameModal({ onClose }: { onClose: () => void }) {
  const [selectedMode, setSelectedMode] = useState<GameMode>("hopouts")
  const [selectedMap, setSelectedMap] = useState("industrial")
  const [maxPlayers, setMaxPlayers] = useState(8)
  const [isPrivate, setIsPrivate] = useState(false)

  const maps = [
    { id: "industrial", name: "Industrial Zone" },
    { id: "downtown", name: "Downtown" },
    { id: "harbor", name: "Harbor District" },
    { id: "warehouse", name: "Warehouse" },
  ]

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-full max-w-md bg-[#111922] border border-[rgba(255,255,255,0.05)] rounded-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0a0f16] border-b border-[rgba(255,255,255,0.05)]">
          <h3 className="text-sm font-bold text-foreground tracking-wider">CREATE GAME</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-[#1a2332] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Game Mode */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground tracking-wider mb-2 block">
              GAME MODE
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["hopouts", "ffa", "gungame"] as GameMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={cn(
                    "px-3 py-2 rounded-md text-[10px] font-bold tracking-wider transition-all border",
                    selectedMode === mode
                      ? "bg-[#00e0c6]/10 border-[#00e0c6] text-[#00e0c6]"
                      : "bg-[#0a0f16] border-[rgba(255,255,255,0.05)] text-muted-foreground hover:text-foreground hover:border-[rgba(255,255,255,0.1)]"
                  )}
                >
                  {modeLabels[mode].toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Map Selection */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground tracking-wider mb-2 block">
              MAP
            </label>
            <div className="grid grid-cols-2 gap-2">
              {maps.map((map) => (
                <button
                  key={map.id}
                  onClick={() => setSelectedMap(map.id)}
                  className={cn(
                    "px-3 py-2 rounded-md text-xs font-medium transition-all border text-left",
                    selectedMap === map.id
                      ? "bg-[#00e0c6]/10 border-[#00e0c6] text-foreground"
                      : "bg-[#0a0f16] border-[rgba(255,255,255,0.05)] text-muted-foreground hover:text-foreground hover:border-[rgba(255,255,255,0.1)]"
                  )}
                >
                  {map.name}
                </button>
              ))}
            </div>
          </div>

          {/* Max Players */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground tracking-wider mb-2 block">
              MAX PLAYERS: {maxPlayers}
            </label>
            <input
              type="range"
              min={2}
              max={16}
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
              className="w-full h-2 bg-[#0a0f16] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00e0c6]"
            />
          </div>

          {/* Private Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Private Lobby</p>
              <p className="text-xs text-muted-foreground">Require password to join</p>
            </div>
            <button
              onClick={() => setIsPrivate(!isPrivate)}
              className={cn(
                "w-10 h-6 rounded-full transition-colors relative",
                isPrivate ? "bg-[#00e0c6]" : "bg-[#0a0f16] border border-[rgba(255,255,255,0.05)]"
              )}
            >
              <div
                className={cn(
                  "w-4 h-4 rounded-full bg-white absolute top-1 transition-transform",
                  isPrivate ? "translate-x-5" : "translate-x-1"
                )}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-4 py-3 bg-[#0a0f16] border-t border-[rgba(255,255,255,0.05)]">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-9 rounded-md bg-[#1a2332] border-[rgba(255,255,255,0.05)] text-sm hover:border-[rgba(255,255,255,0.1)]"
          >
            CANCEL
          </Button>
          <Button
            onClick={onClose}
            className="flex-1 h-9 bg-[#00e0c6] text-[#0a0f16] hover:bg-[#00e0c6]/90 font-bold text-sm tracking-wider rounded-md"
          >
            CREATE LOBBY
          </Button>
        </div>
      </div>
    </div>
  )
}
