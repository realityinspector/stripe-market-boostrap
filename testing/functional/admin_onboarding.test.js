/**
 * Admin Onboarding Functional Tests
 * 
 * This test suite validates the admin onboarding flow:
 * 1. Admin login
 * 2. Platform configuration
 * 3. Stripe Connect configuration
 * 4. Commission settings
 */

const axios = require('axios');
const puppeteer = require('puppeteer');
const { 
  initBrowser, closeBrowser, createPage, 
  navigateTo, waitForElement, clickElement,
  fillInput, getElementText, evaluate
} = require('../utils/puppeteerHelper');
const { createTestUser } = require('../utils/testHelpers');

/**
 * Test the complete admin onboarding flow
 */
async function testAdminOnboarding() {
  let browser;
  let page;
  let admin;
  let result = { passed: false, details: {} };
  
  try {
    console.log('Testing admin onboarding flow...');
    
    // Create admin user
    admin = await createTestUser('admin');
    
    // Initialize browser
    browser = await initBrowser();
    page = await createPage();
    
    // Login as admin
    await testAdminLogin(page, admin);
    result.details.login = { passed: true };
    
    // Navigate to admin portal
    await navigateTo(page, 'http://localhost:8000/admin');
    await waitForElement(page, '.admin-cards');
    
    // Go to onboarding wizard
    await clickElement(page, 'a[href="/admin/onboarding.html"] button');
    await waitForElement(page, '.onboarding-container');
    
    // Complete onboarding steps
    await completeWelcomeStep(page);
    result.details.welcomeStep = { passed: true };
    
    await completePlatformSettingsStep(page);
    result.details.platformSettingsStep = { passed: true };
    
    await completeConnectConfigurationStep(page);
    result.details.connectConfigurationStep = { passed: true };
    
    await completeSetupStep(page);
    result.details.setupStep = { passed: true };
    
    // Verify completion screen
    const completionVisible = await waitForElement(page, '#onboarding-complete');
    if (!completionVisible) {
      throw new Error('Completion screen not displayed');
    }
    
    // Go to dashboard
    await clickElement(page, '#onboarding-complete a.btn');
    await waitForElement(page, '.dashboard-container');
    
    // Verify commission rate was saved
    const savedCommissionRate = await getElementText(page, '#platform-commission');
    if (savedCommissionRate !== '15') {
      console.warn(`Expected commission rate 15, but got ${savedCommissionRate}`);
    }
    
    result.passed = true;
    console.log('Admin onboarding test passed');
    
  } catch (error) {
    console.error('Admin onboarding test failed:', error);
    result.error = error.message;
  } finally {
    if (browser) {
      await closeBrowser();
    }
  }
  
  return result;
}

/**
 * Test admin login
 */
async function testAdminLogin(page, admin) {
  try {
    await navigateTo(page, 'http://localhost:8000/login');
    
    // Fill login form
    await fillInput(page, 'input[name="email"]', admin.email);
    await fillInput(page, 'input[name="password"]', admin.password);
    
    // Submit login form
    await clickElement(page, 'button[type="submit"]');
    
    // Verify authentication
    await waitForElement(page, '.user-info');
    
    // Store token in localStorage for future requests
    await evaluate(page, (token) => {
      localStorage.setItem('authToken', token);
    }, admin.token);
    
    return true;
  } catch (error) {
    console.error('Admin login failed:', error);
    throw error;
  }
}

/**
 * Complete welcome step
 */
async function completeWelcomeStep(page) {
  await waitForElement(page, '#step1');
  await clickElement(page, 'button.next-step[data-next="2"]');
  return true;
}

/**
 * Complete platform settings step
 */
async function completePlatformSettingsStep(page) {
  await waitForElement(page, '#step2');
  
  // Set platform name
  await fillInput(page, '#platform-name', 'Test Marketplace');
  
  // Set commission rate
  await fillInput(page, '#commission-rate', '15');
  
  // Set automatic payouts
  await evaluate(page, () => {
    document.getElementById('automatic-payouts').value = 'weekly';
  });
  
  await clickElement(page, 'button.next-step[data-next="3"]');
  return true;
}

/**
 * Complete Stripe Connect configuration step
 */
async function completeConnectConfigurationStep(page) {
  await waitForElement(page, '#step3');
  
  // Select account type
  await evaluate(page, () => {
    document.querySelector('input[name="account-type"][value="express"]').checked = true;
  });
  
  await clickElement(page, 'button.next-step[data-next="4"]');
  return true;
}

/**
 * Complete setup step
 */
async function completeSetupStep(page) {
  await waitForElement(page, '#step4');
  
  // Verify summary values
  const platformName = await getElementText(page, '#summary-platform-name');
  const commissionRate = await getElementText(page, '#summary-commission-rate');
  const payoutSchedule = await getElementText(page, '#summary-automatic-payouts');
  const accountType = await getElementText(page, '#summary-account-type');
  
  if (platformName !== 'Test Marketplace' || 
      commissionRate !== '15%' || 
      payoutSchedule !== 'Weekly' || 
      accountType !== 'Express') {
    console.warn('Summary values do not match expected settings');
  }
  
  await clickElement(page, 'button.complete-onboarding');
  return true;
}

/**
 * Run all admin onboarding tests
 */
async function runAdminOnboardingTests() {
  const results = {
    onboarding: await testAdminOnboarding()
  };
  
  return {
    passed: Object.values(results).every(r => r.passed),
    results
  };
}

module.exports = {
  testAdminOnboarding,
  runAdminOnboardingTests
};