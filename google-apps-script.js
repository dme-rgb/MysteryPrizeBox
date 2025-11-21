// Google Apps Script for Mystery Box Contest - Google Sheets Webhook
// Paste this code in: Extensions > Apps Script

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Customer detail");
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === "add") {
      // Add new customer entry
      sheet.appendRow([
        data.name,
        data.number,
        data.prize || "",
        data.vehicleNumber,
        data.timestamp,
        data.verified || "No"
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
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Customer detail");
    const action = e.parameter.action;
    
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
          verified: values[i][5] === "Yes"
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
              verified: values[i][5] === "Yes"
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
                verified: values[i][5] === "Yes"
              }
            })).setMimeType(ContentService.MimeType.JSON);
          }
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        customer: null
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
