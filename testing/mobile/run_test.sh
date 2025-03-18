#!/bin/bash

echo "🧪 Running React Native Mobile Component Tests 📱"

# Create directory for test reports if it doesn't exist
mkdir -p testing/reports

# Set timestamp for report
TIMESTAMP=$(date -u +"%Y-%m-%dT%H-%M-%S.%3NZ")
REPORT_FILE="testing/reports/mobile-test-report-$TIMESTAMP.json"

# Default component directory
COMPONENT_DIR="testing/mobile/components"

# Check if a specific component was specified
if [ -n "$1" ]; then
  COMPONENT_TEST="$COMPONENT_DIR/$1.test.js"
  
  # Check if the component test exists
  if [ ! -f "$COMPONENT_TEST" ]; then
    echo "❌ Test file not found: $COMPONENT_TEST"
    echo "{\"timestamp\":\"$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")\",\"type\":\"mobile\",\"success\":false,\"error\":\"Test file not found\"}" > $REPORT_FILE
    echo "📋 Test report generated at: $REPORT_FILE"
    exit 1
  fi
  
  TEST_PATH="$COMPONENT_TEST"
else
  TEST_PATH="$COMPONENT_DIR"
fi

# Setup NODE_ENV for proper test environment
export NODE_ENV=test

# Ensure __DEV__ is defined for React Native
export __DEV__=true

# Run Jest with our configuration
npx jest \
  --config=testing/mobile/jest.config.js \
  --no-cache \
  --transformIgnorePatterns "node_modules/(?!(jest-)?react-native|@react-native(-community)?|@react-navigation|expo|@expo)" \
  "$TEST_PATH" || TEST_FAILED=true

# Generate test report
if [ "$TEST_FAILED" = true ]; then
  echo "❌ Mobile tests failed"
  echo "{\"timestamp\":\"$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")\",\"type\":\"mobile\",\"success\":false,\"component\":\"$1\"}" > $REPORT_FILE
  echo "📋 Test report generated at: $REPORT_FILE"
  exit 1
else
  echo "✅ Mobile tests completed successfully"
  echo "{\"timestamp\":\"$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")\",\"type\":\"mobile\",\"success\":true,\"component\":\"$1\"}" > $REPORT_FILE
  echo "📋 Test report generated at: $REPORT_FILE"
  exit 0
fi