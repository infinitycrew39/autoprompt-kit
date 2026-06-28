import { brandName } from "@/lib/site-data";

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-8">
      <div className="container flex flex-col items-center justify-between gap-3 text-center text-xs text-slate-400 sm:flex-row sm:text-left">
        <p>© {new Date().getFullYear()} {brandName}. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a className="transition-colors hover:text-cyan-300" href="#faq">
            FAQ
          </a>
          <a className="transition-colors hover:text-cyan-300" href="#pricing">
            Pricing
          </a>
          <a className="transition-colors hover:text-cyan-300" href="#hero">
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
