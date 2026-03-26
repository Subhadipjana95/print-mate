import { ScanFace } from "lucide-react"

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/6 bg-[#0a0a0a]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-6">
        {/* <div className="w-7 h-7 rounded-md bg-linear-to-br from-yellow-600 to-yellow-700 flex items-center justify-center">
              <ScanFace className="w-4 h-4 text-black" />
            </div> */}
        <div className="flex h-10 w-10 items-center justify-center rounded-md border">
          <img
            src="/icon.svg"
            alt="Website Icon"
            className="h-full w-full object-cover"
          />
        </div>
        <span className="text-lg font-medium tracking-tight text-amber-500/80">
          PrintSyte
        </span>
        <div className="flex-1" />
        <span className="group text-xs md:text-sm text-zinc-500">
          Built with 💛 by{" "}
          <a
            href="https://www.facebook.com/subhadip.jana.570998"
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-500/80 group-hover:underline"
          >
            Subhadip
          </a>
        </span>
      </div>
    </header>
  )
}
