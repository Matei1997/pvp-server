"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { 
  Crosshair, 
  User, 
  Star,
  Shirt,
  Eye,
  Scissors,
  UserCircle,
  ChevronLeft,
  Circle,
  Aperture,
  Target,
  Grip,
  Cylinder,
  Flashlight,
  Paintbrush,
  X,
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

type LoadoutCategory = "weapons" | "character"
type CharacterSubCategory = "masks" | "pants" | "shoes" | "shirts" | "hats" | "glasses" | "accs" | "outfits" | "bags" | "arms" | "tattoos"
type WeaponSubCategory = "rifles" | "smgs" | "shotguns" | "snipers" | "pistols" | "melee"
type AttachmentSlot = "magazine" | "optic" | "muzzle" | "grip" | "skin"

interface LoadoutItem {
  id: string
  name: string
  equipped?: boolean
}

interface WeaponData extends LoadoutItem {
  supportedSlots: AttachmentSlot[]
  attachments: Partial<Record<AttachmentSlot, string | null>>
}

interface AttachmentOption {
  id: string
  name: string
}

const categories: { id: LoadoutCategory; label: string; icon: React.ElementType }[] = [
  { id: "weapons", label: "WEAPONS", icon: Crosshair },
  { id: "character", label: "CHARACTER", icon: User },
]

const weaponSubCategories: { id: WeaponSubCategory; label: string }[] = [
  { id: "rifles", label: "RIFLES" },
  { id: "smgs", label: "SMGS" },
  { id: "shotguns", label: "SHOTGUNS" },
  { id: "snipers", label: "SNIPERS" },
  { id: "pistols", label: "PISTOLS" },
  { id: "melee", label: "MELEE" },
]

const characterSubCategories: { id: CharacterSubCategory; label: string; icon: React.ElementType }[] = [
  { id: "masks", label: "MASKS", icon: Eye },
  { id: "hats", label: "HATS", icon: User },
  { id: "glasses", label: "GLASSES", icon: Eye },
  { id: "shirts", label: "SHIRTS", icon: Shirt },
  { id: "pants", label: "PANTS", icon: User },
  { id: "shoes", label: "SHOES", icon: User },
  { id: "accs", label: "ACCS", icon: Star },
  { id: "outfits", label: "OUTFITS", icon: User },
  { id: "bags", label: "BAGS", icon: User },
  { id: "arms", label: "ARMS", icon: User },
  { id: "tattoos", label: "TATTOOS", icon: Scissors },
]

const attachmentSlots: { id: AttachmentSlot; label: string; icon: React.ElementType }[] = [
  { id: "magazine", label: "MAGAZINE", icon: Cylinder },
  { id: "optic", label: "OPTIC", icon: Aperture },
  { id: "muzzle", label: "MUZZLE", icon: Circle },
  { id: "grip", label: "GRIP", icon: Grip },
  { id: "skin", label: "SKIN", icon: Paintbrush },
]

