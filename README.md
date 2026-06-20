🤖 Vathmos — AI-Powered CRM Agent System

> **ET Hackathon Project** | Multi-Agent Sales Pipeline powered by LLaMA 3.3 via Groq API



🚀 Overview

**Vathmos** is an intelligent, multi-agent CRM system designed to automate and supercharge the entire B2B sales pipeline. It uses specialized AI agents that work in coordination — from discovering and scoring leads to predicting churn and crafting personalized outreach — all in a sleek dark-mode dashboard.

---

✨ Features

- 🎯 **Lead Scoring Agent** — Automatically scores and prioritizes incoming prospects based on fit and behavior signals
- 📬 **Outreach Agent** — Generates personalized email/message drafts for each lead
- ⚠️ **Deal Risk Agent** — Flags at-risk deals in the pipeline before they go cold
- 🔄 **Churn Prediction Agent** — Identifies existing customers likely to churn
- 🛡️ **Retention Agent** — Recommends actions to retain high-value customers
- 🔁 **Orchestrator** — Coordinates all agents to run the full pipeline end-to-end
- 📊 **Dark-mode Dashboard** — Clean, prospect-discovery-style UI to visualize agent outputs

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, Flask |
| Database | SQLite |
| Frontend | HTML, CSS, JavaScript (vanilla) |
| AI / LLM | Groq API — `llama-3.3-70b-versatile` |
| Architecture | Multi-Agent System with Orchestrator |

---

## 📁 Project Structure

```
Vathmos_ET/
├── main.py                 # Flask app entry point
├── requirements.txt        # Python dependencies
├── crm_agent.db            # SQLite database
│
├── agents/                 # Specialized AI agents
│   ├── lead_scoring.py
│   ├── outreach.py
│   ├── deal_risk.py
│   ├── churn_prediction.py
│   └── retention.py
│
├── orchestrator/           # Pipeline coordinator
│
├── core/                   # Shared logic / utilities
│
├── routes/                 # Flask API routes
│   └── api.py
│
├── database/               # DB init and queries
│   └── db.py
│
├── templates/              # Jinja2 HTML templates
│   ├── index.html
│   └── dashboard.html
│
├── frontend/               # Frontend components
└── static/                 # CSS, JS, assets
```

---

## ⚙️ Setup & Installation

### Prerequisites

- Python 3.9+
- A [Groq API Key](https://console.groq.com/)

### 1. Clone the repository

```bash
git clone https://github.com/Rajeevkulkarni1111/Vathmos_ET.git
cd Vathmos_ET
```

### 2. Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate        # macOS/Linux
venv\Scripts\activate           # Windows
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file in the root directory:

```env
GROQ_API_KEY=your_groq_api_key_here
```

### 5. Run the application

```bash
python main.py
```

The app will be live at **http://127.0.0.1:5000**

---

## 🔌 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/` | Landing / home page |
| `GET` | `/dashboard` | Agent dashboard view |
| `POST` | `/api/...` | Agent pipeline endpoints (see `routes/api.py`) |

---

## 🧠 How It Works

```
User Input / CRM Data
        ↓
   Orchestrator
   ┌────────────────────────────────────────┐
   │  Lead Scoring → Outreach               │
   │  Deal Risk → Churn Prediction          │
   │               → Retention              │
   └────────────────────────────────────────┘
        ↓
  Results stored in SQLite
        ↓
  Displayed on Dashboard
```

Each agent makes an LLM call to `llama-3.3-70b-versatile` via the Groq API with a specialized system prompt and structured output, then saves results to the SQLite database.

---

## 🛣️ Roadmap

- [x] Lead Scoring Agent
- [x] Outreach Agent
- [x] Deal Risk Agent
- [x] Churn Prediction Agent
- [x] Retention Agent
- [x] Orchestrator (end-to-end pipeline)
- [x] Dark-mode Dashboard
- [ ] Gmail Integration for direct email sending
- [ ] Authentication & multi-user support
- [ ] Deployment (Render / Railway / Fly.io)

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

This project was built for the **ET Hackathon**. All rights reserved © Rajeev Kulkarni.

---

## 👤 Author

**Rashmi Sharma**
- GitHub: [@RashmiSharma-1409](https://github.com/RashmiSharma-1409)
