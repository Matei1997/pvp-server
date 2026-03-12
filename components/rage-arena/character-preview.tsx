"use client"

import { cn } from "@/lib/utils"
import { User } from "lucide-react"

interface CharacterPreviewProps {
  className?: string
  showWeapon?: boolean
  characterName?: string
  title?: string
}

export function CharacterPreview({
  className,
  showWeapon = true,
  characterName = "GHOST_001",
  title = "DIAMOND ENFORCER",
}: CharacterPreviewProps) {
  return (
    <div className={cn("relative w-full h-full min-h-[400px] flex items-center justify-center", className)}>
      {/* Background environment */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid floor */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 tactical-grid opacity-30" 
          style={{ 
            perspective: "500px",
            transform: "rotateX(60deg)",
            transformOrigin: "bottom"
          }} 
        />
        
        {/* Ambient glow */}
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-96 h-32 bg-cyan/20 blur-3xl rounded-full" />
      </div>

      {/* Character silhouette placeholder */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Character figure */}
        <div className="relative">
          {/* Glow effect behind character */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 bg-cyan/10 rounded-full blur-2xl" />
          </div>
          
          {/* Character placeholder - tactical figure */}
          <div className="relative w-64 h-80 flex items-center justify-center">
            <svg
              viewBox="0 0 200 300"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Head */}
              <ellipse cx="100" cy="45" rx="28" ry="32" className="fill-surface-3 stroke-border" strokeWidth="2" />
              
              {/* Helmet visor */}
              <path
                d="M75 40 Q100 35 125 40 Q130 50 125 60 Q100 65 75 60 Q70 50 75 40"
                className="fill-cyan/30 stroke-cyan/50"
                strokeWidth="1"
              />
              
              {/* Neck */}
              <rect x="88" y="75" width="24" height="20" className="fill-surface-3" />
              
              {/* Torso */}
              <path
                d="M60 95 L140 95 L145 180 L55 180 Z"
                className="fill-surface-2 stroke-border"
                strokeWidth="2"
              />
              
              {/* Tactical vest details */}
              <rect x="70" y="105" width="60" height="40" rx="4" className="fill-surface-3 stroke-border" strokeWidth="1" />
              <rect x="75" y="110" width="20" height="12" rx="2" className="fill-cyan/20" />
              <rect x="105" y="110" width="20" height="12" rx="2" className="fill-cyan/20" />
              <rect x="75" y="128" width="50" height="8" rx="2" className="fill-surface-1" />
              
              {/* Arms */}
              <path
                d="M60 95 L40 100 L35 160 L50 165 L55 115"
                className="fill-surface-2 stroke-border"
                strokeWidth="2"
              />
              <path
                d="M140 95 L160 100 L165 160 L150 165 L145 115"
                className="fill-surface-2 stroke-border"
                strokeWidth="2"
              />
              
              {/* Weapon in hand */}
              {showWeapon && (
                <g>
                  <rect x="155" y="140" width="45" height="12" rx="2" className="fill-surface-1 stroke-border" strokeWidth="1" />
                  <rect x="165" y="130" width="8" height="25" rx="1" className="fill-surface-3" />
                  <rect x="185" y="142" width="15" height="8" className="fill-surface-3" />
                </g>
              )}
              
              {/* Legs */}
              <path
                d="M55 180 L60 280 L80 280 L85 190 L100 195 L115 190 L120 280 L140 280 L145 180 Z"
                className="fill-surface-3 stroke-border"
                strokeWidth="2"
              />
              
              {/* Belt */}
              <rect x="55" y="175" width="90" height="10" className="fill-surface-1 stroke-border" strokeWidth="1" />
              <rect x="95" y="172" width="10" height="16" rx="2" className="fill-cyan/30 stroke-cyan/50" strokeWidth="1" />
              
              {/* Knee pads */}
              <ellipse cx="70" cy="230" rx="12" ry="15" className="fill-surface-1" />
              <ellipse cx="130" cy="230" rx="12" ry="15" className="fill-surface-1" />
            </svg>
          </div>
          
          {/* Platform */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-4">
            <div className="w-full h-full bg-gradient-to-t from-cyan/30 to-transparent rounded-full blur-sm" />
          </div>
        </div>

        {/* Character info */}
        <div className="mt-6 text-center">
          <h3 className="text-xl font-bold tracking-wider text-foreground">{characterName}</h3>
          <p className="text-sm text-cyan tracking-widest mt-1">{title}</p>
        </div>
      </div>

      {/* Scanline effect */}
      <div className="absolute inset-0 scanline opacity-50 pointer-events-none" />
    </div>
  )
}
