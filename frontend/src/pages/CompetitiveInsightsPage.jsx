import { BarChart3, ShieldQuestion } from "lucide-react";
import { Card } from "@/components/card";
import { EmptyState } from "@/components/empty-state";
import { useLeadWorkspace } from "@/hooks/useLeadWorkspace";

export function CompetitiveInsightsPage() {
  const { selectedLead, competitiveOutput, runPipeline } = useLeadWorkspace();

  if (!competitiveOutput) {
    return (
      <div className="space-y-6">
        <Card>
          <p className="text-xs uppercase tracking-[0.3em] text-accent-cyan">Competitive agent</p>
          <h1 className="mt-4 font-display text-4xl font-bold text-white">Competitive Insights</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">This page reads from `competitive_agent` output. The backend only generates it when the deal agent flags high risk and injects a competitor signal.</p>
        </Card>
        <EmptyState
          icon={ShieldQuestion}
          title="No battlecard generated"
          description="No competitive output exists for the selected lead. That usually means the backend did not classify the deal as high risk during the latest run."
          actionLabel="Run pipeline again"
          onAction={runPipeline}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <p className="text-xs uppercase tracking-[0.3em] text-accent-cyan">Competitive agent</p>
        <h1 className="mt-4 font-display text-4xl font-bold text-white">Competitive Insights</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
          Live battlecard for {selectedLead?.company || "the selected lead"}, using the backend's competitor signal and `competitive_agent` strategy output.
        </p>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Competitor in play</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-white">{competitiveOutput.competitor}</h2>
          <div className="mt-6 rounded-[24px] border border-line bg-white/[0.03] p-5 text-sm leading-7 text-slate-200">
            {competitiveOutput.strategy}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.28em] text-slate-500">
            <BarChart3 className="h-4 w-4 text-accent-orange" />
            Talking points
          </div>
          <div className="mt-5 grid gap-3">
            {competitiveOutput.talking_points.map((point) => (
              <div key={point} className="rounded-[22px] border border-line bg-slate-950/40 p-4 text-sm leading-7 text-slate-200">
                {point}
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
