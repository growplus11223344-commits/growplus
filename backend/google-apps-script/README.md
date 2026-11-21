# GrowPlus Google Apps Script Web App Setup Guide

This guide explains how to connect your Google Sheets spreadsheet to the GrowPlus backend using the Google Apps Script Web App.

---

## 1. Create or Open Your Target Google Sheet

1. Open [Google Sheets](https://sheets.new) and create a new spreadsheet (or open your existing GrowPlus reporting spreadsheet).
2. Name it **GrowPlus Ecosystem Reports**.
3. In the menu, go to **Extensions** → **Apps Script**.

---

## 2. Paste the Script Code

1. In the Apps Script code editor, delete any default code inside `Code.gs`.
2. Copy and paste the entire contents of [`backend/google-apps-script/Code.gs`](./Code.gs).
3. Click the **Save** icon (disk icon or `Ctrl + S`).

---

## 3. (Optional) Configure Script Properties

If your script is **container-bound** (opened from Extensions → Apps Script directly in your Sheet), you don't need any configuration — it will automatically detect the active spreadsheet!

If your script is **standalone** (created at `script.google.com`), or if you maintain separate spreadsheets per category:
1. In the Apps Script left sidebar, click **Project Settings** (gear icon ⚙️).
2. Scroll down to **Script Properties** and click **Edit script properties** → **Add script property**:
   - `SPREADSHEET_ID`: Your master Google Sheet ID (from the sheet URL: `https://docs.google.com/spreadsheets/d/<ID>/edit`).
   - (Optional) `SPREADSHEET_ID_CUSTOMERS`, `SPREADSHEET_ID_ORDERS`, etc. if using individual sheets.
   - (Optional) `WEBAPP_SECRET`: Custom secret token if you wish to enforce token verification.
3. Click **Save script properties**.

---

## 4. Deploy as a Web App

1. In the top-right corner, click **Deploy** → **New deployment**.
2. Click the gear icon (**Select type**) and select **Web app**.
3. Configure the deployment settings:
   - **Description:** `GrowPlus Reporting Web App v2`
   - **Execute as:** `Me (your email address)`
   - **Who has access:** `Anyone` *(Required so the backend server can POST payloads without complex OAuth2 consent screens)*
4. Click **Deploy**.
5. If prompted, click **Authorize access**, choose your Google account, click **Advanced**, and then click **Go to GrowPlus (unsafe)** to grant spreadsheet permissions.
6. Copy the **Web App URL**. It will look like:
   ```
   https://script.google.com/macros/s/AKfycbz-p1CsI_-Ok6r6br8QHTGl7QSN6kTGrnvgRgon35ne5CYR4YlRnEwskkev8pynvWEJWg/exec
   ```

---

## 5. Backend Environment Configuration

The backend requires **ONLY** the `GOOGLE_APPS_SCRIPT_URL` environment variable:

```env
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbz-p1CsI_-Ok6r6br8QHTGl7QSN6kTGrnvgRgon35ne5CYR4YlRnEwskkev8pynvWEJWg/exec
```

Zero Google Service Account, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, or `googleapis` packages are needed on the backend.

---

## 6. Supported Categories & Tabs

When synchronization is triggered, the script automatically manages six formatted tabs:

1. **Customers:** User profile IDs, contact info, KYC verification status, wallet balances, lifetime earnings.
2. **Products:** Product names, SKUs, category taxonomy, MRP, selling price, current stock, active status, reward eligibility.
3. **Orders:** Order numbers, user IDs, fulfillment status, payment status, subtotal, promotional credits applied, net amount, tracking details.
4. **Sales:** Paid orders ledger, gross revenue, credits redeemed, gateway payment IDs, net received cash.
5. **Inventory:** SKU stock levels, reserved quantities, low stock threshold alerts, stock health indicator.
6. **Rewards:** Promotional credit transactions, qualifying retail orders, rewarded users, audit timestamps.

---

## 7. Testing the Web App Manually

You can test connectivity directly from your terminal using curl:

```bash
curl -X POST "https://script.google.com/macros/s/AKfycbz-p1CsI_-Ok6r6br8QHTGl7QSN6kTGrnvgRgon35ne5CYR4YlRnEwskkev8pynvWEJWg/exec" \
  -H "Content-Type: application/json" \
  -d '{"category":"CUSTOMERS","action":"REPLACE","headers":["ID","Name","Status"],"rows":[["u-1","Demo User","Active"]]}'
```
