import { cn } from "@/lib/utils";

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={cn(
        "min-h-[140px] w-full rounded-2xl border border-line bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-accent-cyan/60 focus:bg-white/[0.08]",
        className,
      )}
      {...props}
    />
  );
}
