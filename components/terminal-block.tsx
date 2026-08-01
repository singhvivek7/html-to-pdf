const lines = [
  { prompt: "$", text: "curl -u $CLIENT_ID:$CLIENT_SECRET \\", color: "#8890A3" },
  { prompt: " ", text: "  -X POST https://renderpdf.vercel.app/api/convert \\", color: "#8890A3" },
  { prompt: " ", text: `  -d '{"html":"<h1>invoice</h1>","options":{"format":"A4"}}' \\`, color: "#8890A3" },
  { prompt: " ", text: "  -o output.pdf", color: "#8890A3" },
  { prompt: ">", text: "200 OK · application/pdf", color: "#4ADE80" },
];

export function TerminalBlock() {
  return (
    <div
      className="overflow-hidden rounded-2xl border shadow-2xl"
      style={{ borderColor: "rgba(255,255,255,0.09)", background: "#12161F" }}
    >
      <div
        className="flex items-center gap-2 border-b px-4 py-3"
        style={{ borderColor: "rgba(255,255,255,0.09)", background: "#181D28" }}
      >
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-green-500/80" />
        </div>
        <span className="ml-2 font-mono-accent text-xs" style={{ color: "#8890A3" }}>
          zsh
        </span>
      </div>
      <div className="space-y-1.5 p-6 font-mono-accent text-sm">
        {lines.map((line, i) => (
          <div key={i}>
            <span style={{ color: "#8890A3" }}>{line.prompt} </span>
            <span style={{ color: line.color }}>{line.text}</span>
          </div>
        ))}
        <span className="inline-block h-4 w-2 animate-pulse" style={{ backgroundColor: "#6E7BFF" }} />
      </div>
    </div>
  );
}
