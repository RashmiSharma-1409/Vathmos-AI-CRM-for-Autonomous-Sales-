import { LifeBuoy, MailCheck, Sparkles } from "lucide-react";
import { AIResponseBlock } from "@/components/ai-response-block";
import { Card } from "@/components/card";
import { EmptyState } from "@/components/empty-state";
import { useClipboard } from "@/hooks/useClipboard";
import { useLeadWorkspace } from "@/hooks/useLeadWorkspace";

export function RetentionAgentPage() {
  const { selectedLead, churnOutput, retentionOutput, runPipeline } = useLeadWorkspace();
  const { copy, copiedValue } = useClipboard();
  const emailBody = retentionOutput
    ? `${retentionOutput.retention_email_subject}\n\n${retentionOutput.retention_email_body}`
    : "";

  if (!retentionOutput) {
    return (
      <div className="space-y-6">
        <Card>
          <p className="text-xs uppercase tracking-[0.3em] text-accent-cyan">Retention agent</p>
          <h1 className="mt-4 font-display text-4xl font-bold text-white">Retention Agent</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">The backend only triggers retention output when churn risk is high, so this page mirrors that behavior instead of inventing fallback data.</p>
        </Card>
        <EmptyState
          icon={LifeBuoy}
          title="No retention intervention triggered"
          description={churnOutput ? `Current churn level is ${churnOutput.risk_level}. The Flask pipeline only creates a retention draft for high-risk accounts.` : "Run the full pipeline first to let the churn agent decide whether the retention workflow should fire."}
          actionLabel="Run retention workflow"
          onAction={runPipeline}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <p className="text-xs uppercase tracking-[0.3em] text-accent-cyan">Retention agent</p>
        <h1 className="mt-4 font-display text-4xl font-bold text-white">Retention Agent</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
          AI-generated rescue plan for {selectedLead?.company || "the selected lead"}, created by `retention_agent.py` when the churn output crossed the high-risk threshold.
        </p>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <Card>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Triggered action</p>
          <div className="mt-5 rounded-[24px] border border-line bg-white/[0.03] p-5 text-sm leading-7 text-slate-200">
            {retentionOutput.intervention_action}
          </div>
          <div className="mt-5 rounded-[24px] border border-line bg-slate-950/40 p-5 text-sm leading-7 text-slate-300">
            {churnOutput?.intervention || "No companion churn intervention text found."}
          </div>
        </Card>

        <AIResponseBlock
          title="Retention email draft"
          subtitle={retentionOutput.retention_email_subject}
          content={retentionOutput.retention_email_body}
          onCopy={() => copy(emailBody, "Retention email copied")}
          copied={copiedValue === emailBody}
          badges={[
            { label: "High risk only", tone: "rose" },
            { label: "CS action", tone: "teal" },
          ]}
        />
      </section>

      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] border border-line bg-white/[0.03] p-5">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <MailCheck className="h-4 w-4 text-accent-cyan" />
              Personalized messaging
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-400">The email subject and body come directly from the retention agent output and preserve the company name passed through the pipeline.</p>
          </div>
          <div className="rounded-[24px] border border-line bg-white/[0.03] p-5">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Sparkles className="h-4 w-4 text-accent-orange" />
              Agent-to-agent handoff
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-400">Retention is conditionally activated from churn output, which keeps the UI aligned with the backend orchestration model instead of faking intervention states.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
