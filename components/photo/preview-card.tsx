interface PreviewCardProps {
  title: string;
  url: string;
  placeholder: string;
  transparent: boolean;
}

export function PreviewCard({
  title,
  url,
  placeholder,
  transparent,
}: PreviewCardProps) {
  return (
    <div className="lg:col-span-1 rounded-lg border border-white/6 bg-white/2 p-4 flex flex-col gap-3 min-h-[220px]">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
        {title}
      </p>
      <div
        className={`flex-1 rounded-sm flex items-center justify-center overflow-hidden ${
          transparent ? "transparent-checker" : "bg-white/3"
        }`}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={title}
            className="w-full h-full object-contain max-h-40"
          />
        ) : (
          <span className="text-xs text-zinc-600">{placeholder}</span>
        )}
      </div>

      {/* Scoped checker-board style for transparent backgrounds */}
      <style jsx>{`
        .transparent-checker {
          background-image: linear-gradient(45deg, #1e1e1e 25%, transparent 25%),
            linear-gradient(-45deg, #1e1e1e 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #1e1e1e 75%),
            linear-gradient(-45deg, transparent 75%, #1e1e1e 75%);
          background-size: 16px 16px;
          background-position:
            0 0,
            0 8px,
            8px -8px,
            -8px 0px;
          background-color: #111;
        }
      `}</style>
    </div>
  );
}
