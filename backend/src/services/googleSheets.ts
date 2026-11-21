import { supabaseAdmin } from '../config/supabase';
import { logger } from '../utils/logger';

export type SheetsCategory = 'CUSTOMERS' | 'PRODUCTS' | 'ORDERS' | 'SALES' | 'INVENTORY' | 'REWARDS' | 'SUPPORT';

export interface SheetsSyncPayload {
  secret?: string;
  category: SheetsCategory;
  action?: 'REPLACE' | 'APPEND';
  headers: string[];
  rows: any[][];
}

export interface SheetsSyncResult {
  success: boolean;
  category: SheetsCategory;
  rowsSynced?: number;
  sheetName?: string;
  error?: string;
  statusCode?: number;
}

/**
 * Google Sheets Automated Reporting Service (Google Apps Script Web App Integration)
 * 
 * Synchronizes reporting ledgers from Supabase to Google Sheets via secure HTTP POST
 * to a deployed Google Apps Script Web App.
 * 
 * NOTE: Supabase PostgreSQL is the primary database and sole source of truth for all
 * customer accounts, orders, inventory, and financial balances. Google Sheets is strictly
 * an asynchronous export target and analytical reporting view.
 */
export class GoogleSheetsService {
  private static readonly DEFAULT_TIMEOUT_MS = 25000; // 25 seconds timeout

  /**
   * Get Web App configuration from environment
   */
  private static getConfig(): { webAppUrl: string | null; secret: string | null } {
    const webAppUrl = process.env.GOOGLE_APPS_SCRIPT_URL || process.env.GOOGLE_SHEETS_WEBAPP_URL || null;
    const secret = process.env.GOOGLE_APPS_SCRIPT_SECRET || process.env.GOOGLE_SHEETS_WEBAPP_SECRET || null;
    return { webAppUrl, secret };
  }

  /**
   * Validate payload structure before dispatching
   */
  private static validatePayload(payload: Partial<SheetsSyncPayload>): string | null {
    const validCategories: SheetsCategory[] = ['CUSTOMERS', 'PRODUCTS', 'ORDERS', 'SALES', 'INVENTORY', 'REWARDS', 'SUPPORT'];
    
    if (!payload.category || !validCategories.includes(payload.category as SheetsCategory)) {
      return `Invalid category: Must be one of ${validCategories.join(', ')}`;
    }

    if (!payload.headers || !Array.isArray(payload.headers) || payload.headers.length === 0) {
      return 'Invalid headers: Must be a non-empty array of strings';
    }

    if (!payload.rows || !Array.isArray(payload.rows)) {
      return 'Invalid rows: Must be an array of data rows';
    }

    return null;
  }

  /**
   * Secure HTTP POST dispatcher to Google Apps Script Web App
   * 
   * Features:
   * - Secret token injection from environment if configured (never logged)
   * - Timeout with AbortController
   * - Safe error handling (handles HTML error pages, redirects, JSON responses)
   */
  static async postToAppsScript(
    payload: SheetsSyncPayload,
    overrideUrl?: string,
    overrideSecret?: string,
    timeoutMs: number = GoogleSheetsService.DEFAULT_TIMEOUT_MS
  ): Promise<SheetsSyncResult> {
    const { webAppUrl: configUrl, secret: configSecret } = this.getConfig();
    const url = overrideUrl || configUrl;
    const secret = overrideSecret !== undefined ? overrideSecret : configSecret;

    // 1. Configuration check
    if (!url) {
      logger.warn('[GoogleSheets] GOOGLE_APPS_SCRIPT_URL not configured. Sync skipped.');
      return {
        success: false,
        category: payload.category,
        error: 'GOOGLE_APPS_SCRIPT_URL is not configured',
      };
    }

    // 2. Input validation
    const validationError = this.validatePayload(payload);
    if (validationError) {
      logger.warn(`[GoogleSheets] Payload validation failed for ${payload.category}: ${validationError}`);
      return {
        success: false,
        category: payload.category,
        error: validationError,
      };
    }

    // 3. Prepare request body (NEVER log the secret)
    const bodyData: Record<string, any> = {
      category: payload.category,
      action: payload.action || 'REPLACE',
      headers: payload.headers,
      rows: payload.rows,
      timestamp: new Date().toISOString(),
    };

    if (secret) {
      bodyData.secret = secret;
    }

    const requestBody = JSON.stringify(bodyData);

    logger.info(`[GoogleSheets] Dispatching sync to Apps Script: category=${payload.category}, rows=${payload.rows.length}`);

    // 4. Execute HTTP POST with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*',
        },
        body: requestBody,
        redirect: 'follow',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseText = await response.text();

