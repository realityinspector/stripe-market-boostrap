/**
 * Admin Currency Formatting UI Test
 * 
 * This test validates that the admin dashboard correctly formats currency
 * values for different currencies across the UI.
 */

const puppeteerHelper = require('../utils/puppeteerHelper');
const { 
  initBrowser, 
  createPage, 
  navigateTo, 
  waitForElement,
  evaluate,
  takeScreenshot,
  mockSafeWait,
  closeBrowser
} = puppeteerHelper;

/**
 * Test Currency Formatting in Admin Dashboard
 * 
 * Description:
 * This test validates that the admin dashboard correctly formats currencies
 * in the transaction table, vendor table, and analytics panels.
 * 
 * Test Steps:
 * 1. Login as admin
 * 2. Navigate to admin dashboard
 * 3. Verify currency formatting in various UI components
 */
async function testAdminCurrencyFormatting() {
  let browser;
  let page;
  
  try {
    // Initialize browser
    browser = await initBrowser();
    page = await createPage(browser);
    
    // 1. Login as admin
    await navigateTo(page, 'http://localhost:8000/login');
    
    // Fill login form
    await page.type('input[name="email"]', 'admin@marketplace.com');
    await page.type('input[name="password"]', 'AdminPass123!');
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    // 2. Navigate to admin dashboard
    await navigateTo(page, 'http://localhost:8000/admin/dashboard');
    
    // Wait for dashboard to load
    await waitForElement(page, '.dashboard-stats');
    await mockSafeWait(page, 1000);
    
    // Take a screenshot of the dashboard
    await takeScreenshot(page, 'testing/screenshots/admin-dashboard-currency.png');
    
    // 3. Check currency formatting
    
    // Verify transaction table currency formatting
    const transactionCurrencyElements = await evaluate(page, () => {
      const cells = Array.from(document.querySelectorAll('#transactionsTable tbody tr td:nth-child(4)'));
      return cells.map(cell => cell.innerHTML);
    });
    
    // Check if currency codes are present in transaction amounts
    const transactionHasCurrencyCodes = transactionCurrencyElements.some(
      cellHtml => cellHtml.includes('<span class="currency-code">')
    );
    
    // Verify vendor table currency formatting
    const vendorCurrencyElements = await evaluate(page, () => {
      const cells = Array.from(document.querySelectorAll('#vendorsTable tbody tr td:nth-child(4)'));
      return cells.map(cell => cell.innerHTML);
    });
    
    // Check if currency codes are present in vendor sales amounts
    const vendorHasCurrencyCodes = vendorCurrencyElements.some(
      cellHtml => cellHtml.includes('<span class="currency-code">')
    );
    
    // Verify revenue stats currency formatting
    const revenueElement = await evaluate(page, () => {
      return document.getElementById('totalRevenue').innerHTML;
    });
    
    const revenueHasCurrencyCode = revenueElement.includes('<span class="currency-code">');
    
    return {
      passed: transactionHasCurrencyCodes && vendorHasCurrencyCodes && revenueHasCurrencyCode,
      message: `Currency formatting test ${transactionHasCurrencyCodes && vendorHasCurrencyCodes && revenueHasCurrencyCode ? 'passed' : 'failed'}`,
      details: {
        transactionFormatting: transactionHasCurrencyCodes,
        vendorFormatting: vendorHasCurrencyCodes,
        revenueFormatting: revenueHasCurrencyCode,
        transactionSample: transactionCurrencyElements.slice(0, 2),
        vendorSample: vendorCurrencyElements.slice(0, 2),
        revenueSample: revenueElement
      }
    };
  } catch (error) {
    console.error('Error testing admin currency formatting:', error);
    
    return {
      passed: false,
      message: `Currency formatting test failed with error: ${error.message}`,
      error: error.message
    };
  } finally {
    // Close browser
    if (browser) {
      await closeBrowser(browser);
    }
  }
}

/**
 * Test Currency Symbol Display
 * 
 * Description:
 * This test validates that the admin dashboard correctly displays
 * the appropriate currency symbols for different currencies.
 * 
 * Test Steps:
 * 1. Login as admin
 * 2. Navigate to admin dashboard
 * 3. Open vendor details modal
 * 4. Verify currency symbols in vendor sales
 */
