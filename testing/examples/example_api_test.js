/**
 * Example API Test for Stripe Connect Marketplace
 * 
 * 🚨 ATTENTION AI AGENTS 🚨
 * This is an example test file that demonstrates how to use the API test template.
 * Use this as a reference when creating new API tests.
 */

const axios = require('axios');

// Base URL for API requests
const BASE_URL = process.env.API_URL || 'http://localhost:8000/api';

/**
 * Test Product Search Endpoint
 * 
 * Description:
 * This test validates the product search API endpoint functionality.
 * It tests the ability to search products by keyword and filter by price range.
 * 
 * HTTP Method: GET
 * Endpoint: /products/search
 * Authentication Required: NO
 * 
 * Expected Status Code: 200
 * Expected Response: Array of products matching search criteria
 * 
 * Test Steps:
 * 1. Create test products with different names and prices
 * 2. Search for products by keyword
 * 3. Filter products by price range
 * 4. Verify search results
 */
async function testProductSearch() {
  console.log('Testing product search API...');
  
  try {
    // 1. Setup test data by creating products (assuming products exist)
    // In a real test, you might create these products first
    
    // 2. Test search by keyword
    const keywordResponse = await axios.get(`${BASE_URL}/products/search`, {
      params: { keyword: 'premium' }
    });
    
    // Verify response status
    if (keywordResponse.status !== 200) {
      throw new Error(`Expected status 200, got ${keywordResponse.status}`);
    }
    
    // Verify response data structure
    if (!Array.isArray(keywordResponse.data)) {
      throw new Error('Response should be an array of products');
    }
    
    // Verify search results contain the keyword
    const keywordResults = keywordResponse.data;
    const allResultsHaveKeyword = keywordResults.every(product => 
      product.name.toLowerCase().includes('premium') || 
      product.description.toLowerCase().includes('premium')
    );
    
    if (!allResultsHaveKeyword) {
      throw new Error('Some search results do not match the keyword');
    }
    
    // 3. Test filter by price range
    const priceResponse = await axios.get(`${BASE_URL}/products/search`, {
      params: { minPrice: 50, maxPrice: 150 }
    });
    
    // Verify response status
    if (priceResponse.status !== 200) {
      throw new Error(`Expected status 200, got ${priceResponse.status}`);
    }
    
    // Verify price filter results
    const priceResults = priceResponse.data;
    const allResultsInPriceRange = priceResults.every(product => 
      product.price >= 50 && product.price <= 150
    );
    
    if (!allResultsInPriceRange) {
      throw new Error('Some products are outside the specified price range');
    }
    
    // 4. Test combined search with keyword and price range
    const combinedResponse = await axios.get(`${BASE_URL}/products/search`, {
      params: { 
        keyword: 'premium', 
        minPrice: 50, 
        maxPrice: 150 
      }
    });
    
    // Verify response status
    if (combinedResponse.status !== 200) {
      throw new Error(`Expected status 200, got ${combinedResponse.status}`);
    }
    
    // Verify combined filter results
    const combinedResults = combinedResponse.data;
    const allResultsMatchCriteria = combinedResults.every(product => 
      (product.name.toLowerCase().includes('premium') || 
       product.description.toLowerCase().includes('premium')) &&
      product.price >= 50 && product.price <= 150
    );
    
    if (!allResultsMatchCriteria) {
      throw new Error('Some products do not match both keyword and price range criteria');
    }
    
    console.log('Product search API test passed');
    return { passed: true };
  } catch (error) {
    console.error(`Product search API test failed: ${error.message}`);
    return { 
      passed: false, 
      error: error.message 
    };
  }
}

/**
 * Test Product Search with Invalid Parameters
 * 
 * Description:
 * This test validates that the product search API correctly handles invalid input.
 * 
 * HTTP Method: GET
 * Endpoint: /products/search
 * Authentication Required: NO
 * 
 * Expected Status Code: 400 for invalid parameters
 * Expected Response: Error object with message
 * 
 * Test Steps:
 * 1. Test with invalid price range (maxPrice < minPrice)
 * 2. Test with negative prices
 * 3. Verify error response
 * 
 * Invalid Inputs Tested:
 * - Invalid price range (maxPrice < minPrice)
 * - Negative price values
 */
async function testProductSearchWithInvalidParams() {
  console.log('Testing product search API with invalid parameters...');
  
  try {
    // 1. Test with invalid price range (maxPrice < minPrice)
    const invalidRangeResponse = await axios.get(`${BASE_URL}/products/search`, {
      params: { minPrice: 200, maxPrice: 100 },
      validateStatus: () => true // Don't throw on error status codes
    });
    
    // Verify response status is an error code
    if (invalidRangeResponse.status !== 400) {
      throw new Error(`Expected status 400, got ${invalidRangeResponse.status}`);
    }
    
    // Verify error response data
    if (!invalidRangeResponse.data || !invalidRangeResponse.data.error) {
      throw new Error('Response missing expected error information');
    }
    
    // 2. Test with negative prices
    const negativeValueResponse = await axios.get(`${BASE_URL}/products/search`, {
      params: { minPrice: -50 },
      validateStatus: () => true // Don't throw on error status codes
    });
    
    // Verify response status is an error code
    if (negativeValueResponse.status !== 400) {
      throw new Error(`Expected status 400, got ${negativeValueResponse.status}`);
    }
    
    // Verify error response data
    if (!negativeValueResponse.data || !negativeValueResponse.data.error) {
      throw new Error('Response missing expected error information');
    }
    
    console.log('Product search API invalid parameters test passed');
    return { passed: true };
  } catch (error) {
    console.error(`Product search API invalid parameters test failed: ${error.message}`);
    return { 
      passed: false, 
      error: error.message 
    };
  }
}

// Export test functions for integration with the test runner
module.exports = {
  testProductSearch,
  testProductSearchWithInvalidParams
};

/**
 * 📝 Notes for AI Agents:
 * 
 * This example demonstrates:
 * 
 * 1. Proper structure for API tests following the template
 * 2. Testing happy path (valid search parameters)
 * 3. Testing error path (invalid search parameters)
 * 4. Verifying both response status codes and response data
 * 5. Exporting test functions for integration with the test runner
 * 
 * When creating new API tests:
 * - Follow this structure for consistency
 * - Document expected behavior clearly
 * - Test both valid and invalid inputs
 * - Verify appropriate error handling
 * - Use validateStatus: () => true when expecting error status codes
 * 
 * See the /testing/templates/api_test_template.js file for the base template.
 */