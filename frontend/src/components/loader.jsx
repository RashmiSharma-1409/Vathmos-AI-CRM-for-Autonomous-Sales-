import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function Loader({ className = "", label = "Loading" }) {
  return (
    <div className={cn("flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-[28px] border border-line bg-white/[0.03] text-slate-300", className)}>
      <LoaderCircle className="h-6 w-6 animate-spin text-accent-cyan" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
