import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { brandName, navItems } from "@/lib/site-data";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0A1428]/80 backdrop-blur-xl">
      <nav className="container flex h-16 items-center justify-between">
        <a href="#hero" className="inline-flex items-center gap-2 text-white">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#6366F1] to-[#22D3EE] text-white shadow-glow">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-display text-sm font-bold tracking-wide sm:text-base">{brandName}</span>
        </a>

        <div className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-slate-300 transition-colors hover:text-cyan-300"
            >
              {item.label}
            </a>
          ))}
        </div>

        <Button asChild size="sm">
          <a href="#pricing">Buy Now</a>
        </Button>
      </nav>
    </header>
  );
}
