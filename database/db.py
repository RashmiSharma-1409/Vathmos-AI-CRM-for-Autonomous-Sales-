import sqlite3
import json
import os
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH  = os.path.join(BASE_DIR, "..", "crm_agent.db")


# ──────────────────────────────────────────────
# CONNECTION
# ──────────────────────────────────────────────

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# ──────────────────────────────────────────────
# TABLE CREATION
# ──────────────────────────────────────────────

def init_db():
    conn = get_connection()
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS leads (
            id           TEXT PRIMARY KEY,
            company      TEXT NOT NULL,
            industry     TEXT NOT NULL,
            event        TEXT NOT NULL,
            location     TEXT,
            employees    TEXT,
            website      TEXT,
            tags         TEXT,
            score        INTEGER,
            priority     TEXT,
            score_reason TEXT,
            created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS customers (
            id                 TEXT PRIMARY KEY,
            company            TEXT NOT NULL,
            industry           TEXT NOT NULL,
            plan               TEXT,
            mrr                INTEGER,
            usage              TEXT,
            sentiment          TEXT,
            inactive_days      INTEGER DEFAULT 0,
            competitor_signal  TEXT,
            csm                TEXT,
            joined_date        TEXT,
            churn_score        INTEGER,
            risk_level         TEXT,
            created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS pipeline_events (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            entity_id   TEXT NOT NULL,
            entity_type TEXT NOT NULL,
            event_type  TEXT NOT NULL,
            data        TEXT,
            timestamp   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS agent_outputs (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            lead_id     TEXT NOT NULL,
            agent_name  TEXT NOT NULL,
            output_data TEXT NOT NULL,
            created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    seed_leads(conn)
    seed_customers(conn)
    conn.close()
    print("DB initialised successfully.")


# ──────────────────────────────────────────────
# SEED LEADS — 40 prospects
# ──────────────────────────────────────────────

SEED_LEADS = [
    # SAAS
    {"id":"saas_001","company":"NovaTech","industry":"SaaS","event":"Raised Series A funding of $12M to scale their cloud infrastructure platform","location":"San Francisco, CA","employees":"50-100","website":"novatech.io","tags":["SaaS","Series A","Funding","Cloud","Growth"]},
    {"id":"saas_002","company":"CloudPilot","industry":"SaaS","event":"Raised Series B funding of $40M led by Sequoia Capital","location":"Austin, TX","employees":"100-250","website":"cloudpilot.com","tags":["SaaS","Series B","Funding","Sequoia","Scale"]},
    {"id":"saas_003","company":"StreamlineHQ","industry":"SaaS","event":"Raised Series A funding of $8M for their workflow automation platform","location":"New York, NY","employees":"30-80","website":"streamlinehq.com","tags":["SaaS","Series A","Funding","Automation","Workflow"]},
    {"id":"saas_004","company":"DataBridge","industry":"SaaS","event":"Hired new CTO from Salesforce to lead product engineering","location":"Seattle, WA","employees":"150-300","website":"databridge.io","tags":["SaaS","CTO Hire","Leadership","Salesforce","Engineering"]},
    {"id":"saas_005","company":"PipelineOS","industry":"SaaS","event":"Hired new CEO with 15 years experience scaling B2B SaaS companies","location":"Boston, MA","employees":"80-150","website":"pipelineos.com","tags":["SaaS","CEO Hire","Leadership","B2B","Scale"]},
    {"id":"saas_006","company":"SyncLayer","industry":"SaaS","event":"Hired new CTO from Google Cloud to drive enterprise expansion","location":"Chicago, IL","employees":"200-400","website":"synclayer.com","tags":["SaaS","CTO Hire","Google","Enterprise","Leadership"]},
    {"id":"saas_007","company":"Taskflow","industry":"SaaS","event":"Launched AI-powered project management platform with 5000 beta signups","location":"Toronto, Canada","employees":"40-90","website":"taskflow.app","tags":["SaaS","Product Launch","AI","Project Management","Beta"]},
    {"id":"saas_008","company":"Reportly","industry":"SaaS","event":"Launched real-time analytics dashboard with native Slack and Notion integrations","location":"London, UK","employees":"25-60","website":"reportly.io","tags":["SaaS","Product Launch","Analytics","Slack","Notion"]},
    {"id":"saas_009","company":"OrbitCRM","industry":"SaaS","event":"Expanding into European markets with new offices in Berlin and Amsterdam","location":"New York, NY","employees":"300-600","website":"orbitcrm.com","tags":["SaaS","Expansion","Europe","Berlin","CRM"]},
    {"id":"saas_010","company":"VaultHR","industry":"SaaS","event":"Expanding into Southeast Asian markets after successful US growth","location":"Singapore","employees":"100-200","website":"vaulthr.com","tags":["SaaS","Expansion","Asia","HR Tech","Global"]},
    # FINTECH
    {"id":"fin_001","company":"FinVault","industry":"FinTech","event":"Raised Series A funding of $15M to expand their digital banking platform","location":"New York, NY","employees":"80-150","website":"finvault.io","tags":["FinTech","Series A","Funding","Digital Banking","Growth"]},
    {"id":"fin_002","company":"LedgerAI","industry":"FinTech","event":"Raised Series B funding of $55M led by Tiger Global","location":"London, UK","employees":"200-400","website":"ledgerai.com","tags":["FinTech","Series B","Funding","Tiger Global","AI"]},
    {"id":"fin_003","company":"ClearFund","industry":"FinTech","event":"Raised Series A funding of $10M for SME lending automation","location":"Dublin, Ireland","employees":"40-80","website":"clearfund.io","tags":["FinTech","Series A","Funding","Lending","SME"]},
    {"id":"fin_004","company":"PayStream","industry":"FinTech","event":"Hired new CTO from Stripe to lead payments infrastructure rebuild","location":"San Francisco, CA","employees":"150-300","website":"paystream.co","tags":["FinTech","CTO Hire","Stripe","Payments","Infrastructure"]},
    {"id":"fin_005","company":"WealthRoute","industry":"FinTech","event":"Hired new CEO from BlackRock with a mandate to triple AUM in 3 years","location":"Chicago, IL","employees":"100-200","website":"wealthroute.com","tags":["FinTech","CEO Hire","BlackRock","Wealth Management","Leadership"]},
    {"id":"fin_006","company":"NexoPay","industry":"FinTech","event":"Hired new CTO from Revolut to drive crypto and DeFi product roadmap","location":"Amsterdam, Netherlands","employees":"60-120","website":"nexopay.com","tags":["FinTech","CTO Hire","Revolut","Crypto","DeFi"]},
    {"id":"fin_007","company":"TrustLedger","industry":"FinTech","event":"Launched blockchain-based trade finance platform with 3 major bank pilots","location":"Singapore","employees":"50-100","website":"trustledger.io","tags":["FinTech","Product Launch","Blockchain","Trade Finance","Banks"]},
    {"id":"fin_008","company":"SpendIQ","industry":"FinTech","event":"Launched AI-powered expense management tool for mid-market enterprises","location":"Toronto, Canada","employees":"30-70","website":"spendiq.com","tags":["FinTech","Product Launch","AI","Expense Management","Enterprise"]},
    {"id":"fin_009","company":"MintBridge","industry":"FinTech","event":"Expanding into Latin American markets with regulatory approvals in 4 countries","location":"Miami, FL","employees":"200-500","website":"mintbridge.com","tags":["FinTech","Expansion","Latin America","Regulatory","Global"]},
    {"id":"fin_010","company":"ArcCapital","industry":"FinTech","event":"Expanding into African markets through partnership with local banks","location":"Nairobi, Kenya","employees":"80-160","website":"arccapital.io","tags":["FinTech","Expansion","Africa","Banking","Emerging Markets"]},
    # HEALTHTECH
    {"id":"hlth_001","company":"MedLoop","industry":"HealthTech","event":"Raised Series A funding of $18M for AI-powered diagnostics platform","location":"Boston, MA","employees":"60-120","website":"medloop.health","tags":["HealthTech","Series A","Funding","AI","Diagnostics"]},
    {"id":"hlth_002","company":"PulseOS","industry":"HealthTech","event":"Raised Series B funding of $35M to scale remote patient monitoring","location":"San Diego, CA","employees":"150-300","website":"pulseos.health","tags":["HealthTech","Series B","Funding","Remote Monitoring","Patients"]},
    {"id":"hlth_003","company":"GenomeLink","industry":"HealthTech","event":"Raised Series A funding of $22M for precision medicine research platform","location":"Cambridge, MA","employees":"40-90","website":"genomelink.io","tags":["HealthTech","Series A","Funding","Genomics","Precision Medicine"]},
    {"id":"hlth_004","company":"CareSync","industry":"HealthTech","event":"Hired new CEO with 20 years experience in digital health and hospital systems","location":"Chicago, IL","employees":"200-400","website":"caresync.com","tags":["HealthTech","CEO Hire","Leadership","Digital Health","Hospitals"]},
    {"id":"hlth_005","company":"NeuroPath","industry":"HealthTech","event":"Hired new CTO from IBM Watson Health to lead AI research division","location":"Pittsburgh, PA","employees":"80-160","website":"neuropath.health","tags":["HealthTech","CTO Hire","IBM Watson","AI","Neurology"]},
    {"id":"hlth_006","company":"RehabIQ","industry":"HealthTech","event":"Hired new CEO from Philips Healthcare to accelerate hospital partnerships","location":"Minneapolis, MN","employees":"100-200","website":"rehabiq.com","tags":["HealthTech","CEO Hire","Philips","Hospitals","Rehabilitation"]},
    {"id":"hlth_007","company":"VitalEdge","industry":"HealthTech","event":"Launched wearable-integrated chronic disease management platform","location":"Seattle, WA","employees":"50-100","website":"vitaledge.health","tags":["HealthTech","Product Launch","Wearables","Chronic Disease","IoT"]},
    {"id":"hlth_008","company":"CliniqAI","industry":"HealthTech","event":"Launched FDA-cleared AI tool for radiology report automation","location":"Houston, TX","employees":"60-130","website":"cliniqai.com","tags":["HealthTech","Product Launch","FDA","Radiology","AI"]},
    {"id":"hlth_009","company":"MindBridge Health","industry":"HealthTech","event":"Expanding into 6 new US states following successful pilot in California","location":"Los Angeles, CA","employees":"120-250","website":"mindbridgehealth.com","tags":["HealthTech","Expansion","Mental Health","US Growth","Scaling"]},
    {"id":"hlth_010","company":"TherapyNest","industry":"HealthTech","event":"Expanding into UK and Australian markets with NHS and Medicare partnerships","location":"London, UK","employees":"80-150","website":"therapynest.com","tags":["HealthTech","Expansion","NHS","Australia","Mental Health"]},
    # ECOMMERCE
    {"id":"ecom_001","company":"ShopGrid","industry":"E-commerce","event":"Raised Series A funding of $9M to build out their merchant platform","location":"Singapore","employees":"50-100","website":"shopgrid.co","tags":["E-commerce","Series A","Funding","Merchant Platform","Growth"]},
    {"id":"ecom_002","company":"RetailIQ","industry":"E-commerce","event":"Raised Series B funding of $28M led by a16z for retail tech expansion","location":"Berlin, Germany","employees":"100-200","website":"retailiq.com","tags":["E-commerce","Series B","Funding","a16z","Retail Tech"]},
    {"id":"ecom_003","company":"BuyWave","industry":"E-commerce","event":"Raised Series A funding of $6M for social commerce platform","location":"Mumbai, India","employees":"30-70","website":"buywave.com","tags":["E-commerce","Series A","Funding","Social Commerce","India"]},
    {"id":"ecom_004","company":"CartFlow","industry":"E-commerce","event":"Hired new CTO from Shopify to lead platform re-architecture","location":"Toronto, Canada","employees":"80-160","website":"cartflow.io","tags":["E-commerce","CTO Hire","Shopify","Platform","Engineering"]},
    {"id":"ecom_005","company":"NestCommerce","industry":"E-commerce","event":"Hired new CEO from Amazon Marketplace with vision to disrupt D2C","location":"Seattle, WA","employees":"150-300","website":"nestcommerce.com","tags":["E-commerce","CEO Hire","Amazon","D2C","Leadership"]},
    {"id":"ecom_006","company":"DropNest","industry":"E-commerce","event":"Hired new CTO from eBay to rebuild their seller analytics infrastructure","location":"Austin, TX","employees":"60-120","website":"dropnest.com","tags":["E-commerce","CTO Hire","eBay","Analytics","Sellers"]},
    {"id":"ecom_007","company":"LuxLoop","industry":"E-commerce","event":"Launched AI-powered luxury resale platform with authentication technology","location":"Paris, France","employees":"40-80","website":"luxloop.com","tags":["E-commerce","Product Launch","AI","Luxury","Resale"]},
    {"id":"ecom_008","company":"SnapStock","industry":"E-commerce","event":"Launched real-time inventory sync platform for omnichannel retailers","location":"Chicago, IL","employees":"25-60","website":"snapstock.io","tags":["E-commerce","Product Launch","Inventory","Omnichannel","Retail"]},
    {"id":"ecom_009","company":"GlobalCart","industry":"E-commerce","event":"Expanding into Middle East and North Africa with localised payment rails","location":"Dubai, UAE","employees":"200-400","website":"globalcart.com","tags":["E-commerce","Expansion","MENA","Payments","Global"]},
    {"id":"ecom_010","company":"PeerMart","industry":"E-commerce","event":"Expanding into Latin American markets after record Q4 growth in Brazil","location":"São Paulo, Brazil","employees":"100-250","website":"peermart.com","tags":["E-commerce","Expansion","Latin America","Brazil","Growth"]},
]


# ──────────────────────────────────────────────
# SEED CUSTOMERS — 10 existing clients
# Varied health states: 4 HIGH, 3 MEDIUM, 3 LOW
# ──────────────────────────────────────────────

SEED_CUSTOMERS = [
    # HIGH RISK
    {
        "id": "cust_001", "company": "NovaTech", "industry": "SaaS",
        "plan": "Enterprise", "mrr": 4500,
        "usage": "low", "sentiment": "negative", "inactive_days": 12,
        "competitor_signal": "Webflow Agency X",
        "csm": "Sarah Chen", "joined_date": "2024-06-15"
    },
    {
        "id": "cust_002", "company": "FinVault", "industry": "FinTech",
        "plan": "Growth", "mrr": 3200,
        "usage": "low", "sentiment": "negative", "inactive_days": 9,
        "competitor_signal": "SquareSpace Pro",
        "csm": "James Okafor", "joined_date": "2024-03-20"
    },
    {
        "id": "cust_003", "company": "MedLoop", "industry": "HealthTech",
        "plan": "Enterprise", "mrr": 6800,
        "usage": "low", "sentiment": "negative", "inactive_days": 15,
        "competitor_signal": "Huemor Agency",
        "csm": "Priya Nair", "joined_date": "2023-11-10"
    },
    {
        "id": "cust_004", "company": "ShopGrid", "industry": "E-commerce",
        "plan": "Growth", "mrr": 2900,
        "usage": "low", "sentiment": "negative", "inactive_days": 11,
        "competitor_signal": "Lounge Lizard",
        "csm": "Daniel Park", "joined_date": "2024-01-08"
    },
    # MEDIUM RISK
    {
        "id": "cust_005", "company": "CloudPilot", "industry": "SaaS",
        "plan": "Enterprise", "mrr": 7200,
        "usage": "medium", "sentiment": "neutral", "inactive_days": 4,
        "competitor_signal": None,
        "csm": "Sarah Chen", "joined_date": "2023-09-01"
    },
    {
        "id": "cust_006", "company": "RetailIQ", "industry": "E-commerce",
        "plan": "Growth", "mrr": 3800,
        "usage": "medium", "sentiment": "negative", "inactive_days": 5,
        "competitor_signal": None,
        "csm": "Daniel Park", "joined_date": "2024-02-14"
    },
    {
        "id": "cust_007", "company": "VitalEdge", "industry": "HealthTech",
        "plan": "Starter", "mrr": 1500,
        "usage": "medium", "sentiment": "neutral", "inactive_days": 6,
        "competitor_signal": None,
        "csm": "Priya Nair", "joined_date": "2024-05-22"
    },
    # LOW RISK / HEALTHY
    {
        "id": "cust_008", "company": "PayStream", "industry": "FinTech",
        "plan": "Enterprise", "mrr": 9500,
        "usage": "high", "sentiment": "positive", "inactive_days": 0,
        "competitor_signal": None,
        "csm": "James Okafor", "joined_date": "2023-07-30"
    },
    {
        "id": "cust_009", "company": "CareSync", "industry": "HealthTech",
        "plan": "Growth", "mrr": 4100,
        "usage": "high", "sentiment": "positive", "inactive_days": 1,
        "competitor_signal": None,
        "csm": "Priya Nair", "joined_date": "2023-12-05"
    },
    {
        "id": "cust_010", "company": "CartFlow", "industry": "E-commerce",
        "plan": "Starter", "mrr": 1800,
        "usage": "high", "sentiment": "positive", "inactive_days": 0,
        "competitor_signal": None,
        "csm": "Daniel Park", "joined_date": "2024-04-18"
    },
]


def seed_leads(conn):
    c = conn.cursor()
    inserted = 0
    for lead in SEED_LEADS:
        c.execute("SELECT id FROM leads WHERE id = ?", (lead["id"],))
        if not c.fetchone():
            c.execute("""
                INSERT INTO leads (id, company, industry, event, location, employees, website, tags)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (lead["id"], lead["company"], lead["industry"], lead["event"],
                  lead["location"], lead["employees"], lead["website"],
                  json.dumps(lead["tags"])))
            inserted += 1
    conn.commit()
    print(f"Seeded {inserted} new leads." if inserted else "Leads already seeded.")


def seed_customers(conn):
    c = conn.cursor()
    inserted = 0
    for cust in SEED_CUSTOMERS:
        c.execute("SELECT id FROM customers WHERE id = ?", (cust["id"],))
        if not c.fetchone():
            c.execute("""
                INSERT INTO customers
                    (id, company, industry, plan, mrr, usage, sentiment,
                     inactive_days, competitor_signal, csm, joined_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (cust["id"], cust["company"], cust["industry"], cust["plan"],
                  cust["mrr"], cust["usage"], cust["sentiment"],
                  cust["inactive_days"], cust.get("competitor_signal"),
                  cust["csm"], cust["joined_date"]))
            inserted += 1
    conn.commit()
    print(f"Seeded {inserted} new customers." if inserted else "Customers already seeded.")


# ──────────────────────────────────────────────
# LEADS — helpers
# ──────────────────────────────────────────────

def get_all_leads():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM leads ORDER BY industry, id")
    rows = c.fetchall()
    conn.close()
    return [_row_to_dict(row) for row in rows]


def get_lead_by_id(lead_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM leads WHERE id = ?", (lead_id,))
    row = c.fetchone()
    conn.close()
    return _row_to_dict(row) if row else None


def search_leads(keyword):
    conn = get_connection()
    c = conn.cursor()
    pattern = f"%{keyword}%"
    c.execute("""
        SELECT * FROM leads
        WHERE company LIKE ? OR industry LIKE ? OR event LIKE ? OR tags LIKE ?
        ORDER BY industry, id
    """, (pattern, pattern, pattern, pattern))
    rows = c.fetchall()
    conn.close()
    return [_row_to_dict(row) for row in rows]


def update_lead_score(lead_id, score, priority, score_reason):
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        UPDATE leads SET score=?, priority=?, score_reason=? WHERE id=?
    """, (score, priority, score_reason, lead_id))
    conn.commit()
    conn.close()


# ──────────────────────────────────────────────
# CUSTOMERS — helpers
# ──────────────────────────────────────────────

def get_all_customers():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM customers ORDER BY risk_level DESC, mrr DESC")
    rows = c.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_customer_by_id(cust_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM customers WHERE id = ?", (cust_id,))
    row = c.fetchone()
    conn.close()
    return dict(row) if row else None


def update_customer_risk(cust_id, churn_score, risk_level):
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        UPDATE customers SET churn_score=?, risk_level=? WHERE id=?
    """, (churn_score, risk_level, cust_id))
    conn.commit()
    conn.close()


# ──────────────────────────────────────────────
# PIPELINE EVENTS
# ──────────────────────────────────────────────

def log_pipeline_event(entity_id, entity_type, event_type, data):
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        INSERT INTO pipeline_events (entity_id, entity_type, event_type, data, timestamp)
        VALUES (?, ?, ?, ?, ?)
    """, (entity_id, entity_type, event_type,
          json.dumps(data), datetime.utcnow().isoformat()))
    conn.commit()
    conn.close()


def get_pipeline_events(entity_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        SELECT * FROM pipeline_events WHERE entity_id=? ORDER BY timestamp ASC
    """, (entity_id,))
    rows = c.fetchall()
    conn.close()
    events = []
    for row in rows:
        e = dict(row)
        e["data"] = json.loads(e["data"]) if e["data"] else {}
        events.append(e)
    return events


# ──────────────────────────────────────────────
# AGENT OUTPUTS
# ──────────────────────────────────────────────

def save_agent_output(lead_id, agent_name, output_data):
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        INSERT INTO agent_outputs (lead_id, agent_name, output_data, created_at)
        VALUES (?, ?, ?, ?)
    """, (lead_id, agent_name, json.dumps(output_data),
          datetime.utcnow().isoformat()))
    conn.commit()
    conn.close()


def get_agent_outputs(lead_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        SELECT * FROM agent_outputs WHERE lead_id=? ORDER BY created_at ASC
    """, (lead_id,))
    rows = c.fetchall()
    conn.close()
    outputs = []
    for row in rows:
        o = dict(row)
        o["output_data"] = json.loads(o["output_data"]) if o["output_data"] else {}
        outputs.append(o)
    return outputs


def get_latest_agent_output(lead_id, agent_name):
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        SELECT * FROM agent_outputs WHERE lead_id=? AND agent_name=?
        ORDER BY created_at DESC LIMIT 1
    """, (lead_id, agent_name))
    row = c.fetchone()
    conn.close()
    if row:
        o = dict(row)
        o["output_data"] = json.loads(o["output_data"]) if o["output_data"] else {}
        return o
    return None


# ──────────────────────────────────────────────
# UTILITY
# ──────────────────────────────────────────────

def _row_to_dict(row):
    if not row:
        return None
    d = dict(row)
    if "tags" in d and d["tags"]:
        try:
            d["tags"] = json.loads(d["tags"])
        except Exception:
            d["tags"] = []
    return d


def clear_pipeline_data(entity_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute("DELETE FROM pipeline_events WHERE entity_id=?", (entity_id,))
    c.execute("DELETE FROM agent_outputs WHERE lead_id=?", (entity_id,))
    conn.commit()
    conn.close()
    print(f"Cleared pipeline data for {entity_id}")


if __name__ == "__main__":
    init_db()