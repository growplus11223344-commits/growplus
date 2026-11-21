import { GoogleSheetsService, SheetsSyncPayload } from '../src/services/googleSheets';
import { logger } from '../src/utils/logger';

describe('Google Sheets Apps Script Web App Integration', () => {
  const TEST_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbz-p1CsI_-Ok6r6br8QHTGl7QSN6kTGrnvgRgon35ne5CYR4YlRnEwskkev8pynvWEJWg/exec';
  const TEST_SECRET = 'Hash*&^%7776hsfdj8787%^$!jika';

  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      GOOGLE_APPS_SCRIPT_URL: TEST_WEBAPP_URL,
      GOOGLE_APPS_SCRIPT_SECRET: TEST_SECRET,
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  // =========================================================================
  // 1. INPUT VALIDATION TESTS
  // =========================================================================
  describe('Input & Payload Validation', () => {
    it('should reject invalid data category without making network requests', async () => {
      const fetchSpy = jest.spyOn(global, 'fetch');

      const invalidPayload = {
        category: 'INVALID_CATEGORY' as any,
        headers: ['ID', 'Name'],
        rows: [['1', 'Alice']],
      };

      const result = await GoogleSheetsService.postToAppsScript(invalidPayload);

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Invalid category/);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should reject empty or missing headers without making network requests', async () => {
      const fetchSpy = jest.spyOn(global, 'fetch');

      const invalidPayload: SheetsSyncPayload = {
        category: 'CUSTOMERS',
        headers: [],
        rows: [['1', 'Alice']],
      };

      const result = await GoogleSheetsService.postToAppsScript(invalidPayload);

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Invalid headers/);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should reject non-array rows without making network requests', async () => {
      const fetchSpy = jest.spyOn(global, 'fetch');

      const invalidPayload = {
        category: 'PRODUCTS' as const,
        headers: ['ID', 'Name'],
        rows: 'not-an-array' as any,
      };

      const result = await GoogleSheetsService.postToAppsScript(invalidPayload);

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Invalid rows/);
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 2. ENVIRONMENT CONFIGURATION TESTS
  // =========================================================================
  describe('Environment Configuration Handling', () => {
    it('should fail gracefully if GOOGLE_APPS_SCRIPT_URL (and fallback) is missing', async () => {
      delete process.env.GOOGLE_APPS_SCRIPT_URL;
      delete process.env.GOOGLE_SHEETS_WEBAPP_URL;

      const payload: SheetsSyncPayload = {
        category: 'CUSTOMERS',
        headers: ['ID', 'Name'],
        rows: [['1', 'Alice']],
      };

      const result = await GoogleSheetsService.postToAppsScript(payload);

      expect(result.success).toBe(false);
      expect(result.error).toContain('GOOGLE_APPS_SCRIPT_URL is not configured');
    });

    it('should support GOOGLE_SHEETS_WEBAPP_URL as a fallback alias', async () => {
      delete process.env.GOOGLE_APPS_SCRIPT_URL;
      process.env.GOOGLE_SHEETS_WEBAPP_URL = TEST_WEBAPP_URL;

      const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        status: 200,
        ok: true,
        text: jest.fn().mockResolvedValueOnce(JSON.stringify({ success: true, rowsSynced: 1 })),
      } as any);

      const payload: SheetsSyncPayload = {
        category: 'CUSTOMERS',
        headers: ['ID', 'Name'],
        rows: [['1', 'Alice']],
      };

      const result = await GoogleSheetsService.postToAppsScript(payload);
      expect(result.success).toBe(true);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('should operate cleanly without secret if no secret is configured in environment', async () => {
      delete process.env.GOOGLE_APPS_SCRIPT_SECRET;
      delete process.env.GOOGLE_SHEETS_WEBAPP_SECRET;

      const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        status: 200,
        ok: true,
        text: jest.fn().mockResolvedValueOnce(JSON.stringify({ success: true, rowsSynced: 1 })),
      } as any);

      const payload: SheetsSyncPayload = {
        category: 'ORDERS',
        headers: ['ID', 'Amount'],
        rows: [['ord-1', 500]],
      };

      const result = await GoogleSheetsService.postToAppsScript(payload);
      expect(result.success).toBe(true);

      const sentBody = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);
      expect(sentBody.secret).toBeUndefined();
      expect(sentBody.category).toBe('ORDERS');
    });
  });

  // =========================================================================
  // 3. SUCCESSFUL REQUEST TESTS
  // =========================================================================
  describe('Successful Sync Operations', () => {
    it('should successfully post payload and parse valid Apps Script response', async () => {
      const mockSuccessResponse = {
        success: true,
        category: 'CUSTOMERS',
        sheetName: 'Customers',
        rowsSynced: 2,
        statusCode: 200,
      };

      const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        status: 200,
        ok: true,
        text: jest.fn().mockResolvedValueOnce(JSON.stringify(mockSuccessResponse)),
      } as any);

      const payload: SheetsSyncPayload = {
        category: 'CUSTOMERS',
        action: 'REPLACE',
        headers: ['ID', 'Full Name', 'Email', 'Wallet Balance'],
        rows: [
          ['user-001', 'Alice Johnson', 'alice@growplus.test', 1250],
          ['user-002', 'Bob Smith', 'bob@growplus.test', 500],
        ],
      };

      const result = await GoogleSheetsService.postToAppsScript(payload);

      expect(result.success).toBe(true);
      expect(result.category).toBe('CUSTOMERS');
      expect(result.rowsSynced).toBe(2);
      expect(result.sheetName).toBe('Customers');
      expect(result.statusCode).toBe(200);

      // Verify fetch was called with right URL and payload structure
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [calledUrl, calledOptions] = fetchSpy.mock.calls[0];
      expect(calledUrl).toBe(TEST_WEBAPP_URL);
      expect(calledOptions?.method).toBe('POST');
      expect(calledOptions?.headers).toEqual({
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
      });

      // Verify request body contains secret token and category
      const parsedBody = JSON.parse(calledOptions?.body as string);
      expect(parsedBody.secret).toBe(TEST_SECRET);
      expect(parsedBody.category).toBe('CUSTOMERS');
      expect(parsedBody.action).toBe('REPLACE');
      expect(parsedBody.headers).toHaveLength(4);
      expect(parsedBody.rows).toHaveLength(2);
    });

    it('should support APPEND action when specified', async () => {
      const mockSuccessResponse = {
        success: true,
        category: 'ORDERS',
        sheetName: 'Orders',
        rowsSynced: 1,
        statusCode: 200,
      };

      const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        status: 200,
        ok: true,
        text: jest.fn().mockResolvedValueOnce(JSON.stringify(mockSuccessResponse)),
      } as any);

      const payload: SheetsSyncPayload = {
        category: 'ORDERS',
        action: 'APPEND',
        headers: ['Order Number', 'Amount'],
        rows: [['ORD-1001', 999]],
      };

      const result = await GoogleSheetsService.postToAppsScript(payload);

      expect(result.success).toBe(true);
      const parsedBody = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);
      expect(parsedBody.action).toBe('APPEND');
    });
  });

  // =========================================================================
  // 4. INVALID SECRET & AUTHENTICATION REJECTION TESTS
  // =========================================================================
  describe('Secret Verification & Unauthorized Handling', () => {
    it('should handle unauthorized rejection from Apps Script when secret is wrong', async () => {
      const mockAuthErrorResponse = {
        success: false,
        error: 'Unauthorized: Invalid secret token provided',
        statusCode: 401,
      };

      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        status: 200,
        ok: true,
        text: jest.fn().mockResolvedValueOnce(JSON.stringify(mockAuthErrorResponse)),
      } as any);

      const payload: SheetsSyncPayload = {
        category: 'CUSTOMERS',
        headers: ['ID', 'Name'],
        rows: [['1', 'Alice']],
      };

      const result = await GoogleSheetsService.postToAppsScript(payload, undefined, 'WRONG_SECRET');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unauthorized: Invalid secret token');
      expect(result.statusCode).toBe(401);
    });
  });

  // =========================================================================
  // 5. FAILED GOOGLE SHEETS OPERATIONS & ERROR RECOVERY
  // =========================================================================
  describe('Failed Operations & Edge Cases', () => {
    it('should handle Apps Script deployment error: "Script function not found: doPost"', async () => {
      const htmlError = '<html><head><title>Error</title></head><body><div id="errorMessage">Script function not found: doPost</div></body></html>';

      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        status: 200,
        ok: true,
        text: jest.fn().mockResolvedValueOnce(htmlError),
      } as any);

      const payload: SheetsSyncPayload = {
        category: 'PRODUCTS',
        headers: ['ID', 'Title'],
        rows: [['p-1', 'Organic Compost']],
      };

      const result = await GoogleSheetsService.postToAppsScript(payload);

      expect(result.success).toBe(false);
      expect(result.error).toContain('doPost function not found in deployed script');
      expect(result.statusCode).toBe(500);
    });

    it('should handle 404 Google Drive URL not found error page', async () => {
      const html404 = '<html><body>Google Drive – Page Not Found (404)</body></html>';

      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        status: 404,
        ok: false,
        text: jest.fn().mockResolvedValueOnce(html404),
      } as any);

      const payload: SheetsSyncPayload = {
        category: 'INVENTORY',
        headers: ['Product', 'Stock'],
        rows: [['Item A', 50]],
      };

      const result = await GoogleSheetsService.postToAppsScript(payload);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Apps Script Web App URL not found (404)');
      expect(result.statusCode).toBe(404);
    });

    it('should handle request timeout using AbortController (HTTP 408)', async () => {
      const abortError = new Error('The user aborted a request.');
      abortError.name = 'AbortError';

      jest.spyOn(global, 'fetch').mockRejectedValueOnce(abortError);

      const payload: SheetsSyncPayload = {
        category: 'SALES',
        headers: ['Date', 'Amount'],
        rows: [['2026-11-19', 15000]],
      };

      const result = await GoogleSheetsService.postToAppsScript(payload, undefined, undefined, 100);

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Request timed out/);
      expect(result.statusCode).toBe(408);
    });

    it('should handle generic network error gracefully', async () => {
      jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('getaddrinfo ENOTFOUND script.google.com'));

      const payload: SheetsSyncPayload = {
        category: 'REWARDS',
        headers: ['User', 'Points'],
        rows: [['U1', 100]],
      };

      const result = await GoogleSheetsService.postToAppsScript(payload);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error: getaddrinfo ENOTFOUND');
    });

    it('should handle Apps Script returning custom application-level error JSON', async () => {
      const appErrorResponse = {
        success: false,
        error: 'Failed to access active spreadsheet: Service Spreadsheets failed due to quota limit',
        statusCode: 500,
      };

      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        status: 200,
        ok: true,
        text: jest.fn().mockResolvedValueOnce(JSON.stringify(appErrorResponse)),
      } as any);

      const payload: SheetsSyncPayload = {
        category: 'CUSTOMERS',
        headers: ['ID', 'Name'],
        rows: [['1', 'Alice']],
      };

      const result = await GoogleSheetsService.postToAppsScript(payload);

      expect(result.success).toBe(false);
      expect(result.error).toContain('quota limit');
      expect(result.statusCode).toBe(500);
    });
  });

  // =========================================================================
  // 6. SAFE LOGGING TESTS (NEVER LOG SECRETS)
  // =========================================================================
  describe('Secret Sanitization in Logs', () => {
    it('should NEVER log secret tokens to console or logger', async () => {
      const infoSpy = jest.spyOn(logger, 'info');
      const warnSpy = jest.spyOn(logger, 'warn');
      const errorSpy = jest.spyOn(logger, 'error');

      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        status: 200,
        ok: true,
        text: jest.fn().mockResolvedValueOnce(JSON.stringify({ success: true, rowsSynced: 1 })),
      } as any);

      const payload: SheetsSyncPayload = {
        category: 'CUSTOMERS',
        headers: ['ID', 'Name'],
        rows: [['1', 'Alice']],
      };

      await GoogleSheetsService.postToAppsScript(payload);

      const allLogMessages = [
        ...infoSpy.mock.calls.map(c => JSON.stringify(c)),
        ...warnSpy.mock.calls.map(c => JSON.stringify(c)),
        ...errorSpy.mock.calls.map(c => JSON.stringify(c)),
      ].join(' ');

      expect(allLogMessages).not.toContain(TEST_SECRET);
    });
  });

  // =========================================================================
  // 7. ALL SIX CATEGORIES SYNC WRAPPERS
  // =========================================================================
  describe('All Six Categories Implementation', () => {
    const validCategories: Array<SheetsSyncPayload['category']> = [
      'CUSTOMERS',
      'PRODUCTS',
      'ORDERS',
      'SALES',
      'INVENTORY',
      'REWARDS',
    ];

    validCategories.forEach((category) => {
      it(`should accept and dispatch category "${category}"`, async () => {
        jest.spyOn(global, 'fetch').mockResolvedValueOnce({
          status: 200,
          ok: true,
          text: jest.fn().mockResolvedValueOnce(JSON.stringify({ success: true, rowsSynced: 1, sheetName: category })),
        } as any);

        const payload: SheetsSyncPayload = {
          category,
          headers: ['Header1', 'Header2'],
          rows: [['Val1', 'Val2']],
        };

        const result = await GoogleSheetsService.postToAppsScript(payload);

        expect(result.success).toBe(true);
        expect(result.category).toBe(category);
      });
    });

    it('syncAllReports should execute all categories and return detailed report map', async () => {
      jest.spyOn(GoogleSheetsService, 'syncCustomers').mockResolvedValueOnce(true);
      jest.spyOn(GoogleSheetsService, 'syncProducts').mockResolvedValueOnce(true);
      jest.spyOn(GoogleSheetsService, 'syncOrders').mockResolvedValueOnce(true);
      jest.spyOn(GoogleSheetsService, 'syncSales').mockResolvedValueOnce(true);
      jest.spyOn(GoogleSheetsService, 'syncInventory').mockResolvedValueOnce(true);
      jest.spyOn(GoogleSheetsService, 'syncRewards').mockResolvedValueOnce(true);
      jest.spyOn(GoogleSheetsService, 'syncSupportTickets').mockResolvedValueOnce(true);

      const results = await GoogleSheetsService.syncAllReports();

      expect(results).toEqual({
        CUSTOMERS: true,
        PRODUCTS: true,
        ORDERS: true,
        SALES: true,
        INVENTORY: true,
        REWARDS: true,
        SUPPORT: true,
      });
    });
  });
});
