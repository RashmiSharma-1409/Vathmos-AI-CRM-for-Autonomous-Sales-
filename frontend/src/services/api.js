import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || "Unexpected API error";
    const enrichedError = new Error(message);
    enrichedError.status = error.response?.status;
    enrichedError.payload = error.response?.data;
    throw enrichedError;
  },
);

function unwrap(response) {
  return response.data?.data;
}

export async function getHealth() {
  const response = await client.get("/api/health");
  return response.data;
}

export async function getLeads(query = "") {
  if (query) {
    const response = await client.get("/leads/search", { params: { q: query } });
    return unwrap(response) || [];
  }

  const response = await client.get("/leads");
  return unwrap(response) || [];
}

export async function getLead(leadId) {
  const response = await client.get(`/leads/${leadId}`);
  return unwrap(response);
}

export async function runLeadPipeline(payload) {
  const body = typeof payload === "string" ? { lead_id: payload } : payload;
  const response = await client.post("/run", body);
  return unwrap(response);
}

export async function getAgentOutputs(leadId) {
  const response = await client.get(`/outputs/${leadId}`);
  return unwrap(response) || [];
}

export async function getLatestAgentOutput(leadId, agentName) {
  try {
    const response = await client.get(`/outputs/${leadId}/${agentName}`);
    return unwrap(response)?.output_data || unwrap(response) || null;
  } catch (error) {
    if (error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function getDealAnalysis(leadId) {
  return getLatestAgentOutput(leadId, "deal_agent");
}

export async function generateOutreach(leadId, variant = "initial") {
  const agentName = variant === "followup" ? "outreach_agent_email2" : "outreach_agent_email1";
  return getLatestAgentOutput(leadId, agentName);
}

export async function getChurnPrediction(leadId) {
  return getLatestAgentOutput(leadId, "churn_agent");
}

export async function getCompetitiveInsights(leadId) {
  return getLatestAgentOutput(leadId, "competitive_agent");
}

export async function getRetentionPlan(leadId) {
  return getLatestAgentOutput(leadId, "retention_agent");
}

export async function getTimeline(entityId) {
  const response = await client.get(`/timeline/${entityId}`);
  return unwrap(response) || [];
}

export async function resetLead(leadId) {
  const response = await client.delete(`/reset/${leadId}`);
  return response.data;
}

export default client;
