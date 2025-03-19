import { drizzle } from 'drizzle-orm/node-postgres';
import { and, asc, count, desc, eq, gt, gte, ilike, inArray, lt, lte, or, sql } from 'drizzle-orm';
import { Pool } from 'pg';
import * as schema from '../shared/schema';
import { PgInsertValue } from 'drizzle-orm/pg-core';

// Initialize the database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

// Define interface for pagination parameters
interface PaginationParams {
  page?: number;
  limit?: number;
}

// Helper function to calculate offset from page and limit
function getOffset(page: number = 1, limit: number = 10): number {
  return (page - 1) * limit;
}

// Product Storage Functions
export const productStorage = {
  /**
   * Create a new product
   */
  async createProduct(product: PgInsertValue<typeof schema.products>) {
    return await db.insert(schema.products).values(product).returning();
  },

  /**
   * Get a product by ID
   */
  async getProductById(id: number) {
    const [product] = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.id, id));
    return product;
  },

  /**
   * Get products with optional filtering and pagination
   */
  async getProducts(params: {
    page?: number;
    limit?: number;
    vendorId?: number;
    categoryId?: number;
    featured?: boolean;
    active?: boolean;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  } = {}) {
    const query = db.select().from(schema.products);
    
    // Apply filters if provided
    const conditions = [];
    
    if (params.vendorId) {
      conditions.push(eq(schema.products.vendorId, params.vendorId));
    }
    
    if (params.categoryId) {
      conditions.push(eq(schema.products.categoryId, params.categoryId));
    }
    
    if (params.featured !== undefined) {
      conditions.push(eq(schema.products.featured, params.featured));
    }
    
    if (params.active !== undefined) {
      conditions.push(eq(schema.products.active, params.active));
    }
    
    if (params.minPrice !== undefined) {
      conditions.push(gte(schema.products.price, params.minPrice));
    }
    
    if (params.maxPrice !== undefined) {
      conditions.push(lte(schema.products.price, params.maxPrice));
    }
    
    if (params.search) {
      conditions.push(
        or(
          ilike(schema.products.name, `%${params.search}%`),
          ilike(schema.products.description || '', `%${params.search}%`)
        )
      );
    }
    
    // Apply conditions if any
    if (conditions.length > 0) {
      query.where(and(...conditions));
    }
    
    // Calculate total count for pagination
    const [{ count: total }] = await db
      .select({ count: count() })
      .from(schema.products)
      .where(and(...conditions));
    
    // Apply pagination
    const limit = params.limit || 10;
    const offset = getOffset(params.page || 1, limit);
    
    query.limit(limit).offset(offset).orderBy(desc(schema.products.createdAt));
    
    const products = await query;
    
    return {
      products,
      pagination: {
        total: Number(total),
        page: params.page || 1,
        limit,
        pages: Math.ceil(Number(total) / limit)
      }
    };
  },

  /**
   * Update a product
   */
  async updateProduct(id: number, product: Partial<PgInsertValue<typeof schema.products>>) {
    const [updatedProduct] = await db
      .update(schema.products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(schema.products.id, id))
      .returning();
    return updatedProduct;
  },

  /**
   * Delete a product
   */
  async deleteProduct(id: number) {
    return await db
      .delete(schema.products)
      .where(eq(schema.products.id, id))
      .returning();
  },

  /**
   * Get product categories
   */
  async getProductCategories() {
    const categories = await db
      .select()
      .from(schema.productCategories)
      .where(eq(schema.productCategories.active, true))
      .orderBy(asc(schema.productCategories.name));
    
    return categories;
  },

  /**
   * Create product category
   */
  async createProductCategory(category: PgInsertValue<typeof schema.productCategories>) {
    return await db
      .insert(schema.productCategories)
      .values(category)
      .returning();
  }
};

