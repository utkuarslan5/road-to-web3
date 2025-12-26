export function Footer() {
  return (
    <footer className="w-full py-8 px-4 border-t border-border mt-16">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-muted-foreground mb-4">
          Built with ❤️ for Road to Web3 · 2025
        </p>
        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
          <span>·</span>
          <a
            href="https://sepolia.etherscan.io"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Etherscan
          </a>
          <span>·</span>
          <a
            href="https://amoy.polygonscan.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Polygon Scan
          </a>
        </div>
      </div>
    </footer>
  )
}

