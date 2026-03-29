import os
import re
from functools import lru_cache
from openai import OpenAI
from dotenv import load_dotenv

from core.timeline import get_timeline

load_dotenv()

@lru_cache(maxsize=1)
def get_client():
    return OpenAI(
        base_url="https://api.groq.com/openai/v1",
        api_key=os.getenv("GROQ_API_KEY"),
    )

# â”€â”€ PROTECTED WORDS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# These are swapped out before the camelCase regex runs,
# then restored â€” prevents the splitter from breaking them.
PROTECTED_WORDS = [
    "SaaS", "NovaTech", "CloudPilot", "StreamlineHQ", "DataBridge",
    "PipelineOS", "SyncLayer", "Taskflow", "Reportly", "OrbitCRM",
    "VaultHR", "FinVault", "LedgerAI", "ClearFund", "PayStream",
    "WealthRoute", "NexoPay", "TrustLedger", "SpendIQ", "MintBridge",
    "ArcCapital", "MedLoop", "PulseOS", "GenomeLink", "CareSync",
    "NeuroPath", "RehabIQ", "VitalEdge", "CliniqAI", "TherapyNest",
    "ShopGrid", "RetailIQ", "BuyWave", "CartFlow", "NestCommerce",
    "DropNest", "LuxLoop", "SnapStock", "GlobalCart", "PeerMart",
    "LinkedIn", "GitHub", "YouTube", "HubSpot", "WordPress",
    "Series A", "Series B",
]


def analyze_engagement(lead_id):
    events = get_timeline(lead_id)
    opened   = any(e["event_type"] == "email_opened"    for e in events)
    replied  = any(e["event_type"] == "reply_received"  for e in events)
    no_reply = any(e["event_type"] == "no_reply"        for e in events)
    return {"opened": opened, "replied": replied, "no_reply": no_reply}


def fix_spacing(text):
    """
    Multi-pass cleaner for Llama 3.3 quirks:
    1. Protect known compound words/phrases from camelCase splitting.
    2. Fix camelCase merges on remaining text.
    3. Restore protected words.
    4. Fix apostrophe spacing (You ' ve â†’ You've).
    5. Fix known exact-match patterns.
    """
    # Step 1: protect known words
    placeholders = {}
    for i, word in enumerate(PROTECTED_WORDS):
        placeholder = f"__PROT{i}__"
        placeholders[placeholder] = word
        text = text.replace(word, placeholder)

    # Step 2: camelCase split on unprotected text
    text = re.sub(r'([a-z])([A-Z])', r'\1 \2', text)

    # Step 3: restore
    for placeholder, word in placeholders.items():
        text = text.replace(placeholder, word)

    # Step 4: fix apostrophe spacing â€” Llama adds spaces around apostrophes
    # Pattern: word SPACE ' SPACE word  â†’  word'word
    text = re.sub(r"(\w)\s+'\s+(\w)", r"\1'\2", text)
    # Also catch: SPACE ' ve / ' re / ' ll / ' t / ' s / ' m / ' d
    text = re.sub(r"\s+'(ve|re|ll|t|s|m|d)\b", r"'\1", text)

    # Step 5: fix S-a-a-S style character splits (Llama spells out acronyms)
    text = re.sub(r'\bS-a-a-S\b', 'SaaS', text, flags=re.IGNORECASE)
    text = re.sub(r'\bS\.a\.a\.S\b', 'SaaS', text, flags=re.IGNORECASE)
    text = re.sub(r'\bSaa-S\b', 'SaaS', text)

    # Step 6: known exact-match fixes
    known_fixes = {
        "Congratson":  "Congrats on",
        "congratson":  "congrats on",
        "Nova Tech":   "NovaTech",
    }
    for wrong, right in known_fixes.items():
        text = text.replace(wrong, right)

    return text


def build_subject_line(lead, engagement):
    company = lead["company"]
    if engagement["replied"]:
        return f"Re: {company}'s growth roadmap"
    elif engagement["opened"] and engagement["no_reply"]:
        return f"Still thinking about {company}'s next chapter?"
    else:
        return f"Quick question about {company}'s next phase"


