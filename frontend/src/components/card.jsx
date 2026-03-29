import { cn } from "@/lib/utils";

export function Card({ className = "", children }) {
  return (
    <section className={cn("glass-panel surface-ring relative overflow-hidden rounded-[28px] p-5 sm:p-6", className)}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {children}
    </section>
  );
}
