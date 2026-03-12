"use client"

import { cn } from "@/lib/utils"
import { Star, Lock, Gift, ChevronRight, ChevronLeft, Check } from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

interface SeasonReward {
  tier: number
  name: string
  type: "weapon" | "skin" | "title" | "emote" | "xp"
  rarity: "common" | "rare" | "epic" | "legendary"
  unlocked: boolean
  claimed: boolean
}

const seasonRewards: SeasonReward[] = Array.from({ length: 50 }, (_, i) => ({
  tier: i + 1,
  name: i % 5 === 0 ? "Legendary Weapon Skin" : i % 3 === 0 ? "Epic Title" : i % 2 === 0 ? "Rare Emote" : "XP Boost",
  type: i % 5 === 0 ? "skin" : i % 3 === 0 ? "title" : i % 2 === 0 ? "emote" : "xp",
  rarity: i % 5 === 0 ? "legendary" : i % 3 === 0 ? "epic" : i % 2 === 0 ? "rare" : "common",
  unlocked: i < 24,
  claimed: i < 22,
}))

const rarityColors = {
  common: "border-white/10 bg-black/20",
  rare: "border-cyan/30 bg-cyan/10",
  epic: "border-purple-500/30 bg-purple-500/10",
  legendary: "border-amber-400/30 bg-amber-400/10",
}

const rarityTextColors = {
  common: "text-muted-foreground",
  rare: "text-cyan",
  epic: "text-purple-400",
  legendary: "text-amber-400",
}

