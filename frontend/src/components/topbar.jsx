import { Menu, Play, RotateCcw, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useLeadWorkspace } from "@/hooks/useLeadWorkspace";
import { useAppStore } from "@/store/useAppStore";

export function TopBar({ onOpenSidebar }) {
  const { allLeads, leads, selectedLead, selectedLeadId, setSelectedLead, runPipeline } = useLeadWorkspace();
  const loadLeads = useAppStore((state) => state.loadLeads);
  const resetPipelineData = useAppStore((state) => state.resetPipelineData);
  const requests = useAppStore((state) => state.requests);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 320);

  useEffect(() => {
    loadLeads(debouncedQuery);
  }, [debouncedQuery, loadLeads]);

  const leadOptions = useMemo(() => (leads.length ? leads : allLeads), [allLeads, leads]);

  async function handleRun() {
    try {
      await toast.promise(runPipeline(), {
        loading: "Running full Vathmos pipeline...",
        success: "Pipeline complete",
        error: (error) => error.message,
      });
    } catch {
      return null;
    }
  }

  async function handleReset() {
    if (!selectedLeadId) {
      return;
    }

    try {
      await toast.promise(resetPipelineData(selectedLeadId), {
        loading: "Clearing agent outputs...",
        success: "Pipeline state reset",
        error: (error) => error.message,
      });
    } catch {
      return null;
    }
  }

  return (
    <header className="sticky top-0 z-30 px-4 pb-4 pt-4 sm:px-6 lg:px-8">
      <div className="glass-panel surface-ring flex flex-col gap-4 rounded-[28px] px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3 lg:hidden">
          <button onClick={onOpenSidebar} className="rounded-2xl border border-line bg-white/5 p-3 text-slate-100">
            <Menu className="h-4 w-4" />
          </button>
          <div>
            <p className="font-display text-lg font-bold text-white">Vathmos AI</p>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">AI startup cockpit</p>
          </div>
        </div>

        <div className="grid flex-1 gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(220px,0.9fr)]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-11" placeholder="Search leads, industries, funding, or trigger events" />
          </div>
          <select
            value={selectedLeadId || ""}
            onChange={(event) => setSelectedLead(event.target.value)}
            className="h-11 rounded-2xl border border-line bg-white/5 px-4 text-sm text-slate-100 outline-none"
          >
            {leadOptions.map((lead) => (
              <option key={lead.id} value={lead.id} className="bg-slate-950 text-white">
                {lead.company} - {lead.industry}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {selectedLead ? (
            <>
              <Badge tone="cyan">{selectedLead.industry}</Badge>
              {selectedLead.priority ? <Badge tone="teal">{selectedLead.priority}</Badge> : null}
            </>
          ) : null}
          <Button variant="secondary" onClick={handleReset} disabled={!selectedLeadId || requests[`reset:${selectedLeadId}`]?.loading}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button variant="accent" onClick={handleRun} disabled={!selectedLeadId || requests[`run:${selectedLeadId}`]?.loading}>
            <Play className="mr-2 h-4 w-4" />
            Run Agents
          </Button>
          <ThemeToggle />
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-white/5 px-3 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-cyan to-accent-orange font-display text-sm font-bold text-slate-950">
              VA
            </div>
            <div>
              <p className="text-sm font-medium text-white">Revenue Ops</p>
              <p className="text-xs text-slate-500">Admin workspace</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
