import { DatabaseZap, Sparkles, Target } from "lucide-react";
import { Card } from "@/components/card";
import { DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { StatusPill } from "@/components/status-pill";
import { summarizeFitSignals } from "@/lib/formatters";
import { useLeadWorkspace } from "@/hooks/useLeadWorkspace";

export function LeadIntelligencePage() {
  const { leads, selectedLead, selectedLeadId, setSelectedLead, leadOutput, runPipeline, running } = useLeadWorkspace();
  const fitSignals = summarizeFitSignals(selectedLead, leadOutput);

  const columns = [
    { key: "company", label: "Company" },
    { key: "industry", label: "Industry" },
    {
      key: "event",
      label: "Trigger",
      render: (row) => <span className="line-clamp-2 max-w-sm text-slate-300">{row.event}</span>,
    },
    {
      key: "score",
      label: "Score",
      render: (row) => <span>{row.score ?? "--"}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <p className="text-xs uppercase tracking-[0.3em] text-accent-cyan">Lead agent</p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold text-white">Lead Intelligence</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
              Search the live SQLite lead table, select an account, and run the real Flask pipeline to fetch lead scoring, reasoning, and fit context.
            </p>
          </div>
          {selectedLead ? <StatusPill label={leadOutput?.priority || selectedLead.priority || "unscored"} /> : null}
        </div>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Lead table</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-white">Prospect inventory</h2>
            </div>
            <StatusPill label={`${leads.length} rows`} tone="cyan" />
          </div>
          <DataTable columns={columns} data={leads} onRowClick={(row) => setSelectedLead(row.id)} selectedKey={selectedLeadId} emptyLabel="No leads matched the current search." />
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Selected account</p>
                <h2 className="mt-2 font-display text-3xl font-semibold text-white">{selectedLead?.company || "Pick a lead"}</h2>
                <p className="mt-3 text-sm text-slate-400">{selectedLead?.event || "Choose a lead from the table to inspect signal quality and run AI scoring."}</p>
              </div>
              <button
                onClick={runPipeline}
                disabled={!selectedLead || running}
                className="rounded-2xl bg-gradient-to-r from-accent-cyan via-accent-teal to-accent-orange px-4 py-3 text-sm font-semibold text-slate-950 transition disabled:opacity-60"
              >
                {running ? "Running..." : "Run lead analysis"}
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-line bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Lead score</p>
                <div className="mt-3 font-display text-4xl font-bold text-white">{leadOutput?.score ?? selectedLead?.score ?? "--"}</div>
              </div>
              <div className="rounded-[24px] border border-line bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Fit tier</p>
                <div className="mt-3 flex items-center gap-3">
                  <StatusPill label={leadOutput?.priority || selectedLead?.priority || "unscored"} />
                </div>
              </div>
            </div>
          </Card>

          {leadOutput ? (
            <>
              <Card>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Fit analysis</p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-white">Why this account is in the queue</h3>
                <div className="mt-5 grid gap-3">
                  {fitSignals.map((signal) => (
                    <div key={signal} className="flex items-start gap-3 rounded-[20px] border border-white/8 bg-white/[0.03] p-4 text-sm text-slate-200">
                      <Target className="mt-0.5 h-4 w-4 text-accent-teal" />
                      <span>{signal}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">AI reasoning</p>
                <div className="mt-5 rounded-[24px] border border-line bg-slate-950/40 p-5 text-sm leading-7 text-slate-200">
                  {leadOutput.reason}
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[22px] border border-line bg-white/[0.03] p-4">
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <DatabaseZap className="h-4 w-4 text-accent-cyan" />
                      Real schema field
                    </div>
                    <p className="mt-3 text-sm text-slate-400">The score and reason are read from the backend's `lead_agent` output or saved lead score columns.</p>
                  </div>
                  <div className="rounded-[22px] border border-line bg-white/[0.03] p-4">
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <Sparkles className="h-4 w-4 text-accent-orange" />
                      AI-ready account
                    </div>
                    <p className="mt-3 text-sm text-slate-400">Run the full pipeline to unlock outreach, deal analysis, churn, competitive, and retention views for this same lead.</p>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <EmptyState
              icon={Sparkles}
              title="No lead intelligence yet"
              description="The backend only produces lead scoring after `/run` executes. Select a lead and trigger the pipeline to populate score, priority, and reasoning."
              actionLabel="Run lead agent"
              onAction={runPipeline}
            />
          )}
        </div>
      </section>
    </div>
  );
}
