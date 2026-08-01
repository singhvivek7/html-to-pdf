const cards = [
  { file: "invoice.pdf", action: "converted", accent: "#6E7BFF", className: "floating-card-a" },
  { file: "report.pdf", action: "styled", accent: "#FF7A59", className: "floating-card-b" },
  { file: "output.pdf", action: "ready", accent: "#4ADE80", className: "floating-card-c" },
];

export function FloatingFileCards() {
  return (
    <div className="relative h-[380px] w-full [perspective:1400px]">
      {cards.map((card, i) => (
        <div
          key={card.file}
          className={`${card.className} absolute left-1/2 top-1/2 w-[260px] rounded-2xl border p-5 font-mono text-sm shadow-2xl backdrop-blur-md`}
          style={{
            borderColor: "rgba(255,255,255,0.09)",
            background: "rgba(24,29,40,0.85)",
            zIndex: cards.length - i,
          }}
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: card.accent }} />
            <span style={{ color: "#8890A3" }}>{card.file}</span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: "#E7E9EF" }}>status</span>
            <span style={{ color: card.accent }}>{card.action}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
