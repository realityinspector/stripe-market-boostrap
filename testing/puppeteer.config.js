/**
 * Puppeteer Configuration
 * 
 * This file configures Puppeteer for the testing environment.
 * To use the mock browser implementation instead of launching Chrome,
 * set the environment variable PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true.
 */

module.exports = {
  // Use mock browser in environments where Chromium can't be launched
  mock: true,
  
  // Screenshots directory
  screenshotsDir: './screenshots',
  
  // Base URLs
  baseUrls: {
    frontend: 'http://localhost:5000',
    api: 'http://localhost:8000'
  },
  
  // Test card details (Stripe test cards)
  testCards: {
    visa: {
      number: '4242424242424242',
      expiry: '12/25',
      cvc: '123',
      zip: '12345'
    },
    visaDebit: {
      number: '4000056655665556',
      expiry: '12/25',
      cvc: '123',
      zip: '12345'
    },
    visaDecline: {
      number: '4000000000000002',
      expiry: '12/25',
      cvc: '123',
      zip: '12345'
    }
  },
  
  // Browser launch options
  launchOptions: {
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-accelerated-2d-canvas'
    ],
    timeout: 30000
  },
  
  // Default viewport size
  defaultViewport: {
    width: 1280,
    height: 800
  },
  
  // Default timeout for actions
  defaultTimeout: 30000,
  
  // Whether to enable debug logging
  debug: true
};