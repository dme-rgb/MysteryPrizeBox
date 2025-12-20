# Vehicle Type Feature Setup Guide

## What's Changed

The contest now captures vehicle type (Bike, Car, or Truck) when customers enter. This requires updating your Google Sheets and Google Apps Script.

## Step 1: Update Google Sheets Column Header

1. Open your Google Sheet for "FUEL RUSH Mystery Box Contest"
2. Go to the "Customer detail" sheet
3. Add a new column header in **Column J** (10th column):
   - **Column J Header:** `Vehicle Type`
4. The full column order should now be:
   - A: Name
   - B: Phone Number
   - C: Prize
   - D: Vehicle Number
   - E: Timestamp
   - F: Verified
   - G: Amount
   - H: Verified By
   - I: Verification Timestamp
   - **J: Vehicle Type** ← NEW

## Step 2: Update Google Apps Script

1. Open your Google Sheets document
2. Click **Extensions > Apps Script**
3. Replace the entire code with the updated `google-apps-script.js` file (copy from the project root)
4. Click **Deploy** and select **"New deployment"**
5. Choose **Type: Web app**
6. Set **Execute as:** Your email
7. Set **Who has access:** Anyone
8. Click **Deploy**
9. Copy the new deployment URL and update the `WEBHOOK_URL` in `server/googleSheets.ts` if it has changed

## What the Script Now Does

- **Captures vehicle type** when customers enter the contest
- **Stores it in Column J** of the Customer detail sheet
- **Returns vehicle type** in all API responses
- **Includes it in verified customer data** for employee dashboard

## Testing

1. A customer registers and selects their vehicle type (🏍️ Bike, 🚗 Car, or 🚛 Truck)
2. When the mystery box opens and a reward is set, the vehicle type is sent to Google Sheets
3. Check Column J in "Customer detail" sheet - should show the selected vehicle type

## Column Mapping in Apps Script

The script now reads/writes vehicleType from **index 9** (Column J):
- `values[i][9]` = Vehicle Type
- All other column indices remain unchanged

All existing data will continue to work correctly!
