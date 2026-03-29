from agents.lead_agent import score_lead
from agents.outreach_agent import generate_email
from agents.deal_agent import analyze_deal
from agents.churn_agent import predict_churn
from agents.retention_agent import trigger_retention_workflow
from agents.competitive_agent import generate_battlecard

from core.timeline import log_event
from database.db import (
    save_agent_output, update_lead_score,
    update_customer_risk, clear_pipeline_data
)


# ──────────────────────────────────────────────────────────────────
# PROSPECT PIPELINE — Steps 1-5 only
# Churn/retention do NOT run on prospects — they haven't bought yet
# ──────────────────────────────────────────────────────────────────

def run_pipeline(lead):
    print("\n--- PROSPECT PIPELINE STARTED ---\n")

    clear_pipeline_data(lead["id"])

    # ── STEP 1: Score Lead ────────────────────────────────────────
    lead_result = score_lead(lead)
    print("Lead Scored:", lead_result)

    log_event(lead["id"], "lead", "lead_scored", lead_result)
    update_lead_score(lead["id"], lead_result["score"],
                      lead_result["priority"], lead_result["reason"])
    save_agent_output(lead["id"], "lead_agent", lead_result)

    # ── STEP 2: Initial Outreach ──────────────────────────────────
    email_result = generate_email(lead)
    print("\nEmail 1 Generated:\n", email_result["email_body"])

    log_event(lead["id"], "lead", "email_generated", email_result)
    save_agent_output(lead["id"], "outreach_agent_email1", email_result)

    # ── STEP 3: Simulate Engagement Signals ──────────────────────
    print("\nSimulating engagement...\n")
    log_event(lead["id"], "lead", "email_opened", {"opened": True})
    log_event(lead["id"], "lead", "no_reply",     {"days": 3})

    # ── STEP 4: Adaptive Follow-up ────────────────────────────────
    followup_email = generate_email(lead)
    print("\nAdaptive Follow-up:\n", followup_email["email_body"])

    log_event(lead["id"], "lead", "followup_email_generated", followup_email)
    save_agent_output(lead["id"], "outreach_agent_email2", followup_email)

    # ── STEP 5: Deal Intelligence ─────────────────────────────────
    deal = {"id": lead["id"], "stage": "demo", "value": "high"}

    deal_result = analyze_deal(deal)
    print("Deal Analysis:", deal_result)

    log_event(deal["id"], "deal", "deal_analyzed", deal_result)
    save_agent_output(lead["id"], "deal_agent", deal_result)

    print("\n--- PROSPECT PIPELINE ENDED ---\n")

    return {
        "lead":           lead_result,
        "email":          email_result,
        "followup_email": followup_email,
        "deal":           deal_result,
    }


# ──────────────────────────────────────────────────────────────────
# CUSTOMER HEALTH PIPELINE — runs on existing customers only
# Steps: Churn prediction → Retention email → Competitive battlecard
# ──────────────────────────────────────────────────────────────────

def run_customer_pipeline(customer):
    print(f"\n--- CUSTOMER PIPELINE STARTED: {customer['company']} ---\n")

    clear_pipeline_data(customer["id"])

    # ── STEP 1: Churn Prediction ──────────────────────────────────
    churn_result = predict_churn(customer)
    print("Churn Prediction:", churn_result)

    log_event(customer["id"], "customer", "churn_predicted", churn_result)
    save_agent_output(customer["id"], "churn_agent", churn_result)

    # Persist risk back to customers table for dashboard display
    update_customer_risk(customer["id"],
                         churn_result["churn_score"],
                         churn_result["risk_level"])

    retention_result  = None
    battlecard_result = None

    # ── STEP 2: Retention (only if HIGH risk) ─────────────────────
    if churn_result.get("risk_level", "").lower() == "high":
        print(f"\n🚨 HIGH CHURN RISK: Waking up Retention Agent...\n")

        retention_result = trigger_retention_workflow(
            churn_result,
            company_name=customer.get("company", "Valued Customer")
        )

        print("Retention Email Subject:", retention_result["retention_email_subject"])
        log_event(customer["id"], "customer", "intervention_triggered", retention_result)
        save_agent_output(customer["id"], "retention_agent", retention_result)

        # ── STEP 3: Battlecard (only if competitor signal exists) ─
        competitor = customer.get("competitor_signal")
        if competitor:
            print(f"\n⚔️ COMPETITIVE RISK: Generating battlecard vs {competitor}...\n")

            deal_context = {
                "id":                customer["id"],
                "competitor_signal": competitor,
            }

            battlecard_result = generate_battlecard(deal_context, customer)
            print("Battlecard Strategy:", battlecard_result["strategy"])

            log_event(customer["id"], "customer", "battlecard_generated", battlecard_result)
            save_agent_output(customer["id"], "competitive_agent", battlecard_result)

    print(f"\n--- CUSTOMER PIPELINE ENDED ---\n")

    return {
        "churn":      churn_result,
        "retention":  retention_result,
        "battlecard": battlecard_result,
    }