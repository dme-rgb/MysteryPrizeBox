// Google Apps Script for Mystery Box Contest - Google Sheets Webhook
// Paste this code in: Extensions > Apps Script

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Customer detail");
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === "logTransaction") {
      // Log transaction to Transactions sheet with all 20 fields
      let transactionSheet = ss.getSheetByName("Transactions");
      if (!transactionSheet) {
        transactionSheet = ss.insertSheet("Transactions");
        transactionSheet.appendRow([
          "Vehicle Number",
          "Customer Name", 
          "Phone Number",
          "Amount",
          "Transaction ID",
          "Reference ID",
          "UPI",
          "Payment Mode",
          "Beneficiary Name",
          "BulkPE Status",
          "BulkPE Message",
          "Transaction Status",
          "Error Message",
          "Timestamp",
          "VPA Address",
          "VPA Account Holder Name",
          "VPA Transaction ID",
          "VPA Reference ID",
          "VPA Status",
          "VPA Message"
        ]);
      }
      
      transactionSheet.appendRow([
        data.vehicleNumber || "",
        data.customerName || "",
        data.phoneNumber || "",
        data.amount || "",
        data.transactionId || "",
        data.referenceId || "",
        data.upi || "",
        data.paymentMode || "",
        data.beneficiaryName || "",
        data.bulkpeStatus || "",
        data.bulkpeMessage || "",
        data.status || "",
        data.errorMessage || "",
        data.timestamp || "",
        data.vpaAddress || "",
        data.vpaAccountHolderName || "",
        data.vpaTransactionId || "",
        data.vpaReferenceId || "",
        data.vpaStatus || "",
        data.vpaMessage || ""
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Transaction logged"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === "add") {
      // Add new customer entry
      sheet.appendRow([
        data.name,
        data.number,
        data.prize || "",
        data.vehicleNumber,
        data.timestamp,
        data.verified || "No",
        "", // Amount column (initially empty)
        "", // Verified By column (initially empty)
        ""  // Verification Timestamp column (initially empty)
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Customer added"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === "updateReward") {
      // Update reward for a vehicle
      const vehicleNumber = data.vehicleNumber;
      const prize = data.prize;
      
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      
      // Find the row with this vehicle number (most recent)
      for (let i = values.length - 1; i >= 1; i--) {
        if (values[i][3] === vehicleNumber) {
          sheet.getRange(i + 1, 3).setValue(prize); // Column C (prize)
          break;
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === "verify") {
      // Verify reward for a vehicle
      const vehicleNumber = data.vehicleNumber;
      
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      
      // Find the row with this vehicle number (most recent)
      for (let i = values.length - 1; i >= 1; i--) {
        if (values[i][3] === vehicleNumber) {
          sheet.getRange(i + 1, 6).setValue("Yes"); // Column F (verified)
          break;
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === "verifyAndSetAmount") {
      // Verify reward and set the payout amount for a vehicle
      const vehicleNumber = data.vehicleNumber;
      const amount = data.amount;
      const verifierName = data.verifierName || "Unknown";
      const verificationTimestamp = data.verificationTimestamp || new Date().toISOString();
      
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      
      // Find the row with this vehicle number (most recent)
      for (let i = values.length - 1; i >= 1; i--) {
        if (values[i][3] === vehicleNumber) {
          sheet.getRange(i + 1, 6).setValue("Yes"); // Column F (verified)
          if (amount) {
            sheet.getRange(i + 1, 7).setValue(amount); // Column G (amount)
          }
          sheet.getRange(i + 1, 8).setValue(verifierName); // Column H (verified by)
          sheet.getRange(i + 1, 9).setValue(verificationTimestamp); // Column I (verification timestamp)
          break;
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Customer detail");
    const action = e.parameter.action;
    
    if (action === "getTransactionByPhone") {
      // Retrieve cached transaction details from Transactions sheet by phone number
      // Returns VPA and account holder name if found
      const phoneNumber = e.parameter.phone;
      const transactionSheet = ss.getSheetByName("Transactions");
      
      if (!transactionSheet) {
        return ContentService.createTextOutput(JSON.stringify({
          found: false,
          vpa: null,
          accountHolderName: null
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      const dataRange = transactionSheet.getDataRange();
      const values = dataRange.getValues();
      
      // Search for most recent successful transaction with this phone number
      // Column C (index 2): Phone Number
      // Column O (index 14): VPA Address
      // Column P (index 15): VPA Account Holder Name
      // Column S (index 18): VPA Status
      for (let i = values.length - 1; i >= 1; i--) {
        const rowPhone = String(values[i][2]).trim();
        const vpa = values[i][14];
        const accountHolderName = values[i][15];
        const vpaStatus = values[i][18];
        
        // Match phone number and ensure VPA is valid (not N/A)
        if (rowPhone === String(phoneNumber).trim() && vpa && vpa !== "N/A" && vpaStatus === "SUCCESS") {
          console.log(`[SHEET VPA CACHE] Found cached VPA for ${phoneNumber}: ${vpa}`);
          return ContentService.createTextOutput(JSON.stringify({
            found: true,
            vpa: vpa,
            accountHolderName: accountHolderName || null
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      
      console.log(`[SHEET VPA CACHE] No cached VPA found for ${phoneNumber}`);
      return ContentService.createTextOutput(JSON.stringify({
        found: false,
        vpa: null,
        accountHolderName: null
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "getAll") {
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      const customers = [];
      
      // Skip header row
      for (let i = 1; i < values.length; i++) {
        customers.push({
          name: values[i][0],
          number: values[i][1],
          prize: values[i][2],
          vehicleNumber: values[i][3],
          timestamp: values[i][4],
          verified: values[i][5] === "Yes",
          amount: values[i][6] || null
        });
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        customers: customers
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "getByVehicle") {
      const vehicleNumber = e.parameter.vehicleNumber;
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      
      // Find the first occurrence of this vehicle (oldest entry)
      for (let i = 1; i < values.length; i++) {
        if (values[i][3] === vehicleNumber) {
          return ContentService.createTextOutput(JSON.stringify({
            customer: {
              name: values[i][0],
              number: values[i][1],
              prize: values[i][2],
              vehicleNumber: values[i][3],
              timestamp: values[i][4],
              verified: values[i][5] === "Yes",
              amount: values[i][6] || null
            }
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        customer: null
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "getTodayByVehicle") {
      const vehicleNumber = e.parameter.vehicleNumber;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      
      // Check if vehicle played today
      for (let i = 1; i < values.length; i++) {
        if (values[i][3] === vehicleNumber) {
          const entryDate = new Date(values[i][4]);
          entryDate.setHours(0, 0, 0, 0);
          
          if (entryDate.getTime() === today.getTime()) {
            return ContentService.createTextOutput(JSON.stringify({
              customer: {
                name: values[i][0],
                number: values[i][1],
                prize: values[i][2],
                vehicleNumber: values[i][3],
                timestamp: values[i][4],
                verified: values[i][5] === "Yes",
                amount: values[i][6] || null
              }
            })).setMimeType(ContentService.MimeType.JSON);
          }
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        customer: null
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "getTodayVerifiedCustomers") {
      // Get today's verified customers with VPA info from Transactions sheet
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      const transactionSheet = ss.getSheetByName("Transactions");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const verifiedCustomers = [];
      
      // Iterate through Customer Detail sheet
      for (let i = 1; i < values.length; i++) {
        const entryDate = new Date(values[i][4]);
        entryDate.setHours(0, 0, 0, 0);
        
        // Check if verified and from today
        if (values[i][5] === "Yes" && entryDate.getTime() === today.getTime()) {
          const phoneNumber = String(values[i][1]).trim();
          let vpa = null;
          let vpaAccountHolderName = null;
          
          // Look up VPA from Transactions sheet
          if (transactionSheet) {
            const txnDataRange = transactionSheet.getDataRange();
            const txnValues = txnDataRange.getValues();
            
            // Search for most recent successful transaction with this phone number
            for (let j = txnValues.length - 1; j >= 1; j--) {
              const txnPhone = String(txnValues[j][2]).trim();
              if (txnPhone === phoneNumber) {
                const txnVpa = txnValues[j][14]; // Column O
                const txnStatus = txnValues[j][18]; // Column S
                if (txnVpa && txnVpa !== "N/A" && txnStatus === "SUCCESS") {
                  vpa = txnVpa;
                  vpaAccountHolderName = txnValues[j][15] || null; // Column P
                  break;
                }
              }
            }
          }
          
          verifiedCustomers.push({
            name: values[i][0],
            number: values[i][1],
            prize: values[i][2],
            vehicleNumber: values[i][3],
            timestamp: values[i][4],
            verified: true,
            amount: values[i][6] || null,
            verifiedBy: values[i][7] || null,
            verificationTimestamp: values[i][8] || null,
            vpa: vpa,
            vpaAccountHolderName: vpaAccountHolderName
          });
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        customers: verifiedCustomers
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "getVerifiedCount") {
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      let count = 0;
      
      // Count verified rewards
      for (let i = 1; i < values.length; i++) {
        if (values[i][5] === "Yes" && values[i][2] !== "") {
          count++;
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        count: count
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "getVerifiedCountToday") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      let count = 0;
      
      // Count verified rewards from today only
      for (let i = 1; i < values.length; i++) {
        if (values[i][5] === "Yes" && values[i][2] !== "") {
          const entryDate = new Date(values[i][4]);
          entryDate.setHours(0, 0, 0, 0);
          if (entryDate.getTime() === today.getTime()) {
            count++;
          }
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        count: count
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "getTotalVerifiedAmount") {
      const vehicleNumber = e.parameter.vehicleNumber;
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      let totalAmount = 0;
      
      // Sum all verified rewards for this vehicle
      for (let i = 1; i < values.length; i++) {
        if (values[i][3] === vehicleNumber && values[i][5] === "Yes" && values[i][2] !== "") {
          const prize = parseInt(values[i][2]) || 0;
          totalAmount += prize;
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        totalAmount: totalAmount
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
