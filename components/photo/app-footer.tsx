export function AppFooter() {
  return (
    <footer className="md:border-t border-white/6 md:mt-16 pb-8 pt-2 md:pt-8">
      <div className="relative max-w-5xl mx-auto px-6 flex items-center justify-between text-xs text-zinc-600 group">
        <span>© {new Date().getFullYear()} PrintMate. <span className="hidden md:inline-block">All rights reserved.</span></span>
        <span><span className="hidden md:inline-block">Background removal </span><span className="uppercase md:lowercase"> p</span>owered by <a href="https://www.remove.bg" target="_blank" rel="noopener noreferrer" className="text-yellow-500/70 group-hover:underline">remove.bg</a></span>
      </div>
      <div className="relative h-14 w-full md:hidden" />
    </footer>
  );
}
