import { Sparkles } from "lucide-react"
import { BorderBeam } from "../ui/border-beam"

export function HeroSection() {
  return (
    <section className="space-y-3">
      <div className="relative inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 text-xs text-amber-400/80">
        <BorderBeam
          size={40}
          initialOffset={20}
          className="from-transparent via-amber-500 to-transparent"
          transition={{
            type: "spring",
            stiffness: 10,
            damping: 60,
          }}
        />
        <Sparkles className="h-3 w-3" />
        Powered by remove.bg
      </div>
      <h1 className="text-4xl leading-tight font-medium tracking-tight sm:text-5xl">
        Professional <span className="text-gradient">Passport Photos </span>
        <br className="hidden md:block" />
        in seconds.
      </h1>
      <p className="max-w-xl text-lg text-zinc-400 md:tracking-tight">
        Upload once — background removed automatically, laid out on a
        print-ready sheet. Download, copy, or print directly.
      </p>
    </section>
  )
}
