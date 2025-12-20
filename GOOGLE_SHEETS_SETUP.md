# Google Sheets Setup Instructions

## Step 1: Prepare Your Google Sheet

1. Open your Google Sheet
2. Make sure you have a sheet named **"Customer detail"** (exact name)
3. Add these column headers in Row 1:
   - Column A: `name`
   - Column B: `number`
   - Column C: `prize`
   - Column D: `vehicleNumber`
   - Column E: `timestamp`
   - Column F: `verified`
   - Column G: `amount`
   - Column H: `verifiedBy`
   - Column I: `verificationTimestamp`
   - Column J: `vehicleType`
   - Column K: `doubleRewardDate`

## Step 2: Add the Apps Script Code

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete any existing code in the editor
3. Copy and paste the code from `google-apps-script.js` file
4. Click **Save** (disk icon)

## Step 3: Deploy as Web App

1. Click **Deploy > New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure the settings:
   - **Description**: "Mystery Box Contest Webhook"
   - **Execute as**: Me (your email address)
   - **Who has access**: Anyone
5. Click **Deploy**
6. **Authorize** the script when prompted
   - Click "Review permissions"
   - Choose your Google account
   - Click "Advanced" if you see a warning
   - Click "Go to [Your Project Name] (unsafe)"
   - Click "Allow"
7. Copy the **Web app URL** (it should end with `/exec`)

## Step 4: Update Your Application

Your webhook URL is already configured in the application:
```
https://script.google.com/macros/s/AKfycbx27qhwRz4fBO5URWjiWsIC2R7qtXN4RhS534vJI9YHG78PsNhqei7YIzaIz__pEXHE/exec
```

## Step 5: Test the Integration

1. Start your application
2. Register a new customer
3. Check your Google Sheet - the data should appear automatically
4. Open the mystery box to receive a reward
5. Click "Verify Reward" to mark it as verified
6. The stats counter at the top should update

## How It Works

### Data Flow:
1. **Customer Registration**: Sends customer details to Google Sheets
2. **Reward Assignment**: Updates the prize column when box is opened
3. **Verification**: Marks the reward as verified
4. **Stats**: Counts only verified rewards

### Column Mappings:
- **name**: Customer's full name
- **number**: Phone number
- **prize**: Reward amount (1-5 rupees)
- **vehicleNumber**: Vehicle registration number (primary key)
- **timestamp**: Date and time of entry
- **verified**: "Yes" or "No" - whether reward is verified

### Validation Rules:
1. Same vehicle number must have same name and phone
2. One entry per vehicle per day
3. Only verified rewards count in stats

## Testing the Integration

Once you've completed the setup, test these scenarios to verify everything works:

### Test 1: First-Time Registration
1. Fill in the registration form with:
   - Name: "Test User"
   - Phone: "1234567890"
   - Vehicle: "TEST123"
2. Click "Enter Contest"
3. ✅ Expected: Registration succeeds, you can open the mystery box
4. ✅ Check Google Sheet: New row with your details appears

### Test 2: Vehicle Number Validation
1. Try to register again with:
   - Name: "Different Name"  (❌ different)
   - Phone: "9876543210"     (❌ different)
   - Vehicle: "TEST123"      (✓ same as Test 1)
2. ✅ Expected: Error message - "This vehicle number is already registered with different details"

### Test 3: Same Vehicle, Same Details
1. Try to register with:
   - Name: "Test User"       (✓ same as Test 1)
   - Phone: "1234567890"     (✓ same as Test 1)
   - Vehicle: "TEST123"      (✓ same as Test 1)
2. ✅ Expected: Error message - "You have already played today. Come back tomorrow!"

### Test 4: Reward and Verification
1. Register with a new vehicle number
2. Open the mystery box
3. ✅ Expected: Reward shows 1-5 rupees
4. ✅ Check Google Sheet: Prize column updated with amount
5. Click "Verify Reward"
6. ✅ Check Google Sheet: Verified column shows "Yes"
7. ✅ Check stats header: Total Verified Rewards increases by 1

### Test 5: Different Vehicle
1. Register with completely new details:
   - Name: "Another User"
   - Phone: "5555555555"
   - Vehicle: "XYZ789"
2. ✅ Expected: Registration succeeds (different vehicle)
3. ✅ Expected: Can play and win reward

## Troubleshooting

### If data is not appearing in Google Sheets:
1. Check that the sheet name is exactly "Customer detail"
2. Verify the deployment URL ends with `/exec` (not `/dev`)
3. Check the Apps Script execution logs: **View > Executions**
4. Make sure all column headers are present: name, number, prize, vehicleNumber, timestamp, verified

### If you see authorization errors:
1. Redeploy the web app (Deploy > Manage deployments > Edit > Deploy)
2. Make sure "Who has access" is set to "Anyone"
3. Try running the doPost function manually in Apps Script to trigger authorization

### If verification is not working:
1. Check that column F header is "verified"
2. Make sure the script has write permissions to the sheet
3. Check Apps Script logs for any errors

### If validation is not working:
1. Verify the webhook URL in `server/googleSheets.ts` matches your deployment URL
2. Check that `doGet` function is working by visiting: `YOUR_WEBHOOK_URL?action=getAll`
3. Should return JSON with customers array

### If stats show 0 despite verified rewards:
1. Check that the "verified" column contains "Yes" (case-sensitive)
2. Check that the "prize" column is not empty
3. Try visiting: `YOUR_WEBHOOK_URL?action=getVerifiedCount` - should return a count

## Expected Google Sheets Format

Your sheet should look like this after some entries:

| name | number | prize | vehicleNumber | timestamp | verified | amount | verifiedBy | verificationTimestamp | vehicleType | doubleRewardDate |
|------|--------|-------|--------------|-----------|----------|--------|------------|----------------------|-------------|-----------------|
| Test User | 1234567890 | 3 | TEST123 | 2024-11-21T10:30:00.000Z | Yes | 3 | JHULESH VERMA | 2024-11-21T10:35:00.000Z | truck | 2024-11-21T10:30:00.000Z |
| Another User | 5555555555 | 5 | XYZ789 | 2024-11-21T11:45:00.000Z | No | | | | bike | |