// Event Storage Functions
export const eventStorage = {
  /**
   * Create a new event
   */
  async createEvent(event: PgInsertValue<typeof schema.events>) {
    return await db.insert(schema.events).values(event).returning();
  },

  /**
   * Get an event by ID
   */
  async getEventById(id: number) {
    const [event] = await db
      .select()
      .from(schema.events)
      .where(eq(schema.events.id, id));
    return event;
  },

  /**
   * Get events with optional filtering and pagination
   */
  async getEvents(params: {
    page?: number;
    limit?: number;
    vendorId?: number;
    active?: boolean;
    featured?: boolean;
    upcoming?: boolean;
    search?: string;
  } = {}) {
    const query = db.select().from(schema.events);
    
    // Apply filters if provided
    const conditions = [];
    
    if (params.vendorId) {
      conditions.push(eq(schema.events.vendorId, params.vendorId));
    }
    
    if (params.active !== undefined) {
      conditions.push(eq(schema.events.active, params.active));
    }
    
    if (params.featured !== undefined) {
      conditions.push(eq(schema.events.featured, params.featured));
    }
    
    if (params.upcoming === true) {
      const now = new Date();
      conditions.push(gte(schema.events.startDate, now));
    }
    
    if (params.search) {
      conditions.push(
        or(
          ilike(schema.events.name, `%${params.search}%`),
          ilike(schema.events.description || '', `%${params.search}%`),
          ilike(schema.events.location || '', `%${params.search}%`)
        )
      );
    }
    
    // Apply conditions if any
    if (conditions.length > 0) {
      query.where(and(...conditions));
    }
    
    // Calculate total count for pagination
    const [{ count: total }] = await db
      .select({ count: count() })
      .from(schema.events)
      .where(and(...conditions));
    
    // Apply pagination
    const limit = params.limit || 10;
    const offset = getOffset(params.page || 1, limit);
    
    query.limit(limit).offset(offset).orderBy(asc(schema.events.startDate));
    
    const events = await query;
    
    return {
      events,
      pagination: {
        total: Number(total),
        page: params.page || 1,
        limit,
        pages: Math.ceil(Number(total) / limit)
      }
    };
  },

  /**
   * Update an event
   */
  async updateEvent(id: number, event: Partial<PgInsertValue<typeof schema.events>>) {
    const [updatedEvent] = await db
      .update(schema.events)
      .set({ ...event, updatedAt: new Date() })
      .where(eq(schema.events.id, id))
      .returning();
    return updatedEvent;
  },

  /**
   * Delete an event
   */
  async deleteEvent(id: number) {
    return await db
      .delete(schema.events)
      .where(eq(schema.events.id, id))
      .returning();
  },

  /**
   * Register for an event
   */
  async registerForEvent(registration: PgInsertValue<typeof schema.eventRegistrations>) {
    // Check if event has reached maximum attendees
    const [event] = await db
      .select({
        id: schema.events.id,
        maxAttendees: schema.events.maxAttendees,
        currentRegistrations: sql<number>`
          (SELECT COALESCE(SUM(number_of_tickets), 0) 
           FROM event_registrations 
           WHERE event_id = ${registration.eventId})
        `
      })
      .from(schema.events)
      .where(eq(schema.events.id, registration.eventId));
    
    if (event.maxAttendees !== null && event.currentRegistrations >= event.maxAttendees) {
      throw new Error('Event has reached maximum capacity');
    }
    
    return await db
      .insert(schema.eventRegistrations)
      .values(registration)
      .returning();
  },

  /**
   * Create event add-on
   */
  async createEventAddOn(addOn: PgInsertValue<typeof schema.eventAddOns>) {
    return await db
      .insert(schema.eventAddOns)
      .values(addOn)
      .returning();
  },

  /**
   * Get event add-ons
   */
  async getEventAddOns(eventId: number) {
    return await db
      .select()
      .from(schema.eventAddOns)
      .where(
        and(
          eq(schema.eventAddOns.eventId, eventId),
          eq(schema.eventAddOns.active, true)
        )
      );
  }
};

