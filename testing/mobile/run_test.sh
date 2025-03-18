#!/bin/bash

echo "🧪 Running React Native Mobile Component Tests 📱"

# Create directory for test reports if it doesn't exist
mkdir -p testing/reports

# Set timestamp for report
TIMESTAMP=$(date -u +"%Y-%m-%dT%H-%M-%S.%3NZ")
REPORT_FILE="testing/reports/mobile-test-report-$TIMESTAMP.json"

# Run Jest with our configuration
npx jest \
  --config=testing/mobile/jest.config.js \
  --no-cache \
  --transformIgnorePatterns "node_modules/(?!(jest-)?react-native|@react-native(-community)?|@react-navigation|expo|@expo)" \
  testing/mobile/components || TEST_FAILED=true

# Generate test report
if [ "$TEST_FAILED" = true ]; then
  echo "❌ Mobile tests failed"
  echo "{\"timestamp\":\"$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")\",\"type\":\"mobile\",\"success\":false}" > $REPORT_FILE
  echo "📋 Test report generated at: $REPORT_FILE"
  exit 1
else
  echo "✅ Mobile tests completed successfully"
  echo "{\"timestamp\":\"$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")\",\"type\":\"mobile\",\"success\":true}" > $REPORT_FILE
  echo "📋 Test report generated at: $REPORT_FILE"
  exit 0
fi