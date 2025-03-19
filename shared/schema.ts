import { pgTable, serial, text, integer, decimal, boolean, timestamp, pgEnum, uuid, date, time, varchar, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * Content Class Schema Definitions for Stripe Connect Marketplace
 * 
 * This file defines all database models using Drizzle ORM
 */

// Enums

export const userRoleEnum = pgEnum('user_role', ['admin', 'vendor', 'customer']);

export const vendorStatusEnum = pgEnum('vendor_status', ['pending', 'active', 'suspended']);

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'paid',
  'completed',
  'cancelled',
  'refunded',
  'partially_refunded',
  'failed'
]);

export const refundStatusEnum = pgEnum('refund_status', ['pending', 'completed', 'failed']);

export const fulfillmentStatusEnum = pgEnum('fulfillment_status', [
  'unfulfilled',
  'partial',
  'fulfilled',
  'shipped',
  'delivered'
]);

export const discountTypeEnum = pgEnum('discount_type', [
  'percentage',
  'fixed_amount',
  'free_item',
  'buy_x_get_y'
]);

// Base Tables

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

export const vendors = pgTable('vendors', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  businessName: varchar('business_name', { length: 255 }).notNull(),
  businessDescription: text('business_description'),
  stripeAccountId: varchar('stripe_account_id', { length: 255 }).unique(),
  stripeOnboardingComplete: boolean('stripe_onboarding_complete').default(false),
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }).default('10.00'),
  status: vendorStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// =================== PRODUCT CONTENT CLASSES ===================

