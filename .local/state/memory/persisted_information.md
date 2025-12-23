# FUEL RUSH Mystery Box Contest Game - Prize Range Updated ✅

## Latest Update: Prize Range Changed from 1-5 to 1-20 Rupees

### Prize Distribution Updated:

**Previous Prize Range:**
- 1-5 rupees (flat probability)

**New Prize Range:**
- 1-9 rupees: 80% probability (higher chance of winning lower amounts)
- 10-20 rupees: 20% probability (reduced chance of higher prizes to manage costs)

### Implementation:
Location: `client/src/pages/home.tsx` (line 382-384)

The prize generation now uses:
```javascript
const random = Math.random();
const reward = random < 0.8 
  ? Math.floor(Math.random() * 9) + 1    // 1-9 rupees (80% chance)
  : Math.floor(Math.random() * 11) + 10; // 10-20 rupees (20% chance)
```

### Cost Management:
- **Lower range (1-9):** Most customers will win here (80% of the time)
- **Higher range (10-20):** Fewer customers will win here (20% of the time)
- This helps control the total payout expenses while still offering attractive prizes

### How It Works:
1. Customer plays the mystery box game
2. System generates a random number
3. If < 0.8 (80%): Prize is 1-9 rupees (average ~5 rupees)
4. If ≥ 0.8 (20%): Prize is 10-20 rupees (average ~15 rupees)

### Average Expected Payout:
- Per customer: ~0.8 × 5 + 0.2 × 15 = 4 + 3 = **7 rupees per win**
- Better cost control compared to the previous 1-5 range (average 3 rupees)

### No Other Changes Needed:
- Backend already handles any reward amount
- Google Sheets automatically tracks the actual winning amount
- BulkPE payouts use the actual winning amount

## Ready for Testing:
The app now offers prizes from 1-20 rupees with intelligent cost management through probability weighting.
