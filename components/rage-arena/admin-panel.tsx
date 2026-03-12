"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Shield,
  Users,
  Car,
  User,
  Crosshair,
  MessageSquare,
  HelpCircle,
  Power,
  Megaphone,
  Tag,
  Heart,
  UserX,
  Trash2,
  Eye,
  Search,
  Ban,
  AlertTriangle,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

type AdminTab = "admin" | "players" | "vehicle" | "personal" | "weapon" | "admin-chat" | "support"

const tabs: { id: AdminTab; label: string; icon: React.ElementType }[] = [
  { id: "admin", label: "ADMIN", icon: Shield },
  { id: "players", label: "PLAYERS", icon: Users },
  { id: "vehicle", label: "VEHICLE", icon: Car },
  { id: "personal", label: "PERSONAL", icon: User },
  { id: "weapon", label: "WEAPON", icon: Crosshair },
  { id: "admin-chat", label: "ADMIN CHAT", icon: MessageSquare },
  { id: "support", label: "SUPPORT", icon: HelpCircle },
]

interface AdminAction {
  id: string
  label: string
  description: string
  icon: React.ElementType
  buttonLabel?: string
  hasToggle?: boolean
  isActive?: boolean
}

// Organized by section as requested
const serverActions: AdminAction[] = [
  { id: "duty", label: "Duty Mode", description: "Toggle your admin duty mode", icon: Power, hasToggle: true, isActive: false },
  { id: "announce", label: "Announcement", description: "Send message to all players", icon: Megaphone, buttonLabel: "Send" },
  { id: "tag", label: "Admin Tag", description: "Toggle admin tag visibility", icon: Tag, buttonLabel: "Toggle" },
]

const playerControlActions: AdminAction[] = [
  { id: "revive", label: "Revive All", description: "Revive all dead players", icon: Heart, buttonLabel: "Revive" },
  { id: "kick-all", label: "Kick All", description: "Kick all non-admin players", icon: UserX, buttonLabel: "Kick" },
  { id: "see-ids", label: "Show Player IDs", description: "Toggle player ID display", icon: Eye, buttonLabel: "Toggle" },
]

const worldControlActions: AdminAction[] = [
  { id: "delete-cars", label: "Delete Vehicles", description: "Remove all spawned vehicles", icon: Car, buttonLabel: "Delete" },
  { id: "delete-objects", label: "Delete Objects", description: "Remove all spawned objects", icon: Trash2, buttonLabel: "Delete" },
  { id: "delete-peds", label: "Delete Peds", description: "Remove all spawned NPCs", icon: Users, buttonLabel: "Delete" },
]

interface OnlinePlayer {
  id: string
  name: string
  rank: string
  ping: number
  status: "playing" | "lobby" | "afk"
  mode?: string
}