async function testCurrencySymbols() {
  let browser;
  let page;
  
  try {
    // Initialize browser
    browser = await initBrowser();
    page = await createPage(browser);
    
    // 1. Login as admin
    await navigateTo(page, 'http://localhost:8000/login');
    
    // Fill login form
    await page.type('input[name="email"]', 'admin@marketplace.com');
    await page.type('input[name="password"]', 'AdminPass123!');
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    // 2. Navigate to admin dashboard
    await navigateTo(page, 'http://localhost:8000/admin/dashboard');
    
    // Wait for dashboard to load
    await waitForElement(page, '#vendorsTable');
    await mockSafeWait(page, 1000);
    
    // Click on the first vendor's "View Details" button
    await page.click('#vendorsTable .btn-action');
    
    // Wait for the modal to appear
    await waitForElement(page, '#vendorModal');
    
    // Take a screenshot of the vendor modal
    await takeScreenshot(page, 'testing/screenshots/admin-vendor-modal-currency.png');
    
    // Verify currency formatting in modal
    const salesElement = await evaluate(page, () => {
      return document.getElementById('modalSales').innerHTML;
    });
    
    // Check if at least one currency symbol is present
    const hasCurrencySymbol = /[$€£¥C\$A\$]/.test(salesElement);
    
    // Check if currency code is present
    const hasCurrencyCode = salesElement.includes('<span class="currency-code">');
    
    return {
      passed: hasCurrencySymbol && hasCurrencyCode,
      message: `Currency symbols test ${hasCurrencySymbol && hasCurrencyCode ? 'passed' : 'failed'}`,
      details: {
        hasCurrencySymbol,
        hasCurrencyCode,
        salesElementContent: salesElement
      }
    };
  } catch (error) {
    console.error('Error testing currency symbols:', error);
    
    return {
      passed: false,
      message: `Currency symbols test failed with error: ${error.message}`,
      error: error.message
    };
  } finally {
    // Close browser
    if (browser) {
      await closeBrowser(browser);
    }
  }
}

/**
 * Test Japanese Yen Formatting (No Decimals)
 * 
 * Description:
 * This test validates that the admin dashboard correctly formats
 * Japanese Yen (JPY) without decimal places.
 * 
 * Test Steps:
 * 1. Mock JPY formatting in console
 * 2. Verify JPY is displayed without decimal places
 */
async function testJapaneseYenFormatting() {
  let browser;
  let page;
  
  try {
    // Initialize browser
    browser = await initBrowser();
    page = await createPage(browser);
    
    // Navigate to admin dashboard to load the JavaScript
    await navigateTo(page, 'http://localhost:8000/admin/dashboard');
    
    // Test JPY formatting in console
    const jpyFormatResult = await evaluate(page, () => {
      // Access the formatCurrency function from the page context
      // This assumes the function is globally available
      if (typeof formatCurrency !== 'function') {
        return { error: 'formatCurrency function not found' };
      }
      
      // Test JPY formatting
      const jpyAmount = 1234.56;
      const formattedJpy = formatCurrency(jpyAmount, 'jpy');
      
      // Check if it has no decimal places
      const hasNoDecimals = !formattedJpy.includes('.');
      
      // Check if it has the correct symbol
      const hasYenSymbol = formattedJpy.includes('¥');
      
      return {
        passed: hasNoDecimals && hasYenSymbol,
        formattedValue: formattedJpy,
        hasNoDecimals,
        hasYenSymbol
      };
    });
    
    return {
      passed: jpyFormatResult.passed,
      message: `JPY formatting test ${jpyFormatResult.passed ? 'passed' : 'failed'}`,
      details: jpyFormatResult
    };
  } catch (error) {
    console.error('Error testing JPY formatting:', error);
    
    return {
      passed: false,
      message: `JPY formatting test failed with error: ${error.message}`,
      error: error.message
    };
  } finally {
    // Close browser
    if (browser) {
      await closeBrowser(browser);
    }
  }
}

module.exports = {
  testAdminCurrencyFormatting,
  testCurrencySymbols,
  testJapaneseYenFormatting
};