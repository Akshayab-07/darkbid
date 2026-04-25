import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { MailCheck, Menu } from "lucide-react"
import { WalletButton } from "@/components/shared/WalletButton"
import { ROUTES } from "@/lib/constants"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[rgba(8,11,20,0.85)] backdrop-blur-[12px] border-b border-border-default"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to={ROUTES.HOME} className="flex items-center gap-2 group">
          <MailCheck className="text-violet-500 w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="font-bold text-xl text-text-primary tracking-tight">DarkBid</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            to={ROUTES.DASHBOARD}
            className="text-text-muted hover:text-text-primary transition-colors text-sm font-medium"
          >
            Dashboard
          </Link>
          <Link
            to={ROUTES.LAUNCH}
            className="text-text-muted hover:text-text-primary transition-colors text-sm font-medium"
          >
            Launch Token
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <WalletButton />
          <Button variant="ghost" size="icon" className="md:hidden text-text-muted">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </nav>
  )
}
