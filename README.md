# 🏦 SBI Companion: An Agentic AI Banking Companion

<p align="center">
  <img src="public/logo.png" alt="SBI Saathi Logo" width="160" />
</p>

<p align="center">
  <strong>India's First Agentic AI Banking Companion for SBI Services</strong>
</p>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#technology-stack">Technology Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#database-setup">Database Setup</a>
</p>

---

## 🌟 Overview

**SBI Companion** is a premium, AI-powered financial dashboard and conversational SBI AI designed to secure and optimize your personal wealth, credit cards, insurance net, and day-to-day banking. By combining next-generation LLM intelligence with secure mockup sandbox capabilities, SBI Companion guides your financial decisions and performs automated workflows with your explicit consent.

---

## ✨ Key Features

### 💬 Agentic AI Assistant

* **Contextual Conversations:** Chat with a companion that has access to your portfolio, cards, transactions, and goals.
* **Smart Actions:** Prompt the agent to analyze spending patterns, transfer simulator funds, or suggest an investment plan.

### 💳 Cards Control Hub

* **Security Controls:** Toggle card locking, manage transaction limits (POS, ATM, Online, International), and block cards.
* **Spend Analytics:** Track monthly usages, categorizations, and receive warning nudges when reaching limits.

### 🛡️ Insurance Policy Auditor

* **Protection Auditing:** Evaluate active life, health, and vehicle policies to compute a unified protection score.
* **Gaps Detection:** Identify missing covers (e.g., critical illness, low coverage limits) and receive plan comparisons.
* **Claims Helper:** Pre-fill claiming documentation and submit details through a guided walkthrough.

### 📈 Investments (Wealth Nudges)

* **Goal Tracker:** Create and monitor goals (e.g., Retiring early, Buying a Home) linked to active SIPs.
* **Mutual Fund Discoverer:** Browse high-performing funds and start automated monthly investments.

### 💸 Payments & Bills Scheduler

* **Automated Scheduler:** Monitor utility, credit card, and custom bills.
* **Transfer Limits:** Set custom transaction boundaries for daily, weekly, or recurring items.

---

## 🛠️ Technology Stack

* **Frontend:** React 19 (Hooks, Context API), TypeScript, Vite, Tailwind CSS
* **Data & Analytics:** Recharts (Interactive Financial Charts), Lucide React (Icons)
* **Backend Database & Auth:** Supabase (SQL DB, REST RPCs, user authentication)
* **AI Model:** Google Gemini API (Agentic interactions, conversational analysis)

---

## 🚀 Getting Started

### Prerequisites

* **Node.js** (v18.0.0 or higher)
* **npm** (v9.0.0 or higher)

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd sbi-saathi
   ```
2. **Install dependencies:**

   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and specify the following variables:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

   *(Ensure `.env` remains ignored by git to keep your keys secure!)*
4. **Start local development server:**

   ```bash
   npm run dev
   ```
5. **Build for production:**

   ```bash
   npm run build
   ```

---

## 🗄️ Database Setup

The database schema is defined in [supabase_schema.sql](<file:///d:/Programming%20Playground/Google%20Antigravity%20Playground/SBI%20Saathi/supabase_schema.sql>).

### Option A: Automate using PowerShell

If you have your project's `service_role` key, you can use the automatic schema applicator script:

```powershell
$env:SUPABASE_SERVICE_ROLE_KEY='your_service_role_key'
.\apply_schema.ps1
```

### Option B: Manual SQL Editor (Recommended)

1. Go to your **Supabase Dashboard** -> **SQL Editor**.
2. Click **New query**.
3. Copy the entire contents of [supabase_schema.sql](<file:///d:/Programming%20Playground/Google%20Antigravity%20Playground/SBI%20Saathi/supabase_schema.sql>) and paste it into the editor.
4. Click **Run**.
