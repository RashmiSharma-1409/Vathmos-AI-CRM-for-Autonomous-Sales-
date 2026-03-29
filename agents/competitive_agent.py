import os
import json
from functools import lru_cache
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Point the client to OpenRouter
@lru_cache(maxsize=1)
def get_client():
    return OpenAI(
        base_url="https://api.groq.com/openai/v1",
        api_key=os.getenv("GROQ_API_KEY"),
    )

model = "llama-3.3-70b-versatile"

def generate_battlecard(deal, lead):
    # Grab the competitor from the deal, or use a default if missing
    competitor = deal.get("competitor_signal", "a cheaper, template-based alternative")
    
    prompt = f"""
    Act as an elite Product Marketing Manager for a premium web design agency. 
    Our sales rep is trying to close a deal with {lead.get('company', 'this prospect')} ({lead.get('industry', 'B2B')}), but the deal is at high risk. 
    
    They are currently looking at a competitor: {competitor}.

    Provide a concise competitive battlecard for our rep to use on their next call to save the deal.

    Return ONLY a raw JSON object matching this exact format:
    {{
      "strategy": "<1 powerful sentence on how to pivot the conversation away from price and toward ROI>",
      "talking_points": [
        "<Bullet 1: Attack the competitor's weakness>", 
        "<Bullet 2: Highlight our premium value>", 
        "<Bullet 3: A specific question the rep should ask the prospect to make them doubt the competitor>"
      ]
    }}
    
    Do not include markdown formatting, code blocks, or any conversational text.
    """

    try:
        response = get_client().chat.completions.create(
            model="llama-3.3-70b-versatile", 
            temperature=0.3,
            timeout=10,
            messages=[{"role": "user", "content": prompt}]
        )
        
        content = response.choices[0].message.content.strip()

        # The Armor: Strip markdown backticks if the AI disobeys instructions
        if content.startswith("```json"): content = content[7:]
        elif content.startswith("```"): content = content[3:]
        if content.endswith("```"): content = content[:-3]
        
        parsed = json.loads(content.strip())
        
        final_strategy = parsed.get("strategy", "Focus on our premium ROI and faster time-to-value rather than upfront costs.")
        final_points = parsed.get("talking_points", [
            "Highlight our specific SaaS design expertise.", 
            "Showcase our case studies proving a 20% lift in conversions.", 
            "Ask them what the true cost of a poorly converting website is."
        ])

    except Exception as e:
        print(f"Warning: Battlecard fallback triggered. Error: {e}")
        final_strategy = "Pivot the conversation away from price and toward long-term value."
        final_points = ["Focus on premium quality", "Highlight fast delivery", "Reference past success"]

    return {
        "deal_id": deal.get("id", "unknown"),
        "competitor": competitor,
        "strategy": final_strategy,
        "talking_points": final_points,
        "status": "battlecard_generated_ai"
    }