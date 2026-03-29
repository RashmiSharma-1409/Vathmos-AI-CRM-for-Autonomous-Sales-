import { Clock3, Workflow } from "lucide-react";
import { Card } from "@/components/card";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatEventLabel, formatRelativeDate } from "@/lib/formatters";
import { useLeadWorkspace } from "@/hooks/useLeadWorkspace";

export function TimelinePage() {
  const { selectedLead, timeline, loadingTimeline, runPipeline } = useLeadWorkspace();

  return (
    <div className="space-y-6">
      <Card>
        <p className="text-xs uppercase tracking-[0.3em] text-accent-cyan">Timeline</p>
        <h1 className="mt-4 font-display text-4xl font-bold text-white">Activity Feed</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
          Chronological event feed for {selectedLead?.company || "the selected lead"}, pulled from `/timeline/:entityId` and displaying lead, deal, and customer actions exactly as persisted by the backend.
        </p>
      </Card>

      {!timeline.length && !loadingTimeline ? (
        <EmptyState
          icon={Clock3}
          title="Timeline is empty"
          description="No pipeline events have been logged for the selected lead yet. Run the full pipeline to see agent steps, system decisions, and entity-level events in sequence."
          actionLabel="Run pipeline"
          onAction={runPipeline}
        />
      ) : (
        <div className="space-y-4">
          {timeline.map((event) => (
            <Card key={`${event.id}-${event.timestamp}`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06] text-accent-cyan">
                    <Workflow className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-2xl font-semibold text-white">{formatEventLabel(event.event_type)}</h2>
                      <Badge tone="cyan">{event.entity_type}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{formatRelativeDate(event.timestamp)}</p>
                  </div>
                </div>
                <Badge tone="amber">{event.entity_id}</Badge>
              </div>
              <pre className="mt-5 overflow-x-auto rounded-[24px] border border-line bg-slate-950/50 p-4 text-xs leading-6 text-slate-300">
                {JSON.stringify(event.data, null, 2)}
              </pre>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