// Product Categories
export const productCategories = pgTable('product_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  parentId: integer('parent_id').references(() => productCategories.id, { onDelete: 'set null' }),
  slug: varchar('slug', { length: 150 }).notNull().unique(),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

// Products
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  vendorId: integer('vendor_id').references(() => vendors.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  imageUrl: text('image_url'),
  active: boolean('active').default(true),
  featured: boolean('featured').default(false),
  inventory: integer('inventory').default(0),
  sku: varchar('sku', { length: 50 }),
  weight: decimal('weight', { precision: 8, scale: 2 }),
  dimensions: varchar('dimensions', { length: 100 }),
  categoryId: integer('category_id').references(() => productCategories.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Product-Category Relationship (for products with multiple categories)
export const productCategoryMappings = pgTable('product_category_mappings', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  categoryId: integer('category_id').references(() => productCategories.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// Product Inventory
export const productInventory = pgTable('product_inventory', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  quantity: integer('quantity').default(0).notNull(),
  reservedQuantity: integer('reserved_quantity').default(0),
  lowStockThreshold: integer('low_stock_threshold'),
  lastRestocked: timestamp('last_restocked').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Inventory History
export const inventoryHistory = pgTable('inventory_history', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  quantityChange: integer('quantity_change').notNull(),
  newQuantity: integer('new_quantity').notNull(),
  reason: varchar('reason', { length: 255 }),
  reference: varchar('reference', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: integer('created_by').references(() => users.id)
});

// =================== EVENT CONTENT CLASSES ===================

// Events
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  vendorId: integer('vendor_id').references(() => vendors.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  startTime: time('start_time'),
  endTime: time('end_time'),
  location: varchar('location', { length: 255 }),
  imageUrl: text('image_url'),
  isPaid: boolean('is_paid').default(false),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).default('0.00'),
  maxAttendees: integer('max_attendees'),
  active: boolean('active').default(true),
  featured: boolean('featured').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Event Registration
export const eventRegistrations = pgTable('event_registrations', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id),
  guestEmail: varchar('guest_email', { length: 255 }),
  guestName: varchar('guest_name', { length: 255 }),
  numberOfTickets: integer('number_of_tickets').default(1).notNull(),
  registrationType: varchar('registration_type', { length: 50 }).default('standard'),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  paymentStatus: orderStatusEnum('payment_status').default('pending').notNull(),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  checkInStatus: boolean('check_in_status').default(false),
  createdAt: timestamp('created_at').defaultNow()
});

// Event Add-ons
export const eventAddOns = pgTable('event_add_ons', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // e.g., 'meal', 'merchandise', 'service'
  inventory: integer('inventory'),
  maxPerRegistration: integer('max_per_registration'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

// Event Registration Add-ons
export const registrationAddOns = pgTable('registration_add_ons', {
  id: serial('id').primaryKey(),
  registrationId: integer('registration_id').references(() => eventRegistrations.id, { onDelete: 'cascade' }).notNull(),
  addOnId: integer('add_on_id').references(() => eventAddOns.id, { onDelete: 'cascade' }).notNull(),
  quantity: integer('quantity').default(1).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// =================== DISCOUNT SYSTEMS ===================

// Discount Codes
export const discountCodes = pgTable('discount_codes', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  description: text('description'),
  discountType: discountTypeEnum('discount_type').notNull(),
  discountValue: decimal('discount_value', { precision: 10, scale: 2 }).notNull(),
  minOrderAmount: decimal('min_order_amount', { precision: 10, scale: 2 }),
  maxDiscountAmount: decimal('max_discount_amount', { precision: 10, scale: 2 }),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  usageLimit: integer('usage_limit'),
  usageCount: integer('usage_count').default(0),
  active: boolean('active').default(true),
  createdBy: integer('created_by').references(() => users.id),
  vendorId: integer('vendor_id').references(() => vendors.id), // NULL for global/platform codes
  applicableToAll: boolean('applicable_to_all').default(false),
  isFirstTimeOnly: boolean('is_first_time_only').default(false),
  createdAt: timestamp('created_at').defaultNow()
});

// Discount Code Products (which products the code applies to)
export const discountCodeProducts = pgTable('discount_code_products', {
  id: serial('id').primaryKey(),
  discountCodeId: integer('discount_code_id').references(() => discountCodes.id, { onDelete: 'cascade' }).notNull(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// Discount Code Categories (which categories the code applies to)
export const discountCodeCategories = pgTable('discount_code_categories', {
  id: serial('id').primaryKey(),
  discountCodeId: integer('discount_code_id').references(() => discountCodes.id, { onDelete: 'cascade' }).notNull(),
  categoryId: integer('category_id').references(() => productCategories.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// Discount Code Events (which events the code applies to)
export const discountCodeEvents = pgTable('discount_code_events', {
  id: serial('id').primaryKey(),
  discountCodeId: integer('discount_code_id').references(() => discountCodes.id, { onDelete: 'cascade' }).notNull(),
  eventId: integer('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// Special Pricing Rules (volume discounts, bundle pricing, etc.)
export const specialPricingRules = pgTable('special_pricing_rules', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  ruleType: varchar('rule_type', { length: 50 }).notNull(), // 'volume', 'bundle', 'threshold'
  discountType: discountTypeEnum('discount_type').notNull(),
  discountValue: decimal('discount_value', { precision: 10, scale: 2 }).notNull(),
  threshold: integer('threshold'), // quantity or amount threshold
  vendorId: integer('vendor_id').references(() => vendors.id), // NULL for global/platform rules
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

// Special Pricing Product Rules (which products a rule applies to)
export const specialPricingProductRules = pgTable('special_pricing_product_rules', {
  id: serial('id').primaryKey(),
  ruleId: integer('rule_id').references(() => specialPricingRules.id, { onDelete: 'cascade' }).notNull(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// Special Pricing Category Rules (which categories a rule applies to)
export const specialPricingCategoryRules = pgTable('special_pricing_category_rules', {
  id: serial('id').primaryKey(),
  ruleId: integer('rule_id').references(() => specialPricingRules.id, { onDelete: 'cascade' }).notNull(),
  categoryId: integer('category_id').references(() => productCategories.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// =================== ORDERS, PAYMENTS, REFUNDS ===================

// Orders
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').references(() => users.id),
  vendorId: integer('vendor_id').references(() => vendors.id),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  commissionAmount: decimal('commission_amount', { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum('status').default('pending').notNull(),
  currency: varchar('currency', { length: 3 }).default('usd').notNull(),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  discountCodeId: integer('discount_code_id').references(() => discountCodes.id),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0.00'),
  taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }).default('0.00'),
  shippingAmount: decimal('shipping_amount', { precision: 10, scale: 2 }).default('0.00'),
  fulfillmentStatus: fulfillmentStatusEnum('fulfillment_status').default('unfulfilled'),
  notes: text('notes'),
  shippingAddress: text('shipping_address'),
  trackingNumber: varchar('tracking_number', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Order Items
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  productId: integer('product_id').references(() => products.id),
  productName: varchar('product_name', { length: 255 }).notNull(), // Store at time of purchase
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(), // Price at time of purchase
  discountedPrice: decimal('discounted_price', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow()
});

// Refunds
export const refunds = pgTable('refunds', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  reason: text('reason'),
  stripeRefundId: varchar('stripe_refund_id', { length: 255 }),
  initiatedBy: varchar('initiated_by', { length: 20 }).notNull(), // 'customer', 'vendor', 'admin'
  status: refundStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  processedAt: timestamp('processed_at')
});

// =================== NON-PRODUCT CONTENT ===================

// Posts (non-product content like articles, news, etc.)
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  authorId: integer('author_id').references(() => users.id),
  imageUrl: text('image_url'),
  status: varchar('status', { length: 20 }).default('draft').notNull(), // 'draft', 'published', 'archived'
  featured: boolean('featured').default(false),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Post Categories
export const postCategories = pgTable('post_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  slug: varchar('slug', { length: 150 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow()
});

// Post-Category Mappings
export const postCategoryMappings = pgTable('post_category_mappings', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').references(() => posts.id, { onDelete: 'cascade' }).notNull(),
  categoryId: integer('category_id').references(() => postCategories.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// =================== SHIPPING & FULFILLMENT ===================

// Shipping Methods
export const shippingMethods = pgTable('shipping_methods', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  estimatedDeliveryDays: integer('estimated_delivery_days'),
  active: boolean('active').default(true),
  vendorId: integer('vendor_id').references(() => vendors.id), // NULL for platform-wide
  createdAt: timestamp('created_at').defaultNow()
});

// Fulfillment Records
export const fulfillments = pgTable('fulfillments', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  status: fulfillmentStatusEnum('status').default('unfulfilled'),
  trackingCompany: varchar('tracking_company', { length: 100 }),
  trackingNumber: varchar('tracking_number', { length: 100 }),
  trackingUrl: text('tracking_url'),
  shippedAt: timestamp('shipped_at'),
  deliveredAt: timestamp('delivered_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// =================== RELATIONSHIPS ===================

// Define relationships between tables
export const usersRelations = relations(users, ({ many }) => ({
  vendorProfile: many(vendors),
  orders: many(orders, { relationName: 'customerOrders' }),
  posts: many(posts)
}));

export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  user: one(users, {
    fields: [vendors.userId],
    references: [users.id]
  }),
  products: many(products),
  events: many(events)
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [products.vendorId],
    references: [vendors.id]
  }),
  category: one(productCategories, {
    fields: [products.categoryId],
    references: [productCategories.id]
  }),
  inventory: one(productInventory, {
    fields: [products.id],
    references: [productInventory.productId]
  }),
  categoryMappings: many(productCategoryMappings),
  inventoryHistory: many(inventoryHistory),
  orderItems: many(orderItems)
}));

export const productCategoriesRelations = relations(productCategories, ({ one, many }) => ({
  parent: one(productCategories, {
    fields: [productCategories.parentId],
    references: [productCategories.id]
  }),
  children: many(productCategories, {
    relationName: 'parentChild'
  }),
  products: many(products),
  productMappings: many(productCategoryMappings)
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [events.vendorId],
    references: [vendors.id]
  }),
  registrations: many(eventRegistrations),
  addOns: many(eventAddOns)
}));

export const eventRegistrationsRelations = relations(eventRegistrations, ({ one, many }) => ({
  event: one(events, {
    fields: [eventRegistrations.eventId],
    references: [events.id]
  }),
  user: one(users, {
    fields: [eventRegistrations.userId],
    references: [users.id]
  }),
  addOns: many(registrationAddOns)
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(users, {
    fields: [orders.customerId],
    references: [users.id]
  }),
  vendor: one(vendors, {
    fields: [orders.vendorId],
    references: [vendors.id]
  }),
  discountCode: one(discountCodes, {
    fields: [orders.discountCodeId],
    references: [discountCodes.id]
  }),
  items: many(orderItems),
  refunds: many(refunds),
  fulfillments: many(fulfillments)
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id]
  }),
  categoryMappings: many(postCategoryMappings)
}));