import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

const AGENT_KEYS = {
  lead: "lead_agent",
  outreachInitial: "outreach_agent_email1",
  outreachFollowup: "outreach_agent_email2",
  deal: "deal_agent",
  competitive: "competitive_agent",
  churn: "churn_agent",
  retention: "retention_agent",
};

export function useLeadWorkspace() {
  const {
    allLeads,
    leadResults,
    selectedLeadId,
    outputsByLead,
    timelinesByLead,
    pipelineResultsByLead,
    requests,
    ensureOutputs,
    ensureTimeline,
    runPipeline,
    refreshOutputs,
    refreshTimeline,
    setSelectedLead,
  } = useAppStore((state) => state);

  const selectedLead = allLeads.find((lead) => lead.id === selectedLeadId) || leadResults.find((lead) => lead.id === selectedLeadId) || null;
  const outputs = selectedLeadId ? outputsByLead[selectedLeadId] || [] : [];
  const timeline = selectedLeadId ? timelinesByLead[selectedLeadId] || [] : [];
  const liveResult = selectedLeadId ? pipelineResultsByLead[selectedLeadId] : null;

  useEffect(() => {
    if (!selectedLeadId) {
      return;
    }

    ensureOutputs(selectedLeadId);
    ensureTimeline(selectedLeadId);
  }, [ensureOutputs, ensureTimeline, selectedLeadId]);

  const latestOutputs = outputs.reduce((accumulator, entry) => {
    accumulator[entry.agent_name] = entry.output_data;
    return accumulator;
  }, {});

  return {
    leads: leadResults,
    allLeads,
    selectedLead,
    selectedLeadId,
    outputs,
    timeline,
    running: Boolean(requests[`run:${selectedLeadId}`]?.loading),
    loadingOutputs: Boolean(requests[`outputs:${selectedLeadId}`]?.loading),
    loadingTimeline: Boolean(requests[`timeline:${selectedLeadId}`]?.loading),
    liveResult,
    leadOutput: liveResult?.lead || latestOutputs[AGENT_KEYS.lead] || null,
    outreachInitial: liveResult?.email || latestOutputs[AGENT_KEYS.outreachInitial] || null,
    outreachFollowup: liveResult?.followup_email || latestOutputs[AGENT_KEYS.outreachFollowup] || null,
    dealOutput: liveResult?.deal || latestOutputs[AGENT_KEYS.deal] || null,
    competitiveOutput: liveResult?.battlecard || latestOutputs[AGENT_KEYS.competitive] || null,
    churnOutput: liveResult?.churn || latestOutputs[AGENT_KEYS.churn] || null,
    retentionOutput: liveResult?.retention_intervention || latestOutputs[AGENT_KEYS.retention] || null,
    setSelectedLead,
    runPipeline: () => runPipeline(selectedLeadId),
    refreshWorkspace: async () => {
      if (!selectedLeadId) {
        return;
      }

      await Promise.all([refreshOutputs(selectedLeadId), refreshTimeline(selectedLeadId)]);
    },
  };
}
