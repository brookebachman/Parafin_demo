# GrubDash Capital - Parafin Embedded Demo

A simple web application that displays Parafin's embedded capital UI component, demonstrating four unique offer states for flex loans.

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd Parafin_demo
npm install
```

### 2. Add credentials

Create a `.env` file in the root directory:

```
PARAFIN_CLIENT_ID=your-sandbox-client-id
PARAFIN_CLIENT_SECRET=your-sandbox-client-secret
```

Get your sandbox credentials from the [Parafin Dashboard](https://dashboard.parafin.com/developer/api-keys). Make sure you are in sandbox mode.

### 3. Run the app

```bash
npm run dev
```

This starts:
- Frontend on http://localhost:3000 (Vite + React)
- Backend on http://localhost:8080 (Express)

## How It Works

The app uses Parafin's `@parafin/react` widget to embed the capital experience. The backend handles API authentication and sandbox data setup.

### Four Offer States

Each button triggers API calls to set up the corresponding state in Parafin's sandbox, then loads the widget with the appropriate bearer token.

| Button | State | What happens |
|--------|-------|-------------|
| 1. No Offers | No offers available | Creates a business and person with no offer generated |
| 2. Pre-Approved Offer | Pre-approved offer available | Creates a business, person, bank account, and flex loan offer |
| 3. Fund | Capital on its way | Funds the accepted offer (must accept offer in widget first) |
| 4. Payment | Outstanding balance | Creates a repayment against the funded capital product |

### Flow

1. Click **No Offers** to see the empty state
2. Click **Pre-Approved Offer** to generate a flex loan offer and see it in the widget
3. Accept the offer through the widget UI
4. Click **Fund** to disburse capital, then reload to see the "capital on its way" state
5. Click **Payment** to create a repayment, then reload to see the outstanding balance

## Tech Stack

- React (Vite)
- Express
- @parafin/react (embedded widget)
- Parafin Sandbox API

## Project Structure

```
├── src/
│   ├── App.jsx          # Main app with state buttons and widget
│   └── main.jsx         # React entry point
├── server/
│   └── server.js        # Express server - token redemption and sandbox API calls
├── index.html
├── vite.config.js
├── .env                 # Sandbox credentials (not committed)
└── package.json
```
