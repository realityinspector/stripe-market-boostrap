# Blocked Tasks

## ATTENTION AI AGENTS
This document tracks tasks that are currently blocked, with reasons and potential unblocking strategies.

## Currently Blocked Tasks

<!-- If there are no blocked tasks, leave this section as is with the note below. -->
<!-- Currently, there are no blocked tasks. -->

### PAYMENT-001: Fix Payment Intent Creation
**Priority**: High  
**Status**: Blocked  
**Related Task**: STRIPE-001  
**Description**: Address issues with Stripe payment intent creation. Tests are failing when attempting to create payment intents.

**Blocking Reason**: 
This task is blocked by STRIPE-001 (Fix Stripe Connect Vendor Onboarding) because payment intents require properly onboarded vendors with Connect accounts.

**Steps to Unblock**:
1. Complete STRIPE-001 to fix vendor onboarding
2. Once vendors have valid Stripe Connect accounts, payment intents can be created properly

**Dependencies**:
- STRIPE-001: Fix Stripe Connect Vendor Onboarding

## Recently Unblocked Tasks

<!-- If no tasks have been unblocked recently, leave this section as is with the note below. -->
<!-- No tasks have been unblocked recently. -->

## Template for New Blocked Tasks

### TASK-XXX: [Task Title]
**Priority**: [High/Medium/Low]  
**Status**: Blocked  
**Related Task**: [Related Task ID]  
**Description**: [Brief description of the task]

**Blocking Reason**: 
[Detailed explanation of why the task is blocked]

**Steps to Unblock**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Dependencies**:
- [Dependency 1]
- [Dependency 2]