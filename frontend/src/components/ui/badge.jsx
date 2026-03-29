import { cn } from "@/lib/utils";

export function Badge({ className = "", tone = "slate", children }) {
  const tones = {
    slate: "bg-slate-500/10 text-slate-300 border-slate-400/20",
    cyan: "bg-cyan-400/10 text-cyan-200 border-cyan-300/20",
    teal: "bg-emerald-400/10 text-emerald-200 border-emerald-300/20",
    amber: "bg-amber-400/10 text-amber-200 border-amber-300/20",
    rose: "bg-rose-400/10 text-rose-200 border-rose-300/20",
    lime: "bg-lime-400/10 text-lime-200 border-lime-300/20",
  };

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium", tones[tone] || tones.slate, className)}>
      {children}
    </span>
  );
}
