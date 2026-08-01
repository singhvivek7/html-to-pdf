const DIM = "text-[#A29A8C]";
const PAPER = "text-[#EFE9DD]";
const FLAG = "text-[#D9915A]";
const VAR = "text-[#C4763B]";
const KEY = "text-[#C4763B]";

const lines: { prompt: string; tokens: { t: string; c: string }[] }[] = [
  {
    prompt: "$",
    tokens: [
      { t: "curl", c: `${PAPER} font-semibold` },
      { t: " ", c: "" },
      { t: "-u", c: FLAG },
      { t: " ", c: "" },
      { t: "$CLIENT_ID:$CLIENT_SECRET", c: VAR },
      { t: " \\", c: DIM },
    ],
  },
  {
    prompt: " ",
    tokens: [
      { t: "  ", c: "" },
      { t: "-X", c: FLAG },
      { t: " ", c: "" },
      { t: "POST", c: PAPER },
      { t: " ", c: "" },
      { t: "https://renderpdf.vercel.app/api/convert", c: PAPER },
      { t: " \\", c: DIM },
    ],
  },
  {
    prompt: " ",
    tokens: [
      { t: "  ", c: "" },
      { t: "-d", c: FLAG },
      { t: " '{", c: DIM },
      { t: '"html"', c: KEY },
      { t: ":", c: DIM },
      { t: '"<h1>invoice</h1>"', c: PAPER },
      { t: ",", c: DIM },
      { t: '"options"', c: KEY },
      { t: ":{", c: DIM },
      { t: '"format"', c: KEY },
      { t: ":", c: DIM },
      { t: '"A4"', c: PAPER },
      { t: "}}' \\", c: DIM },
    ],
  },
  {
    prompt: " ",
    tokens: [
      { t: "  ", c: "" },
      { t: "-o", c: FLAG },
      { t: " output.pdf", c: PAPER },
    ],
  },
  {
    prompt: ">",
    tokens: [
      { t: "200", c: `${VAR} font-semibold` },
      { t: " OK · application/pdf", c: DIM },
    ],
  },
];

export function TerminalBlock() {
  return (
    <div className="overflow-hidden border border-[#EFE9DD]/[0.12] bg-[#242220] shadow-2xl">
      <div className="flex items-center gap-2 border-b border-[#EFE9DD]/[0.12] bg-[#1C1B19] px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[#8C5228]" />
          <div className="h-3 w-3 rounded-full bg-[#C4763B]" />
          <div className="h-3 w-3 rounded-full bg-[#EFE9DD] opacity-40" />
        </div>
        <span className="ml-2 font-mono-accent text-xs text-[#A29A8C]">zsh</span>
      </div>
      <div className="space-y-1.5 p-6 font-mono-accent text-sm">
        {lines.map((line, i) => (
          <div key={i}>
            <span className="text-[#A29A8C]">{line.prompt} </span>
            {line.tokens.map((tok, j) => (
              <span key={j} className={tok.c}>
                {tok.t}
              </span>
            ))}
          </div>
        ))}
        <span className="inline-block h-4 w-2 animate-pulse bg-[#C4763B]" />
      </div>
    </div>
  );
}
