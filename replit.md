# Mystery Box Contest Game

## Project Overview
A web-based mystery box contest game where customers register with their details to open animated prize boxes and win 1-5 rupees cashback rewards. Features a forest green color scheme with 3D isometric mystery box design.

## Key Features
- Customer registration with phone number and vehicle number
- 3D mystery box animation with magical effects
- Random cashback rewards (1-5 rupees)
- **Employee-based verification system** (customers cannot self-verify)
- Employee login and verification dashboard
- 45-second verification window with real-time polling
- WhatsApp bill upload fallback if not verified in time
- Google Sheets integration for data persistence
- Vehicle number validation (primary key)
- Daily play limit (one entry per vehicle per day)

## Employee Verification System
- Employees access `/employee` to login (credentials: employee / employee123)
- After login, employees see unverified customers in `/employee/dashboard`
- Employees can verify customers by clicking a checkbox next to their name
- Customers see a 45-second countdown while waiting for verification
- If verified: Customer sees success message and payment link notification
- If not verified in 45 seconds: Customer can upload bill photo via WhatsApp
- WhatsApp number for verification: +918817828153

## Tech Stack
- Frontend: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- Backend: Express.js, Node.js
- Data Storage: Google Sheets (via webhook)
- In-Memory Storage: For session management

## Important Files
- `client/src/pages/home.tsx` - Main customer game page
- `client/src/pages/employee-login.tsx` - Employee login page
- `client/src/pages/employee-dashboard.tsx` - Employee verification dashboard
- `client/src/components/MysteryBox.tsx` - 3D mystery box component
- `client/src/components/CustomerForm.tsx` - Registration form
- `server/routes.ts` - API routes (including employee auth and verification)
- `server/storage.ts` - In-memory storage with employee data
- `server/googleSheets.ts` - Google Sheets webhook service
- `shared/schema.ts` - Data models and validation (includes employee schema)
- `design_guidelines.md` - Design system and color palette

## Google Sheets Setup
⚠️ **Important**: The application requires Google Sheets to be set up for data persistence.

### Webhook URL
```
https://script.google.com/macros/s/AKfycbx27qhwRz4fBO5URWjiWsIC2R7qtXN4RhS534vJI9YHG78PsNhqei7YIzaIz__pEXHE/exec
```

### Setup Instructions
1. See `GOOGLE_SHEETS_SETUP.md` for detailed setup instructions
2. Copy the code from `google-apps-script.js` to your Google Sheet's Apps Script editor
3. Deploy as Web App with "Anyone" access
4. The webhook URL is already configured in `server/googleSheets.ts`

### Sheet Structure
- Sheet Name: "Customer detail"
- Columns: name, number, prize, vehicleNumber, timestamp, verified

## Business Rules
1. **Vehicle Number as Primary Key**: Same vehicle must have same name and phone number
2. **Daily Limit**: One mystery box per vehicle per day
3. **Reward Range**: 1-5 rupees cashback
4. **Verification Required**: Rewards must be verified before counting in stats
5. **Stats Display**: Only verified rewards show in the total count

## Data Flow
1. Customer fills registration form
2. System validates vehicle number against Google Sheets
3. If valid, customer can open mystery box
4. Random reward (1-5 rupees) is assigned
5. Reward must be verified by clicking "Verify Reward"
6. Only verified rewards count in the stats header

## Color Scheme
- Primary Green: #41886e
- Light Green: #5ba085
- Dark Green: #2d5f4a
- Gold Accent: #ffd700
- Background: #1a1a1a

## Development
- Run: `npm run dev`
- Workflow: "Start application" (already configured)
- Port: 5000

## Notes
- User dismissed the native Google Sheets integration - using webhook approach instead
- In-memory storage used for session management, Google Sheets for persistence
- Daily reset is handled by checking timestamp in Google Sheets
