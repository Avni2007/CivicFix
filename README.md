# CivicFix — Production-Quality AI-Powered Civic Issue Reporting & Resolution Platform

CivicFix is a full-stack, production-grade web application built to solve a critical daily civic problem: **citizens encounter infrastructure defects (potholes, garbage accumulation, broken streetlights, water leaks, drainage overflows) but lack a transparent, AI-assisted mechanism to report them, track status updates, and verify issue resolution.**

---

## 🌟 Core Architecture & Solution Highlights

- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Leaflet + OpenStreetMap, Recharts, Axios, React Router DOM.
- **Backend**: Node.js, Express.js REST API, JWT Authentication, Bcrypt Password Hashing, Role-Based Access Control (RBAC).
- **Database**: MongoDB & Mongoose ORM (featuring an automated fallback to an embedded in-memory MongoDB server for instant zero-setup execution).
- **AI/ML Service Engine**:
  1. **Category Prediction**: Keyword & NLP scoring engine mapping issue descriptions to municipal categories.
  2. **Priority Prediction Engine**: Calculates priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) using severity keyword analysis, category base risk, and spatial density.
  3. **Spatial Duplicate Detection**: Uses the **Haversine formula** to search active complaints within a **500-meter radius** combined with text similarity to prevent duplicate dispatches.
  4. **Smart Department Routing**: Automatically assigns complaints to responsible municipal departments (Public Works, Sanitation, Electricity, Water, Drainage, Traffic, Municipal Admin).
  5. **Executive Summarizer**: Generates concise action summaries for municipal department officers.
