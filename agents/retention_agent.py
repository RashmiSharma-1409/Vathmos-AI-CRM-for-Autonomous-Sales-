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

model = "llama-3.3-70b-versatile"


def generate_retention_email(customer, company_name):
    prompt = f"""
    Act as an empathetic Customer Success Manager at a B2B SaaS company.
    This account is flagged as HIGH RISK for churn.

    Customer Details:
    - Company: {company_name}
    - Reasons for Churn Risk: {customer.get('reasons', ['Declining usage', 'Negative sentiment'])}

    Write a short, highly personalized "save the account" email.
    - Address them by company name ({company_name}), not "Hi team" or "Hi Valued Customer".
    - Acknowledge their specific drop in usage or frustration directly.
    - Offer a free strategy call or dedicated support.
    - Sound like a human who genuinely cares â€” not a salesperson.
    - Keep it under 100 words.

    Return ONLY a raw JSON object in this exact format:
    {{
      "email_subject": "<a warm, specific subject line mentioning {company_name}>",
      "email_body": "<the email body as a single paragraph, no newlines or markdown>"
    }}
    """

    try:
        response = get_client().chat.completions.create(
            model="llama-3.3-70b-versatile",
            temperature=0.4,
            messages=[{"role": "user", "content": prompt}]
        )

        content = response.choices[0].message.content.strip()

        if content.startswith("```json"):
            content = content[7:]
        elif content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]

        parsed = json.loads(content.strip())
        final_subject = parsed.get("email_subject", f"Checking in on {company_name}")
        final_body = parsed.get("email_body", f"Hi {company_name} team, we noticed a drop in usage and want to help. Can we schedule a quick call?")

    except Exception as e:
        print(f"Warning: Retention fallback triggered. Error: {e}")
        # Fallback uses real company_name â€” never "Valued Customer"
        final_subject = f"Checking in on {company_name}"
        final_body = (
            f"Hi {company_name} team, we noticed your activity has slowed recently and want to make sure "
            f"you're getting full value from the platform. Can we jump on a quick 20-minute call this week "
            f"to walk through any blockers together?"
        )

    return {
        "customer_id": customer["id"],
        "email_subject": final_subject,
        "email_body": final_body,
        "status": "retention_email_drafted"
    }


def trigger_retention_workflow(churn_data, company_name="Unknown Company"):
    """
    Orchestrates retention logic using churn signals.
    Always pass company_name from the pipeline for personalised emails.
    """
    customer = {
        "id": churn_data["customer_id"],
        "reasons": churn_data.get("reasons", [])
    }

    email_result = generate_retention_email(customer, company_name)

    return {
        "intervention_action": "Send personalized retention email",
        "retention_email_subject": email_result["email_subject"],
        "retention_email_body": email_result["email_body"],
        "status": "retention_triggered"
    }