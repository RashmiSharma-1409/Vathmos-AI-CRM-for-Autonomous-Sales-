import os
import json
from functools import lru_cache
from openai import OpenAI
from dotenv import load_dotenv

from core.timeline import get_timeline  # ðŸ§  NEW

load_dotenv()

@lru_cache(maxsize=1)
def get_client():
    return OpenAI(
        base_url="https://api.groq.com/openai/v1",
        api_key=os.getenv("GROQ_API_KEY"),
    )

model = "llama-3.3-70b-versatile"


# ðŸ§  NEW: Extract engagement signals from timeline
def get_engagement_summary(deal_id):
    events = get_timeline(deal_id)

    no_reply = any(e["event_type"] == "no_reply" for e in events)
    opened = any(e["event_type"] == "email_opened" for e in events)
    followups = sum(1 for e in events if "email" in e["event_type"])

    return {
        "no_reply": no_reply,
        "opened": opened,
        "followups": followups
    }


def analyze_deal(deal):
    deal_id = deal.get("id", "unknown")

    # ðŸ§  Get timeline-based engagement
    engagement = get_engagement_summary(deal_id)

    # ðŸ”¥ Prompt now uses REAL signals
    prompt = f"""
    Act as an elite Sales Operations Analyst.

    Analyze deal risk using engagement behaviour.

    Context:
    B2B deals typically close in 7-14 days.

    Engagement Signals:
    - Email opened: {engagement['opened']}
    - No reply: {engagement['no_reply']}
    - Number of follow-ups sent: {engagement['followups']}

    Rules:
    - No reply + multiple follow-ups â†’ HIGH risk
    - Opened but no reply â†’ MEDIUM-HIGH risk
    - No engagement at all â†’ HIGH risk
    - Active engagement â†’ LOW risk

    Return ONLY raw JSON:
    {{
      "risk_level": "<Low/Medium/High>",
      "issue": "<1-2 sentences>",
      "action": "<1 specific step>"
    }}
    """

    try:
        response = get_client().chat.completions.create(
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            messages=[{"role": "user", "content": prompt}]
        )

        content = response.choices[0].message.content.strip()
        print("RAW LLM OUTPUT:", content)

        # ðŸ›¡ï¸ Clean markdown
        if content.startswith("```json"):
            content = content[7:]
        elif content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]

        content = content.strip()
        parsed = json.loads(content)

        # ðŸ”¥ Normalize risk
        risk_raw = str(parsed.get("risk_level", "unknown")).lower()

        if "high" in risk_raw:
            final_risk = "High"
        elif "medium" in risk_raw:
            final_risk = "Medium"
        elif "low" in risk_raw:
            final_risk = "Low"
        else:
            final_risk = "Unknown"

        final_issue = str(parsed.get("issue", "Could not determine issue."))
        final_action = str(parsed.get("action", "Review deal manually."))

    except Exception as e:
        print(f"Warning: Deal analysis fallback triggered. Error: {e}")
        final_risk = "High"
        final_issue = "AI failed due to timeout or parsing error."
        final_action = "Manually review this deal immediately."

    # ðŸ§  Confidence based on engagement reality
    if engagement["no_reply"]:
        confidence = 95
    elif engagement["opened"]:
        confidence = 80
    else:
        confidence = 70

    # ðŸ”¥ Status intelligence
    status = "ai_analyzed"
    if final_risk == "Unknown":
        status = "uncertain_output"

    return {
        "deal_id": deal_id,
        "risk_level": final_risk,
        "issue": final_issue,
        "action": final_action,
        "confidence": confidence,
        "engagement_context": engagement,  # ðŸ˜ demo gold
        "status": status
    }