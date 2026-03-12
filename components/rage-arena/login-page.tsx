"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Eye, EyeOff, User, Lock, Loader2 } from "lucide-react"

interface LoginPageProps {
  onLogin?: (username: string, password: string) => Promise<void>
  onSuccess?: () => void
  error?: string | null
}

export function LoginPage({ onLogin, onSuccess, error: externalError }: LoginPageProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!username.trim()) {
      setError("Username is required")
      return
    }
    if (!password.trim()) {
      setError("Password is required")
      return
    }

    setIsLoading(true)
    try {
      if (onLogin) {
        await onLogin(username, password)
      }
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const displayError = externalError || error

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Hex pattern overlay */}
        <div className="absolute inset-0 hex-pattern opacity-50" />
        
        {/* Atmospheric glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
        
        {/* Scanlines */}
        <div className="absolute inset-0 scanline opacity-30" />
      </div>

      {/* Login Container */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4 w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 glow-cyan">
              <span className="text-primary font-bold text-3xl tracking-tighter">RA</span>
            </div>
            <div className="absolute -inset-2 bg-primary/20 rounded-lg blur-xl -z-10" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-wider text-foreground">
              RAGE <span className="text-primary text-glow-cyan">ARENA</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1 tracking-wide">
              COMPETITIVE PVP
            </p>
          </div>
        </div>

        {/* Login Panel */}
        <div className="glass-panel rounded-xl w-full overflow-hidden">
          {/* Panel Header */}
          <div className="bg-surface-2 px-6 py-3 border-b border-border/50">
            <h2 className="text-sm font-bold text-foreground tracking-wider">
              AUTHENTICATE
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Error Message */}
            {displayError && (
              <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30">
                <p className="text-sm text-destructive font-medium">{displayError}</p>
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground tracking-wider font-medium">
                USERNAME
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  disabled={isLoading}
                  className={cn(
                    "w-full pl-10 pr-4 py-3 rounded-lg",
                    "bg-surface-1 border border-border",
                    "text-foreground placeholder:text-muted-foreground/50",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
                    "transition-all duration-200",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground tracking-wider font-medium">
                PASSWORD
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  disabled={isLoading}
                  className={cn(
                    "w-full pl-10 pr-12 py-3 rounded-lg",
                    "bg-surface-1 border border-border",
                    "text-foreground placeholder:text-muted-foreground/50",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
                    "transition-all duration-200",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:cursor-not-allowed"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full py-3 rounded-lg font-bold tracking-wider text-sm",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "relative overflow-hidden group"
              )}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  CONNECTING...
                </span>
              ) : (
                <>
                  <span className="relative z-10">LOGIN</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground/60 tracking-wide">
          RAGE ARENA v1.0 - TACTICAL COMBAT SYSTEM
        </p>
      </div>
    </div>
  )
}