// Discount Storage Functions
export const discountStorage = {
  /**
   * Create a new discount code
   */
  async createDiscountCode(discount: PgInsertValue<typeof schema.discountCodes>) {
    return await db
      .insert(schema.discountCodes)
      .values(discount)
      .returning();
  },

  /**
   * Get a discount code by code
   */
  async getDiscountCodeByCode(code: string) {
    const [discountCode] = await db
      .select()
      .from(schema.discountCodes)
      .where(
        and(
          eq(schema.discountCodes.code, code),
          eq(schema.discountCodes.active, true)
        )
      );
    return discountCode;
  },

  /**
   * Validate discount code for usage
   */
  async validateDiscountCode(params: {
    userId?: number;
    vendorId?: number;
    productIds?: number[];
    categoryIds?: number[];
    eventId?: number;
    orderAmount?: number;
  }) {
    const { code } = params;
    if (!code) return null;
    
    const [discountCode] = await db
      .select()
      .from(schema.discountCodes)
      .where(
        and(
          eq(schema.discountCodes.code, code),
          eq(schema.discountCodes.active, true)
        )
      );
    
    if (!discountCode) return null;
    
    // Check if code is expired
    const now = new Date();
    if (discountCode.startDate && discountCode.startDate > now) {
      return { valid: false, message: 'Discount code is not yet active' };
    }
    
    if (discountCode.endDate && discountCode.endDate < now) {
      return { valid: false, message: 'Discount code has expired' };
    }
    
    // Check usage limit
    if (discountCode.usageLimit && discountCode.usageCount >= discountCode.usageLimit) {
      return { valid: false, message: 'Discount code has reached maximum usage' };
    }
    
    // Check minimum order amount
    if (discountCode.minOrderAmount && params.orderAmount && params.orderAmount < discountCode.minOrderAmount) {
      return { 
        valid: false, 
        message: `Discount code requires a minimum order of ${discountCode.minOrderAmount}` 
      };
    }
    
    // Check if the discount is applicable to all products
    if (!discountCode.applicableToAll) {
      // For product-specific discounts
      if (params.productIds && params.productIds.length > 0) {
        const productDiscounts = await db
          .select()
          .from(schema.discountCodeProducts)
          .where(
            and(
              eq(schema.discountCodeProducts.discountCodeId, discountCode.id),
              inArray(schema.discountCodeProducts.productId, params.productIds)
            )
          );
        
        if (productDiscounts.length === 0) {
          // Check if discount applies to category
          if (params.categoryIds && params.categoryIds.length > 0) {
            const categoryDiscounts = await db
              .select()
              .from(schema.discountCodeCategories)
              .where(
                and(
                  eq(schema.discountCodeCategories.discountCodeId, discountCode.id),
                  inArray(schema.discountCodeCategories.categoryId, params.categoryIds)
                )
              );
            
            if (categoryDiscounts.length === 0) {
              return { valid: false, message: 'Discount code is not applicable to selected products' };
            }
          } else {
            return { valid: false, message: 'Discount code is not applicable to selected products' };
          }
        }
      }
      
      // For event-specific discounts
      if (params.eventId) {
        const eventDiscounts = await db
          .select()
          .from(schema.discountCodeEvents)
          .where(
            and(
              eq(schema.discountCodeEvents.discountCodeId, discountCode.id),
              eq(schema.discountCodeEvents.eventId, params.eventId)
            )
          );
        
        if (eventDiscounts.length === 0) {
          return { valid: false, message: 'Discount code is not applicable to this event' };
        }
      }
    }
    
    // Check vendor-specific discounts
    if (discountCode.vendorId && params.vendorId && discountCode.vendorId !== params.vendorId) {
      return { valid: false, message: 'Discount code is not applicable to this vendor' };
    }
    
    // Check first-time customer discounts
    if (discountCode.isFirstTimeOnly && params.userId) {
      const previousOrders = await db
        .select({ count: count() })
        .from(schema.orders)
        .where(eq(schema.orders.customerId, params.userId));
      
      if (previousOrders[0].count > 0) {
        return { valid: false, message: 'Discount code is only valid for first-time customers' };
      }
    }
    
    return { 
      valid: true, 
      discountCode 
    };
  },

  /**
   * Increment usage count for a discount code
   */
  async incrementDiscountUsage(discountCodeId: number) {
    return await db
      .update(schema.discountCodes)
      .set({ 
        usageCount: sql`${schema.discountCodes.usageCount} + 1` 
      })
      .where(eq(schema.discountCodes.id, discountCodeId))
      .returning();
  },

  /**
   * Get all discount codes
   */
  async getDiscountCodes(params: PaginationParams = {}) {
    const limit = params.limit || 10;
    const offset = getOffset(params.page || 1, limit);
    
    const discountCodes = await db
      .select()
      .from(schema.discountCodes)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(schema.discountCodes.createdAt));
    
    const [{ count: total }] = await db
      .select({ count: count() })
      .from(schema.discountCodes);
    
    return {
      discountCodes,
      pagination: {
        total: Number(total),
        page: params.page || 1,
        limit,
        pages: Math.ceil(Number(total) / limit)
      }
    };
  }
};

