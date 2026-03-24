import { ScanFace } from "lucide-react";

export function AppHeader() {
  return (
    <header className="border-b border-white/6 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-3">
        <div className="w-7 h-7 rounded-md bg-linear-to-br from-yellow-600 to-yellow-700 flex items-center justify-center">
          <ScanFace className="w-4 h-4 text-black" />
        </div>
        <span className="font-medium text-lg tracking-tight text-amber-500/80">PrintMate</span>
        <div className="flex-1" />
        <span className="md:hidden text-xs text-zinc-500 group">Built with 💛 by <a href="https://www.facebook.com/subhadip.jana.570998/" target="_blank" rel="noopener noreferrer" className="text-yellow-500/80 group-hover:underline">Subhadip</a></span>
        <span className="text-xs text-zinc-500 hidden sm:block">
          Passport Photo Generator
        </span>
      </div>
    </header>
  );
}
