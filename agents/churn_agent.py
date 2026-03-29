import os
import json
from functools import lru_cache
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

@lru_cache(maxsize=1)
def get_client():
    return OpenAI(
        base_url="https://api.groq.com/openai/v1",
        api_key=os.getenv("GROQ_API_KEY"),
    )


def compute_churn_score(customer):
    """
    Rule-based scoring engine â€” fast, deterministic, no API call.
    Returns raw score + reasons for the LLM to reason over.
    """
    churn_score = 0
    reasons = []

    if customer.get("usage") == "low":
        churn_score += 50
        reasons.append("Low product usage detected")

    if customer.get("sentiment") == "negative":
        churn_score += 30
        reasons.append("Negative customer sentiment")

    if customer.get("inactive_days", 0) > 7:
        churn_score += 20
        reasons.append(f"Customer inactive for {customer.get('inactive_days')} days")

    if churn_score >= 70:
        risk_level = "high"
    elif churn_score >= 40:
        risk_level = "medium"
    else:
        risk_level = "low"

    return churn_score, risk_level, reasons


def analyze_churn_with_llm(customer, churn_score, risk_level, reasons):
    """
    LLM layer â€” takes rule-based signals and generates:
    - A human-readable churn narrative (uses company name, not ID)
    - A specific personalised intervention action
    - Urgency + recovery probability
    """
    # Use company name if available, fall back to ID
    company_name = customer.get("company") or customer.get("id", "this customer")

    prompt = f"""
    Act as an expert Customer Success Analyst at a B2B SaaS company.

    You have been given pre-computed churn signals for a customer account.
    Your job is to interpret these signals and recommend a precise intervention.

    IMPORTANT: Always refer to the customer by their company name "{company_name}".
    Never use their ID or any placeholder like "the customer" alone.

    Customer Data:
    - Company Name: {company_name}
    - Usage Level: {customer.get("usage", "unknown")}
    - Sentiment: {customer.get("sentiment", "unknown")}
    - Inactive Days: {customer.get("inactive_days", 0)}

    Pre-computed Risk Analysis:
    - Churn Score: {churn_score}/100
    - Risk Level: {risk_level.upper()}
    - Triggered Signals: {reasons}

    Based on this, provide your analysis as a raw JSON object with NO markdown or code blocks:
    {{
      "churn_narrative": "<2 sentences explaining WHY {company_name} is at risk, using their name>",
      "intervention": "<1 highly specific action the account manager should take THIS WEEK for {company_name}>",
      "urgency": "<'immediate' | 'within_3_days' | 'this_week'>",
      "recovery_probability": "<integer 0-100>"
    }}

    Rules:
    - Be specific. Not 'send an email' â€” say exactly what to address.
    - Match urgency to risk level.
    - Output ONLY the raw JSON. No markdown, no code blocks, no extra text.
    """

    try:
        response = get_client().chat.completions.create(
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            messages=[{"role": "user", "content": prompt}]
        )

        content = response.choices[0].message.content.strip()

        # Strip markdown if model wraps in code blocks
        if content.startswith("```json"):
            content = content[7:]
        elif content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]

        content = content.strip()
        parsed  = json.loads(content)

        return {
            "churn_narrative":    str(parsed.get("churn_narrative",    f"{company_name} shows elevated churn signals.")),
            "intervention":       str(parsed.get("intervention",       "Schedule an immediate check-in call.")),
            "urgency":            str(parsed.get("urgency",            "within_3_days")),
            "recovery_probability": int(parsed.get("recovery_probability", 50))
        }

    except Exception as e:
        print(f"Warning: Churn LLM fallback triggered. Error: {e}")

        if risk_level == "high":
            return {
                "churn_narrative":    f"{company_name} is showing multiple critical churn signals including low usage and negative sentiment.",
                "intervention":       f"Escalate {company_name} to account manager immediately â€” schedule a rescue call within 24 hours and prepare a tailored retention offer.",
                "urgency":            "immediate",
                "recovery_probability": 40
            }
        elif risk_level == "medium":
            return {
                "churn_narrative":    f"{company_name}'s engagement is declining with early warning signs of dissatisfaction.",
                "intervention":       f"Send {company_name} a personalised check-in email referencing their specific use case and offer a free strategy session.",
                "urgency":            "within_3_days",
                "recovery_probability": 65
            }
        else:
            return {
                "churn_narrative":    f"{company_name} appears healthy with no strong churn indicators at this time.",
                "intervention":       f"Continue standard engagement cadence with {company_name}. Monitor for any changes in usage.",
                "urgency":            "this_week",
                "recovery_probability": 85
            }


def predict_churn(customer):
    """
    Main entry point â€” combines rule engine + LLM into one unified response.
    Expects customer dict with optional 'company' key for personalised output.
    """
    churn_score, risk_level, reasons = compute_churn_score(customer)
    llm_analysis = analyze_churn_with_llm(customer, churn_score, risk_level, reasons)

    return {
        "customer_id":        customer["id"],
        "churn_score":        churn_score,
        "risk_level":         risk_level,
        "reasons":            reasons,
        "churn_narrative":    llm_analysis["churn_narrative"],
        "intervention":       llm_analysis["intervention"],
        "urgency":            llm_analysis["urgency"],
        "recovery_probability": llm_analysis["recovery_probability"],
        "status":             "churn_analyzed_ai"
    }