// Mock weapon data - simplified without rarity
const mockWeapons: Record<WeaponSubCategory, WeaponData[]> = {
  rifles: [
    { id: "ak47", name: "AK-47", equipped: true, supportedSlots: ["magazine", "optic", "muzzle", "grip", "skin"], attachments: { magazine: "ext_mag", muzzle: "suppressor", skin: "desert_camo" } },
    { id: "m4a1", name: "M4A1-S", supportedSlots: ["magazine", "optic", "muzzle", "grip", "skin"], attachments: { optic: "red_dot", grip: "vert_grip" } },
    { id: "famas", name: "FAMAS", supportedSlots: ["magazine", "optic", "muzzle", "skin"], attachments: {} },
    { id: "aug", name: "AUG A3", supportedSlots: ["magazine", "optic", "muzzle", "grip", "skin"], attachments: {} },
    { id: "scar", name: "SCAR-H", supportedSlots: ["magazine", "optic", "muzzle", "grip", "skin"], attachments: {} },
    { id: "grau", name: "GRAU 5.56", supportedSlots: ["magazine", "optic", "muzzle", "grip", "skin"], attachments: {} },
  ],
  smgs: [
    { id: "mp5", name: "MP5-SD", equipped: true, supportedSlots: ["magazine", "optic", "grip", "skin"], attachments: { magazine: "ext_mag", optic: "holo" } },
    { id: "ump", name: "UMP-45", supportedSlots: ["magazine", "optic", "muzzle", "grip", "skin"], attachments: {} },
    { id: "vector", name: "VECTOR", supportedSlots: ["magazine", "optic", "muzzle", "grip", "skin"], attachments: {} },
    { id: "p90", name: "P90", supportedSlots: ["magazine", "optic", "muzzle", "skin"], attachments: {} },
  ],
  shotguns: [
    { id: "pump", name: "PUMP ACTION", equipped: true, supportedSlots: ["optic", "muzzle", "skin"], attachments: {} },
    { id: "auto", name: "AUTO SHOTGUN", supportedSlots: ["magazine", "optic", "muzzle", "grip", "skin"], attachments: {} },
    { id: "sawed", name: "SAWED-OFF", supportedSlots: ["skin"], attachments: {} },
  ],
  snipers: [
    { id: "awp", name: "AWP", equipped: true, supportedSlots: ["magazine", "optic", "muzzle", "skin"], attachments: { optic: "scope_8x", muzzle: "suppressor" } },
    { id: "scout", name: "SCOUT", supportedSlots: ["magazine", "optic", "muzzle", "skin"], attachments: {} },
    { id: "heavy", name: "HEAVY SNIPER", supportedSlots: ["magazine", "optic", "muzzle", "skin"], attachments: {} },
    { id: "barrett", name: "BARRETT .50", supportedSlots: ["magazine", "optic", "muzzle", "skin"], attachments: {} },
  ],
  pistols: [
    { id: "deagle", name: "DESERT EAGLE", equipped: true, supportedSlots: ["magazine", "optic", "muzzle", "skin"], attachments: { skin: "gold" } },
    { id: "glock", name: "GLOCK 18", supportedSlots: ["magazine", "optic", "muzzle", "skin"], attachments: {} },
    { id: "1911", name: "M1911", supportedSlots: ["magazine", "muzzle", "skin"], attachments: {} },
    { id: "fiveseven", name: "FIVE-SEVEN", supportedSlots: ["magazine", "optic", "muzzle", "skin"], attachments: {} },
  ],
  melee: [
    { id: "knife", name: "COMBAT KNIFE", equipped: true, supportedSlots: ["skin"], attachments: {} },
    { id: "karambit", name: "KARAMBIT", supportedSlots: ["skin"], attachments: {} },
    { id: "baton", name: "BATON", supportedSlots: ["skin"], attachments: {} },
  ],
}

// Mock attachment options - simplified
const attachmentOptions: Record<AttachmentSlot, AttachmentOption[]> = {
  magazine: [
    { id: "ext_mag", name: "Extended Magazine" },
    { id: "fast_mag", name: "Fast Reload Mag" },
    { id: "drum_mag", name: "Drum Magazine" },
  ],
  optic: [
    { id: "red_dot", name: "Red Dot Sight" },
    { id: "holo", name: "Holographic Sight" },
    { id: "acog", name: "ACOG 4x" },
    { id: "scope_8x", name: "Sniper Scope 8x" },
  ],
  muzzle: [
    { id: "suppressor", name: "Suppressor" },
    { id: "compensator", name: "Compensator" },
    { id: "flash_hider", name: "Flash Hider" },
    { id: "muzzle_brake", name: "Muzzle Brake" },
  ],
  grip: [
    { id: "vert_grip", name: "Vertical Grip" },
    { id: "angled_grip", name: "Angled Grip" },
    { id: "stubby_grip", name: "Stubby Grip" },
  ],
  skin: [
    { id: "desert_camo", name: "Desert Camo" },
    { id: "urban_camo", name: "Urban Camo" },
    { id: "gold", name: "Gold" },
    { id: "carbon", name: "Carbon Fiber" },
    { id: "tiger", name: "Tiger Stripe" },
  ],
}

