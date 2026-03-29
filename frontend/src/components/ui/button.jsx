import { cn } from "@/lib/utils";

export function Button({ className = "", variant = "default", size = "md", ...props }) {
  const variants = {
    default: "bg-white text-slate-950 hover:bg-slate-100",
    secondary: "bg-slate-900/70 text-slate-100 hover:bg-slate-800/80 border border-line",
    ghost: "bg-transparent text-slate-200 hover:bg-white/5",
    accent: "bg-gradient-to-r from-accent-cyan via-accent-teal to-accent-orange text-slate-950 hover:opacity-90",
    danger: "bg-rose-500/15 text-rose-200 hover:bg-rose-500/25 border border-rose-400/20",
  };

  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4 text-sm",
    lg: "h-12 px-5 text-sm",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