// Order Storage Functions
export const orderStorage = {
  /**
   * Create a new order
   */
  async createOrder(order: PgInsertValue<typeof schema.orders>, orderItems: PgInsertValue<typeof schema.orderItems>[]) {
    // Start a transaction
    return await db.transaction(async (tx) => {
      // Insert order
      const [newOrder] = await tx
        .insert(schema.orders)
        .values(order)
        .returning();
      
      // Insert order items
      if (orderItems.length > 0) {
        const items = orderItems.map(item => ({
          ...item,
          orderId: newOrder.id
        }));
        
        await tx
          .insert(schema.orderItems)
          .values(items);
        
        // Update inventory if needed
        for (const item of items) {
          if (item.productId) {
            // Get current inventory
            const [product] = await tx
              .select({ inventory: schema.products.inventory })
              .from(schema.products)
              .where(eq(schema.products.id, item.productId));
            
            // Update inventory
            if (product && product.inventory !== null) {
              const newInventory = Math.max(0, product.inventory - item.quantity);
              
              await tx
                .update(schema.products)
                .set({ inventory: newInventory })
                .where(eq(schema.products.id, item.productId));
              
              // Record inventory change
              await tx
                .insert(schema.inventoryHistory)
                .values({
                  productId: item.productId,
                  quantityChange: -item.quantity,
                  newQuantity: newInventory,
                  reason: 'order',
                  reference: `order-${newOrder.id}`
                });
            }
          }
        }
      }
      
      // If using a discount code, increment usage
      if (order.discountCodeId) {
        await tx
          .update(schema.discountCodes)
          .set({ 
            usageCount: sql`${schema.discountCodes.usageCount} + 1` 
          })
          .where(eq(schema.discountCodes.id, order.discountCodeId));
      }
      
      return newOrder;
    });
  },

  /**
   * Get an order by ID
   */
  async getOrderById(id: number) {
    const [order] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, id));
    
    if (order) {
      const orderItems = await db
        .select()
        .from(schema.orderItems)
        .where(eq(schema.orderItems.orderId, id));
      
      return { ...order, items: orderItems };
    }
    
    return null;
  },

  /**
   * Get orders for a customer
   */
  async getCustomerOrders(customerId: number, params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}) {
    const limit = params.limit || 10;
    const offset = getOffset(params.page || 1, limit);
    
    const query = db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.customerId, customerId));
    
    if (params.status) {
      query.where(eq(schema.orders.status, params.status));
    }
    
    const orders = await query
      .limit(limit)
      .offset(offset)
      .orderBy(desc(schema.orders.createdAt));
    
    const [{ count: total }] = await db
      .select({ count: count() })
      .from(schema.orders)
      .where(eq(schema.orders.customerId, customerId));
    
    // Get order items for each order
    const orderWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await db
          .select()
          .from(schema.orderItems)
          .where(eq(schema.orderItems.orderId, order.id));
        
        return { ...order, items };
      })
    );
    
    return {
      orders: orderWithItems,
      pagination: {
        total: Number(total),
        page: params.page || 1,
        limit,
        pages: Math.ceil(Number(total) / limit)
      }
    };
  },

  /**
   * Get orders for a vendor
   */
  async getVendorOrders(vendorId: number, params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}) {
    const limit = params.limit || 10;
    const offset = getOffset(params.page || 1, limit);
    
    const query = db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.vendorId, vendorId));
    
    if (params.status) {
      query.where(eq(schema.orders.status, params.status));
    }
    
    const orders = await query
      .limit(limit)
      .offset(offset)
      .orderBy(desc(schema.orders.createdAt));
    
    const [{ count: total }] = await db
      .select({ count: count() })
      .from(schema.orders)
      .where(eq(schema.orders.vendorId, vendorId));
    
    // Get order items for each order
    const orderWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await db
          .select()
          .from(schema.orderItems)
          .where(eq(schema.orderItems.orderId, order.id));
        
        return { ...order, items };
      })
    );
    
    return {
      orders: orderWithItems,
      pagination: {
        total: Number(total),
        page: params.page || 1,
        limit,
        pages: Math.ceil(Number(total) / limit)
      }
    };
  },

  /**
   * Update order status
   */
  async updateOrderStatus(id: number, status: string) {
    const [updatedOrder] = await db
      .update(schema.orders)
      .set({ 
        status: status as any, 
        updatedAt: new Date() 
      })
      .where(eq(schema.orders.id, id))
      .returning();
    
    return updatedOrder;
  },

  /**
   * Update fulfillment status
   */
  async updateFulfillmentStatus(id: number, status: string, trackingInfo?: { 
    trackingNumber?: string;
    trackingCompany?: string;
    trackingUrl?: string;
  }) {
    const [updatedOrder] = await db
      .update(schema.orders)
      .set({ 
        fulfillmentStatus: status as any,
        ...trackingInfo,
        updatedAt: new Date() 
      })
      .where(eq(schema.orders.id, id))
      .returning();
    
    // Create fulfillment record
    const now = new Date();
    await db
      .insert(schema.fulfillments)
      .values({
        orderId: id,
        status: status as any,
        trackingCompany: trackingInfo?.trackingCompany,
        trackingNumber: trackingInfo?.trackingNumber,
        trackingUrl: trackingInfo?.trackingUrl,
        shippedAt: status === 'shipped' ? now : undefined,
        deliveredAt: status === 'delivered' ? now : undefined
      });
    
    return updatedOrder;
  }
};