// Mock character items - simplified
const mockCharacterItems: Record<CharacterSubCategory, LoadoutItem[]> = {
  masks: [
    { id: "balaclava", name: "Balaclava", equipped: true },
    { id: "skull", name: "Skull Mask" },
    { id: "gas", name: "Gas Mask" },
    { id: "tactical", name: "Tactical Mask" },
  ],
  hats: [
    { id: "beanie", name: "Beanie" },
    { id: "cap", name: "Baseball Cap", equipped: true },
    { id: "helmet", name: "Combat Helmet" },
    { id: "beret", name: "Beret" },
  ],
  glasses: [
    { id: "shades", name: "Sunglasses", equipped: true },
    { id: "tactical", name: "Tactical Goggles" },
    { id: "nvg", name: "Night Vision" },
  ],
  shirts: [
    { id: "tshirt", name: "T-Shirt" },
    { id: "hoodie", name: "Hoodie", equipped: true },
    { id: "vest", name: "Tactical Vest" },
    { id: "jacket", name: "Combat Jacket" },
  ],
  pants: [
    { id: "cargo", name: "Cargo Pants", equipped: true },
    { id: "jeans", name: "Jeans" },
    { id: "tactical", name: "Tactical Pants" },
  ],
  shoes: [
    { id: "boots", name: "Combat Boots", equipped: true },
    { id: "sneakers", name: "Sneakers" },
    { id: "tactical", name: "Tactical Boots" },
  ],
  accs: [
    { id: "watch", name: "Tactical Watch", equipped: true },
    { id: "dog_tags", name: "Dog Tags" },
    { id: "earpiece", name: "Earpiece" },
  ],
  outfits: [
    { id: "default", name: "Default", equipped: true },
    { id: "ghillie", name: "Ghillie Suit" },
    { id: "swat", name: "SWAT Gear" },
  ],
  bags: [
    { id: "backpack", name: "Tactical Backpack", equipped: true },
    { id: "sling", name: "Sling Bag" },
  ],
  arms: [
    { id: "gloves", name: "Tactical Gloves", equipped: true },
    { id: "fingerless", name: "Fingerless Gloves" },
  ],
  tattoos: [
    { id: "sleeve", name: "Arm Sleeve" },
    { id: "tribal", name: "Tribal" },
    { id: "back", name: "Back Piece" },
  ],
}

