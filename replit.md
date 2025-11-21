# Mystery Box Contest Game

## Project Overview
A web-based mystery box contest game where customers register with their details to open animated prize boxes and win 1-5 rupees cashback rewards. Features a forest green color scheme with 3D isometric mystery box design.

## Key Features
- Customer registration with name, phone number, and vehicle number
- 3D mystery box animation with magical effects
- Random cashback rewards (1-5 rupees)
- Reward verification system
- Google Sheets integration for data persistence
- Vehicle number validation (primary key)
- Daily play limit (one entry per vehicle per day)

## Tech Stack
- Frontend: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- Backend: Express.js, Node.js
- Data Storage: Google Sheets (via webhook)
- In-Memory Storage: For session management

## Important Files
- `client/src/pages/home.tsx` - Main game page
- `client/src/components/MysteryBox.tsx` - 3D mystery box component
- `client/src/components/CustomerForm.tsx` - Registration form
- `server/routes.ts` - API routes
- `server/googleSheets.ts` - Google Sheets webhook service
- `shared/schema.ts` - Data models and validation
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
