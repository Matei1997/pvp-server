"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Volume2,
  VolumeX,
  Monitor,
  Gamepad2,
  Bell,
  Eye,
} from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"

type SettingsCategory = "audio" | "video" | "controls" | "gameplay" | "notifications"

const categories: { id: SettingsCategory; label: string; icon: React.ElementType }[] = [
  { id: "audio", label: "AUDIO", icon: Volume2 },
  { id: "video", label: "VIDEO", icon: Monitor },
  { id: "controls", label: "CONTROLS", icon: Gamepad2 },
  { id: "gameplay", label: "GAMEPLAY", icon: Eye },
  { id: "notifications", label: "NOTIFICATIONS", icon: Bell },
]

export function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>("audio")
  
  // Audio settings
  const [masterVolume, setMasterVolume] = useState([80])
  const [sfxVolume, setSfxVolume] = useState([100])
  const [musicVolume, setMusicVolume] = useState([50])
  const [voiceVolume, setVoiceVolume] = useState([75])
  const [voipEnabled, setVoipEnabled] = useState(true)
  
  // Video settings
  const [fov, setFov] = useState([90])
  const [showFPS, setShowFPS] = useState(true)
  const [showPing, setShowPing] = useState(true)
  
  // Gameplay settings
  const [hitmarkers, setHitmarkers] = useState(true)
  const [damageNumbers, setDamageNumbers] = useState(true)
  const [killcam, setKillcam] = useState(true)
  
  // Notifications
  const [chatNotifications, setChatNotifications] = useState(true)
  const [teamNotifications, setTeamNotifications] = useState(true)
  const [friendNotifications, setFriendNotifications] = useState(true)

  return (
    <div className="h-full flex flex-col bg-[#0a0f16] p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-black tracking-wider text-foreground">
          GAME <span className="text-[#00e0c6]">SETTINGS</span>
        </h1>
        <p className="text-sm text-muted-foreground">Customize your game experience</p>
      </div>
      
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left Sidebar Navigation */}
        <div className="w-48 bg-[#111922] border border-[rgba(255,255,255,0.05)] rounded-md p-4">
        <div className="space-y-1">
            {categories.map((cat) => {
              const Icon = cat.icon
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-all border",
                    isActive
                      ? "bg-[#00e0c6]/10 text-[#00e0c6] border-[#00e0c6]/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-[rgba(255,255,255,0.03)] border-transparent"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-medium tracking-wider">{cat.label}</span>
                </button>
              )
            })}
          </div>
        </div>

      {/* Settings Content */}
        <div className="flex-1">
          <ScrollArea className="h-full">
            <div className="max-w-2xl space-y-4">
            {/* Audio Settings */}
            {activeCategory === "audio" && (
              <>
                <SettingSection title="Volume">
                  <SliderSetting
                    label="Master Volume"
                    value={masterVolume}
                    onChange={setMasterVolume}
                    icon={masterVolume[0] > 0 ? Volume2 : VolumeX}
                  />
                  <SliderSetting
                    label="Sound Effects"
                    value={sfxVolume}
                    onChange={setSfxVolume}
                  />
                  <SliderSetting
                    label="Music"
                    value={musicVolume}
                    onChange={setMusicVolume}
                  />
                  <SliderSetting
                    label="Voice Chat"
                    value={voiceVolume}
                    onChange={setVoiceVolume}
                  />
                </SettingSection>

                <SettingSection title="Voice">
                  <ToggleSetting
                    label="Enable VOIP"
                    description="Allow voice communication in matches"
                    enabled={voipEnabled}
                    onChange={setVoipEnabled}
                  />
                </SettingSection>
              </>
            )}

            {/* Video Settings */}
            {activeCategory === "video" && (
              <>
                <SettingSection title="Display">
                  <SliderSetting
                    label="Field of View"
                    value={fov}
                    onChange={setFov}
                    min={60}
                    max={120}
                    showValue
                  />
                </SettingSection>

                <SettingSection title="HUD">
                  <ToggleSetting
                    label="Show FPS Counter"
                    description="Display frames per second"
                    enabled={showFPS}
                    onChange={setShowFPS}
                  />
                  <ToggleSetting
                    label="Show Ping"
                    description="Display network latency"
                    enabled={showPing}
                    onChange={setShowPing}
                  />
                </SettingSection>
              </>
            )}

            {/* Controls Settings */}
            {activeCategory === "controls" && (
              <>
                <SettingSection title="Keybinds">
                  <KeybindSetting label="Move Forward" currentKey="W" />
                  <KeybindSetting label="Move Backward" currentKey="S" />
                  <KeybindSetting label="Move Left" currentKey="A" />
                  <KeybindSetting label="Move Right" currentKey="D" />
                  <KeybindSetting label="Jump" currentKey="SPACE" />
                  <KeybindSetting label="Crouch" currentKey="CTRL" />
                  <KeybindSetting label="Sprint" currentKey="SHIFT" />
                  <KeybindSetting label="Reload" currentKey="R" />
                  <KeybindSetting label="Use Item" currentKey="F" />
                  <KeybindSetting label="Scoreboard" currentKey="TAB" />
                  <KeybindSetting label="Push to Talk" currentKey="V" />
                </SettingSection>

                <SettingSection title="Mouse">
                  <SliderSetting
                    label="Sensitivity"
                    value={[50]}
                    onChange={() => {}}
                    showValue
                  />
                </SettingSection>
              </>
            )}

            {/* Gameplay Settings */}
            {activeCategory === "gameplay" && (
              <>
                <SettingSection title="Combat Feedback">
                  <ToggleSetting
                    label="Hitmarkers"
                    description="Show visual feedback when hitting enemies"
                    enabled={hitmarkers}
                    onChange={setHitmarkers}
                  />
                  <ToggleSetting
                    label="Damage Numbers"
                    description="Display damage values on hit"
                    enabled={damageNumbers}
                    onChange={setDamageNumbers}
                  />
                </SettingSection>

                <SettingSection title="Death">
                  <ToggleSetting
                    label="Killcam"
                    description="View your death from the killer's perspective"
                    enabled={killcam}
                    onChange={setKillcam}
                  />
                </SettingSection>
              </>
            )}

            {/* Notifications Settings */}
            {activeCategory === "notifications" && (
              <SettingSection title="Notifications">
                <ToggleSetting
                  label="Chat Messages"
                  description="Show chat notification sounds"
                  enabled={chatNotifications}
                  onChange={setChatNotifications}
                />
                <ToggleSetting
                  label="Team Updates"
                  description="Notifications for team events"
                  enabled={teamNotifications}
                  onChange={setTeamNotifications}
                />
                <ToggleSetting
                  label="Friend Activity"
                  description="When friends come online or invite you"
                  enabled={friendNotifications}
                  onChange={setFriendNotifications}
                />
              </SettingSection>
            )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

// Setting Section Component
function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#111922] border border-[rgba(255,255,255,0.05)] rounded-md p-5">
      <h3 className="text-sm font-bold text-[#00e0c6] tracking-wider mb-4">{title}</h3>
      <div className="space-y-5">{children}</div>
    </div>
  )
}

// Slider Setting Component
function SliderSetting({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  showValue = false,
  icon: Icon,
}: {
  label: string
  value: number[]
  onChange: (value: number[]) => void
  min?: number
  max?: number
  showValue?: boolean
  icon?: React.ElementType
}) {
  return (
    <div className="flex items-center gap-4">
      {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-foreground">{label}</span>
          {showValue && <span className="text-xs text-muted-foreground">{value[0]}</span>}
        </div>
        <Slider
          value={value}
          onValueChange={onChange}
          min={min}
          max={max}
          step={1}
          className="w-full"
        />
      </div>
    </div>
  )
}

// Toggle Setting Component
function ToggleSetting({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string
  description: string
  enabled: boolean
  onChange: (enabled: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={enabled} onCheckedChange={onChange} />
    </div>
  )
}

// Keybind Setting Component
function KeybindSetting({ label, currentKey }: { label: string; currentKey: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-foreground">{label}</span>
      <button className="px-4 py-2 rounded-md bg-[#0a0f16] border border-[rgba(255,255,255,0.05)] text-xs font-mono text-[#00e0c6] hover:bg-[rgba(255,255,255,0.03)] hover:border-[#00e0c6]/30 transition-colors">
        {currentKey}
      </button>
    </div>
  )
}
