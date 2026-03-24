import { Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="space-y-3">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-xs text-amber-400/80">
        <Sparkles className="w-3 h-3" />
        Powered by remove.bg AI
      </div>
      <h1 className="text-4xl sm:text-5xl font-medium tracking-tight leading-tight">
        Professional <span className="text-gradient">Passport Photos </span>
        <br className="hidden md:block" />
        in seconds.
      </h1>
      <p className="text-zinc-400 text-lg max-w-xl md:tracking-tight">
        Upload once — background removed automatically, laid out on a
        print-ready sheet. Download, copy, or print directly.
      </p>
    </section>
  );
}