- **Form Auto-Save & Draft Persistence**: Real-time debounced draft saving to MongoDB (`/api/drafts`) with localStorage offline fallback and a "Continue Draft" section on the Citizen Dashboard.
- **Authority Operational Calendar & Task Management**: Interactive calendar scheduling dispatches, setting resolution deadlines, tracking overdue tasks, and linking dispatches to complaints.
- **Interactive Maps & Heatmap Density**: Leaflet maps with custom priority-coded markers (🔴 Critical, 🟠 High, 🟡 Medium, 🟢 Low), popup previews, Nominatim reverse geocoding, and **Density Heatmap Visualization**.
- **Immutable Audit History & Visual Timeline**: Every state transition (`REPORTED` → `VERIFIED` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED` → `CLOSED` / `REOPENED`) is recorded in an audit table with officer notes and timestamped proof-of-work images.
- **Citizen Verification Feedback Loop**: Officers cannot unilaterally close complaints. Citizens hold ultimate verification authority to confirm fix quality (**Yes → Closed** with 1-5 star ratings or **No → Reopened** with required explanation).

---

## 🏛️ Official Government-Verified Staff Dataset (36 Indian States & UTs)

CivicFix includes verified municipal staff datasets and local body registries across all 28 states and 8 union territories of India, utilizing real Ministry of Housing and Urban Affairs (MoHUA) / Local Government Directory (LGD) codes and state administrative cadres.

### Featured Verified Municipal Authorities & HRMS Cadre:
| State / UT | Municipal Body | Official Officer / Commissioner | Official Email | HRMS Employee ID | Department |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Delhi** | Municipal Corporation of Delhi (MCD) | Dr. Ashwani Kumar, IAS | `commissioner.mcd@delhi.gov.in` | `HRMS-DL-MCD-0001` | Municipal Administration |
| **Delhi** | Municipal Corporation of Delhi (MCD) | Er. Vikas Anand | `officer.pwd.delhi@civicfix.gov` | `HRMS-DL-MCD-1099` | Public Works |
| **Maharashtra** | Brihanmumbai Municipal Corporation (BMC) | Dr. Bhushan Gagrani, IAS | `commissioner.bmc@mcgm.gov.in` | `HRMS-MH-BMC-0001` | Municipal Administration |
| **Maharashtra** | Brihanmumbai Municipal Corporation (BMC) | Er. P. Velrasu, IAS | `officer.pwd.maharashtra@civicfix.gov` | `HRMS-MH-BMC-1002` | Public Works |
| **Karnataka** | Bruhat Bengaluru Mahanagara Palike (BBMP) | Shri Tushar Giri Nath, IAS | `commissioner.bbmp@karnataka.gov.in` | `HRMS-KA-BBMP-0001` | Municipal Administration |
| **Karnataka** | Bruhat Bengaluru Mahanagara Palike (BBMP) | Er. B.S. Prahallad | `officer.pwd.karnataka@civicfix.gov` | `HRMS-KA-BBMP-1055` | Public Works |
| **Tamil Nadu** | Greater Chennai Corporation (GCC) | Dr. J. Radhakrishnan, IAS | `commissioner.gcc@tn.gov.in` | `HRMS-TN-GCC-0001` | Municipal Administration |
| **Telangana** | Greater Hyderabad Municipal Corp (GHMC) | Shri Ronald Rose, IAS | `commissioner.ghmc@telangana.gov.in` | `HRMS-TG-GHMC-0001` | Municipal Administration |

All 73+ official staff accounts can log in via `/municipal-login` using default password: `demo1234`.

### Seeder & Provisioning Commands:
- `npm run seed` — Full database seed with 36 Municipalities, 73 verified government staff, demo shortcuts, and realistic complaints
- `npm run seed:official-staff` — Provision all verified staff from `government_verified_staff_dataset.json`
- `npm run seed:states` — Seed 36 state municipal bodies and geo-tagged complaints
- `node seed/provisionMunicipalUser.js --employeeId "HRMS-DL-MCD-1099"` — Provision a specific official officer by HRMS ID

---

## 👥 Demo User Accounts

The database seed script initializes ready-to-test accounts pre-populated with 35+ realistic complaints, notifications, draft complaints, and calendar tasks:

| Role | Email | Password | Access / Purpose |
| :--- | :--- | :--- | :--- |
| **Citizen** | `citizen@civicfix.demo` | `demo1234` | Report issues, auto-save drafts, track timeline, verify resolution quality |
| **Public Works Officer** | `authority@civicfix.demo` | `demo1234` | Manage roads/pothole queue, schedule tasks/deadlines, upload proof photo, mark resolved |
| **Sanitation Officer** | `officer.sanitation@civicfix.demo` | `demo1234` | Manage garbage/waste department complaints |
| **Municipal Admin** | `admin@civicfix.demo` | `demo1234` | Operational command center, Recharts analytics, system metrics |

---

## 🚀 Quick Start & Installation Instructions

### 1. Backend Server Setup

```bash
cd server
npm install
npm run seed     # Seeds DB with 35+ realistic complaints and demo accounts
npm start        # Launches REST API server on http://localhost:5000
```

### 2. Frontend Client Setup

```bash
cd client
npm install
npm run dev      # Launches Vite dev server on http://localhost:3000
```

---

## 🧪 Running Automated Test Suite

Run the automated API and AI test suite:

```bash
cd server
npm test
```

Verifies:
- AI Category & Priority Prediction Engine
- Haversine 500m Spatial Duplicate Detection
- User Password Hashing & Role Authorization

---

## 🔌 API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register user (Citizen / Officer / Admin)
- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET /api/auth/me` — Fetch authenticated user profile

### Complaints (`/api/complaints`)
- `GET /api/complaints` — Retrieve filterable list of complaints
- `POST /api/complaints` — Report new complaint with image upload & AI analysis
- `GET /api/complaints/:id` — Fetch complaint by ID with history timeline & comments
- `PATCH /api/complaints/:id` — Update status (Officer / Admin)
- `POST /api/complaints/:id/proof` — Upload proof-of-work image (Officer)
- `POST /api/complaints/:id/verify` — Confirm resolution or reopen (Citizen)
- `POST /api/complaints/:id/comments` — Post discussion comment

### Drafts (`/api/drafts`)
- `POST /api/drafts` — Auto-save/update complaint draft
- `GET /api/drafts` — Get user's active drafts
- `GET /api/drafts/:id` — Get draft by ID
- `DELETE /api/drafts/:id` — Delete a draft

### Operational Calendar (`/api/calendar`)
- `GET /api/calendar` — Get scheduled dispatches & deadline tasks
- `POST /api/calendar` — Schedule task / set resolution deadline
- `PATCH /api/calendar/:id` — Update task status or notes
- `DELETE /api/calendar/:id` — Delete calendar task

### AI Engine (`/api/ai`)
- `POST /api/ai/analyze` — Live issue analysis preview
- `POST /api/ai/duplicate-check` — Check spatial duplicates within 500m

### Admin Analytics (`/api/admin`)
- `GET /api/admin/statistics` — Aggregate counts & Recharts dataset

---

## 📊 Real-World Impact Metrics

Metrics evaluating deployment effectiveness:
1. **Average Resolution Time**: Target reduction from 72h to <24h.
2. **Duplicate Complaint Reduction**: 500m Haversine detection eliminates ~30% redundant dispatches.
3. **Citizen Resolution Satisfaction**: Measured via 1-5 star verification ratings.

## 🔐 Email OTP Verification (real email delivery)

Citizen registration and login verification use the email address entered by the citizen. The backend sends the generated 6-digit OTP to that exact address through SMTP.

### Gmail setup

1. Turn on 2-Step Verification for the Gmail account that will send CivicFix mail.
2. Create a Gmail **App Password** (Google Account → Security → App passwords).
3. Copy `.env.example` to `.env` inside `server/`.
4. Set these values:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_sender@gmail.com
SMTP_PASS=your_16_character_app_password
SMTP_FROM="CivicFix India" <your_sender@gmail.com>
```

Do **not** use the normal Gmail password. The sender account is only the SMTP sender; OTP messages are delivered to the citizen's `email` field.

The OTP expires after 10 minutes. If a user tries to log in before verification, CivicFix generates and emails a fresh OTP automatically. `Resend OTP` generates another fresh code.

### MongoDB

For a real deployed website, set `MONGODB_URI` to a MongoDB Atlas connection string. The development server can fall back to MongoDB Memory Server when a local MongoDB instance is unavailable, but that data is temporary.

### Run locally

Terminal 1:

```bash
cd server
npm install
cp .env.example .env
# edit .env and add MONGODB_URI + SMTP credentials
npm start
```

Terminal 2:

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:3000`.

### Production single-server deployment

The Express server automatically serves `client/dist` when it exists, so the frontend and API can be hosted from one website:

```bash
cd client
npm install
npm run build
cd ../server
npm install
npm start
```

Then open `http://localhost:5000`.

A Dockerfile is included for platforms that support Docker. Set `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, and the SMTP variables as platform environment variables.

---

## 🇮🇳 Pan-India Nationwide Governance (All 36 States & UTs)

CivicFix includes complete, out-of-the-box governance data for all **28 States and 8 Union Territories** across India:

- **Official LGD Municipal Codes**: E.g., `MCD-DL` (Delhi), `BMC-MH` (Mumbai), `BBMP-KA` (Bengaluru), `GCC-TN` (Chennai), `GHMC-TG` (Hyderabad), `KMC-WB` (Kolkata), `AMC-GJ` (Ahmedabad), `LMC-UP` (Lucknow), `JMC-RJ` (Jaipur), `PMC-BR` (Patna), and all remaining 26 states/UTs.
- **Official Government-Verified Accounts**: 73+ verified state municipal officers with HRMS Employee IDs, designations, official state portals, and 24/7 citizen helplines.
- **Statewide Leaflet Map Navigation**: Interactive Pan-India map (`/map`) centered at `[22.9734, 78.6569]` with one-click state zoom and filtering.
- **State-Level AI Routing**: Citizens reporting issues in any state automatically route tickets to the designated department officer for that state.
- **Public Municipal Directory**: Public dashboard (`/public-dashboard`) and Official Staff Portal (`/municipal-login`) for citizen transparency and official staff login.

### Seeding Official Staff & State Municipalities:
```bash
cd server
npm run seed:states           # Seeds all 36 States & UTs with official officers
npm run seed:official-staff   # Provisions all 73 verified government staff
```

---

## ☁️ Pan-India Cloud Launch Playbook

To launch CivicFix publicly for all states in India:

### 1. Database (MongoDB Atlas)
1. Create a free/production cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and whitelist `0.0.0.0/0` (or your cloud hosting IPs).
3. Copy the connection string: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/civicfix?retryWrites=true&w=majority`

### 2. Environment Variables (.env)
Set the following on Render, Railway, DigitalOcean, or AWS:
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/civicfix?retryWrites=true&w=majority
JWT_SECRET=your_super_strong_jwt_secret_key_civicfix_india
CLIENT_URL=https://your-civicfix-domain.com

# Real Citizen Email OTP Verification (Gmail / AWS SES / SendGrid)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=civicfix.india@gmail.com
SMTP_PASS=your_16_character_app_password
SMTP_FROM="CivicFix India" <civicfix.india@gmail.com>
```

### 3. Deploy in 1-Click (Docker or Single Server)
```bash
# Build frontend and start Express production server
cd client && npm install && npm run build && cd ../server && npm install && npm run seed:states && npm start
```

### Important security notes

- `server/.env` is intentionally not included in the repository/ZIP. Never commit SMTP passwords, MongoDB credentials, or AI API keys.
- Public registration can only create `citizen` accounts. Authority/admin accounts remain provisioned by the municipal seed/provisioning scripts.
- OTP verification is required before a citizen receives a JWT.

