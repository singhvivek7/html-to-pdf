export function AuroraBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div className="bg-grid absolute inset-0 opacity-40" />
      <div className="animate-float absolute left-1/2 top-[-10%] h-[700px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-orange-500/25 via-red-500/15 to-transparent blur-3xl" />
      <div className="animate-float-delayed absolute -right-40 top-1/3 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-purple-500/20 via-blue-500/10 to-transparent blur-3xl" />
      <div className="animate-float absolute -left-40 bottom-[-10%] h-[500px] w-[600px] rounded-full bg-gradient-to-tr from-red-500/15 via-orange-500/10 to-transparent blur-3xl" />
      <svg
        className="absolute inset-x-0 bottom-0 h-[420px] w-full opacity-70"
        viewBox="0 0 1440 420"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="aurora-a" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="oklch(0.75 0.18 40)" stopOpacity="0.35" />
            <stop offset="50%" stopColor="oklch(0.6 0.22 25)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="oklch(0.55 0.2 330)" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="aurora-b" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="oklch(0.55 0.2 330)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="oklch(0.7 0.15 200)" stopOpacity="0.12" />
          </linearGradient>
        </defs>
        <path
          d="M0,280 C240,200 480,340 720,260 C960,180 1200,300 1440,220 L1440,420 L0,420 Z"
          fill="url(#aurora-a)"
        />
        <path
          d="M0,340 C260,280 500,380 760,320 C1000,260 1220,360 1440,300 L1440,420 L0,420 Z"
          fill="url(#aurora-b)"
        />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
    </div>
  );
}
