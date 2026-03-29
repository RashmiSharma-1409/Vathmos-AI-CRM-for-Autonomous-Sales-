import { AlertTriangle, Gauge, Goal, Lightbulb, MessagesSquare } from "lucide-react";
import { Card } from "@/components/card";
import { EmptyState } from "@/components/empty-state";
import { MetricBox } from "@/components/metric-box";
import { StatusPill } from "@/components/status-pill";
import { deriveCloseProbability, deriveRiskScore } from "@/lib/formatters";
import { useLeadWorkspace } from "@/hooks/useLeadWorkspace";

export function DealIntelligencePage() {
  const { selectedLead, dealOutput, competitiveOutput, runPipeline } = useLeadWorkspace();

  if (!dealOutput) {
    return (
      <div className="space-y-6">
        <Card>
          <p className="text-xs uppercase tracking-[0.3em] text-accent-cyan">Deal agent</p>
          <h1 className="mt-4 font-display text-4xl font-bold text-white">Deal Intelligence</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">This view maps directly to the backend's `deal_agent` output and only populates after the full `/run` pipeline completes.</p>
        </Card>
        <EmptyState
          icon={MessagesSquare}
          title="No deal analysis available"
          description="The Flask backend does not expose a standalone `/deal` route. It creates `deal_agent` output during `/run`, so this page waits for a pipeline execution before rendering risk, confidence, and recommendations."
          actionLabel="Run full pipeline"
          onAction={runPipeline}
        />
      </div>
    );
  }

  const riskScore = deriveRiskScore(dealOutput);
  const closeProbability = deriveCloseProbability(dealOutput);
  const engagement = dealOutput.engagement_context || {};

  return (
    <div className="space-y-6">
      <Card>
        <p className="text-xs uppercase tracking-[0.3em] text-accent-cyan">Deal agent</p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold text-white">Deal Intelligence</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
              Risk posture, confidence, and next-step recommendations for {selectedLead?.company || "the selected lead"}, sourced from `deal_agent` and enriched with derived close probability.
            </p>
          </div>
          <StatusPill label={dealOutput.risk_level} />
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricBox icon={AlertTriangle} label="Deal Risk Score" value={`${riskScore}/100`} caption="Derived from risk level + confidence" tone="rose" trend="Derived" />
        <MetricBox icon={Goal} label="Closure Probability" value={`${closeProbability}%`} caption="Derived from backend engagement signals" tone="amber" trend="Derived" />
        <MetricBox icon={Gauge} label="Agent Confidence" value={`${dealOutput.confidence || 0}%`} caption="Native `deal_agent` field" tone="cyan" trend="Verified" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <Card>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Deal diagnosis</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-white">Issue summary</h2>
          <div className="mt-5 rounded-[24px] border border-line bg-slate-950/40 p-5 text-sm leading-7 text-slate-200">{dealOutput.issue}</div>

          <div className="mt-5 rounded-[24px] border border-line bg-white/[0.03] p-5">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Lightbulb className="h-4 w-4 text-accent-orange" />
              Recommendation
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-200">{dealOutput.action}</p>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Engagement context</p>
            <div className="mt-5 grid gap-3">
              <div className="rounded-[22px] border border-line bg-white/[0.03] p-4 text-sm text-slate-200">Email opened: <strong>{engagement.opened ? "Yes" : "No"}</strong></div>
              <div className="rounded-[22px] border border-line bg-white/[0.03] p-4 text-sm text-slate-200">Replied: <strong>{engagement.replied ? "Yes" : "No"}</strong></div>
              <div className="rounded-[22px] border border-line bg-white/[0.03] p-4 text-sm text-slate-200">No reply signal: <strong>{engagement.no_reply ? "Yes" : "No"}</strong></div>
              <div className="rounded-[22px] border border-line bg-white/[0.03] p-4 text-sm text-slate-200">Follow-ups: <strong>{engagement.followups ?? 0}</strong></div>
            </div>
          </Card>

          <Card>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Competitive signal</p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-white">Battlecard status</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {competitiveOutput?.strategy || "The competitive agent only fires when the backend flags deal risk as high. No battlecard was generated for the current run."}
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
