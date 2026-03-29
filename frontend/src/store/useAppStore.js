import { create } from "zustand";
import {
  getAgentOutputs,
  getLeads,
  getTimeline,
  resetLead,
  runLeadPipeline,
} from "@/services/api";

function setRequestState(set, key, patch) {
  set((state) => ({
    requests: {
      ...state.requests,
      [key]: {
        ...state.requests[key],
        ...patch,
      },
    },
  }));
}

function getInitialTheme() {
  if (typeof window === "undefined") {
    return "dark";
  }

  return window.localStorage.getItem("vathmos-theme") || "dark";
}

export const useAppStore = create((set, get) => ({
  theme: getInitialTheme(),
  allLeads: [],
  leadResults: [],
  searchQuery: "",
  selectedLeadId: null,
  outputsByLead: {},
  timelinesByLead: {},
  pipelineResultsByLead: {},
  requests: {},
  initialized: false,

  setTheme: (theme) => {
    window.localStorage.setItem("vathmos-theme", theme);
    set({ theme });
  },

  toggleTheme: () => {
    const theme = get().theme === "dark" ? "light" : "dark";
    window.localStorage.setItem("vathmos-theme", theme);
    set({ theme });
  },

  setSelectedLead: (leadId) => set({ selectedLeadId: leadId }),

  loadLeads: async (query = "") => {
    set({ searchQuery: query });
    setRequestState(set, "leads", { loading: true, error: null });

    try {
      const leads = await getLeads(query);
      const nextState = {
        leadResults: leads,
      };

      if (!query) {
        nextState.allLeads = leads;
      }

      if (!get().selectedLeadId && leads.length) {
        nextState.selectedLeadId = leads[0].id;
      }

      set(nextState);
      setRequestState(set, "leads", { loading: false, error: null });
      return leads;
    } catch (error) {
      setRequestState(set, "leads", { loading: false, error: error.message });
      throw error;
    }
  },

  bootstrap: async () => {
    if (get().initialized) {
      return;
    }

    await get().loadLeads();
    set({ initialized: true });
  },

  refreshOutputs: async (leadId) => {
    if (!leadId) {
      return [];
    }

    const key = `outputs:${leadId}`;
    setRequestState(set, key, { loading: true, error: null });

    try {
      const outputs = await getAgentOutputs(leadId);
      set((state) => ({
        outputsByLead: {
          ...state.outputsByLead,
          [leadId]: outputs,
        },
      }));
      setRequestState(set, key, { loading: false, error: null });
      return outputs;
    } catch (error) {
      setRequestState(set, key, { loading: false, error: error.message });
      throw error;
    }
  },

  ensureOutputs: async (leadId) => {
    if (!leadId) {
      return [];
    }

    if (get().outputsByLead[leadId]) {
      return get().outputsByLead[leadId];
    }

    return get().refreshOutputs(leadId);
  },

  refreshTimeline: async (leadId) => {
    if (!leadId) {
      return [];
    }

    const key = `timeline:${leadId}`;
    setRequestState(set, key, { loading: true, error: null });

    try {
      const timeline = await getTimeline(leadId);
      set((state) => ({
        timelinesByLead: {
          ...state.timelinesByLead,
          [leadId]: timeline,
        },
      }));
      setRequestState(set, key, { loading: false, error: null });
      return timeline;
    } catch (error) {
      setRequestState(set, key, { loading: false, error: error.message });
      throw error;
    }
  },

  ensureTimeline: async (leadId) => {
    if (!leadId) {
      return [];
    }

    if (get().timelinesByLead[leadId]) {
      return get().timelinesByLead[leadId];
    }

    return get().refreshTimeline(leadId);
  },

  runPipeline: async (leadId) => {
    if (!leadId) {
      throw new Error("Select a lead before running the pipeline.");
    }

    const key = `run:${leadId}`;
    setRequestState(set, key, { loading: true, error: null });

    try {
      const result = await runLeadPipeline(leadId);
      set((state) => ({
        pipelineResultsByLead: {
          ...state.pipelineResultsByLead,
          [leadId]: result,
        },
      }));

      await Promise.all([
        get().loadLeads(get().searchQuery),
        get().refreshOutputs(leadId),
        get().refreshTimeline(leadId),
      ]);

      setRequestState(set, key, { loading: false, error: null });
      return result;
    } catch (error) {
      setRequestState(set, key, { loading: false, error: error.message });
      throw error;
    }
  },

  resetPipelineData: async (leadId) => {
    if (!leadId) {
      return null;
    }

    const key = `reset:${leadId}`;
    setRequestState(set, key, { loading: true, error: null });

    try {
      const response = await resetLead(leadId);
      set((state) => ({
        outputsByLead: {
          ...state.outputsByLead,
          [leadId]: [],
        },
        timelinesByLead: {
          ...state.timelinesByLead,
          [leadId]: [],
        },
        pipelineResultsByLead: {
          ...state.pipelineResultsByLead,
          [leadId]: null,
        },
      }));
      await get().loadLeads(get().searchQuery);
      setRequestState(set, key, { loading: false, error: null });
      return response;
    } catch (error) {
      setRequestState(set, key, { loading: false, error: error.message });
      throw error;
    }
  },

  hydrateDashboardAnalytics: async () => {
    const leads = get().allLeads.length ? get().allLeads : await get().loadLeads();
    const key = "dashboard:analytics";
    setRequestState(set, key, { loading: true, error: null });

    try {
      const results = await Promise.allSettled(
        leads.map(async (lead) => ({
          leadId: lead.id,
          outputs: await getAgentOutputs(lead.id),
        })),
      );

      const nextOutputs = { ...get().outputsByLead };
      results.forEach((result) => {
        if (result.status === "fulfilled") {
          nextOutputs[result.value.leadId] = result.value.outputs;
        }
      });

      set({ outputsByLead: nextOutputs });
      setRequestState(set, key, { loading: false, error: null });
      return nextOutputs;
    } catch (error) {
      setRequestState(set, key, { loading: false, error: error.message });
      throw error;
    }
  },
}));
