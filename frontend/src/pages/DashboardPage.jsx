import { useEffect, useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, BrainCircuit, BriefcaseBusiness, ShieldAlert } from "lucide-react";
import { Card } from "@/components/card";
import { Loader } from "@/components/loader";
import { MetricBox } from "@/components/metric-box";
import { StatusPill } from "@/components/status-pill";
import { bucketLeadScores, derivePipelineFunnel, formatRelativeDate } from "@/lib/formatters";
import { useLeadWorkspace } from "@/hooks/useLeadWorkspace";
import { useAppStore } from "@/store/useAppStore";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-line bg-slate-950/95 px-3 py-2 text-sm text-slate-200 shadow-soft">
      <p className="font-medium text-white">{label}</p>
      <p>{payload[0].value} leads</p>
    </div>
  );
}

export function DashboardPage() {
  const { allLeads, outputsByLead, requests, hydrateDashboardAnalytics } = useAppStore((state) => ({
    allLeads: state.allLeads,
    outputsByLead: state.outputsByLead,
    requests: state.requests,
    hydrateDashboardAnalytics: state.hydrateDashboardAnalytics,
  }));
  const { selectedLead, leadOutput, dealOutput, churnOutput } = useLeadWorkspace();

  useEffect(() => {
    if (allLeads.length) {
      hydrateDashboardAnalytics();
    }
  }, [allLeads.length, hydrateDashboardAnalytics]);

  const metrics = useMemo(() => {
    const activeDeals = Object.values(outputsByLead).filter((outputs) => outputs.some((entry) => entry.agent_name === "deal_agent")).length;
    const riskyDeals = Object.values(outputsByLead).filter((outputs) =>
      outputs.some((entry) => entry.agent_name === "deal_agent" && ["High", "Medium"].includes(entry.output_data?.risk_level)),
    ).length;

    return {
      totalLeads: allLeads.length,
      highScoreLeads: allLeads.filter((lead) => lead.priority === "high" || (lead.score || 0) >= 70).length,
      activeDeals,
      riskyDeals,
    };
  }, [allLeads, outputsByLead]);

  const scoreData = useMemo(() => bucketLeadScores(allLeads), [allLeads]);
  const funnelData = useMemo(() => derivePipelineFunnel(allLeads, outputsByLead), [allLeads, outputsByLead]);
  const analyticsLoading = requests["dashboard:analytics"]?.loading;

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <Card className="noise overflow-hidden">
          <p className="text-xs uppercase tracking-[0.3em] text-accent-cyan">Vathmos AI</p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Agent-native revenue control room for every lead, deal, and rescue motion.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            The dashboard reads directly from Flask-backed lead records, agent outputs, and timeline events so the SaaS cockpit always reflects live backend state.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-300">
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Lead scoring</div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Deal intelligence</div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Retention workflows</div>
          </div>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Live focus lead</p>
          {selectedLead ? (
            <>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl font-semibold text-white">{selectedLead.company}</h2>
                  <p className="mt-2 text-sm text-slate-400">{selectedLead.event}</p>
                </div>
                <StatusPill label={leadOutput?.priority || selectedLead.priority || "unscored"} />
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] border border-line bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Lead score</p>
                  <div className="mt-3 font-display text-4xl font-bold text-white">{leadOutput?.score ?? selectedLead.score ?? "--"}</div>
                  <p className="mt-2 text-sm text-slate-400">{leadOutput?.reason || selectedLead.score_reason || "Run the pipeline to score this account."}</p>
                </div>
                <div className="rounded-[24px] border border-line bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Deal risk</p>
                  <div className="mt-3 font-display text-4xl font-bold text-white">{dealOutput?.risk_level || "Not run"}</div>
                  <p className="mt-2 text-sm text-slate-400">{churnOutput?.risk_level ? `Churn risk ${churnOutput.risk_level}` : "No downstream agent outputs yet."}</p>
                </div>
              </div>
              <p className="mt-6 text-xs uppercase tracking-[0.24em] text-slate-500">
                Last seen {formatRelativeDate(selectedLead.created_at)}
              </p>
            </>
          ) : (
            <Loader label="Loading selected lead" className="mt-5 min-h-[280px]" />
          )}
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricBox icon={Activity} label="Total Leads" value={metrics.totalLeads} caption="Seeded from SQLite lead table" trend="Synced" />
        <MetricBox icon={BrainCircuit} label="High-score Leads" value={metrics.highScoreLeads} caption="Score >= 70 or priority high" tone="teal" trend="Qualified" />
        <MetricBox icon={BriefcaseBusiness} label="Active Deals" value={metrics.activeDeals} caption="Detected from stored deal outputs" tone="amber" trend="In motion" />
        <MetricBox icon={ShieldAlert} label="Risky Deals" value={metrics.riskyDeals} caption="Medium and high risk intelligence" tone="rose" trend="Watchlist" />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Lead score distribution</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-white">Portfolio quality mix</h2>
            </div>
            <StatusPill label="Live DB" tone="cyan" />
          </div>
          {analyticsLoading ? (
            <Loader label="Hydrating lead analytics" />
          ) : (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreData}>
                  <CartesianGrid vertical={false} stroke="rgba(148, 163, 184, 0.09)" />
                  <XAxis dataKey="label" stroke="rgba(148, 163, 184, 0.7)" tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(148, 163, 184, 0.7)" tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                  <Bar dataKey="value" radius={[14, 14, 0, 0]} fill="url(#leadGradient)" />
                  <defs>
                    <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#55d6ff" />
                      <stop offset="100%" stopColor="#4cf0c2" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Deal pipeline</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-white">Agent stage coverage</h2>
            </div>
            <StatusPill label="Backfilled" tone="amber" />
          </div>
          {analyticsLoading ? (
            <Loader label="Loading pipeline stages" />
          ) : (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={funnelData}>
                  <CartesianGrid vertical={false} stroke="rgba(148, 163, 184, 0.09)" />
                  <XAxis dataKey="name" stroke="rgba(148, 163, 184, 0.7)" tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(148, 163, 184, 0.7)" tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="value" stroke="#ff9f66" fill="rgba(255, 159, 102, 0.2)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
