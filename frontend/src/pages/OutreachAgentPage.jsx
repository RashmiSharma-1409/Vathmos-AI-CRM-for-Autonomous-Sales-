import { useEffect, useState } from "react";
import { MailOpen } from "lucide-react";
import { AIResponseBlock } from "@/components/ai-response-block";
import { Card } from "@/components/card";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { useClipboard } from "@/hooks/useClipboard";
import { useLeadWorkspace } from "@/hooks/useLeadWorkspace";

function emailToText(email) {
  if (!email) {
    return "";
  }

  return `${email.email_subject}\n\n${String(email.email_body || "").replaceAll("<br>", "\n")}`;
}

export function OutreachAgentPage() {
  const { selectedLead, outreachInitial, outreachFollowup, runPipeline } = useLeadWorkspace();
  const { copy, copiedValue } = useClipboard();
  const [initialDraft, setInitialDraft] = useState("");
  const [followupDraft, setFollowupDraft] = useState("");

  useEffect(() => {
    setInitialDraft(emailToText(outreachInitial));
  }, [outreachInitial]);

  useEffect(() => {
    setFollowupDraft(emailToText(outreachFollowup));
  }, [outreachFollowup]);

  if (!outreachInitial && !outreachFollowup) {
    return (
      <div className="space-y-6">
        <Card>
          <p className="text-xs uppercase tracking-[0.3em] text-accent-cyan">Outreach agent</p>
          <h1 className="mt-4 font-display text-4xl font-bold text-white">Outreach Automation</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">This page renders the backend's `outreach_agent_email1` and `outreach_agent_email2` outputs, then lets sales users copy or edit the sequence before sending.</p>
        </Card>
        <EmptyState
          icon={MailOpen}
          title="No outreach sequence yet"
          description="The Flask backend generates outreach emails only during `/run`. Trigger the full agent pipeline to populate initial and adaptive follow-up sequences for the selected lead."
          actionLabel="Generate sequence"
          onAction={runPipeline}
        />
      </div>
    );
  }

  const initialCtx = outreachInitial?.engagement_context || {};
  const followupCtx = outreachFollowup?.engagement_context || {};

  return (
    <div className="space-y-6">
      <Card>
        <p className="text-xs uppercase tracking-[0.3em] text-accent-cyan">Outreach agent</p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold text-white">Outreach Automation</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
              Personalized outreach sequence for {selectedLead?.company || "the selected lead"}, pulled from the real pipeline outputs and ready for editing.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="cyan">Sequence ready</Badge>
            <Badge tone="amber">Human editable</Badge>
          </div>
        </div>
      </Card>

      <section className="grid gap-6 xl:grid-cols-2">
        <AIResponseBlock
          title="Initial outreach"
          subtitle={outreachInitial?.email_subject || "No subject"}
          editableValue={initialDraft}
          onEditableChange={setInitialDraft}
          onCopy={() => copy(initialDraft, "Initial email copied")}
          copied={copiedValue === initialDraft}
          badges={[
            { label: initialCtx.opened ? "Opened" : "Unopened", tone: initialCtx.opened ? "teal" : "slate" },
            { label: initialCtx.no_reply ? "No reply" : "Awaiting response", tone: initialCtx.no_reply ? "amber" : "cyan" },
          ]}
        />
        <AIResponseBlock
          title="Adaptive follow-up"
          subtitle={outreachFollowup?.email_subject || "No follow-up subject"}
          editableValue={followupDraft}
          onEditableChange={setFollowupDraft}
          onCopy={() => copy(followupDraft, "Follow-up email copied")}
          copied={copiedValue === followupDraft}
          badges={[
            { label: followupCtx.opened ? "Opened" : "Cold", tone: followupCtx.opened ? "teal" : "slate" },
            { label: followupCtx.no_reply ? "Needs urgency" : "Soft touch", tone: followupCtx.no_reply ? "rose" : "cyan" },
          ]}
        />
      </section>

      <Card>
        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Sequence insight</p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-white">Backend-compatible email logic</h2>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          The first email uses the current lead event as the primary hook. The follow-up is regenerated against the live timeline state, so opened-with-no-reply leads automatically shift to a sharper angle in the second touch.
        </p>
      </Card>
    </div>
  );
}
