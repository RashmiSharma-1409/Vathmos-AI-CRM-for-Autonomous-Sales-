import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/card";
import { Badge } from "@/components/ui/badge";

export function MetricBox({ icon: Icon, label, value, caption, tone = "cyan", trend }) {
  return (
    <Card className="h-full">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/6 text-white">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-slate-400">{label}</p>
            <h3 className="mt-1 font-display text-3xl font-bold tracking-tight text-white">{value}</h3>
          </div>
        </div>
        {trend ? <Badge tone={tone}>{trend}</Badge> : null}
      </div>
      {caption ? (
        <div className="mt-5 flex items-center gap-2 text-sm text-slate-300">
          <ArrowUpRight className="h-4 w-4 text-accent-teal" />
          <span>{caption}</span>
        </div>
      ) : null}
    </Card>
  );
}
