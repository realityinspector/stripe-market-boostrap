/**
 * UI Test Template for Stripe Connect Marketplace
 * 
 * 🚨 ATTENTION AI AGENTS 🚨
 * This template provides a structured format for creating new UI tests
 * for the Stripe Connect Marketplace application. Use this template to
 * ensure proper integration with the Puppeteer-based testing infrastructure.
 * 
 * UI tests should focus on:
 * 1. Verifying correct rendering of UI components
 * 2. Testing user interactions (clicking, typing, form submission)
 * 3. Checking responsive design across device sizes
 * 4. Validating UI state changes after actions
 * 5. Testing both real and mock browser environments
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
 * Test [UI FEATURE/PAGE]
 * 
 * Description:
 * This test validates the [UI FEATURE/PAGE] rendering and functionality
 * [BRIEF DESCRIPTION OF WHAT THE TEST DOES]
 * 
 * Expected Elements:
 * - [EXPECTED ELEMENT 1]
 * - [EXPECTED ELEMENT 2]
 * 
 * Test Steps:
 * 1. [FIRST TEST STEP]
 * 2. [SECOND TEST STEP]
 * 3. [THIRD TEST STEP]
 */
async function testUiFeature() {
  console.log('Testing [UI feature/page]...');
  
  let browser;
  let page;
  
  try {
    // Initialize browser and page
    browser = await initBrowser();
    page = await createPage(browser);
    
    // Navigate to the page
    await navigateTo(page, `${BASE_URL}/[page-path]`);
    
    // Wait for critical elements to load
    const elementLoaded = await waitForElement(page, '[selector]');
    if (!elementLoaded) {
      throw new Error('Critical element did not load');
    }
    
    // Verify expected elements exist
    const hasElement1 = await elementExists(page, '[selector-1]');
    const hasElement2 = await elementExists(page, '[selector-2]');
    
    if (!hasElement1 || !hasElement2) {
      throw new Error('Missing expected UI elements');
    }
    
    // Take screenshot for reference (optional)
    await takeScreenshot(page, 'testing/screenshots/ui-feature-test.png');
    
    // Test interaction (example: click a button)
    await clickElement(page, '[button-selector]');
    
    // Wait for reaction to complete
    await mockSafeWait(page, 1000);
    
    // Verify expected result of interaction
    const resultText = await getElementText(page, '[result-selector]');
    if (resultText !== '[expected-text]') {
      throw new Error(`Expected text "[expected-text]", got "${resultText}"`);
    }
    
    console.log('[UI feature/page] test passed');
    return { passed: true };
  } catch (error) {
    console.error(`[UI feature/page] test failed: ${error.message}`);
    
    // Capture failure screenshot if possible
    if (page) {
      await takeScreenshot(page, 'testing/screenshots/ui-feature-test-failure.png');
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
 * Test [UI FEATURE/PAGE] Form Submission
 * 
 * Description:
 * This test validates the [UI FEATURE/PAGE] form submission process
 * [BRIEF DESCRIPTION OF WHAT THE TEST DOES]
 * 
 * Form Fields:
 * - [FORM FIELD 1]
 * - [FORM FIELD 2]
 * 
 * Expected Outcome:
 * - [EXPECTED OUTCOME]
 * 
 * Test Steps:
 * 1. [FIRST TEST STEP]
 * 2. [SECOND TEST STEP]
 * 3. [THIRD TEST STEP]
 */
async function testUiFormSubmission() {
  console.log('Testing [UI feature/page] form submission...');
  
  let browser;
  let page;
  
  try {
    // Initialize browser and page
    browser = await initBrowser();
    page = await createPage(browser);
    
    // Navigate to the form page
    await navigateTo(page, `${BASE_URL}/[form-page-path]`);
    
    // Wait for form to load
    const formLoaded = await waitForElement(page, 'form');
    if (!formLoaded) {
      throw new Error('Form did not load');
    }
    
    // Fill form fields
    await fillInput(page, '[field1-selector]', '[field1-value]');
    await fillInput(page, '[field2-selector]', '[field2-value]');
    
    // Submit the form
    await clickElement(page, '[submit-button-selector]');
    
    // Wait for submission to complete
    await mockSafeWait(page, 1000);
    
    // Verify successful submission indicator
    const successElement = await waitForElement(page, '[success-indicator-selector]', 5000);
    if (!successElement) {
      throw new Error('Form submission success indicator not found');
    }
    
    console.log('[UI feature/page] form submission test passed');
    return { passed: true };
  } catch (error) {
    console.error(`[UI feature/page] form submission test failed: ${error.message}`);
    
    // Capture failure screenshot if possible
    if (page) {
      await takeScreenshot(page, 'testing/screenshots/ui-form-test-failure.png');
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
 * Test [UI FEATURE/PAGE] Responsive Design
 * 
 * Description:
 * This test validates that [UI FEATURE/PAGE] renders correctly
 * across different device sizes.
 * 
 * Device Sizes Tested:
 * - Desktop (1280×720)
 * - Tablet (768×1024)
 * - Mobile (375×667)
 * 
 * Expected Behavior:
 * - [EXPECTED BEHAVIOR ON DESKTOP]
 * - [EXPECTED BEHAVIOR ON TABLET]
 * - [EXPECTED BEHAVIOR ON MOBILE]
 */
async function testUiResponsiveDesign() {
  console.log('Testing [UI feature/page] responsive design...');
  
  let browser;
  let page;
  
  try {
    // Initialize browser and page
    browser = await initBrowser();
    page = await createPage(browser);
    
    // Test desktop viewport
    await page.setViewport({ width: 1280, height: 720 });
    await navigateTo(page, `${BASE_URL}/[page-path]`);
    await mockSafeWait(page, 1000);
    
    // Check desktop-specific elements
    const desktopElementExists = await elementExists(page, '[desktop-element-selector]');
    if (!desktopElementExists) {
      throw new Error('Desktop-specific element not found');
    }
    
    await takeScreenshot(page, 'testing/screenshots/ui-desktop-view.png');
    
    // Test tablet viewport
    await page.setViewport({ width: 768, height: 1024 });
    await navigateTo(page, `${BASE_URL}/[page-path]`);
    await mockSafeWait(page, 1000);
    
    // Check tablet-specific elements
    const tabletElementExists = await elementExists(page, '[tablet-element-selector]');
    if (!tabletElementExists) {
      throw new Error('Tablet-specific element not found');
    }
    
    await takeScreenshot(page, 'testing/screenshots/ui-tablet-view.png');
    
    // Test mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    await navigateTo(page, `${BASE_URL}/[page-path]`);
    await mockSafeWait(page, 1000);
    
    // Check mobile-specific elements
    const mobileElementExists = await elementExists(page, '[mobile-element-selector]');
    if (!mobileElementExists) {
      throw new Error('Mobile-specific element not found');
    }
    
    await takeScreenshot(page, 'testing/screenshots/ui-mobile-view.png');
    
    console.log('[UI feature/page] responsive design test passed');
    return { passed: true };
  } catch (error) {
    console.error(`[UI feature/page] responsive design test failed: ${error.message}`);
    
    // Capture failure screenshot if possible
    if (page) {
      await takeScreenshot(page, 'testing/screenshots/ui-responsive-test-failure.png');
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

// Remember to export all test functions for integration with the test runner
module.exports = {
  testUiFeature,
  testUiFormSubmission,
  testUiResponsiveDesign
};

/**
 * 📝 Notes for AI Agents:
 * 
 * 1. Replace placeholders like [UI FEATURE/PAGE] with actual feature names.
 * 2. Follow camelCase naming for test functions.
 * 3. Include comprehensive documentation for each test function.
 * 4. Always return an object with at least a 'passed' property.
 * 5. Export all test functions at the end of the file.
 * 6. Use the puppeteerHelper utilities for all browser interactions.
 * 7. Always handle both the real browser case and the mock browser case.
 * 8. Use the mockSafeWait function instead of page.waitFor to ensure 
 *    tests run in both real and mock environments.
 * 9. Always close the browser in a finally block to prevent resource leaks.
 * 10. Run UI tests using: node testing/runTests.js ui
 * 
 * See the DEVELOPER_GUIDE.md file for more detailed testing instructions.
 */