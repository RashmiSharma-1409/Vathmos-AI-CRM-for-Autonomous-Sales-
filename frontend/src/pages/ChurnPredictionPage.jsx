import { AlertOctagon, ShieldAlert, TrendingUp } from "lucide-react";
import { Card } from "@/components/card";
import { EmptyState } from "@/components/empty-state";
import { MetricBox } from "@/components/metric-box";
import { StatusPill } from "@/components/status-pill";
import { useLeadWorkspace } from "@/hooks/useLeadWorkspace";

export function ChurnPredictionPage() {
  const { selectedLead, churnOutput, runPipeline } = useLeadWorkspace();

  if (!churnOutput) {
    return (
      <div className="space-y-6">
        <Card>
          <p className="text-xs uppercase tracking-[0.3em] text-accent-cyan">Churn agent</p>
          <h1 className="mt-4 font-display text-4xl font-bold text-white">Churn Prediction</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">The backend computes churn signals during the pipeline run and stores them as `churn_agent` output. Nothing on this page is mocked.</p>
        </Card>
        <EmptyState
          icon={ShieldAlert}
          title="No churn prediction available"
          description="Run the pipeline to generate churn probability, triggered reasons, urgency, intervention guidance, and recovery probability for the selected lead."
          actionLabel="Run churn analysis"
          onAction={runPipeline}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <p className="text-xs uppercase tracking-[0.3em] text-accent-cyan">Churn agent</p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold text-white">Churn Prediction</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
              Risk profile for {selectedLead?.company || "the selected lead"}, sourced from the rule engine plus LLM analysis in `churn_agent.py`.
            </p>
          </div>
          <StatusPill label={churnOutput.risk_level} />
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricBox icon={ShieldAlert} label="Churn Probability" value={`${churnOutput.churn_score}%`} caption="Native backend churn score" tone="rose" trend="Model output" />
        <MetricBox icon={TrendingUp} label="Recovery Probability" value={`${churnOutput.recovery_probability}%`} caption="Expected rescue upside" tone="teal" trend="Agent estimate" />
        <MetricBox icon={AlertOctagon} label="Urgency" value={churnOutput.urgency.replaceAll("_", " ")} caption="Action window from backend schema" tone="amber" trend="Operational" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
        <Card>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Risk factors</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-white">What the model flagged</h2>
          <div className="mt-5 grid gap-3">
            {churnOutput.reasons.map((reason) => (
              <div key={reason} className="rounded-[22px] border border-line bg-white/[0.03] p-4 text-sm text-slate-200">
                {reason}
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Narrative</p>
            <div className="mt-5 rounded-[24px] border border-line bg-slate-950/40 p-5 text-sm leading-7 text-slate-200">{churnOutput.churn_narrative}</div>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Suggested action</p>
            <div className="mt-5 rounded-[24px] border border-line bg-white/[0.03] p-5 text-sm leading-7 text-slate-200">{churnOutput.intervention}</div>
          </Card>
        </div>
      </section>
    </div>
  );
}
