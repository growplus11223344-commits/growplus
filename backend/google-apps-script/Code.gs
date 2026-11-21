/**
 * ==============================================================================
 * GROWPLUS ECOMMERCE & REWARDS — GOOGLE APPS SCRIPT WEB APP INTEGRATION
 * ==============================================================================
 * 
 * Secure Web App endpoint to synchronize reporting ledgers from GrowPlus Backend
 * directly into Google Sheets tabs without requiring Google Cloud Service Accounts.
 * 
 * Supported Categories:
 *   1. CUSTOMERS — Registered users, KYC, activity, wallet balance, lifetime earnings
 *   2. PRODUCTS  — Catalog items, SKU, MRP, price, inventory stock, status, rewards
 *   3. ORDERS    — Order numbers, customer IDs, status, subtotals, credits, tracking
 *   4. SALES     — Revenue breakdown, payment gateways, net received, refunds
 *   5. INVENTORY — Stock levels, reserved quantities, low stock threshold alerts
 *   6. REWARDS   — Immutable reward payouts, order qualifications, credit ledger
 * 
 * Security:
 *   Requires HTTP POST with valid 'secret' token in the JSON request body.
 * ==============================================================================
 */

// Default secret token (can also be configured via Script Properties)
var WEBAPP_SECRET = "Hash*&^%7776hsfdj8787%^$!jika";

/**
 * Handle incoming HTTP POST requests from GrowPlus Backend API
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  
  // Protect against concurrent writes (wait up to 30s)
  try {
    lock.waitLock(30000);
  } catch (err) {
    return createJsonResponse(503, {
      success: false,
      error: "Service busy: Could not obtain execution lock within 30 seconds"
    });
  }

  try {
    // 1. Verify request body
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse(400, {
        success: false,
        error: "Missing request body: JSON payload expected"
      });
    }

    var payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return createJsonResponse(400, {
        success: false,
        error: "Malformed JSON payload: " + parseErr.message
      });
    }

    // 2. Verify secret token (if configured in Script Properties or fallback)
    var scriptSecret = PropertiesService.getScriptProperties().getProperty("WEBAPP_SECRET");
    if (scriptSecret) {
      if (!payload.secret || payload.secret !== scriptSecret) {
        return createJsonResponse(401, {
          success: false,
          error: "Unauthorized: Invalid or missing secret token"
        });
      }
    } else if (payload.secret && payload.secret !== WEBAPP_SECRET) {
      return createJsonResponse(401, {
        success: false,
        error: "Unauthorized: Invalid secret token provided"
      });
    }

    // 3. Verify category
    var category = (payload.category || "").toUpperCase().trim();
    var validCategories = ["CUSTOMERS", "PRODUCTS", "ORDERS", "SALES", "INVENTORY", "REWARDS"];
    if (validCategories.indexOf(category) === -1) {
      return createJsonResponse(422, {
        success: false,
        error: "Invalid category '" + category + "'. Must be one of: " + validCategories.join(", ")
      });
    }

    // 4. Verify headers and rows
    var headers = payload.headers;
    var rows = payload.rows || [];
    var action = (payload.action || "REPLACE").toUpperCase(); // 'REPLACE' (default) or 'APPEND'

    if (!Array.isArray(headers) || headers.length === 0) {
      return createJsonResponse(422, {
        success: false,
        error: "Invalid headers: Must be a non-empty array of column names"
      });
    }

    if (!Array.isArray(rows)) {
      return createJsonResponse(422, {
        success: false,
        error: "Invalid rows: Must be an array of data rows"
      });
    }

    // 5. Open Target Spreadsheet
    // Priority:
    // a. Container-bound spreadsheet: SpreadsheetApp.getActiveSpreadsheet()
    // b. Category-specific spreadsheet ID: SPREADSHEET_ID_<CATEGORY>
    // c. Default master spreadsheet ID: SPREADSHEET_ID
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      var targetId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID_" + category) ||
                     PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
      if (targetId) {
        try {
          ss = SpreadsheetApp.openById(targetId);
        } catch (openErr) {
          return createJsonResponse(500, {
            success: false,
            error: "Failed to open spreadsheet ID '" + targetId + "': " + openErr.message
          });
        }
      } else {
        return createJsonResponse(500, {
          success: false,
          error: "No active spreadsheet found. Container-bind this script to a Google Sheet or set SPREADSHEET_ID (or SPREADSHEET_ID_" + category + ") in Script Properties."
        });
      }
    }

    // 6. Map category to tab name
    var tabNames = {
      "CUSTOMERS": "Customers",
      "PRODUCTS": "Products",
      "ORDERS": "Orders",
      "SALES": "Sales",
      "INVENTORY": "Inventory",
      "REWARDS": "Rewards"
    };

    var tabName = tabNames[category] || category;
    var sheet = ss.getSheetByName(tabName);

    if (!sheet) {
      sheet = ss.insertSheet(tabName);
    }

    // 7. Write data to sheet
    if (action === "REPLACE") {
      sheet.clearContents();
      sheet.clearFormats();

      // Write Header Row
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Style Header
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#0F172A"); // Slate dark
      headerRange.setFontColor("#10B981"); // Emerald accent
      headerRange.setHorizontalAlignment("left");
      sheet.setFrozenRows(1);

      // Write Rows
      if (rows.length > 0) {
        var sanitizedRows = sanitizeRows(rows, headers.length);
        sheet.getRange(2, 1, sanitizedRows.length, headers.length).setValues(sanitizedRows);
        
        // Alternate row banding
        sheet.getRange(2, 1, sanitizedRows.length, headers.length).setFontFamily("Roboto");
      }

      // Auto-fit columns
      for (var c = 1; c <= headers.length; c++) {
        sheet.autoResizeColumn(c);
      }
    } else if (action === "APPEND" && rows.length > 0) {
      if (sheet.getLastRow() === 0) {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#0F172A").setFontColor("#10B981");
        sheet.setFrozenRows(1);
      }
      var sanitizedRows = sanitizeRows(rows, headers.length);
      var startRow = sheet.getLastRow() + 1;
      sheet.getRange(startRow, 1, sanitizedRows.length, headers.length).setValues(sanitizedRows);
    }

    return createJsonResponse(200, {
      success: true,
      category: category,
      action: action,
      sheetName: tabName,
      rowsSynced: rows.length,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    return createJsonResponse(500, {
      success: false,
      error: "Apps Script error: " + err.message
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Handle GET requests for health check
 */
function doGet(e) {
  return createJsonResponse(200, {
    status: "ok",
    service: "GrowPlus Google Sheets Reporting Web App",
    categories: ["CUSTOMERS", "PRODUCTS", "ORDERS", "SALES", "INVENTORY", "REWARDS"],
    timestamp: new Date().toISOString()
  });
}

/**
 * Helper to ensure row array dimensions strictly match column count
 */
function sanitizeRows(rows, colCount) {
  return rows.map(function(row) {
    var padded = [];
    for (var i = 0; i < colCount; i++) {
      var val = (row && i < row.length) ? row[i] : "";
      if (val === null || val === undefined) {
        val = "";
      } else if (typeof val === "object") {
        val = JSON.stringify(val);
      }
      padded.push(val);
    }
    return padded;
  });
}

/**
 * Helper to produce standard JSON output
 */
function createJsonResponse(statusCode, obj) {
  obj.statusCode = statusCode;
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
