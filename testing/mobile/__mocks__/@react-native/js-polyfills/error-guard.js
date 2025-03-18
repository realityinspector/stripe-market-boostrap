/**
 * Mock for the React Native error-guard module
 * 
 * This mock replaces the Flow-typed version with a JavaScript version
 * that Jest can properly handle.
 */

const ErrorUtils = {
  setGlobalHandler: jest.fn(),
  reportError: jest.fn(),
  reportFatalError: jest.fn(),
};

let _inGuard = 0;

// Simple implementation without Flow types
function guard(fn) {
  try {
    _inGuard++;
    return fn();
  } catch (e) {
    ErrorUtils.reportError(e);
  } finally {
    _inGuard--;
  }
  return null;
}

// Export the simulated module
module.exports = {
  ErrorUtils,
  guard,
};