export function SeasonPage() {
  const currentTier = 24
  const currentXP = 3450
  const tierXP = 5000
  const seasonNumber = 3
  const seasonName = "OPERATION SHADOWFALL"
  const daysRemaining = 42

  const xpProgress = (currentXP / tierXP) * 100

  return (
    <div className="h-full flex flex-col bg-[#0a0f16] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="px-3 py-1 text-xs font-bold tracking-wider bg-[#00e0c6]/10 text-[#00e0c6] rounded-md border border-[#00e0c6]/30">
              SEASON {seasonNumber}
            </span>
            <span className="text-xs text-muted-foreground">{daysRemaining} days remaining</span>
          </div>
          <h1 className="text-xl font-black tracking-wider text-foreground">
            {seasonName}
          </h1>
        </div>

        {/* Current tier */}
        <div className="bg-[#111922] border border-[rgba(255,255,255,0.05)] rounded-md px-5 py-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-md bg-[#00e0c6]/10 border border-[#00e0c6]/30 flex items-center justify-center">
            <Star className="w-7 h-7 text-[#00e0c6]" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground tracking-wider">CURRENT TIER</p>
            <p className="text-2xl font-black text-[#00e0c6]">{currentTier}</p>
          </div>
        </div>
      </div>

      {/* XP Progress */}
      <div className="bg-[#111922] border border-[rgba(255,255,255,0.05)] rounded-md p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground tracking-wider">TIER PROGRESS</span>
          <span className="text-xs font-mono text-foreground">
            {currentXP.toLocaleString()} / {tierXP.toLocaleString()} XP
          </span>
        </div>
        <div className="h-2 bg-[#0a0f16] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#00e0c6] transition-all rounded-full"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          {(tierXP - currentXP).toLocaleString()} XP until Tier {currentTier + 1}
        </p>
      </div>

      {/* Rewards Track */}
      <div className="bg-[#111922] border border-[rgba(255,255,255,0.05)] rounded-md p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xs font-bold text-[#00e0c6] tracking-wider">SEASON REWARDS</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-md border-[rgba(255,255,255,0.05)] bg-[#0a0f16] hover:border-[rgba(255,255,255,0.1)]">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-md border-[rgba(255,255,255,0.05)] bg-[#0a0f16] hover:border-[rgba(255,255,255,0.1)]">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="w-full">
          <div className="flex gap-3 pb-3">
            {seasonRewards.map((reward) => (
              <RewardCard key={reward.tier} reward={reward} isCurrentTier={reward.tier === currentTier} />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Featured Rewards */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <FeaturedReward
          tier={25}
          name="Shadow Operative"
          description="Exclusive character skin"
          rarity="legendary"
        />
        <FeaturedReward
          tier={35}
          name="Void Walker"
          description="Animated weapon wrap"
          rarity="epic"
        />
        <FeaturedReward
          tier={50}
          name="Shadowfall Champion"
          description="Ultimate season reward"
          rarity="legendary"
        />
      </div>
    </div>
  )
}

function RewardCard({
  reward,
  isCurrentTier,
}: {
  reward: SeasonReward
  isCurrentTier: boolean
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center p-3 pt-5 rounded-md border w-[90px] shrink-0 transition-all",
        reward.unlocked ? rarityColors[reward.rarity] : "border-[rgba(255,255,255,0.05)] bg-[#111922]",
        isCurrentTier && "ring-2 ring-[#00e0c6] ring-offset-2 ring-offset-[#0a0f16]"
      )}
    >
      {/* Tier number - inside the card with proper spacing */}
      <div className={cn(
        "absolute top-1 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] font-bold rounded-md",
        reward.unlocked ? "bg-[#00e0c6] text-[#0a0f16]" : "bg-[#1a2332] text-muted-foreground border border-[rgba(255,255,255,0.05)]"
      )}>
        {reward.tier}
      </div>

      {/* Reward icon */}
      <div className={cn(
        "w-14 h-14 rounded-md flex items-center justify-center mb-2 border",
        "bg-[#0a0f16] border-[rgba(255,255,255,0.05)]"
      )}>
        {!reward.unlocked ? (
          <Lock className="w-5 h-5 text-muted-foreground" />
        ) : reward.claimed ? (
          <Check className="w-5 h-5 text-[#2ecc71]" />
        ) : (
          <Gift className={cn("w-5 h-5", rarityTextColors[reward.rarity])} />
        )}
      </div>

      {/* Reward name */}
      <p className={cn(
        "text-[10px] text-center font-medium truncate w-full",
        reward.unlocked ? rarityTextColors[reward.rarity] : "text-muted-foreground"
      )}>
        {reward.name}
      </p>

      {/* Claim button */}
      {reward.unlocked && !reward.claimed && (
        <Button 
          size="sm" 
          className="h-6 text-[9px] mt-2 w-full bg-[#00e0c6] text-[#0a0f16] hover:bg-[#00e0c6]/90 rounded-md font-bold"
        >
          CLAIM
        </Button>
      )}
    </div>
  )
}

function FeaturedReward({
  tier,
  name,
  description,
  rarity,
}: {
  tier: number
  name: string
  description: string
  rarity: "epic" | "legendary"
}) {
  return (
    <div className={cn(
      "bg-[#111922] rounded-md p-4 border transition-all hover:scale-[1.01]",
      rarityColors[rarity]
    )}>
      <div className="flex items-center justify-between mb-3">
        <span className={cn(
          "px-2.5 py-1 text-[10px] font-bold tracking-wider rounded-md border",
          rarity === "legendary" 
            ? "bg-[#f39c12]/10 text-[#f39c12] border-[#f39c12]/30" 
            : "bg-[#9b59b6]/10 text-[#9b59b6] border-[#9b59b6]/30"
        )}>
          TIER {tier}
        </span>
        <Star className={cn("w-4 h-4", rarityTextColors[rarity])} />
      </div>

      {/* Placeholder for reward preview */}
      <div className="h-24 w-full rounded-md mb-3 flex items-center justify-center border border-[rgba(255,255,255,0.05)] bg-[#0a0f16]">
        <Gift className={cn("w-10 h-10", rarityTextColors[rarity])} />
      </div>

      <h4 className={cn("font-bold text-sm", rarityTextColors[rarity])}>{name}</h4>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}
