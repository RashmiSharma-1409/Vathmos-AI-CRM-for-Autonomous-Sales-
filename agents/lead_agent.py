import os
import json
from functools import lru_cache
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# 1. Point the client to OpenRouter
@lru_cache(maxsize=1)
def get_client():
    return OpenAI(
        base_url="https://api.groq.com/openai/v1",
        api_key=os.getenv("GROQ_API_KEY"),
    )

model = "llama-3.3-70b-versatile"

def score_lead(lead):
    # 2. Upgraded prompt forcing strict formatting
    prompt = f"""
    Act as an expert Sales Intelligence System. Analyze this lead for a premium web design agency.

    Company: {lead['company']}
    Industry: {lead['industry']}
    Event: {lead['event']}
    Score high ONLY if there is clear buying signal (funding, hiring, expansion).
    Evaluate the lead and return ONLY a raw JSON object matching this exact format:
    {{
      "score": <integer 0-100 based on fit and urgency>,
      "priority": "<must be exactly 'low', 'medium', or 'high'>",
      "reason": "<1 concise sentence explaining the score>"
    }}

    Do not include markdown formatting, code blocks, or any conversational text.
    """

    try:
        # 3. Use the free Nemotron model
        response = get_client().chat.completions.create(
            model="llama-3.3-70b-versatile", 
            messages=[{"role": "user", "content": prompt}]
        )
        
        content = response.choices[0].message.content.strip()

        # 4. The "Armor": Strip markdown backticks if the AI disobeys instructions
        if content.startswith("```json"):
            content = content[7:]
        elif content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
            
        content = content.strip()

        # Parse the cleaned string
        parsed = json.loads(content)
        
        # 5. Use .get() to safely extract values. If the AI forgets a key, it won't crash your server.
        final_score = int(parsed.get("score", 50))
        final_priority = str(parsed.get("priority", "medium")).lower()
        final_reason = str(parsed.get("reason", "Lead scored successfully."))

    except Exception as e:
        # 6. Fallback safety net triggers if the API fails or JSON is unfixable
        print(f"Warning: Lead scoring fallback triggered. Error: {e}")
        final_score = 50
        final_priority = "medium"
        final_reason = "Fallback due to parsing error or API timeout"

    return {
        "lead_id": lead["id"],
        "score": final_score,
        "priority": final_priority,
        "reason": final_reason,
        "status": "ai_scored"
    }