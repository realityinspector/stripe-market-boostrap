/**
 * Example UI Test for Stripe Connect Marketplace
 * 
 * 🚨 ATTENTION AI AGENTS 🚨
 * This is an example test file that demonstrates how to use the UI test template.
 * Use this as a reference when creating new UI tests.
 */

const { 
  initBrowser, 
  closeBrowser, 
  createPage, 
  navigateTo,
  elementExists,
  clickElement,
  fillInput,
  getElementText,
  waitForElement,
  mockSafeWait,
  takeScreenshot
} = require('../utils/puppeteerHelper');

// Base URL for UI testing
const BASE_URL = process.env.UI_URL || 'http://localhost:8000';

/**
 * Test Product Filtering UI
 * 
 * Description:
 * This test validates the product filtering UI component functionality.
 * It tests price range filters, category selection, and result updates.
 * 
 * Expected Elements:
 * - Price range sliders
 * - Category checkboxes
 * - Filter button
 * - Product results grid
 * 
 * Test Steps:
 * 1. Navigate to products page
 * 2. Set price range filter
 * 3. Select a product category
 * 4. Apply filters
 * 5. Verify filtered results
 */
async function testProductFilteringUI() {
  console.log('Testing product filtering UI...');
  
  let browser;
  let page;
  
  try {
    // Initialize browser and page
    browser = await initBrowser();
    page = await createPage(browser);
    
    // Navigate to the products page
    await navigateTo(page, `${BASE_URL}/products`);
    
    // Wait for the filter components to load
    const filtersLoaded = await waitForElement(page, '.product-filters');
    if (!filtersLoaded) {
      throw new Error('Product filters did not load');
    }
    
    // Take screenshot of initial state
    await takeScreenshot(page, 'testing/screenshots/product-filters-initial.png');
    
    // Set price range using slider (min price)
    await page.evaluate(() => {
      // Use JavaScript to set slider value since direct interaction is difficult
      const minPriceSlider = document.querySelector('.price-slider-min');
      if (minPriceSlider) {
        minPriceSlider.value = "50";
        minPriceSlider.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    // Set price range using slider (max price)
    await page.evaluate(() => {
      const maxPriceSlider = document.querySelector('.price-slider-max');
      if (maxPriceSlider) {
        maxPriceSlider.value = "150";
        maxPriceSlider.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    // Wait for price display to update
    await mockSafeWait(page, 500);
    
    // Verify price display updated
    const minPriceDisplay = await getElementText(page, '.min-price-display');
    const maxPriceDisplay = await getElementText(page, '.max-price-display');
    
    if (minPriceDisplay !== '$50' || maxPriceDisplay !== '$150') {
      throw new Error(`Price display not updated correctly. Got min: ${minPriceDisplay}, max: ${maxPriceDisplay}`);
    }
    
    // Select a category checkbox
    await clickElement(page, '.category-checkbox[data-category="electronics"]');
    
    // Click the apply filters button
    await clickElement(page, '.apply-filters-button');
    
    // Wait for results to update
    await mockSafeWait(page, 1000);
    
    // Take screenshot of filtered results
    await takeScreenshot(page, 'testing/screenshots/product-filters-applied.png');
    
    // Verify product results are filtered
    // We should only have products in the electronics category within our price range
    const productElements = await page.$$('.product-card');
    
    // Check that we have at least one product
    if (productElements.length === 0) {
      throw new Error('No products found after filtering');
    }
    
    // Verify each product is in the correct category
    let allProductsMatchFilter = true;
    for (const productElement of productElements) {
      const category = await productElement.$eval('.product-category', el => el.textContent);
      const price = await productElement.$eval('.product-price', el => {
        // Remove currency symbol and convert to number
        return parseFloat(el.textContent.replace(/[^0-9.-]+/g, ''));
      });
      
      if (category !== 'Electronics' || price < 50 || price > 150) {
        allProductsMatchFilter = false;
        break;
      }
    }
    
    if (!allProductsMatchFilter) {
      throw new Error('Some products do not match the applied filters');
    }
    
    // Clear filters by clicking the reset button
    await clickElement(page, '.reset-filters-button');
    
    // Wait for results to update
    await mockSafeWait(page, 1000);
    
    // Verify filters were reset
    const allProductElements = await page.$$('.product-card');
    if (allProductElements.length <= productElements.length) {
      throw new Error('Filter reset did not increase the number of products shown');
    }
    
    console.log('Product filtering UI test passed');
    return { passed: true };
  } catch (error) {
    console.error(`Product filtering UI test failed: ${error.message}`);
    
    // Capture failure screenshot if possible
    if (page) {
      await takeScreenshot(page, 'testing/screenshots/product-filters-failure.png');
    }
    
    return { 
      passed: false, 
      error: error.message 
    };
  } finally {
    // Always close the browser
    if (browser) {
      await closeBrowser(browser);
    }
  }
}

/**
 * Test Product Filtering UI Responsive Design
 * 
 * Description:
 * This test validates that the product filtering UI renders correctly
 * across different device sizes.
 * 
 * Device Sizes Tested:
 * - Desktop (1280×720)
 * - Tablet (768×1024)
 * - Mobile (375×667)
 * 
 * Expected Behavior:
 * - Desktop: Filter sidebar visible alongside products
 * - Tablet: Filter sidebar toggleable with button
 * - Mobile: Filter panel as bottom sheet or overlay
 */
async function testProductFilteringResponsiveDesign() {
  console.log('Testing product filtering responsive design...');
  
  let browser;
  let page;
  
  try {
    // Initialize browser and page
    browser = await initBrowser();
    page = await createPage(browser);
    
    // Test desktop viewport
    await page.setViewport({ width: 1280, height: 720 });
    await navigateTo(page, `${BASE_URL}/products`);
    await mockSafeWait(page, 1000);
    
    // Check desktop-specific elements
    const desktopSidebarVisible = await elementExists(page, '.filters-sidebar.desktop-visible');
    if (!desktopSidebarVisible) {
      throw new Error('Desktop filter sidebar not found');
    }
    
    await takeScreenshot(page, 'testing/screenshots/product-filters-desktop.png');
    
    // Test tablet viewport
    await page.setViewport({ width: 768, height: 1024 });
    await navigateTo(page, `${BASE_URL}/products`);
    await mockSafeWait(page, 1000);
    
    // Check tablet-specific elements
    // On tablet, the filter button should be visible
    const tabletFilterButton = await elementExists(page, '.filter-toggle-button');
    if (!tabletFilterButton) {
      throw new Error('Tablet filter toggle button not found');
    }
    
    // Click the filter toggle button
    await clickElement(page, '.filter-toggle-button');
    
    // Wait for filter panel to appear
    await mockSafeWait(page, 500);
    
    // Verify filter panel becomes visible
    const tabletFilterPanelVisible = await elementExists(page, '.filters-sidebar.is-visible');
    if (!tabletFilterPanelVisible) {
      throw new Error('Tablet filter panel did not become visible after clicking toggle');
    }
    
    await takeScreenshot(page, 'testing/screenshots/product-filters-tablet.png');
    
    // Test mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    await navigateTo(page, `${BASE_URL}/products`);
    await mockSafeWait(page, 1000);
    
    // Check mobile-specific elements
    const mobileFilterButton = await elementExists(page, '.filter-toggle-button.mobile');
    if (!mobileFilterButton) {
      throw new Error('Mobile filter button not found');
    }
    
    // Click the mobile filter button
    await clickElement(page, '.filter-toggle-button.mobile');
    
    // Wait for filter drawer/overlay to appear
    await mockSafeWait(page, 500);
    
    // Verify mobile filter drawer is visible
    const mobileFilterDrawer = await elementExists(page, '.filter-drawer.is-visible');
    if (!mobileFilterDrawer) {
      throw new Error('Mobile filter drawer did not appear');
    }
    
    await takeScreenshot(page, 'testing/screenshots/product-filters-mobile.png');
    
    console.log('Product filtering responsive design test passed');
    return { passed: true };
  } catch (error) {
    console.error(`Product filtering responsive design test failed: ${error.message}`);
    
    // Capture failure screenshot if possible
    if (page) {
      await takeScreenshot(page, 'testing/screenshots/product-filters-responsive-failure.png');
    }
    
    return { 
      passed: false, 
      error: error.message 
    };
  } finally {
    // Always close the browser
    if (browser) {
      await closeBrowser(browser);
    }
  }
}

// Export test functions for integration with the test runner
module.exports = {
  testProductFilteringUI,
  testProductFilteringResponsiveDesign
};

/**
 * 📝 Notes for AI Agents:
 * 
 * This example demonstrates:
 * 
 * 1. Proper structure for UI tests following the template
 * 2. Testing UI components and interactions
 * 3. Testing responsive design across device sizes
 * 4. Using the puppeteerHelper utilities for browser automation
 * 5. Taking screenshots for visual verification and debugging
 * 6. Proper browser resource cleanup
 * 
 * When creating new UI tests:
 * - Initialize and close the browser properly
 * - Use the puppeteerHelper utilities for all browser interactions
 * - Take screenshots at key points for debugging
 * - Test across different device sizes when applicable
 * - Clean up resources in finally blocks
 * 
 * See the /testing/templates/ui_test_template.js file for the base template.
 */