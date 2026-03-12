"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Gamepad2,
  Crosshair,
  Trophy,
  Target,
  Calendar,
  User,
  Shield,
  ChevronDown,
  Settings,
  LogOut,
  Users,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export type NavTab = "play" | "custom" | "loadout" | "ranking" | "challenges" | "season" | "profile" | "settings" | "admin"

interface NavigationProps {
  activeTab: NavTab
  onTabChange: (tab: NavTab) => void
  onSettingsOpen?: () => void
  isAdmin?: boolean
  adminLevel?: number
  playerName?: string
  playerRank?: string
  playerAvatar?: string
}

const navItems: { id: NavTab; label: string; icon: React.ElementType }[] = [
  { id: "play", label: "PLAY", icon: Gamepad2 },
  { id: "custom", label: "CUSTOM", icon: Users },
  { id: "loadout", label: "LOADOUT", icon: Crosshair },
  { id: "ranking", label: "RANKING", icon: Trophy },
  { id: "challenges", label: "CHALLENGES", icon: Target },
  { id: "season", label: "SEASON", icon: Calendar },
  { id: "profile", label: "PROFILE", icon: User },
]

export function Navigation({
  activeTab,
  onTabChange,
  onSettingsOpen,
  isAdmin = false,
  adminLevel = 0,
  playerName = "GHOST_001",
  playerRank = "Diamond II",
  playerAvatar,
}: NavigationProps) {
  const showAdmin = isAdmin || adminLevel > 0
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#111922] border-b border-[rgba(255,255,255,0.05)]">
      <div className="flex items-center justify-between px-6 h-12">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[#00e0c6]/10 flex items-center justify-center border border-[#00e0c6]/20">
            <span className="text-[#00e0c6] font-black text-sm tracking-tighter">RA</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base font-black tracking-wider text-foreground">
              RAGE <span className="text-[#00e0c6]">ARENA</span>
            </h1>
          </div>
        </div>

        {/* Nav Items */}
        <div className="flex items-center gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "relative px-4 py-3 flex items-center gap-2 text-xs font-bold tracking-wider transition-all duration-200 uppercase",
                  "hover:text-foreground",
                  isActive
                    ? "text-[#00e0c6]"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline">{item.label}</span>
                {isActive && (
                  <div 
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-0.5 bg-[#00e0c6]"
                    style={{ boxShadow: '0 0 10px #00e0c6, 0 0 20px rgba(0, 224, 198, 0.5)' }}
                  />
                )}
              </button>
            )
          })}

          {/* Settings Button - Always visible */}
          <button
            onClick={() => onSettingsOpen ? onSettingsOpen() : onTabChange("settings")}
            className={cn(
              "relative px-4 py-3 flex items-center gap-2 text-xs font-bold tracking-wider transition-all duration-200 uppercase",
              "hover:text-foreground",
              activeTab === "settings"
                ? "text-[#00e0c6]"
                : "text-muted-foreground"
            )}
          >
            <Settings className="w-4 h-4" />
            <span className="hidden lg:inline">SETTINGS</span>
            {activeTab === "settings" && (
              <div 
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-0.5 bg-[#00e0c6]"
                style={{ boxShadow: '0 0 10px #00e0c6, 0 0 20px rgba(0, 224, 198, 0.5)' }}
              />
            )}
          </button>

          {/* Admin Button - Visible when adminLevel > 0 */}
          {showAdmin && (
            <button
              onClick={() => onTabChange("admin")}
              className={cn(
                "relative px-4 py-3 flex items-center gap-2 text-xs font-bold tracking-wider transition-all duration-200 uppercase",
                "hover:text-foreground",
                activeTab === "admin"
                  ? "text-[#2ecc71]"
                  : "text-muted-foreground"
              )}
            >
              <Shield className="w-4 h-4" />
              <span className="hidden lg:inline">ADMIN</span>
              {activeTab === "admin" && (
                <div 
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-0.5 bg-[#2ecc71]"
                  style={{ boxShadow: '0 0 10px #2ecc71, 0 0 20px rgba(46, 204, 113, 0.5)' }}
                />
              )}
            </button>
          )}
        </div>

        {/* Player Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-secondary/50 transition-colors">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">{playerName}</p>
                <p className="text-xs text-primary">{playerRank}</p>
              </div>
              <Avatar className="h-7 w-7 border border-primary/30">
                <AvatarImage src={playerAvatar} />
                <AvatarFallback className="bg-secondary text-foreground text-xs">
                  {playerName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onTabChange("profile")}>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onTabChange("loadout")}>
              <Crosshair className="w-4 h-4 mr-2" />
              Loadout
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onSettingsOpen ? onSettingsOpen() : onTabChange("settings")}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
