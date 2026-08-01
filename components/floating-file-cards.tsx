const cards = [
  { file: "invoice.pdf", action: "converted", accentClass: "text-[#C4763B]", dotClass: "bg-[#C4763B]", className: "floating-card-a" },
  { file: "report.pdf", action: "styled", accentClass: "text-[#D9915A]", dotClass: "bg-[#D9915A]", className: "floating-card-b" },
  { file: "output.pdf", action: "ready", accentClass: "text-[#8C5228]", dotClass: "bg-[#8C5228]", className: "floating-card-c" },
];

export function FloatingFileCards() {
  return (
    <div className="relative h-[380px] w-full [perspective:1400px]">
      {cards.map((card, i) => (
        <div
          key={card.file}
          className={`${card.className} absolute left-1/2 top-1/2 w-[260px] border border-[#EFE9DD]/[0.12] bg-[#242220]/90 p-5 font-mono text-sm shadow-2xl backdrop-blur-md`}
          style={{ zIndex: cards.length - i }}
        >
          <div className="mb-3 flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${card.dotClass}`} />
            <span className="text-[#A29A8C]">{card.file}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#EFE9DD]">status</span>
            <span className={card.accentClass}>{card.action}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
