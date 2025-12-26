import { Badge } from "@/components/ui/badge"

export function Footer() {
  return (
    <footer className="w-full py-12 px-4 border-t border-border mt-20 bg-cabinet/50">
      <div className="max-w-7xl mx-auto">
        {/* Credits section - arcade style */}
        <div className="text-center mb-8">
          <Badge variant="level" className="mb-4">
            CREDITS
          </Badge>
          <p className="font-mono text-sm text-muted-foreground">
            ROAD TO WEB3 &copy; 2025
          </p>
        </div>

        {/* Links */}
        <div className="flex justify-center items-center gap-6 font-mono text-sm">
          <FooterLink href="https://github.com" label="GITHUB" />
          <Separator />
          <FooterLink href="https://sepolia.etherscan.io" label="SEPOLIA" />
          <Separator />
          <FooterLink href="https://amoy.polygonscan.com" label="POLYGON" />
        </div>

        {/* Insert coin message */}
        <div className="mt-10 text-center">
          <p className="font-mono text-xs text-steel tracking-widest animate-neon-pulse">
            INSERT COIN TO CONTINUE
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-muted-foreground hover:text-primary transition-colors duration-200 hover:text-neon-cyan"
    >
      {label}
    </a>
  )
}

function Separator() {
  return <span className="text-bezel">•</span>
}
