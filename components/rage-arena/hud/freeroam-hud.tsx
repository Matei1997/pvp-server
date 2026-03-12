"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Heart,
  Shield,
  Crosshair,
  Car,
  MapPin,
  Layers,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

// Chat safe zone offset - reserves space for GTA/RageMP chat box
// Adjust this value if chat size changes (160-200px recommended)
const HUD_LEFT_TOP_OFFSET = "top-[180px]"

interface KillFeedEntry {
  id: string
  killer: string
  victim: string
  weapon: string
}

interface FreeRoamHUDProps {
  playerHealth: number
  playerArmor: number
  currentDimension: string
  killfeed: KillFeedEntry[]
  onSpawnWeapon?: (weapon: string) => void
  onSpawnVehicle?: (vehicle: string) => void
  onTeleport?: (location: string) => void
  onChangeDimension?: (dimension: string) => void
}

const weapons = [
  "PISTOL",
  "SMG",
  "ASSAULT RIFLE",
  "SHOTGUN",
  "SNIPER",
  "HEAVY RIFLE",
  "RPG",
  "MINIGUN",
]

const vehicles = [
  "SPORTS CAR",
  "MUSCLE CAR",
  "MOTORCYCLE",
  "SUV",
  "HELICOPTER",
  "BOAT",
  "TANK",
]

const locations = [
  "AIRPORT",
  "DOWNTOWN",
  "MILITARY BASE",
  "BEACH",
  "MOUNTAINS",
  "DESERT",
]

const dimensions = ["PUBLIC", "PRIVATE 1", "PRIVATE 2", "DUEL ARENA"]

export function FreeRoamHUD({
  playerHealth = 100,
  playerArmor = 100,
  currentDimension = "PUBLIC",
  killfeed = [],
  onSpawnWeapon,
  onSpawnVehicle,
  onTeleport,
  onChangeDimension,
}: Partial<FreeRoamHUDProps>) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* LEFT SIDE - Mode Header - positioned below chat safe zone */}
      <div className={cn("absolute left-2 flex flex-col gap-2", HUD_LEFT_TOP_OFFSET)}>
        <div className="flex items-center gap-2">
          <div className="glass-panel rounded px-3 py-1.5 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-bold text-success tracking-wider">FREEROAM</span>
          </div>
          <div className="glass-panel rounded px-2 py-1.5">
            <span className="text-[10px] text-muted-foreground">DIM:</span>
            <span className="text-xs font-medium text-foreground ml-1">{currentDimension}</span>
          </div>
        </div>
      </div>

      {/* TOP RIGHT - Kill Feed - strict edge positioning */}
      <div className="absolute top-2 right-2 flex flex-col items-end gap-0.5 max-w-[240px]">
        {killfeed.slice(0, 5).map((entry) => (
          <div
            key={entry.id}
            className="glass-panel rounded px-2 py-1 flex items-center gap-1.5 text-xs animate-in slide-in-from-right-5"
          >
            <span className="font-medium text-success truncate max-w-[70px]">{entry.killer}</span>
            <span className="text-muted-foreground text-[10px]">[{entry.weapon}]</span>
            <span className="font-medium text-foreground truncate max-w-[70px]">{entry.victim}</span>
          </div>
        ))}
      </div>

      {/* BOTTOM LEFT - Minimap - strict edge positioning */}
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

      {/* BOTTOM RIGHT - Health/Armor - strict edge positioning, NO self-heal button */}
      <div className="absolute bottom-2 right-2">
        <div className="glass-panel rounded px-3 py-2 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-team-red" />
            <div className="w-20 h-2.5 bg-surface-1 rounded-full overflow-hidden">
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

      {/* RIGHT SIDE - Collapsible Utility Menu - positioned away from center */}
      <div className="absolute right-2 top-16 pointer-events-auto">
        {/* Menu Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={cn(
            "glass-panel rounded p-2 transition-all duration-200",
            menuOpen ? "rounded-r-none border-r-0 bg-surface-2" : "hover:bg-surface-2"
          )}
        >
          {menuOpen ? (
            <ChevronRight className="w-4 h-4 text-foreground" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-foreground" />
          )}
        </button>

        {/* Menu Content */}
        {menuOpen && (
          <div className="absolute right-full top-0 mr-0">
            <div className="glass-panel rounded rounded-r-none border-r-0 p-1.5 flex flex-col gap-0.5 min-w-[160px]">
              {/* Quick actions - no self-heal */}
              <MenuButton
                icon={Crosshair}
                label="Spawn Weapon"
                isActive={activeSubmenu === "weapons"}
                onClick={() => setActiveSubmenu(activeSubmenu === "weapons" ? null : "weapons")}
              />
              <MenuButton
                icon={Car}
                label="Spawn Vehicle"
                isActive={activeSubmenu === "vehicles"}
                onClick={() => setActiveSubmenu(activeSubmenu === "vehicles" ? null : "vehicles")}
              />
              <MenuButton
                icon={MapPin}
                label="Teleport"
                isActive={activeSubmenu === "teleport"}
                onClick={() => setActiveSubmenu(activeSubmenu === "teleport" ? null : "teleport")}
              />
              <MenuButton
                icon={Layers}
                label="Dimension"
                isActive={activeSubmenu === "dimension"}
                onClick={() => setActiveSubmenu(activeSubmenu === "dimension" ? null : "dimension")}
              />
            </div>

            {/* Submenu */}
            {activeSubmenu && (
              <div className="absolute right-full top-0 mr-1">
                <div className="glass-panel rounded p-1.5 min-w-[140px]">
                  <div className="flex items-center justify-between mb-1.5 px-1.5">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {activeSubmenu}
                    </span>
                    <button onClick={() => setActiveSubmenu(null)}>
                      <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>
                  <ScrollArea className="h-[180px]">
                    <div className="flex flex-col gap-0.5">
                      {activeSubmenu === "weapons" &&
                        weapons.map((weapon) => (
                          <SubmenuItem
                            key={weapon}
                            label={weapon}
                            onClick={() => onSpawnWeapon?.(weapon)}
                          />
                        ))}
                      {activeSubmenu === "vehicles" &&
                        vehicles.map((vehicle) => (
                          <SubmenuItem
                            key={vehicle}
                            label={vehicle}
                            onClick={() => onSpawnVehicle?.(vehicle)}
                          />
                        ))}
                      {activeSubmenu === "teleport" &&
                        locations.map((location) => (
                          <SubmenuItem
                            key={location}
                            label={location}
                            onClick={() => onTeleport?.(location)}
                          />
                        ))}
                      {activeSubmenu === "dimension" &&
                        dimensions.map((dim) => (
                          <SubmenuItem
                            key={dim}
                            label={dim}
                            isActive={dim === currentDimension}
                            onClick={() => onChangeDimension?.(dim)}
                          />
                        ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function MenuButton({
  icon: Icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ElementType
  label: string
  isActive?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 rounded transition-colors text-left",
        isActive
          ? "bg-primary/20 text-primary"
          : "text-foreground hover:bg-surface-2"
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}

function SubmenuItem({
  label,
  isActive,
  onClick,
}: {
  label: string
  isActive?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-2 py-1.5 rounded text-xs transition-colors",
        isActive
          ? "bg-primary/20 text-primary"
          : "text-foreground hover:bg-surface-2"
      )}
    >
      {label}
    </button>
  )
}
