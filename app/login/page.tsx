"use client"

import { useRouter } from "next/navigation"
import { LoginPage } from "@/components/rage-arena/login-page"

export default function Login() {
  const router = useRouter()

  const handleLogin = async (username: string, password: string) => {
    // Placeholder for actual authentication logic
    // This would be replaced with real backend authentication
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    // Simulate validation
    if (!username || !password) {
      throw new Error("Invalid credentials")
    }
  }

  const handleSuccess = () => {
    router.push("/")
  }

  return (
    <LoginPage
      onLogin={handleLogin}
      onSuccess={handleSuccess}
    />
  )
}