      // Check if response is JSON or HTML error page
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch {
        // If response is HTML, check for common Google Apps Script errors
        if (responseText.includes('Script function not found')) {
          const errMsg = 'Apps Script deployment error: doPost function not found in deployed script';
          logger.error(`[GoogleSheets] ${errMsg}`);
          return {
            success: false,
            category: payload.category,
            error: errMsg,
            statusCode: 500,
          };
        }

        if (responseText.includes('Google Drive – Page Not Found') || responseText.includes('404')) {
          const errMsg = 'Apps Script Web App URL not found (404). Check deployment URL.';
          logger.error(`[GoogleSheets] ${errMsg}`);
          return {
            success: false,
            category: payload.category,
            error: errMsg,
            statusCode: 404,
          };
        }

        logger.error(`[GoogleSheets] Non-JSON response received from Apps Script (Length: ${responseText.length})`);
        return {
          success: false,
          category: payload.category,
          error: `Non-JSON response from Google Apps Script (HTTP ${response.status})`,
          statusCode: response.status,
        };
      }

      // Check success in JSON response
      if (data && data.success) {
        logger.info(`[GoogleSheets] Successfully synced ${data.rowsSynced ?? payload.rows.length} rows to sheet '${data.sheetName || payload.category}'`);
        return {
          success: true,
          category: payload.category,
          rowsSynced: data.rowsSynced ?? payload.rows.length,
          sheetName: data.sheetName,
          statusCode: data.statusCode || 200,
        };
      } else {
        const errorMsg = data?.error || 'Apps Script returned failure status';
        logger.warn(`[GoogleSheets] Sync rejected by Apps Script for ${payload.category}: ${errorMsg}`);
        return {
          success: false,
          category: payload.category,
          error: errorMsg,
          statusCode: data?.statusCode || 400,
        };
      }

    } catch (err: any) {
      clearTimeout(timeoutId);

      if (err.name === 'AbortError') {
        const timeoutMsg = `Request timed out after ${timeoutMs}ms while contacting Google Apps Script`;
        logger.error(`[GoogleSheets] ${timeoutMsg}`);
        return {
          success: false,
          category: payload.category,
          error: timeoutMsg,
          statusCode: 408,
        };
      }

      logger.error(`[GoogleSheets] Network exception connecting to Apps Script: ${err.message}`);
      return {
        success: false,
        category: payload.category,
        error: `Network error: ${err.message}`,
      };
    }
  }

  // ============================================================
  // 1. CUSTOMERS REPORT
  // ============================================================
  static async syncCustomers(): Promise<boolean> {
    try {
      const { data: users, error } = await supabaseAdmin
        .from('user_profiles')
        .select('id, user_id, full_name, email, phone, is_verified, is_active, created_at')
        .order('created_at', { ascending: false });

      if (error || !users) {
        logger.error('[GoogleSheets] Failed to fetch customers from Supabase:', error);
        return false;
      }

      // Fetch corresponding wallet accounts
      const userIds = users.map((u: any) => u.user_id).filter(Boolean);
      let walletMap: Record<string, { balance: number; total_earned: number }> = {};
      if (userIds.length > 0) {
        const { data: wallets } = await supabaseAdmin
          .from('wallet_accounts')
          .select('user_id, balance, total_earned')
          .in('user_id', userIds);
        if (wallets) {
          for (const w of wallets) {
            walletMap[w.user_id] = { balance: w.balance, total_earned: w.total_earned };
          }
        }
      }

      const headers = ['User ID', 'Full Name', 'Email', 'Phone', 'Verified', 'Is Active', 'Wallet Balance (₹)', 'Total Earned (₹)', 'Registered Date'];
      const rows = users.map((u: any) => {
        const w = walletMap[u.user_id] || { balance: 0, total_earned: 0 };
        return [
          u.user_id,
          u.full_name || '',
          u.email || '',
          u.phone || '',
          u.is_verified ? 'YES' : 'NO',
          u.is_active ? 'YES' : 'NO',
          w.balance,
          w.total_earned,
          u.created_at,
        ];
      });

      const result = await this.postToAppsScript({
        category: 'CUSTOMERS',
        headers,
        rows,
      });

      return result.success;
    } catch (err) {
      logger.error('[GoogleSheets] Exception in syncCustomers:', err);
      return false;
    }
  }

  // ============================================================
  // 2. PRODUCTS REPORT
  // ============================================================
  static async syncProducts(): Promise<boolean> {
    try {
      const { data: products, error } = await supabaseAdmin
        .from('products')
        .select('id, name, sku, selling_price, mrp, status, is_eligible_for_rewards, categories(name), inventory(quantity)')
        .order('name');

      if (error || !products) {
        logger.error('[GoogleSheets] Failed to fetch products from Supabase:', error);
        return false;
      }

      const headers = ['Product ID', 'Name', 'SKU', 'Category', 'Selling Price (₹)', 'MRP (₹)', 'Stock', 'Status', 'Rewards Eligible'];
      const rows = products.map((p: any) => [
        p.id,
        p.name,
        p.sku || '',
        p.categories?.name || 'Uncategorized',
        p.selling_price,
        p.mrp || '',
        p.inventory?.[0]?.quantity ?? 0,
        p.status,
        p.is_eligible_for_rewards ? 'YES' : 'NO',
      ]);

      const result = await this.postToAppsScript({
        category: 'PRODUCTS',
        headers,
        rows,
      });

      return result.success;
    } catch (err) {
      logger.error('[GoogleSheets] Exception in syncProducts:', err);
      return false;
    }
  }

  // ============================================================
  // 3. ORDERS REPORT
  // ============================================================
  static async syncOrders(): Promise<boolean> {
    try {
      const { data: orders, error } = await supabaseAdmin
        .from('orders')
        .select('order_number, user_id, status, payment_status, subtotal, credits_applied, total_amount, tracking_number, created_at')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error || !orders) {
        logger.error('[GoogleSheets] Failed to fetch orders from Supabase:', error);
        return false;
      }

      const headers = ['Order Number', 'User ID', 'Order Status', 'Payment Status', 'Subtotal (₹)', 'Credits Applied (₹)', 'Total Amount (₹)', 'Tracking #', 'Order Date'];
      const rows = orders.map((o: any) => [
        o.order_number,
        o.user_id,
        o.status,
        o.payment_status,
        o.subtotal,
        o.credits_applied || 0,
        o.total_amount,
        o.tracking_number || '',
        o.created_at,
      ]);

      const result = await this.postToAppsScript({
        category: 'ORDERS',
        headers,
        rows,
      });

      return result.success;
    } catch (err) {
      logger.error('[GoogleSheets] Exception in syncOrders:', err);
      return false;
    }
  }

  // ============================================================
  // 4. SALES REPORT
  // ============================================================
  static async syncSales(): Promise<boolean> {
    try {
      const { data: paidOrders, error } = await supabaseAdmin
        .from('orders')
        .select(`
          order_number,
          user_id,
          subtotal,
          credits_applied,
          total_amount,
          created_at,
          payments(gateway_payment_id, gateway_order_id, status)
        `)
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error || !paidOrders) {
        logger.error('[GoogleSheets] Failed to fetch sales from Supabase:', error);
        return false;
      }

      const headers = [
        'Order Number',
        'Customer ID',
        'Order Subtotal (₹)',
        'Credits Applied (₹)',
        'Net Cash Paid (₹)',
        'Payment ID',
        'Payment Status',
        'Transaction Date'
      ];

      const rows = paidOrders.map((o: any) => {
        const payment = o.payments?.[0];
        return [
          o.order_number,
          o.user_id,
          o.subtotal,
          o.credits_applied || 0,
          o.total_amount,
          payment?.gateway_payment_id || 'STORE_CREDITS',
          payment?.status || 'captured',
          o.created_at,
        ];
      });

      const result = await this.postToAppsScript({
        category: 'SALES',
        headers,
        rows,
      });

      return result.success;
    } catch (err) {
      logger.error('[GoogleSheets] Exception in syncSales:', err);
      return false;
    }
  }

  // ============================================================
  // 5. INVENTORY REPORT
  // ============================================================
  static async syncInventory(): Promise<boolean> {
    try {
      const { data: inv, error } = await supabaseAdmin
        .from('inventory')
        .select('id, quantity, reserved_quantity, low_stock_threshold, products(name, sku, status)')
        .order('quantity', { ascending: true });

      if (error || !inv) {
        logger.error('[GoogleSheets] Failed to fetch inventory from Supabase:', error);
        return false;
      }

      const headers = ['Product Name', 'SKU', 'Available Qty', 'Reserved Qty', 'Low Stock Threshold', 'Stock Health'];
      const rows = inv.map((i: any) => {
        const isLow = i.quantity <= i.low_stock_threshold;
        return [
          i.products?.name || 'Unknown',
          i.products?.sku || '',
          i.quantity,
          i.reserved_quantity,
          i.low_stock_threshold,
          isLow ? 'CRITICAL / LOW' : 'HEALTHY',
        ];
      });

      const result = await this.postToAppsScript({
        category: 'INVENTORY',
        headers,
        rows,
      });

      return result.success;
    } catch (err) {
      logger.error('[GoogleSheets] Exception in syncInventory:', err);
      return false;
    }
  }

  // ============================================================
  // 6. REWARDS REPORT
  // ============================================================
  static async syncRewards(): Promise<boolean> {
    try {
      const { data: txs, error } = await supabaseAdmin
        .from('reward_transactions')
        .select('id, user_id, amount, type, description, created_at, orders(order_number)')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error || !txs) {
        logger.error('[GoogleSheets] Failed to fetch rewards from Supabase:', error);
        return false;
      }

      const headers = ['Reward TX ID', 'Beneficiary User ID', 'Order Number', 'Reward Amount (₹)', 'Type', 'Description', 'Timestamp'];
      const rows = txs.map((t: any) => [
        t.id,
        t.user_id,
        t.orders?.order_number || '',
        t.amount,
        t.type,
        t.description || '',
        t.created_at,
      ]);

      const result = await this.postToAppsScript({
        category: 'REWARDS',
        headers,
        rows,
      });

      return result.success;
    } catch (err) {
      logger.error('[GoogleSheets] Exception in syncRewards:', err);
      return false;
    }
  }

  // ============================================================
  // 7. SUPPORT TICKETS REPORT
  // ============================================================
  static async syncSupportTickets(): Promise<boolean> {
    try {
      const { data: tickets, error } = await supabaseAdmin
        .from('support_tickets')
        .select('id, user_id, subject, category, status, created_at')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error || !tickets) {
        logger.error('[GoogleSheets] Failed to fetch support tickets from Supabase:', error);
        return false;
      }

      const userIds = Array.from(new Set(tickets.map((t: any) => t.user_id).filter(Boolean)));
      let profileMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabaseAdmin
          .from('user_profiles')
          .select('id, full_name, phone')
          .in('id', userIds);
        if (profiles) {
          profileMap = Object.fromEntries(profiles.map((p: any) => [p.id, p]));
        }
      }

      const headers = [
        'Ticket ID',
        'Customer ID',
        'Customer Name',
        'Phone',
        'Subject',
        'Category',
        'Status',
        'Created At'
      ];

      const rows = tickets.map((t: any) => [
        t.id,
        t.user_id,
        profileMap[t.user_id]?.full_name || 'GrowPlus Customer',
        profileMap[t.user_id]?.phone || 'N/A',
        t.subject,
        t.category,
        t.status,
        t.created_at,
      ]);

      const result = await this.postToAppsScript({
        category: 'SUPPORT',
        headers,
        rows,
      });

      return result.success;
    } catch (err) {
      logger.error('[GoogleSheets] Exception in syncSupportTickets:', err);
      return false;
    }
  }

  // ============================================================
  // ALL REPORTS SYNCHRONIZATION
  // ============================================================
  static async syncAllReports(): Promise<Record<SheetsCategory, boolean>> {
    logger.info('[GoogleSheets] Initiating complete multi-category reporting sync (CUSTOMERS, PRODUCTS, ORDERS, SALES, INVENTORY, REWARDS, SUPPORT)...');
    
    const [customers, products, orders, sales, inventory, rewards, support] = await Promise.all([
      this.syncCustomers(),
      this.syncProducts(),
      this.syncOrders(),
      this.syncSales(),
      this.syncInventory(),
      this.syncRewards(),
      this.syncSupportTickets(),
    ]);

    const summary: Record<SheetsCategory, boolean> = {
      CUSTOMERS: customers,
      PRODUCTS: products,
      ORDERS: orders,
      SALES: sales,
      INVENTORY: inventory,
      REWARDS: rewards,
      SUPPORT: support,
    };

    logger.info('[GoogleSheets] Multi-category sync finished. Results:', summary);
    return summary;
  }
}
