import { clamp } from "@/lib/utils";

export function formatRelativeDate(value) {
  if (!value) {
    return "No timestamp";
  }

  const date = new Date(value);
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatEventLabel(eventType = "") {
  return eventType
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function bucketLeadScores(leads = []) {
  const buckets = [
    { label: "90-100", min: 90, max: 100, value: 0 },
    { label: "70-89", min: 70, max: 89, value: 0 },
    { label: "50-69", min: 50, max: 69, value: 0 },
    { label: "0-49", min: 0, max: 49, value: 0 },
    { label: "Unscored", min: null, max: null, value: 0 },
  ];

  leads.forEach((lead) => {
    if (typeof lead.score !== "number") {
      buckets.at(-1).value += 1;
      return;
    }

    const bucket = buckets.find((entry) => entry.min !== null && lead.score >= entry.min && lead.score <= entry.max);
    if (bucket) {
      bucket.value += 1;
    }
  });

  return buckets;
}

export function derivePipelineFunnel(leads = [], outputsByLead = {}) {
  const counts = {
    scored: 0,
    outreach: 0,
    deal: 0,
    battlecard: 0,
    retention: 0,
  };

  leads.forEach((lead) => {
    const outputs = outputsByLead[lead.id] || [];
    const names = new Set(outputs.map((entry) => entry.agent_name));

    if (lead.score !== null && lead.score !== undefined) {
      counts.scored += 1;
    }
    if (names.has("outreach_agent_email1") || names.has("outreach_agent_email2")) {
      counts.outreach += 1;
    }
    if (names.has("deal_agent")) {
      counts.deal += 1;
    }
    if (names.has("competitive_agent")) {
      counts.battlecard += 1;
    }
    if (names.has("retention_agent")) {
      counts.retention += 1;
    }
  });

  return [
    { name: "Scored", value: counts.scored },
    { name: "Outreach", value: counts.outreach },
    { name: "Deal Intel", value: counts.deal },
    { name: "Competitive", value: counts.battlecard },
    { name: "Retention", value: counts.retention },
  ];
}

export function deriveRiskScore(dealOutput) {
  if (!dealOutput) {
    return 0;
  }

  const lookup = {
    low: 28,
    medium: 58,
    high: 84,
  };

  const base = lookup[(dealOutput.risk_level || "").toLowerCase()] || 44;
  const confidence = typeof dealOutput.confidence === "number" ? dealOutput.confidence : 70;
  return clamp(Math.round((base + confidence) / 2));
}

export function deriveCloseProbability(dealOutput) {
  if (!dealOutput) {
    return 0;
  }

  const ctx = dealOutput.engagement_context || {};
  const lookup = {
    low: 82,
    medium: 57,
    high: 31,
  };

  let probability = lookup[(dealOutput.risk_level || "").toLowerCase()] || 50;

  if (ctx.opened) {
    probability += 6;
  }
  if (ctx.replied) {
    probability += 12;
  }
  if (ctx.no_reply) {
    probability -= 10;
  }

  return clamp(probability);
}

export function summarizeFitSignals(lead, leadOutput) {
  if (!lead) {
    return [];
  }

  return [
    `Industry focus: ${lead.industry}`,
    `Primary buying signal: ${lead.event}`,
    `Priority tier: ${(leadOutput?.priority || lead.priority || "unscored").toUpperCase()}`,
    `Geo and scale: ${lead.location || "Unknown location"} • ${lead.employees || "Unknown team size"}`,
  ];
}

export function getPriorityTone(priority = "") {
  const tones = {
    high: "rose",
    medium: "amber",
    low: "emerald",
  };

  return tones[priority.toLowerCase()] || "slate";
}