def build_prompt(lead, engagement):
    company  = lead["company"]
    event    = lead["event"]
    industry = lead["industry"]

    if engagement["replied"]:
        tone_instruction = "Be consultative, warm, and continue the conversation naturally."
        context_line     = "The prospect has already replied. Build on the existing conversation."

    elif engagement["opened"] and engagement["no_reply"]:
        tone_instruction = (
            "Be more direct and add urgency. "
            "CRITICAL: Do NOT mention their funding round or milestone â€” they already saw that angle and ignored it. "
            "Instead open with a bold statement or question specifically about their website or competitors. "
            "Completely different opening, completely different angle."
        )
        context_line = (
            "The prospect opened the first email but didn't reply. "
            "The first email mentioned their funding â€” do NOT repeat that. "
            "Try a fresh angle focused on what they're losing without better design."
        )

    elif not engagement["opened"]:
        tone_instruction = "Lead with a stronger curiosity-driven hook. Be shorter and punchier."
        context_line     = "The prospect has not engaged at all. Brevity and intrigue matter more than detail."

    else:
        tone_instruction = "Write a standard personalized cold email with a soft CTA."
        context_line     = "This is the first outreach attempt."

    prompt = f"""
    Act as a top-tier sales representative for a premium web design agency.

    CRITICAL FORMATTING RULES â€” follow without exception:
    - Every word must be separated by a single space. No merged words ever.
    - "Series A" and "Series B" are always TWO words with a space between them.
    - "SaaS" is always ONE word: S-a-a-S is WRONG. The correct spelling is SaaS.
    - "{company}" must be written exactly as shown â€” do not split or alter it.
    - Contractions like "You've", "I've", "don't", "it's" must NEVER have spaces around the apostrophe.
      WRONG: "You ' ve"  RIGHT: "You've"
      WRONG: "I ' ve"    RIGHT: "I've"
      WRONG: "don ' t"   RIGHT: "don't"

    Context:
    {context_line}

    Engagement Signals:
    - Email opened: {engagement['opened']}
    - Replied: {engagement['replied']}
    - No reply: {engagement['no_reply']}

    Tone Instruction:
    {tone_instruction}

    Prospect Details:
    - Company: {company}
    - Recent Milestone: {event}
    - Industry: {industry}

    Email Instructions:
    1. Hook: Reference their recent milestone naturally â€” don't sound generic.
    2. Pivot: Connect it to their website or online presence and growth stage.
    3. Value: Show how better design directly improves their specific outcome.
    4. CTA: End with a single soft question. Not "Let me know if you're interested."
    5. Keep under 120 words.
    6. No subject line â€” only the email body.
    7. Address the reader directly â€” no "[First Name]" placeholder.
    8. No "I hope this finds you well" or any cliche openers.

    Output: Only the email body text. Nothing else.
    """
    return prompt


def generate_email(lead):
    engagement = analyze_engagement(lead["id"])
    subject    = build_subject_line(lead, engagement)
    prompt     = build_prompt(lead, engagement)

    try:
        response = get_client().chat.completions.create(
            model="llama-3.3-70b-versatile",
            temperature=0.5,
            messages=[{"role": "user", "content": prompt}]
        )

        email_body = response.choices[0].message.content.strip()
        email_body = fix_spacing(email_body)
        email_body = email_body.replace("\n", "<br>")

    except Exception as e:
        print(f"Warning: Outreach agent fallback triggered. Error: {e}")
        if engagement["replied"]:
            email_body = f"Thanks for getting back to me! I'd love to continue our conversation about {lead['company']}'s goals. Would a quick call this week work?"
        elif engagement["opened"] and engagement["no_reply"]:
            email_body = f"Still thinking it over? Happy to answer any questions about how we could support {lead['company']}'s next phase. Worth a 15-minute chat?"
        else:
            email_body = f"Congrats on {lead['event']} â€” exciting times for {lead['company']}. Would love to show you how design can accelerate what you're building. Open to a quick chat?"

    return {
        "lead_id":          lead["id"],
        "email_subject":    subject,
        "email_body":       email_body,
        "engagement_context": engagement,
        "status":           "email_generated_ai"
    }