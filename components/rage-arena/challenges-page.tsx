"use client"

import { cn } from "@/lib/utils"
import { Target, Clock, Gift, CheckCircle2, Crosshair, Trophy, Skull, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Challenge {
  id: string
  title: string
  description: string
  progress: number
  target: number
  reward: string
  rewardType: "xp" | "currency" | "item"
  completed: boolean
  claimed: boolean
  icon: React.ElementType
}

const dailyChallenges: Challenge[] = [
  {
    id: "d1",
    title: "Eliminator",
    description: "Get 15 kills in any mode",
    progress: 12,
    target: 15,
    reward: "500 XP",
    rewardType: "xp",
    completed: false,
    claimed: false,
    icon: Crosshair,
  },
  {
    id: "d2",
    title: "Victorious",
    description: "Win 3 matches",
    progress: 3,
    target: 3,
    reward: "750 XP",
    rewardType: "xp",
    completed: true,
    claimed: false,
    icon: Trophy,
  },
  {
    id: "d3",
    title: "Headhunter",
    description: "Get 5 headshot kills",
    progress: 5,
    target: 5,
    reward: "300 XP",
    rewardType: "xp",
    completed: true,
    claimed: true,
    icon: Target,
  },
]

const weeklyChallenges: Challenge[] = [
  {
    id: "w1",
    title: "Massacre",
    description: "Get 100 kills in Hopouts",
    progress: 67,
    target: 100,
    reward: "2500 XP",
    rewardType: "xp",
    completed: false,
    claimed: false,
    icon: Skull,
  },
  {
    id: "w2",
    title: "Champion",
    description: "Win 15 matches in any mode",
    progress: 8,
    target: 15,
    reward: "3000 XP",
    rewardType: "xp",
    completed: false,
    claimed: false,
    icon: Trophy,
  },
  {
    id: "w3",
    title: "Gun Master",
    description: "Complete 5 Gun Game matches",
    progress: 2,
    target: 5,
    reward: "1500 XP",
    rewardType: "xp",
    completed: false,
    claimed: false,
    icon: Zap,
  },
]

export function ChallengesPage() {
  const dailyResetTime = "5h 32m"
  const weeklyResetTime = "4d 5h"

  return (
    <div className="h-full flex flex-col bg-[#0a0f16] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black tracking-wider text-foreground">
            DAILY <span className="text-[#00e0c6]">CHALLENGES</span>
          </h1>
          <p className="text-sm text-muted-foreground">Complete challenges to earn rewards</p>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="space-y-6 pr-4 max-w-3xl">
          {/* Daily Challenges Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-[#00e0c6]/10 border border-[#00e0c6]/30 flex items-center justify-center">
                  <Target className="w-5 h-5 text-[#00e0c6]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground tracking-wider">DAILY CHALLENGES</h3>
                  <p className="text-xs text-muted-foreground">Reset every 24 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-[#111922] border border-[rgba(255,255,255,0.05)] px-3 py-2 rounded-md">
                <Clock className="w-3.5 h-3.5" />
                <span>Resets in {dailyResetTime}</span>
              </div>
            </div>

            <div className="space-y-2">
              {dailyChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          </section>

          {/* Weekly Challenges Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-[#f39c12]/10 border border-[#f39c12]/30 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-[#f39c12]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground tracking-wider">WEEKLY CHALLENGES</h3>
                  <p className="text-xs text-muted-foreground">Reset every week</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-[#111922] border border-[rgba(255,255,255,0.05)] px-3 py-2 rounded-md">
                <Clock className="w-3.5 h-3.5" />
                <span>Resets in {weeklyResetTime}</span>
              </div>
            </div>

            <div className="space-y-2">
              {weeklyChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  )
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const Icon = challenge.icon
  const progressPercent = (challenge.progress / challenge.target) * 100

  return (
    <div
      className={cn(
        "bg-[#111922] border border-[rgba(255,255,255,0.05)] rounded-md p-4 transition-all",
        challenge.claimed && "opacity-50"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className={cn(
          "w-12 h-12 rounded-md flex items-center justify-center shrink-0 border",
          challenge.completed 
            ? "bg-[#2ecc71]/10 border-[#2ecc71]/30" 
            : "bg-[#0a0f16] border-[rgba(255,255,255,0.05)]"
        )}>
          {challenge.completed ? (
            <CheckCircle2 className="w-6 h-6 text-[#2ecc71]" />
          ) : (
            <Icon className="w-6 h-6 text-[#00e0c6]" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-bold text-foreground text-sm truncate">{challenge.title}</h4>
            <div className="flex items-center gap-2">
              <Gift className="w-3.5 h-3.5 text-[#f39c12]" />
              <span className="text-xs font-medium text-[#f39c12]">{challenge.reward}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{challenge.description}</p>
          
          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-[#0a0f16] rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all rounded-full",
                  challenge.completed ? "bg-[#2ecc71]" : "bg-[#00e0c6]"
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-mono text-muted-foreground shrink-0">
              {challenge.progress}/{challenge.target}
            </span>
          </div>
        </div>

        {/* Action */}
        {challenge.completed && !challenge.claimed && (
          <Button 
            size="sm" 
            className="shrink-0 h-8 px-4 bg-[#2ecc71] hover:bg-[#2ecc71]/90 text-[#0a0f16] text-xs font-bold tracking-wider rounded-md"
          >
            CLAIM
          </Button>
        )}
        {challenge.claimed && (
          <span className="text-xs text-muted-foreground shrink-0">CLAIMED</span>
        )}
      </div>
    </div>
  )
}