const mockPlayers: OnlinePlayer[] = [
  { id: "1", name: "GHOST_001", rank: "Diamond II", ping: 32, status: "playing", mode: "Hopouts" },
  { id: "2", name: "FragMaster", rank: "Platinum I", ping: 45, status: "playing", mode: "FFA" },
  { id: "3", name: "SniperElite", rank: "Gold III", ping: 78, status: "lobby" },
  { id: "4", name: "NoobSlayer", rank: "Silver II", ping: 120, status: "afk" },
  { id: "5", name: "ProPlayer_X", rank: "Diamond I", ping: 28, status: "playing", mode: "Gun Game" },
]

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>("admin")
  const [searchQuery, setSearchQuery] = useState("")
  const [dutyActive, setDutyActive] = useState(false)

  const filteredPlayers = mockPlayers.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-full flex flex-col bg-[#0a0f16] p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-black tracking-wider text-foreground">
            ADMIN <span className="text-[#2ecc71]">PANEL</span>
          </h1>
          <p className="text-[11px] text-muted-foreground">Server management tools</p>
        </div>
        
        {/* Tabs */}
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wider transition-all flex items-center gap-1.5 border",
                  isActive
                    ? "bg-[#2ecc71]/10 text-[#2ecc71] border-[#2ecc71]/30"
                    : "bg-[#111922] border-[rgba(255,255,255,0.05)] text-muted-foreground hover:text-foreground hover:border-[rgba(255,255,255,0.1)]"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Admin Tab Content */}
        {activeTab === "admin" && (
          <>
            {/* Left - Personal Statistics */}
            <div className="w-56 flex-shrink-0">
              <div className="bg-[#111922] border border-[rgba(255,255,255,0.05)] rounded-md p-4 h-full">
                <h3 className="text-xs font-bold text-foreground tracking-wider mb-1">Personal Statistics</h3>
                <p className="text-[10px] text-muted-foreground mb-4">Your admin profile</p>

                {/* Admin Avatar */}
                <div className="flex items-center gap-3 mb-4 p-3 bg-[#0a0f16] rounded-md border border-[rgba(255,255,255,0.05)]">
                  <div className="w-10 h-10 rounded-md bg-[#1a2332] flex items-center justify-center border border-[rgba(255,255,255,0.05)]">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">GHOST_001</p>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-[#2ecc71] text-[#0a0f16] rounded">Admin L3</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Gender", value: "Male" },
                    { label: "Birth", value: "2024-07-02" },
                    { label: "Rank", value: "Officer" },
                    { label: "Org", value: "Law Enf..." },
                    { label: "Money", value: "$5,261" },
                    { label: "ID", value: "3" },
                  ].map((stat, i) => (
                    <div key={i} className="p-2 bg-[#0a0f16] rounded-md border border-[rgba(255,255,255,0.05)]">
                      <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                      <p className="text-xs font-bold text-foreground truncate">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right - Admin Actions organized by section */}
            <div className="flex-1">
              <ScrollArea className="h-full">
                <div className="space-y-4 pr-4">
                  {/* SERVER Section */}
                  <div className="bg-[#111922] border border-[rgba(255,255,255,0.05)] rounded-md p-4">
                    <h3 className="text-xs font-bold text-[#2ecc71] tracking-wider mb-3">SERVER</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {serverActions.map((action) => {
                        const Icon = action.icon
                        return (
                          <div key={action.id} className="bg-[#0a0f16] border border-[rgba(255,255,255,0.05)] rounded-md p-3 flex flex-col">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="text-xs font-bold text-foreground">{action.label}</h4>
                                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{action.description}</p>
                              </div>
                              <div className="w-8 h-8 rounded-md bg-[#1a2332] flex items-center justify-center border border-[rgba(255,255,255,0.05)]">
                                <Icon className="w-4 h-4 text-[#2ecc71]" />
                              </div>
                            </div>
                            {action.hasToggle ? (
                              <div className="flex items-center gap-2 mt-auto">
                                <button
                                  onClick={() => setDutyActive(!dutyActive)}
                                  className={cn(
                                    "flex-1 px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wider transition-all",
                                    dutyActive
                                      ? "bg-[#2ecc71] text-[#0a0f16]"
                                      : "bg-[#1a2332] border border-[rgba(255,255,255,0.05)] text-muted-foreground"
                                  )}
                                >
                                  Turn {dutyActive ? "Off" : "On"}
                                </button>
                                <div className={cn("w-3 h-3 rounded-full", dutyActive ? "bg-[#2ecc71]" : "bg-[#e74c3c]")} />
                              </div>
                            ) : (
                              <button className="mt-auto px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wider bg-[#1a2332] border border-[rgba(255,255,255,0.05)] text-muted-foreground hover:text-foreground hover:border-[rgba(255,255,255,0.1)] transition-colors">
                                {action.buttonLabel}
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* PLAYER CONTROL Section */}
                  <div className="bg-[#111922] border border-[rgba(255,255,255,0.05)] rounded-md p-4">
                    <h3 className="text-xs font-bold text-[#2ecc71] tracking-wider mb-3">PLAYER CONTROL</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {playerControlActions.map((action) => {
                        const Icon = action.icon
                        return (
                          <div key={action.id} className="bg-[#0a0f16] border border-[rgba(255,255,255,0.05)] rounded-md p-3 flex flex-col">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="text-xs font-bold text-foreground">{action.label}</h4>
                                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{action.description}</p>
                              </div>
                              <div className="w-8 h-8 rounded-md bg-[#1a2332] flex items-center justify-center border border-[rgba(255,255,255,0.05)]">
                                <Icon className="w-4 h-4 text-[#2ecc71]" />
                              </div>
                            </div>
                            <button className="mt-auto px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wider bg-[#1a2332] border border-[rgba(255,255,255,0.05)] text-muted-foreground hover:text-foreground hover:border-[rgba(255,255,255,0.1)] transition-colors">
                              {action.buttonLabel}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* WORLD CONTROL Section */}
                  <div className="bg-[#111922] border border-[rgba(255,255,255,0.05)] rounded-md p-4">
                    <h3 className="text-xs font-bold text-[#2ecc71] tracking-wider mb-3">WORLD CONTROL</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {worldControlActions.map((action) => {
                        const Icon = action.icon
                        return (
                          <div key={action.id} className="bg-[#0a0f16] border border-[rgba(255,255,255,0.05)] rounded-md p-3 flex flex-col">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="text-xs font-bold text-foreground">{action.label}</h4>
                                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{action.description}</p>
                              </div>
                              <div className="w-8 h-8 rounded-md bg-[#1a2332] flex items-center justify-center border border-[rgba(255,255,255,0.05)]">
                                <Icon className="w-4 h-4 text-[#2ecc71]" />
                              </div>
                            </div>
                            <button className="mt-auto px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wider bg-[#1a2332] border border-[rgba(255,255,255,0.05)] text-muted-foreground hover:text-foreground hover:border-[rgba(255,255,255,0.1)] transition-colors">
                              {action.buttonLabel}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </>
        )}

        {/* Players Tab Content */}
        {activeTab === "players" && (
          <div className="flex-1 bg-[#111922] border border-[rgba(255,255,255,0.05)] rounded-md overflow-hidden">
            {/* Search Header */}
            <div className="p-4 border-b border-[rgba(255,255,255,0.05)] flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search players..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9 bg-[#0a0f16] border-[rgba(255,255,255,0.05)] rounded-md text-sm"
                />
              </div>
              <span className="text-xs text-muted-foreground">{filteredPlayers.length} online</span>
            </div>

            {/* Players Table */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-[#0a0f16] text-[10px] font-bold text-muted-foreground tracking-wider border-b border-[rgba(255,255,255,0.05)]">
              <div className="col-span-3">PLAYER</div>
              <div className="col-span-2">RANK</div>
              <div className="col-span-1">PING</div>
              <div className="col-span-2">STATUS</div>
              <div className="col-span-4 text-right">ACTIONS</div>
            </div>

            <ScrollArea className="h-[calc(100%-90px)]">
              <div className="divide-y divide-[rgba(255,255,255,0.05)]">
                {filteredPlayers.map((player) => (
                  <div key={player.id} className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-[#0a0f16] flex items-center justify-center border border-[rgba(255,255,255,0.05)]">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{player.name}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-muted-foreground">{player.rank}</span>
                    </div>
                    <div className="col-span-1">
                      <span className={cn(
                        "text-xs",
                        player.ping < 50 ? "text-[#2ecc71]" : player.ping < 100 ? "text-[#f39c12]" : "text-[#e74c3c]"
                      )}>
                        {player.ping}ms
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className={cn(
                        "text-xs",
                        player.status === "playing" ? "text-[#2ecc71]" : player.status === "lobby" ? "text-[#00e0c6]" : "text-muted-foreground"
                      )}>
                        {player.status === "playing" ? player.mode : player.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="col-span-4 flex justify-end gap-2">
                      <Button size="sm" className="h-7 px-2.5 text-[10px] bg-[#0a0f16] border border-[rgba(255,255,255,0.05)] text-muted-foreground hover:text-foreground hover:border-[rgba(255,255,255,0.1)]">
                        <Eye className="w-3 h-3 mr-1" />
                        Spectate
                      </Button>
                      <Button size="sm" className="h-7 px-2.5 text-[10px] bg-[#0a0f16] border border-[rgba(255,255,255,0.05)] text-[#f39c12] hover:bg-[#f39c12]/10">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Warn
                      </Button>
                      <Button size="sm" className="h-7 px-2.5 text-[10px] bg-[#0a0f16] border border-[rgba(255,255,255,0.05)] text-[#e74c3c] hover:bg-[#e74c3c]/10">
                        <Ban className="w-3 h-3 mr-1" />
                        Ban
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Other tabs placeholder */}
        {!["admin", "players"].includes(activeTab) && (
          <div className="flex-1 arena-panel rounded flex items-center justify-center">
            <div className="text-center">
              <Shield className="w-10 h-10 text-emerald-500/20 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">{activeTab.toUpperCase()} panel coming soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