export function LoadoutPage() {
  const [activeCategory, setActiveCategory] = useState<LoadoutCategory>("weapons")
  const [activeWeaponSub, setActiveWeaponSub] = useState<WeaponSubCategory>("rifles")
  const [activeCharacterSub, setActiveCharacterSub] = useState<CharacterSubCategory>("masks")
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponData | null>(null)
  const [activeAttachmentSlot, setActiveAttachmentSlot] = useState<AttachmentSlot | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const weapons = (mockWeapons[activeWeaponSub] || []).filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const characterItems = (mockCharacterItems[activeCharacterSub] || []).filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleWeaponSelect = (weapon: WeaponData) => {
    setSelectedWeapon(weapon)
    setActiveAttachmentSlot(null)
  }

  const handleBackToWeapons = () => {
    setSelectedWeapon(null)
    setActiveAttachmentSlot(null)
  }

  const getAttachmentName = (slotId: AttachmentSlot, attachmentId: string | null | undefined): string => {
    if (!attachmentId) return "None"
    const option = attachmentOptions[slotId]?.find(opt => opt.id === attachmentId)
    return option?.name || "None"
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0f16] p-4">
      {/* Page Header */}
      <div className="mb-4">
        <h1 className="text-lg font-black tracking-wider text-foreground">
          {activeCategory === "weapons" 
            ? (selectedWeapon ? <><span className="text-[#00e0c6]">{selectedWeapon.name}</span></> : <>MY <span className="text-[#00e0c6]">LOADOUT</span></>)
            : <>CHARACTER <span className="text-[#00e0c6]">CUSTOMIZATION</span></>
          }
        </h1>
        <p className="text-[11px] text-muted-foreground">
          {activeCategory === "weapons" 
            ? (selectedWeapon ? "Customize attachments" : "Select and customize your weapons")
            : "Personalize your character"
          }
        </p>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left - Category Rail */}
        <div className="flex gap-2">
          {/* Main Category Tabs */}
          <div className="flex flex-col gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id)
                    setSelectedWeapon(null)
                    setActiveAttachmentSlot(null)
                  }}
                  className={cn(
                    "w-16 py-3 px-2 rounded-md flex flex-col items-center justify-center gap-1.5 transition-all",
                    isActive 
                      ? "bg-[#00e0c6]/10 text-[#00e0c6] border border-[#00e0c6]/30" 
                      : "bg-[#111922] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)] text-muted-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[8px] font-bold tracking-wider">{cat.label}</span>
                </button>
              )
            })}
          </div>

          {/* Weapon Sub Categories */}
          {activeCategory === "weapons" && !selectedWeapon && (
            <div className="flex flex-col gap-1 bg-[#111922] border border-[rgba(255,255,255,0.05)] rounded-md p-2">
              {weaponSubCategories.map((sub) => {
                const isActive = activeWeaponSub === sub.id
                return (
                  <button
                    key={sub.id}
                    onClick={() => setActiveWeaponSub(sub.id)}
                    className={cn(
                      "w-16 py-2 px-2 rounded-md flex flex-col items-center justify-center transition-all",
                      isActive 
                        ? "bg-[#00e0c6]/10 text-[#00e0c6]" 
                        : "hover:bg-[rgba(255,255,255,0.03)] text-muted-foreground"
                    )}
                  >
                    <Crosshair className="w-4 h-4 mb-1" />
                    <span className="text-[7px] font-medium">{sub.label}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Weapon Attachment Slots */}
          {activeCategory === "weapons" && selectedWeapon && (
            <div className="flex flex-col gap-1 bg-[#111922] border border-[rgba(255,255,255,0.05)] rounded-md p-2">
              <button
                onClick={handleBackToWeapons}
                className="w-16 py-2 px-2 rounded-md flex items-center justify-center gap-1 text-muted-foreground hover:bg-[rgba(255,255,255,0.03)] hover:text-foreground transition-all mb-1"
              >
                <ChevronLeft className="w-3 h-3" />
                <span className="text-[7px] font-medium">BACK</span>
              </button>
              
              <div className="w-full h-px bg-[rgba(255,255,255,0.05)] mb-1" />
              
              {attachmentSlots
                .filter(slot => selectedWeapon.supportedSlots.includes(slot.id))
                .map((slot) => {
                  const Icon = slot.icon
                  const isActive = activeAttachmentSlot === slot.id
                  const hasAttachment = selectedWeapon.attachments[slot.id]
                  return (
                    <button
                      key={slot.id}
                      onClick={() => setActiveAttachmentSlot(isActive ? null : slot.id)}
                      className={cn(
                        "w-16 py-2 px-1 rounded-md flex flex-col items-center justify-center gap-0.5 transition-all relative",
                        isActive 
                          ? "bg-[#00e0c6]/10 text-[#00e0c6]" 
                          : "hover:bg-[rgba(255,255,255,0.03)] text-muted-foreground"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[6px] font-medium">{slot.label}</span>
                      {hasAttachment && (
                        <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#00e0c6] rounded-full" />
                      )}
                    </button>
                  )
                })}
            </div>
          )}

          {/* Character Sub Categories */}
          {activeCategory === "character" && (
            <div className="flex flex-col gap-0.5 bg-[#111922] border border-[rgba(255,255,255,0.05)] rounded-md p-2">
              <ScrollArea className="h-[calc(100vh-180px)]">
                {characterSubCategories.map((sub) => {
                  const Icon = sub.icon
                  const isActive = activeCharacterSub === sub.id
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setActiveCharacterSub(sub.id)}
                      className={cn(
                        "w-16 py-2 px-2 rounded-md flex flex-col items-center justify-center gap-0.5 transition-all mb-0.5",
                        isActive 
                          ? "bg-[#00e0c6]/10 text-[#00e0c6]" 
                          : "hover:bg-[rgba(255,255,255,0.03)] text-muted-foreground"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[7px] font-medium">{sub.label}</span>
                    </button>
                  )
                })}
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Center - Items Grid */}
        <div className="flex-1 max-w-[560px] flex flex-col">
          {/* Search */}
          {!activeAttachmentSlot && (
            <div className="mb-3">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 px-4 bg-[#111922] border border-[rgba(255,255,255,0.05)] rounded-md text-sm focus:outline-none focus:border-[#00e0c6]/30 placeholder:text-muted-foreground"
              />
            </div>
          )}

          {/* Attachment Slot Header */}
          {activeCategory === "weapons" && selectedWeapon && activeAttachmentSlot && (
            <div className="bg-[#111922] border border-[rgba(255,255,255,0.05)] rounded-md p-3 mb-3 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-muted-foreground tracking-widest">
                  {attachmentSlots.find(s => s.id === activeAttachmentSlot)?.label}
                </div>
                <div className="text-sm font-bold text-foreground">
                  {getAttachmentName(activeAttachmentSlot, selectedWeapon.attachments[activeAttachmentSlot])}
                </div>
              </div>
              <button
                onClick={() => setActiveAttachmentSlot(null)}
                className="p-1.5 hover:bg-[rgba(255,255,255,0.03)] rounded-md transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          )}

          {/* Items Grid */}
          <ScrollArea className="flex-1">
            {activeCategory === "weapons" && !selectedWeapon && (
              <div className="grid grid-cols-4 gap-2 pr-2">
                {weapons.map((weapon) => (
                  <WeaponCard 
                    key={weapon.id} 
                    weapon={weapon}
                    onClick={() => handleWeaponSelect(weapon)}
                  />
                ))}
              </div>
            )}

            {activeCategory === "weapons" && selectedWeapon && !activeAttachmentSlot && (
              <div className="pr-2">
                <div className="text-xs text-muted-foreground mb-3">
                  Select an attachment slot to customize
                </div>
                
                {/* Attachment Summary */}
                <div className="space-y-2">
                  {attachmentSlots
                    .filter(slot => selectedWeapon.supportedSlots.includes(slot.id))
                    .map(slot => {
                      const Icon = slot.icon
                      const attachmentId = selectedWeapon.attachments[slot.id]
                      const attachmentName = getAttachmentName(slot.id, attachmentId)
                      return (
                        <button
                          key={slot.id}
                          onClick={() => setActiveAttachmentSlot(slot.id)}
                          className="w-full flex items-center gap-3 p-3 rounded-md bg-[#111922] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)] text-left transition-all"
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-md flex items-center justify-center",
                            attachmentId ? "bg-[#00e0c6]/10 text-[#00e0c6]" : "bg-[rgba(255,255,255,0.03)] text-muted-foreground"
                          )}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="text-[10px] text-muted-foreground">{slot.label}</div>
                            <div className={cn(
                              "text-sm font-medium",
                              attachmentId ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {attachmentName}
                            </div>
                          </div>
                          {attachmentId && <Check className="w-4 h-4 text-[#00e0c6]" />}
                        </button>
                      )
                    })}
                </div>
              </div>
            )}

            {activeCategory === "weapons" && selectedWeapon && activeAttachmentSlot && (
              <div className="space-y-1.5 pr-2">
                {/* None Option */}
                <AttachmentOptionCard
                  option={{ id: "none", name: "None" }}
                  isEquipped={!selectedWeapon.attachments[activeAttachmentSlot]}
                  onSelect={() => {}}
                />
                
                {/* Attachment Options */}
                {attachmentOptions[activeAttachmentSlot]?.map(option => (
                  <AttachmentOptionCard
                    key={option.id}
                    option={option}
                    isEquipped={selectedWeapon.attachments[activeAttachmentSlot] === option.id}
                    onSelect={() => {}}
                  />
                ))}
              </div>
            )}

            {activeCategory === "character" && (
              <div className="grid grid-cols-4 gap-2 pr-2">
                {characterItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right - Preview Area */}
        <div className="w-72 flex flex-col items-center justify-center bg-[#111922] border border-[rgba(255,255,255,0.05)] rounded-md p-4">
          {/* Character/Weapon Preview */}
          <div className="flex flex-col items-center justify-center flex-1 w-full">
            {activeCategory === "character" ? (
              <div className="w-full max-w-[200px] aspect-[3/4] bg-[#0a0f16] rounded-md border border-[rgba(255,255,255,0.05)] flex items-center justify-center">
                <UserCircle className="w-28 h-28 text-muted-foreground/20" />
              </div>
            ) : selectedWeapon ? (
              <div className="w-full max-w-[220px] aspect-[4/3] bg-[#0a0f16] rounded-md border border-[rgba(255,255,255,0.05)] flex flex-col items-center justify-center relative">
                <Crosshair className="w-24 h-24 text-muted-foreground/20" />
                
                {/* Weapon Name Overlay */}
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <div className="text-lg font-bold text-[#00e0c6]">
                    {selectedWeapon.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {Object.values(selectedWeapon.attachments).filter(Boolean).length} attachments equipped
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-[200px] aspect-square bg-[#0a0f16] rounded-md border border-[rgba(255,255,255,0.05)] flex flex-col items-center justify-center">
                <Crosshair className="w-20 h-20 text-muted-foreground/20" />
                <div className="mt-4 text-sm text-muted-foreground">Select a weapon</div>
              </div>
            )}
          </div>

          {/* Equip Button - only show when weapon selected */}
          {selectedWeapon && !selectedWeapon.equipped && (
            <Button 
              className="mt-4 bg-[#00e0c6] hover:bg-[#00e0c6]/90 text-[#0a0f16] font-bold text-sm px-8 rounded-md h-10"
              style={{ boxShadow: '0 0 18px rgba(0, 224, 198, 0.3)' }}
            >
              EQUIP WEAPON
            </Button>
          )}
          {selectedWeapon?.equipped && (
            <div className="mt-4 px-5 py-2.5 text-sm font-bold text-[#00e0c6] border border-[#00e0c6]/30 rounded-md bg-[#00e0c6]/10">
              EQUIPPED
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function WeaponCard({ weapon, onClick }: { weapon: WeaponData; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative p-3 rounded-md cursor-pointer transition-all bg-[#111922] border",
        weapon.equipped 
          ? "border-[rgba(0,224,198,0.5)] bg-[#00e0c6]/5" 
          : "border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)]"
      )}
    >
      {/* Equipped indicator */}
      {weapon.equipped && (
        <div className="absolute top-2 right-2">
          <Star className="w-3.5 h-3.5 text-[#00e0c6] fill-[#00e0c6]" />
        </div>
      )}

      {/* Preview Area */}
      <div className="aspect-square rounded-md bg-[#0a0f16] mb-2 flex items-center justify-center">
        <Crosshair className="w-8 h-8 text-muted-foreground/40" />
      </div>

      {/* Item Name */}
      <div className="text-[10px] font-bold text-center truncate">{weapon.name}</div>

      {/* Attachment count */}
      {Object.values(weapon.attachments).filter(Boolean).length > 0 && (
        <div className="text-[9px] text-center text-[#00e0c6] mt-1">
          {Object.values(weapon.attachments).filter(Boolean).length} mods
        </div>
      )}
    </div>
  )
}

function AttachmentOptionCard({ 
  option, 
  isEquipped, 
  onSelect 
}: { 
  option: AttachmentOption
  isEquipped: boolean
  onSelect: () => void 
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-md transition-all text-left border",
        isEquipped 
          ? "bg-[#00e0c6]/10 border-[#00e0c6]" 
          : "bg-[#111922] border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)]"
      )}
    >
      <div className={cn(
        "w-9 h-9 rounded-md flex items-center justify-center",
        isEquipped ? "bg-[#00e0c6]/20" : "bg-[rgba(255,255,255,0.03)]"
      )}>
        {option.id === "none" ? (
          <X className="w-4 h-4 text-muted-foreground" />
        ) : (
          <Target className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
      
      <div className="flex-1">
        <div className={cn(
          "text-sm font-medium",
          isEquipped ? "text-[#00e0c6]" : "text-foreground"
        )}>
          {option.name}
        </div>
      </div>
      
      {isEquipped && <Check className="w-4 h-4 text-[#00e0c6]" />}
    </button>
  )
}

function ItemCard({ item }: { item: LoadoutItem }) {
  return (
    <div
      className={cn(
        "relative p-3 rounded-md cursor-pointer transition-all bg-[#111922] border",
        item.equipped 
          ? "border-[rgba(0,224,198,0.5)] bg-[#00e0c6]/5" 
          : "border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)]"
      )}
    >
      {/* Equipped indicator */}
      {item.equipped && (
        <div className="absolute top-2 right-2">
          <Star className="w-3.5 h-3.5 text-[#00e0c6] fill-[#00e0c6]" />
        </div>
      )}

      {/* Preview Area */}
      <div className="aspect-square rounded-md bg-[#0a0f16] mb-2 flex items-center justify-center">
        <div className="w-6 h-6 rounded bg-[rgba(255,255,255,0.05)]" />
      </div>

      {/* Item Name */}
      <div className="text-[10px] font-bold text-center truncate">{item.name}</div>

      {/* Equip Button */}
      <Button 
        size="sm" 
        className={cn(
          "w-full mt-2 h-6 text-[9px] font-bold px-2 rounded-md",
          item.equipped 
            ? "bg-[#00e0c6]/10 text-[#00e0c6] border border-[#00e0c6]/30 hover:bg-[#00e0c6]/20" 
            : "bg-[#00e0c6] hover:bg-[#00e0c6]/90 text-[#0a0f16]"
        )}
      >
        {item.equipped ? "EQUIPPED" : "EQUIP"}
      </Button>
    </div>
  )
}
