"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { 
  Users, 
  UserPlus, 
  Crown, 
  Mic, 
  MicOff, 
  Check, 
  X,
  Copy,
  LogOut
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface PartyMember {
  id: string
  name: string
  isLeader: boolean
  isReady: boolean
  isSpeaking: boolean
  isMuted: boolean
  rank?: string
}

interface PartyPanelProps {
  members?: PartyMember[]
  maxSize?: number
  partyCode?: string
  isLeader?: boolean
  onInvite?: () => void
  onLeave?: () => void
  onKick?: (memberId: string) => void
  onToggleReady?: () => void
}

const mockMembers: PartyMember[] = [
  { id: "1", name: "GHOST_001", isLeader: true, isReady: true, isSpeaking: false, isMuted: false, rank: "Diamond II" },
  { id: "2", name: "xShadow", isLeader: false, isReady: true, isSpeaking: true, isMuted: false, rank: "Gold I" },
  { id: "3", name: "NightWolf", isLeader: false, isReady: false, isSpeaking: false, isMuted: true, rank: "Platinum III" },
]

export function PartyPanel({
  members = mockMembers,
  maxSize = 5,
  partyCode = "RAGE-X7K9",
  isLeader = true,
  onInvite,
  onLeave,
  onKick,
  onToggleReady,
}: PartyPanelProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyCode = () => {
    navigator.clipboard.writeText(partyCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const currentMember = members.find(m => m.isLeader) || members[0]
  const isReady = currentMember?.isReady

  return (
    <div className="w-60 h-full flex flex-col bg-[#111922] border-l border-[rgba(255,255,255,0.05)]">
      {/* Header */}
      <div className="p-4 border-b border-[rgba(255,255,255,0.05)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#00e0c6]" />
            <span className="text-xs font-bold text-foreground tracking-wider">PARTY</span>
          </div>
          <span className="text-xs text-muted-foreground">{members.length}/{maxSize}</span>
        </div>
        
        {/* Party Code */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-[#0a0f16] rounded-md px-3 py-1.5 border border-[rgba(255,255,255,0.05)]">
            <span className="text-xs text-muted-foreground">Code: </span>
            <span className="text-xs font-mono text-[#00e0c6]">{partyCode}</span>
          </div>
          <button
            onClick={handleCopyCode}
            className="p-2 rounded-md bg-[#0a0f16] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)] transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-[#2ecc71]" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Members List */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className={cn(
                "flex items-center gap-2.5 p-2.5 rounded-md transition-colors",
                "bg-[#0a0f16] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)]"
              )}
            >
              {/* Avatar placeholder */}
              <div className="relative">
                <div className="w-8 h-8 rounded-md bg-[#1a2332] border border-[rgba(255,255,255,0.05)] flex items-center justify-center">
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {member.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                {member.isLeader && (
                  <Crown className="absolute -top-1 -right-1 w-3 h-3 text-[#f39c12]" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-foreground truncate">
                    {member.name}
                  </span>
                  {member.isSpeaking && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2ecc71] animate-pulse" />
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground">{member.rank}</span>
              </div>

              {/* Status indicators */}
              <div className="flex items-center gap-1">
                {/* Voice status */}
                {member.isMuted ? (
                  <MicOff className="w-3 h-3 text-[#e74c3c]" />
                ) : (
                  <Mic className={cn(
                    "w-3 h-3",
                    member.isSpeaking ? "text-[#2ecc71]" : "text-muted-foreground"
                  )} />
                )}
                
                {/* Ready status */}
                <div className={cn(
                  "w-4 h-4 rounded-md flex items-center justify-center",
                  member.isReady 
                    ? "bg-[#2ecc71]/20 text-[#2ecc71]" 
                    : "bg-[#1a2332] text-muted-foreground"
                )}>
                  {member.isReady ? (
                    <Check className="w-2.5 h-2.5" />
                  ) : (
                    <X className="w-2.5 h-2.5" />
                  )}
                </div>

                {/* Kick button (for leader only, not self) */}
                {isLeader && !member.isLeader && (
                  <button
                    onClick={() => onKick?.(member.id)}
                    className="p-1 rounded-md hover:bg-[#e74c3c]/20 text-muted-foreground hover:text-[#e74c3c] transition-colors"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: maxSize - members.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex items-center justify-center p-2.5 rounded-md border border-dashed border-[rgba(255,255,255,0.1)] text-muted-foreground"
            >
              <span className="text-[10px]">Empty Slot</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 border-t border-[rgba(255,255,255,0.05)] space-y-2">
        <Button
          onClick={onInvite}
          className="w-full h-8 bg-[#00e0c6]/10 text-[#00e0c6] border border-[#00e0c6]/30 hover:bg-[#00e0c6]/20 font-medium text-xs tracking-wider rounded-md"
        >
          <UserPlus className="w-3.5 h-3.5 mr-1.5" />
          INVITE PLAYER
        </Button>
        
        <div className="flex gap-2">
          <Button
            onClick={onToggleReady}
            className={cn(
              "flex-1 h-8 font-medium text-xs tracking-wider rounded-md",
              isReady
                ? "bg-[#2ecc71]/10 text-[#2ecc71] border border-[#2ecc71]/30 hover:bg-[#2ecc71]/20"
                : "bg-[#0a0f16] text-foreground border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)]"
            )}
          >
            {isReady ? "READY" : "NOT READY"}
          </Button>
          
          <Button
            onClick={onLeave}
            variant="outline"
            className="h-8 px-3 text-[#e74c3c] border-[#e74c3c]/30 hover:bg-[#e74c3c]/10 rounded-md"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
