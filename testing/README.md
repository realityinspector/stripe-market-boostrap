# Stripe Connect Marketplace Testing Framework

This testing framework provides automated testing for all components of the Stripe Connect Marketplace:

- API endpoints
- Database CRUD operations
- Authentication flows
- Payment processing
- Vendor onboarding
- Frontend rendering
- End-to-end user flows

## Running Tests

```bash
# Run all tests
npm run test

# Run specific test categories
npm run test:api
npm run test:e2e
npm run test:frontend
```

## Test Reports

After running tests, reports are available in the `testing/reports` directory.