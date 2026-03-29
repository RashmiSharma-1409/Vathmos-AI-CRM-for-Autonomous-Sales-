// ══════════════════════════════════════════════════════════════════
// PipelineAI — Dashboard Page JavaScript
// Dedicated page: all backend pipeline operations happen here
// ══════════════════════════════════════════════════════════════════

const API = '';

// ── STATE ──────────────────────────────────────────────────────
let currentMode    = 'prospects';
let currentLeadId  = null;
let currentCompany = null;
let searchTimer    = null;
let activeChip     = 'SaaS';

// ── HELPERS ────────────────────────────────────────────────────
function el(id) { return document.getElementById(id); }

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function setText(id, text) {
  const e = el(id);
  if (e) e.textContent = text;
}

function setHtml(id, html) {
  const e = el(id);
  if (e) e.innerHTML = html;
}

function setStatus(state, text) {
  const dot = el('statusDot');
  const txt = el('statusText');
  if (dot) dot.className = `status-dot ${state === 'ready' ? '' : state}`;
  if (txt) txt.textContent = text;
}


// ══════════════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════════════

window.switchMode = function(mode) {
  currentMode = mode;
  document.querySelectorAll('.panel-tab').forEach(t => {
    t.classList.toggle('active', t.textContent.toLowerCase() === mode);
  });
  
  const searchWrap = el('searchWrap');
  const searchChips = el('searchChips');
  const resultsEmpty = el('resultsEmpty');
  
  if (resultsEmpty) {
    if (mode === 'prospects') {
      resultsEmpty.querySelector('.empty-title').textContent = 'Select a prospect to run the pipeline';
      resultsEmpty.querySelector('.empty-sub').innerHTML = 'Search for leads on the left, click one to trigger<br />the full prospect pipeline';
    } else {
      resultsEmpty.querySelector('.empty-title').textContent = 'Select a customer to analyze health';
      resultsEmpty.querySelector('.empty-sub').innerHTML = 'Click a customer on the left to trigger<br />churn prediction and retention workflows';
    }
  }

  if (mode === 'prospects') {
    if (searchWrap) searchWrap.style.display = 'flex';
    if (searchChips) searchChips.style.display = 'flex';
    quickSearch(activeChip || 'SaaS');
  } else {
    if (searchWrap) searchWrap.style.display = 'none';
    if (searchChips) searchChips.style.display = 'none';
    loadCustomers();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = el('searchInput');
  const rerunBtn    = el('rerunBtn');

  // Load initial leads
  quickSearch('SaaS');

  // Debounced search
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    const q = searchInput.value.trim();
    if (!q) return;
    searchTimer = setTimeout(() => doSearch(q), 380);
  });

  // Enter key
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      clearTimeout(searchTimer);
      const q = searchInput.value.trim();
      if (q) doSearch(q);
    }
  });

  // Rerun button
  rerunBtn.addEventListener('click', () => {
    if (currentLeadId) resetAndRerun(currentLeadId, currentCompany);
  });

  // Scroll-aware header
  window.addEventListener('scroll', () => {
    const header = el('dashHeader');
    if (!header) return;
    if (window.scrollY > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
});


// ══════════════════════════════════════════════════════════════════
// SEARCH — GET /leads/search?q=
// ══════════════════════════════════════════════════════════════════

function quickSearch(keyword) {
  activeChip = keyword;
  const searchInput = el('searchInput');
  if (searchInput) searchInput.value = keyword;

  document.querySelectorAll('.chip').forEach(c => {
    c.classList.toggle('active', c.textContent === keyword);
  });
  doSearch(keyword);
}

async function doSearch(keyword) {
  const searchLoader = el('searchLoader');
  const resultsCount = el('resultsCount');

  if (searchLoader) searchLoader.classList.add('spinning');
  if (resultsCount) resultsCount.textContent = 'Searching...';

  try {
    const res = await fetch(`${API}/leads/search?q=${encodeURIComponent(keyword)}`);
    if (!res.ok) throw new Error(`Search failed (${res.status})`);

    const json = await res.json();
    if (json.status === 'success') {
      renderLeads(json.data || []);
      const count = (json.data || []).length;
      if (resultsCount)
        resultsCount.textContent = `${count} prospect${count !== 1 ? 's' : ''} found`;
    } else {
      throw new Error(json.message || 'Search failed');
    }
  } catch (e) {
    if (resultsCount) resultsCount.textContent = 'Search failed — check server';
    console.error('Search error:', e);
  } finally {
    if (searchLoader) searchLoader.classList.remove('spinning');
  }
}

function renderLeads(leads) {
  const leadsList = el('leadsList');
  if (!leadsList) return;

  if (!leads.length) {
    leadsList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⊘</div>
        <p>No prospects found<br/>Try a different keyword</p>
      </div>`;
    return;
  }

  leadsList.innerHTML = leads.map(lead => {
    const scoreClass = lead.priority === 'high' ? 'high'
                     : lead.priority === 'medium' ? 'medium'
                     : lead.score ? 'low' : 'unscored';
    const scoreLabel = lead.score ? `${lead.score}` : '—';

    const tags = (lead.tags || []).slice(0, 3).map(t =>
      `<span class="lc-tag">${escHtml(t)}</span>`
    ).join('');

    return `
      <div class="lead-card ${lead.id === currentLeadId ? 'active' : ''}"
           data-lead-id="${escHtml(lead.id)}"
           data-company="${escHtml(lead.company)}">
        <div class="lc-top">
          <div class="lc-company">${escHtml(lead.company)}</div>
          <div class="lc-score ${scoreClass}">${scoreLabel}</div>
        </div>
        <div class="lc-event">${escHtml(lead.event)}</div>
        <div class="lc-bottom">${tags}</div>
      </div>`;
  }).join('');

  leadsList.querySelectorAll('.lead-card').forEach(card => {
    card.addEventListener('click', () => {
      const leadId  = card.dataset.leadId;
      const company = card.dataset.company;
      if (leadId) selectLead(leadId, company);
    });
  });
}


// ══════════════════════════════════════════════════════════════════
// CUSTOMERS — GET /customers
// ══════════════════════════════════════════════════════════════════

async function loadCustomers() {
  const leadsList = el('leadsList');
  const resultsCount = el('resultsCount');

  if (leadsList) leadsList.innerHTML = '<div class="empty-state"><p>Loading customers...</p></div>';
  if (resultsCount) resultsCount.textContent = 'Loading...';

  try {
    const res = await fetch(`${API}/customers`);
    if (!res.ok) throw new Error(`Fetch failed (${res.status})`);

    const json = await res.json();
    if (json.status === 'success') {
      renderCustomers(json.data || []);
      const count = (json.data || []).length;
      if (resultsCount)
        resultsCount.textContent = `${count} customer${count !== 1 ? 's' : ''} found`;
    } else {
      throw new Error(json.message || 'Fetch failed');
    }
  } catch (e) {
    if (resultsCount) resultsCount.textContent = 'Failed to load customers';
    if (leadsList) leadsList.innerHTML = `<div class="empty-state"><p>Error loading customers</p></div>`;
    console.error('Error:', e);
  }
}

function renderCustomers(customers) {
  const leadsList = el('leadsList');
  if (!leadsList) return;

  if (!customers.length) {
    leadsList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⊘</div>
        <p>No customers found</p>
      </div>`;
    return;
  }

  leadsList.innerHTML = customers.map(cust => {
    const riskClass = cust.risk_level === 'high' ? 'high'
                    : cust.risk_level === 'medium' ? 'medium'
                    : 'low';
    const riskLabel = cust.churn_score ? `${cust.churn_score} Risk` : '—';
    const tag = `<span class="lc-tag">${escHtml(cust.plan)}</span>`;

    return `
      <div class="lead-card ${cust.id === currentLeadId ? 'active' : ''}"
           data-lead-id="${escHtml(cust.id)}"
           data-company="${escHtml(cust.company)}">
        <div class="lc-top">
          <div class="lc-company">${escHtml(cust.company)}</div>
          <div class="lc-score ${riskClass}">${riskLabel}</div>
        </div>
        <div class="lc-event">MRR: $${cust.mrr} | Used: ${escHtml(cust.usage)}</div>
        <div class="lc-bottom">${tag}</div>
      </div>`;
  }).join('');

  leadsList.querySelectorAll('.lead-card').forEach(card => {
    card.addEventListener('click', () => {
      const custId  = card.dataset.leadId;
      const company = card.dataset.company;
      if (custId) selectCustomer(custId, company);
    });
  });
}

function selectCustomer(custId, company) {
  currentLeadId  = custId;
  currentCompany = company;

  document.querySelectorAll('.lead-card').forEach(c => {
    c.classList.toggle('active', c.dataset.leadId === custId);
  });

  runCustomerPipeline(custId, company);
}

// ══════════════════════════════════════════════════════════════════
// PIPELINE — POST /run, DELETE /reset/{id}, GET /timeline/{id}
// ══════════════════════════════════════════════════════════════════

function selectLead(leadId, company) {
  currentLeadId  = leadId;
  currentCompany = company;

  document.querySelectorAll('.lead-card').forEach(c => {
    c.classList.toggle('active', c.dataset.leadId === leadId);
  });

  runPipeline(leadId, company);
}

async function resetAndRerun(leadId, company) {
  setStatus('busy', 'Resetting...');
  try {
    await fetch(`${API}/reset/${leadId}`, { method: 'DELETE' });
  } catch (e) {
    console.warn('Reset failed, proceeding:', e);
  }
  if (currentMode === 'prospects') runPipeline(leadId, company);
  else runCustomerPipeline(leadId, company);
}

async function runPipeline(leadId, company) {
  if (!company) {
    try {
      const r = await fetch(`${API}/leads/${leadId}`);
      if (r.ok) {
        const j = await r.json();
        company = j.data?.company || leadId;
      } else { company = leadId; }
    } catch { company = leadId; }
  }

  currentCompany = company;
  setStatus('busy', 'Running pipeline...');
  showRunningState(company);

  // Animate step pills
  const numSteps = 5;
  let stepIndex = 0;
  const stepInterval = setInterval(() => {
    if (stepIndex > 0) markStepDone(stepIndex);
    stepIndex++;
    if (stepIndex <= numSteps) markStepActive(stepIndex);
    if (stepIndex > numSteps) clearInterval(stepInterval);
  }, 900);

  // Log messages
  let logStep = 0;
  const logMessages = [
    ['1', 'lead_scored',         'Scoring lead with AI...'],
    ['2', 'email_generated',     'Generating outreach email...'],
    ['3', 'engagement_signal',   'Simulating engagement signals...'],
    ['4', 'followup_generated',  'Generating adaptive follow-up...'],
    ['5', 'deal_analyzed',       'Analysing deal risk from timeline...'],
  ];
  const logInterval = setInterval(() => {
    if (logStep < logMessages.length) {
      appendLog(...logMessages[logStep]);
      logStep++;
    } else { clearInterval(logInterval); }
  }, 900);

  try {
    const res = await fetch(`${API}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id: leadId })
    });

    clearInterval(stepInterval);
    clearInterval(logInterval);
    for (let i = 1; i <= numSteps; i++) markStepDone(i);

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
      throw new Error(errJson.message || `Pipeline failed (${res.status})`);
    }

    const json = await res.json();

    if (json.status === 'success') {
      appendLog('✓', 'pipeline_complete', 'All agents finished successfully');
      setStatus('ready', 'Pipeline complete');
      setTimeout(() => {
        populateResults(company, json.data);
        const searchInput = el('searchInput');
        doSearch(searchInput?.value || activeChip);
      }, 600);
    } else {
      throw new Error(json.message || 'Pipeline returned error');
    }
  } catch (e) {
    clearInterval(stepInterval);
    clearInterval(logInterval);
    appendLog('✗', 'error', e.message);
    setStatus('error', 'Pipeline failed');
    console.error('Pipeline error:', e);
  }
}

async function runCustomerPipeline(custId, company) {
  currentCompany = company;
  setStatus('busy', 'Running pipeline...');
  showRunningState(company);

  const numSteps = 3;
  let stepIndex = 0;
  const stepInterval = setInterval(() => {
    if (stepIndex > 0) markStepDone(stepIndex);
    stepIndex++;
    if (stepIndex <= numSteps) markStepActive(stepIndex);
    if (stepIndex > numSteps) clearInterval(stepInterval);
  }, 900);

  let logStep = 0;
  const logMessages = [
    ['1', 'churn_predicted',     'Predicting churn probability...'],
    ['2', 'intervention',        'Evaluating retention workflow...'],
    ['3', 'battlecard_generated','Generating competitive battlecard...'],
  ];
  const logInterval = setInterval(() => {
    if (logStep < logMessages.length) {
      appendLog(...logMessages[logStep]);
      logStep++;
    } else { clearInterval(logInterval); }
  }, 900);

  try {
    const res = await fetch(`${API}/customers/${custId}/analyze`, {
      method: 'POST'
    });

    clearInterval(stepInterval);
    clearInterval(logInterval);
    for (let i = 1; i <= numSteps; i++) markStepDone(i);

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
      throw new Error(errJson.message || `Pipeline failed (${res.status})`);
    }

    const json = await res.json();

    if (json.status === 'success') {
      appendLog('✓', 'pipeline_complete', 'All agents finished successfully');
      setStatus('ready', 'Pipeline complete');
      setTimeout(() => {
        populateResults(company, json.data);
      }, 600);
    } else {
      throw new Error(json.message || 'Pipeline returned error');
    }
  } catch (e) {
    clearInterval(stepInterval);
    clearInterval(logInterval);
    appendLog('✗', 'error', e.message);
    setStatus('error', 'Pipeline failed');
    console.error('Pipeline error:', e);
  }
}

// ══════════════════════════════════════════════════════════════════
// PIPELINE UI HELPERS
// ══════════════════════════════════════════════════════════════════

function showRunningState(company) {
  const resultsEmpty    = el('resultsEmpty');
  const resultsCards    = el('resultsCards');
  const pipelineRunning = el('pipelineRunning');

  if (resultsEmpty)    resultsEmpty.style.display    = 'none';
  if (resultsCards)    resultsCards.style.display     = 'none';
  if (pipelineRunning) pipelineRunning.style.display = 'block';

  setText('runningCompany', company);
  setHtml('runningLog', '');

  const stepsEl = el('runningSteps');
  if (stepsEl) {
    if (currentMode === 'prospects') {
      stepsEl.innerHTML = `
        <div class="step-pill" data-step="1">Lead Score</div>
        <div class="step-pill" data-step="2">Email</div>
        <div class="step-pill" data-step="3">Signals</div>
        <div class="step-pill" data-step="4">Follow-up</div>
        <div class="step-pill" data-step="5">Deal Intel</div>
      `;
    } else {
      stepsEl.innerHTML = `
        <div class="step-pill" data-step="1">Churn</div>
        <div class="step-pill" data-step="2">Retention</div>
        <div class="step-pill" data-step="3">Battlecard</div>
      `;
    }
  }

  document.querySelectorAll('.step-pill').forEach(p => p.classList.remove('active', 'done'));
  markStepActive(1);
}

function markStepActive(n) {
  const pill = document.querySelector(`.step-pill[data-step="${n}"]`);
  if (pill) { pill.classList.add('active'); pill.classList.remove('done'); }
}

function markStepDone(n) {
  const pill = document.querySelector(`.step-pill[data-step="${n}"]`);
  if (pill) { pill.classList.remove('active'); pill.classList.add('done'); }
}

function appendLog(step, event, detail) {
  const log = el('runningLog');
  if (!log) return;
  const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
  const line = document.createElement('div');
  line.className = 'log-line';
  line.innerHTML = `
    <span class="log-time">${time}</span>
    <span class="log-event">${escHtml(event)}</span>
    <span class="log-detail">${escHtml(detail)}</span>`;
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
}


// ══════════════════════════════════════════════════════════════════
// RESULTS — Map backend response to UI cards
// ══════════════════════════════════════════════════════════════════

function applyCardVisibility() {
  const pCards = ['cardScore', 'cardEmail', 'cardFollowup', 'cardDeal'];
  const cCards = ['cardChurn', 'cardRetention', 'cardCompetitive'];
  
  if (currentMode === 'prospects') {
    pCards.forEach(id => { if (el(id)) el(id).style.display = 'block'; });
    cCards.forEach(id => { if (el(id)) el(id).style.display = 'none'; });
  } else {
    pCards.forEach(id => { if (el(id)) el(id).style.display = 'none'; });
    cCards.forEach(id => { if (el(id)) el(id).style.display = 'block'; });
  }
}

function populateResults(company, data) {
  if (el('pipelineRunning')) el('pipelineRunning').style.display = 'none';
  if (el('resultsCards'))    el('resultsCards').style.display     = 'block';

  applyCardVisibility();

  setText('resultsCompanyName', company);
  setText('resultsMeta', `Pipeline completed · ${new Date().toLocaleString()}`);

  // Card 1: Lead Score
  const lead = data.lead || {};
  const score = lead.score || 0;
  const priority = (lead.priority || 'low').toLowerCase();

  setText('scoreNumber', score);
  setText('scoreReason', lead.reason || '—');

  const badge = el('scoreBadge');
  if (badge) {
    badge.textContent = priority.toUpperCase();
    badge.className = `card-badge ${priority}`;
  }

  const circumference = 314;
  const offset = circumference - (score / 100) * circumference;
  const ring = el('ringFill');
  if (ring) {
    ring.style.strokeDashoffset = offset;
    ring.className = `ring-fill ${priority}`;
  }

  // Card 2: Email 1
  const email = data.email || {};
  setText('emailSubject1', email.email_subject || '—');
  setHtml('emailBody1', formatEmailBody(email.email_body));
  renderEngagement('engagementBar1', email.engagement_context);

  // Card 3: Follow-up
  const followup = data.followup_email || {};
  setText('emailSubject2', followup.email_subject || '—');
  setHtml('emailBody2', formatEmailBody(followup.email_body));
  renderEngagement('engagementBar2', followup.engagement_context);

  // Card 4: Deal Intelligence
  const deal = data.deal || {};
  const dealRisk = (deal.risk_level || 'low').toLowerCase();

  const dealBadge = el('dealBadge');
  if (dealBadge) {
    dealBadge.textContent = (deal.risk_level || '—').toUpperCase();
    dealBadge.className = `card-badge ${dealRisk}`;
  }

  const bar = el('dealRiskBar');
  if (bar) bar.className = `deal-risk-bar ${dealRisk}`;

  setText('dealConfidence', `Confidence: ${deal.confidence || 0}%`);
  setText('dealIssue', deal.issue || '—');
  setText('dealAction', deal.action || '—');

  // Card 5: Competitive Battlecard
  const battlecard = data.battlecard || {};
  setText('competitiveStrategy',
    battlecard.strategy || 'No competitive pressure detected — battlecard not triggered.');

  const points = Array.isArray(battlecard.talking_points) ? battlecard.talking_points : [];
  const pointsEl = el('competitivePoints');
  if (pointsEl) {
    pointsEl.innerHTML = points.length
      ? points.map(p => `<li>${escHtml(p)}</li>`).join('')
      : '<li>Battlecard is generated only when deal risk is HIGH.</li>';
  }

  // Card 6: Churn
  const churn = data.churn || {};
  const churnRisk = (churn.risk_level || 'low').toLowerCase();

  const churnBadge = el('churnBadge');
  if (churnBadge) {
    churnBadge.textContent = (churn.risk_level || '—').toUpperCase();
    churnBadge.className = `card-badge ${churnRisk}`;
  }

  setText('churnScore', churn.churn_score ?? '—');
  setText('recoveryProb', churn.recovery_probability != null ? `${churn.recovery_probability}%` : '—');

  const urgencyMap = { immediate: 'NOW', within_3_days: '3 days', this_week: 'Week' };
  setText('churnUrgency', urgencyMap[churn.urgency] || churn.urgency || '—');
  setText('churnNarrative', churn.churn_narrative || '—');
  setText('churnIntervention', churn.intervention || '—');

  // Card 7: Retention
  const ret = data.retention_intervention || {};
  setText('retentionSubject',
    ret.retention_email_subject || 'No intervention triggered — churn risk was not HIGH.');
  setText('retentionBody',
    ret.retention_email_body || 'Retention emails are auto-generated only for high churn-risk accounts.');

  // Timeline
  loadTimeline(currentLeadId);
}

function formatEmailBody(body) {
  if (!body) return '—';
  return escHtml(body)
    .replace(/&lt;br&gt;/g, '<br>')
    .replace(/&lt;br\/&gt;/g, '<br>')
    .replace(/\n/g, '<br>');
}

function renderEngagement(containerId, ctx) {
  const container = el(containerId);
  if (!container) return;
  if (!ctx || typeof ctx !== 'object') {
    container.innerHTML = `
      <span class="eng-pill off">Opened</span>
      <span class="eng-pill off">Replied</span>
      <span class="eng-pill off">No Reply</span>`;
    return;
  }
  const pills = [
    { key: 'opened', label: 'Opened' },
    { key: 'replied', label: 'Replied' },
    { key: 'no_reply', label: 'No Reply' },
  ];
  container.innerHTML = pills.map(p =>
    `<span class="eng-pill ${ctx[p.key] ? 'on' : 'off'}">${p.label}</span>`
  ).join('');
}


// ══════════════════════════════════════════════════════════════════
// TIMELINE — GET /timeline/{entity_id}
// ══════════════════════════════════════════════════════════════════

async function loadTimeline(leadId) {
  if (!leadId) return;
  try {
    const res = await fetch(`${API}/timeline/${leadId}`);
    if (!res.ok) return;
    const json = await res.json();
    if (json.status === 'success') renderTimeline(json.data || []);
  } catch (e) {
    console.error('Timeline load failed:', e);
  }
}

function renderTimeline(events) {
  const track = el('timelineTrack');
  if (!track) return;

  if (!events.length) {
    track.innerHTML = '<div style="color:var(--text-muted);font-size:12px;">No events yet</div>';
    return;
  }

  const iconMap = {
    lead_scored: '★', email_generated: '✉', email_opened: '👁',
    no_reply: '○', followup_email_generated: '↻', deal_analyzed: '◈',
    battlecard_generated: '⚔', churn_predicted: '⚠', intervention_triggered: '⚡',
  };

  track.innerHTML = events.map(e => {
    const icon = iconMap[e.event_type] || '·';
    const dot = e.entity_type === 'deal' ? 'deal'
              : e.entity_type === 'customer' ? 'customer' : 'lead';
    const time = e.timestamp
      ? new Date(e.timestamp).toLocaleTimeString('en-GB', { hour12: false }) : '';

    return `
      <div class="tl-event">
        <div class="tl-dot ${dot}">${icon}</div>
        <div class="tl-content">
          <div class="tl-type">${escHtml(e.event_type)}</div>
          <div class="tl-time">${time} · ${escHtml(e.entity_type)}</div>
        </div>
      </div>`;
  }).join('');
}
