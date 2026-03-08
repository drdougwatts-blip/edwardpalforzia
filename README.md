# Edward's Palforzia Tracker

A web application for recording daily Palforzia (peanut immunotherapy) doses administered at home, tracking clinic up-dosing visits at Southampton Children's Hospital, and sharing fortnightly summaries with the clinical team.

## Tech Stack

- **React** (Vite) — frontend framework
- **Firebase** — Authentication, Firestore, Hosting
- **jsPDF** — PDF report generation
- **date-fns** — date utilities

## Getting Started

### 1. Firebase Setup

1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password sign-in
3. Create a **Firestore** database (start in test mode, then apply rules from `firestore.rules`)
4. Copy your Firebase config

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your Firebase credentials:

```bash
cp .env.example .env
```

### 3. Install & Run

```bash
npm install
npm run dev
```

### 4. Create Accounts

1. Open the app and click "Need an account? Register"
2. Create a **parent** account (role: parent) — for Anna & Doug
3. Create a **doctor** account (role: doctor) — for clinical team

### 5. Deploy

```bash
npm run build
firebase deploy
```

## User Roles

- **Parent** — Log daily doses, record clinic visits, manage appointments, view reports
- **Doctor** — Read-only dashboard with adherence stats, dose history, PDF export

## Palforzia Dose Schedule

| Level | Daily Dose |
|-------|-----------|
| 1     | 0.5 mg    |
| 2     | 1 mg      |
| 3     | 1.5 mg    |
| 4     | 3 mg      |
| 5     | 6 mg      |
| 6     | 12 mg     |
| 7     | 20 mg     |
| 8     | 40 mg     |
| 9     | 80 mg     |
| 10    | 120 mg    |
| 11    | 160 mg    |
| 12    | 200 mg    |
| 13    | 240 mg    |
| 14    | 300 mg (maintenance) |