// Content Management Functions
export const contentStorage = {
  /**
   * Create a new blog post
   */
  async createPost(post: PgInsertValue<typeof schema.posts>) {
    return await db.insert(schema.posts).values(post).returning();
  },

  /**
   * Get a post by ID or slug
   */
  async getPostByIdOrSlug(idOrSlug: number | string) {
    let query;
    
    if (typeof idOrSlug === 'number') {
      query = eq(schema.posts.id, idOrSlug);
    } else {
      query = eq(schema.posts.slug, idOrSlug);
    }
    
    const [post] = await db
      .select()
      .from(schema.posts)
      .where(query);
    
    return post;
  },

  /**
   * Get posts with pagination and filtering
   */
  async getPosts(params: {
    page?: number;
    limit?: number;
    status?: string;
    featured?: boolean;
    authorId?: number;
    categoryId?: number;
    search?: string;
  } = {}) {
    const query = db.select().from(schema.posts);
    
    // Apply filters if provided
    const conditions = [];
    
    if (params.status) {
      conditions.push(eq(schema.posts.status, params.status));
    }
    
    if (params.featured !== undefined) {
      conditions.push(eq(schema.posts.featured, params.featured));
    }
    
    if (params.authorId) {
      conditions.push(eq(schema.posts.authorId, params.authorId));
    }
    
    if (params.categoryId) {
      const postIds = await db
        .select({ postId: schema.postCategoryMappings.postId })
        .from(schema.postCategoryMappings)
        .where(eq(schema.postCategoryMappings.categoryId, params.categoryId));
      
      if (postIds.length > 0) {
        conditions.push(inArray(schema.posts.id, postIds.map(p => p.postId)));
      } else {
        // No posts in this category
        return {
          posts: [],
          pagination: {
            total: 0,
            page: params.page || 1,
            limit: params.limit || 10,
            pages: 0
          }
        };
      }
    }
    
    if (params.search) {
      conditions.push(
        or(
          ilike(schema.posts.title, `%${params.search}%`),
          ilike(schema.posts.content, `%${params.search}%`),
          ilike(schema.posts.excerpt || '', `%${params.search}%`)
        )
      );
    }
    
    // Apply conditions if any
    if (conditions.length > 0) {
      query.where(and(...conditions));
    }
    
    // Calculate total count for pagination
    const [{ count: total }] = await db
      .select({ count: count() })
      .from(schema.posts)
      .where(and(...conditions));
    
    // Apply pagination
    const limit = params.limit || 10;
    const offset = getOffset(params.page || 1, limit);
    
    query.limit(limit).offset(offset).orderBy(desc(schema.posts.createdAt));
    
    const posts = await query;
    
    // Get categories for each post
    const postsWithCategories = await Promise.all(
      posts.map(async (post) => {
        const categories = await db
          .select({ 
            id: schema.postCategories.id,
            name: schema.postCategories.name,
            slug: schema.postCategories.slug
          })
          .from(schema.postCategoryMappings)
          .innerJoin(
            schema.postCategories,
            eq(schema.postCategoryMappings.categoryId, schema.postCategories.id)
          )
          .where(eq(schema.postCategoryMappings.postId, post.id));
        
        return { ...post, categories };
      })
    );
    
    return {
      posts: postsWithCategories,
      pagination: {
        total: Number(total),
        page: params.page || 1,
        limit,
        pages: Math.ceil(Number(total) / limit)
      }
    };
  },

  /**
   * Update a post
   */
  async updatePost(id: number, post: Partial<PgInsertValue<typeof schema.posts>>) {
    const [updatedPost] = await db
      .update(schema.posts)
      .set({ ...post, updatedAt: new Date() })
      .where(eq(schema.posts.id, id))
      .returning();
    
    return updatedPost;
  },

  /**
   * Delete a post
   */
  async deletePost(id: number) {
    return await db
      .delete(schema.posts)
      .where(eq(schema.posts.id, id))
      .returning();
  },

  /**
   * Get post categories
   */
  async getPostCategories() {
    return await db
      .select()
      .from(schema.postCategories)
      .orderBy(asc(schema.postCategories.name));
  }
};

export default {
  productStorage,
  eventStorage,
  discountStorage,
  orderStorage,
  contentStorage
};