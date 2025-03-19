import { db } from './db';
import * as schema from '../shared/schema';
import { eq, and, gte, lte, like, inArray } from 'drizzle-orm';

/**
 * Server-side data access layer for the content classes
 * Provides methods to interact with the database using Drizzle ORM
 */

// ================ USER & VENDOR FUNCTIONS ================

export async function createUser(userData) {
  return db.insert(schema.users).values(userData).returning();
}

export async function getUserById(id) {
  return db.query.users.findFirst({
    where: eq(schema.users.id, id),
    with: {
      vendorProfile: true
    }
  });
}

export async function getUserByEmail(email) {
  return db.query.users.findFirst({
    where: eq(schema.users.email, email),
    with: {
      vendorProfile: true
    }
  });
}

export async function createVendor(vendorData) {
  return db.insert(schema.vendors).values(vendorData).returning();
}

export async function getVendorById(id) {
  return db.query.vendors.findFirst({
    where: eq(schema.vendors.id, id),
    with: {
      user: true
    }
  });
}

export async function updateVendorStatus(id, status) {
  return db.update(schema.vendors)
    .set({ status })
    .where(eq(schema.vendors.id, id))
    .returning();
}

// ================ PRODUCT FUNCTIONS ================

export async function createProduct(productData) {
  const product = await db.insert(schema.products).values(productData).returning();
  
  // If inventory is specified, create inventory record
  if (productData.inventory !== undefined && product.length > 0) {
    await db.insert(schema.productInventory).values({
      productId: product[0].id,
      quantity: productData.inventory
    });
  }
  
  return product;
}

export async function getProductById(id) {
  return db.query.products.findFirst({
    where: eq(schema.products.id, id),
    with: {
      vendor: {
        with: {
          user: true
        }
      },
      category: true,
      inventory: true
    }
  });
}

export async function getProducts(options = {}) {
  const {
    page = 1,
    limit = 20,
    vendorId = null,
    categoryId = null,
    featured = null,
    active = true,
    minPrice = null,
    maxPrice = null,
    search = null
  } = options;

  const offset = (page - 1) * limit;
  
  const conditions = [];
  
  if (active !== null) {
    conditions.push(eq(schema.products.active, active));
  }
  
  if (vendorId) {
    conditions.push(eq(schema.products.vendorId, vendorId));
  }
  
  if (categoryId) {
    conditions.push(eq(schema.products.categoryId, categoryId));
  }
  
  if (featured !== null) {
    conditions.push(eq(schema.products.featured, featured));
  }
  
  if (minPrice !== null) {
    conditions.push(gte(schema.products.price, minPrice));
  }
  
  if (maxPrice !== null) {
    conditions.push(lte(schema.products.price, maxPrice));
  }
  
  if (search) {
    conditions.push(like(schema.products.name, `%${search}%`));
  }
  
  const query = conditions.length > 0 
    ? and(...conditions) 
    : undefined;
  
  const [products, count] = await Promise.all([
    db.query.products.findMany({
      where: query,
      with: {
        vendor: {
          with: {
            user: {
              columns: {
                id: true,
                name: true
              }
            }
          }
        },
        category: true,
        inventory: true
      },
      limit,
      offset
    }),
    db.select({ count: db.fn.count() })
      .from(schema.products)
      .where(query)
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      totalItems: Number(count[0].count),
      totalPages: Math.ceil(Number(count[0].count) / limit)
    }
  };
}

export async function updateProduct(id, productData) {
  const product = await db.update(schema.products)
    .set(productData)
    .where(eq(schema.products.id, id))
    .returning();
  
  // Update inventory if provided
  if (productData.inventory !== undefined && product.length > 0) {
    const inventory = await db.query.productInventory.findFirst({
      where: eq(schema.productInventory.productId, id)
    });
    
    if (inventory) {
      await db.update(schema.productInventory)
        .set({ 
          quantity: productData.inventory,
          updatedAt: new Date()
        })
        .where(eq(schema.productInventory.productId, id));
    } else {
      await db.insert(schema.productInventory).values({
        productId: id,
        quantity: productData.inventory
      });
    }
    
    // Log inventory history
    await db.insert(schema.inventoryHistory).values({
      productId: id,
      quantityChange: inventory 
        ? productData.inventory - inventory.quantity 
        : productData.inventory,
      newQuantity: productData.inventory,
      reason: 'manual_update'
    });
  }
  
  return product;
}

export async function updateProductStatus(id, active) {
  return db.update(schema.products)
    .set({ active })
    .where(eq(schema.products.id, id))
    .returning();
}

export async function updateProductFeatureStatus(id, featured) {
  return db.update(schema.products)
    .set({ featured })
    .where(eq(schema.products.id, id))
    .returning();
}

// ================ PRODUCT CATEGORY FUNCTIONS ================

export async function createProductCategory(categoryData) {
  return db.insert(schema.productCategories).values(categoryData).returning();
}

export async function getProductCategories() {
  return db.query.productCategories.findMany({
    with: {
      parent: true
    }
  });
}

export async function assignProductToCategories(productId, categoryIds) {
  // Delete existing mappings
  await db.delete(schema.productCategoryMappings)
    .where(eq(schema.productCategoryMappings.productId, productId));
  
  // Create new mappings
  const mappings = categoryIds.map(categoryId => ({
    productId,
    categoryId
  }));
  
  return db.insert(schema.productCategoryMappings)
    .values(mappings)
    .returning();
}

// ================ EVENT FUNCTIONS ================

export async function createEvent(eventData) {
  return db.insert(schema.events).values(eventData).returning();
}

export async function getEventById(id) {
  return db.query.events.findFirst({
    where: eq(schema.events.id, id),
    with: {
      vendor: true,
      addOns: true
    }
  });
}

export async function getEvents(options = {}) {
  const {
    page = 1,
    limit = 20,
    vendorId = null,
    active = true,
    featured = null,
    upcoming = false,
    search = null
  } = options;

  const offset = (page - 1) * limit;
  
  const conditions = [];
  
  if (active !== null) {
    conditions.push(eq(schema.events.active, active));
  }
  
  if (vendorId) {
    conditions.push(eq(schema.events.vendorId, vendorId));
  }
  
  if (featured !== null) {
    conditions.push(eq(schema.events.featured, featured));
  }
  
  if (upcoming) {
    conditions.push(gte(schema.events.startDate, new Date()));
  }
  
  if (search) {
    conditions.push(like(schema.events.name, `%${search}%`));
  }
  
  const query = conditions.length > 0 
    ? and(...conditions) 
    : undefined;
  
  const [events, count] = await Promise.all([
    db.query.events.findMany({
      where: query,
      with: {
        vendor: true
      },
      limit,
      offset
    }),
    db.select({ count: db.fn.count() })
      .from(schema.events)
      .where(query)
  ]);

  return {
    events,
    pagination: {
      page,
      limit,
      totalItems: Number(count[0].count),
      totalPages: Math.ceil(Number(count[0].count) / limit)
    }
  };
}

export async function createEventAddOn(addOnData) {
  return db.insert(schema.eventAddOns).values(addOnData).returning();
}

export async function getEventAddOns(eventId) {
  return db.query.eventAddOns.findMany({
    where: eq(schema.eventAddOns.eventId, eventId)
  });
}

export async function createEventRegistration(registrationData) {
  const registration = await db.insert(schema.eventRegistrations)
    .values(registrationData)
    .returning();
  
  if (registrationData.addOns && registration.length > 0) {
    const addOnEntries = registrationData.addOns.map(addOn => ({
      registrationId: registration[0].id,
      addOnId: addOn.id,
      quantity: addOn.quantity,
      price: addOn.price
    }));
    
    await db.insert(schema.registrationAddOns)
      .values(addOnEntries);
  }
  
  return registration;
}

export async function getEventRegistration(id) {
  return db.query.eventRegistrations.findFirst({
    where: eq(schema.eventRegistrations.id, id),
    with: {
      event: true,
      user: true,
      addOns: {
        with: {
          addOn: true
        }
      }
    }
  });
}

// ================ DISCOUNT FUNCTIONS ================

export async function createDiscountCode(discountData) {
  return db.insert(schema.discountCodes).values(discountData).returning();
}

export async function getDiscountCode(code) {
  return db.query.discountCodes.findFirst({
    where: eq(schema.discountCodes.code, code)
  });
}

export async function validateDiscountCode(code, options = {}) {
  const {
    userId = null,
    vendorId = null,
    productIds = [],
    categoryIds = [],
    eventId = null,
    orderAmount = 0
  } = options;
  
  const now = new Date();
  
  const discount = await db.query.discountCodes.findFirst({
    where: and(
      eq(schema.discountCodes.code, code),
      eq(schema.discountCodes.active, true),
      lte(schema.discountCodes.startDate || now, now),
      gte(schema.discountCodes.endDate || now, now)
    )
  });
  
  if (!discount) {
    return { valid: false, message: 'Invalid or expired discount code' };
  }
  
  // Check usage limit
  if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
    return { valid: false, message: 'Discount code usage limit reached' };
  }
  
  // Check minimum order amount
  if (discount.minOrderAmount && orderAmount < discount.minOrderAmount) {
    return { 
      valid: false, 
      message: `Minimum order amount of ${discount.minOrderAmount} required` 
    };
  }
  
  // If vendor-specific, check vendor
  if (discount.vendorId && vendorId && discount.vendorId !== vendorId) {
    return { valid: false, message: 'Discount code not valid for this vendor' };
  }
  
  // Check if first-time customer restriction applies
  if (discount.isFirstTimeOnly && userId) {
    const previousOrders = await db.query.orders.findFirst({
      where: eq(schema.orders.customerId, userId)
    });
    
    if (previousOrders) {
      return { valid: false, message: 'Discount code valid for first-time customers only' };
    }
  }
  
  // Check product/category/event applicability if not applicable to all
  if (!discount.applicableToAll) {
    let isApplicable = false;
    
    // Check for product applicability
    if (productIds.length > 0) {
      const productDiscounts = await db.query.discountCodeProducts.findMany({
        where: and(
          eq(schema.discountCodeProducts.discountCodeId, discount.id),
          inArray(schema.discountCodeProducts.productId, productIds)
        )
      });
      
      if (productDiscounts.length > 0) {
        isApplicable = true;
      }
    }
    
    // Check for category applicability
    if (!isApplicable && categoryIds.length > 0) {
      const categoryDiscounts = await db.query.discountCodeCategories.findMany({
        where: and(
          eq(schema.discountCodeCategories.discountCodeId, discount.id),
          inArray(schema.discountCodeCategories.categoryId, categoryIds)
        )
      });
      
      if (categoryDiscounts.length > 0) {
        isApplicable = true;
      }
    }
    
    // Check for event applicability
    if (!isApplicable && eventId) {
      const eventDiscount = await db.query.discountCodeEvents.findFirst({
        where: and(
          eq(schema.discountCodeEvents.discountCodeId, discount.id),
          eq(schema.discountCodeEvents.eventId, eventId)
        )
      });
      
      if (eventDiscount) {
        isApplicable = true;
      }
    }
    
    if (!isApplicable) {
      return { valid: false, message: 'Discount code not applicable to selected items' };
    }
  }
  
  return { 
    valid: true, 
    discount 
  };
}

export async function incrementDiscountUsage(id) {
  return db.update(schema.discountCodes)
    .set({ 
      usageCount: db.sql`${schema.discountCodes.usageCount} + 1` 
    })
    .where(eq(schema.discountCodes.id, id))
    .returning();
}

// ================ ORDER & PAYMENT FUNCTIONS ================

export async function createOrder(orderData) {
  const order = await db.insert(schema.orders).values(orderData).returning();
  
  if (orderData.items && order.length > 0) {
    const orderItems = orderData.items.map(item => ({
      orderId: order[0].id,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
      discountedPrice: item.discountedPrice
    }));
    
    await db.insert(schema.orderItems).values(orderItems);
    
    // Update inventory
    for (const item of orderData.items) {
      const inventory = await db.query.productInventory.findFirst({
        where: eq(schema.productInventory.productId, item.productId)
      });
      
      if (inventory) {
        const newQuantity = Math.max(0, inventory.quantity - item.quantity);
        
        await db.update(schema.productInventory)
          .set({ 
            quantity: newQuantity,
            updatedAt: new Date()
          })
          .where(eq(schema.productInventory.productId, item.productId));
        
        // Log inventory change
        await db.insert(schema.inventoryHistory).values({
          productId: item.productId,
          quantityChange: -item.quantity,
          newQuantity,
          reason: 'order_placed',
          reference: `order_${order[0].id}`
        });
      }
    }
    
    // Apply discount if a code was used
    if (orderData.discountCodeId) {
      await incrementDiscountUsage(orderData.discountCodeId);
    }
  }
  
  return order;
}

export async function getOrderById(id) {
  return db.query.orders.findFirst({
    where: eq(schema.orders.id, id),
    with: {
      customer: true,
      vendor: true,
      items: true,
      discountCode: true
    }
  });
}

export async function getOrdersByCustomer(customerId, options = {}) {
  const { page = 1, limit = 20 } = options;
  const offset = (page - 1) * limit;
  
  const [orders, count] = await Promise.all([
    db.query.orders.findMany({
      where: eq(schema.orders.customerId, customerId),
      with: {
        vendor: true,
        items: true
      },
      limit,
      offset,
      orderBy: db.sql`${schema.orders.createdAt} desc`
    }),
    db.select({ count: db.fn.count() })
      .from(schema.orders)
      .where(eq(schema.orders.customerId, customerId))
  ]);
  
  return {
    orders,
    pagination: {
      page,
      limit,
      totalItems: Number(count[0].count),
      totalPages: Math.ceil(Number(count[0].count) / limit)
    }
  };
}

export async function getOrdersByVendor(vendorId, options = {}) {
  const { page = 1, limit = 20, status = null } = options;
  const offset = (page - 1) * limit;
  
  const conditions = [eq(schema.orders.vendorId, vendorId)];
  
  if (status) {
    conditions.push(eq(schema.orders.status, status));
  }
  
  const query = and(...conditions);
  
  const [orders, count] = await Promise.all([
    db.query.orders.findMany({
      where: query,
      with: {
        customer: true,
        items: true
      },
      limit,
      offset,
      orderBy: db.sql`${schema.orders.createdAt} desc`
    }),
    db.select({ count: db.fn.count() })
      .from(schema.orders)
      .where(query)
  ]);
  
  return {
    orders,
    pagination: {
      page,
      limit,
      totalItems: Number(count[0].count),
      totalPages: Math.ceil(Number(count[0].count) / limit)
    }
  };
}

export async function updateOrderStatus(id, status) {
  return db.update(schema.orders)
    .set({ 
      status,
      updatedAt: new Date()
    })
    .where(eq(schema.orders.id, id))
    .returning();
}

export async function updateOrderFulfillment(id, fulfillmentData) {
  const order = await db.update(schema.orders)
    .set({ 
      fulfillmentStatus: fulfillmentData.status,
      trackingNumber: fulfillmentData.trackingNumber,
      updatedAt: new Date()
    })
    .where(eq(schema.orders.id, id))
    .returning();
  
  if (order.length > 0) {
    await db.insert(schema.fulfillments).values({
      orderId: id,
      status: fulfillmentData.status,
      trackingCompany: fulfillmentData.trackingCompany,
      trackingNumber: fulfillmentData.trackingNumber,
      trackingUrl: fulfillmentData.trackingUrl,
      shippedAt: fulfillmentData.status === 'shipped' ? new Date() : null,
      deliveredAt: fulfillmentData.status === 'delivered' ? new Date() : null,
      notes: fulfillmentData.notes
    });
  }
  
  return order;
}

// ================ REFUND FUNCTIONS ================

export async function createRefund(refundData) {
  const refund = await db.insert(schema.refunds).values(refundData).returning();
  
  if (refund.length > 0 && refundData.status === 'completed') {
    const order = await getOrderById(refundData.orderId);
    
    if (order) {
      // Check if this is a full or partial refund
      const newStatus = refundData.amount >= order.totalAmount 
        ? 'refunded' 
        : 'partially_refunded';
      
      await updateOrderStatus(order.id, newStatus);
    }
  }
  
  return refund;
}

export async function getRefundsByOrder(orderId) {
  return db.query.refunds.findMany({
    where: eq(schema.refunds.orderId, orderId),
    orderBy: db.sql`${schema.refunds.createdAt} desc`
  });
}

export async function updateRefundStatus(id, status) {
  const refund = await db.update(schema.refunds)
    .set({ 
      status,
      processedAt: status === 'completed' ? new Date() : null
    })
    .where(eq(schema.refunds.id, id))
    .returning();
  
  if (refund.length > 0 && status === 'completed') {
    const allRefunds = await getRefundsByOrder(refund[0].orderId);
    const order = await getOrderById(refund[0].orderId);
    
    if (order) {
      const totalRefunded = allRefunds
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + Number(r.amount), 0);
      
      // Check if this is a full or partial refund
      const newStatus = totalRefunded >= order.totalAmount 
        ? 'refunded' 
        : 'partially_refunded';
      
      await updateOrderStatus(order.id, newStatus);
    }
  }
  
  return refund;
}

// ================ POSTS (NON-PRODUCT CONTENT) ================

export async function createPost(postData) {
  return db.insert(schema.posts).values(postData).returning();
}

export async function getPostById(id) {
  return db.query.posts.findFirst({
    where: eq(schema.posts.id, id),
    with: {
      author: true,
      categoryMappings: {
        with: {
          category: true
        }
      }
    }
  });
}

export async function getPostBySlug(slug) {
  return db.query.posts.findFirst({
    where: eq(schema.posts.slug, slug),
    with: {
      author: true,
      categoryMappings: {
        with: {
          category: true
        }
      }
    }
  });
}

export async function getPosts(options = {}) {
  const { 
    page = 1, 
    limit = 20, 
    status = 'published',
    featured = null,
    authorId = null,
    categoryId = null,
    search = null
  } = options;
  
  const offset = (page - 1) * limit;
  
  const conditions = [];
  
  if (status) {
    conditions.push(eq(schema.posts.status, status));
  }
  
  if (featured !== null) {
    conditions.push(eq(schema.posts.featured, featured));
  }
  
  if (authorId) {
    conditions.push(eq(schema.posts.authorId, authorId));
  }
  
  if (search) {
    conditions.push(like(schema.posts.title, `%${search}%`));
  }
  
  const query = conditions.length > 0 
    ? and(...conditions) 
    : undefined;
  
  let posts = await db.query.posts.findMany({
    where: query,
    with: {
      author: true,
      categoryMappings: {
        with: {
          category: true
        }
      }
    },
    limit,
    offset,
    orderBy: [
      { column: schema.posts.featured, direction: 'desc' },
      { column: schema.posts.publishedAt, direction: 'desc' }
    ]
  });
  
  // Filter by category if needed (doing this after fetch since it requires a join condition)
  if (categoryId) {
    posts = posts.filter(post => 
      post.categoryMappings.some(mapping => mapping.category.id === categoryId)
    );
  }
  
  const count = await db.select({ count: db.fn.count() })
    .from(schema.posts)
    .where(query);
  
  return {
    posts,
    pagination: {
      page,
      limit,
      totalItems: Number(count[0].count),
      totalPages: Math.ceil(Number(count[0].count) / limit)
    }
  };
}

export async function updatePost(id, postData) {
  return db.update(schema.posts)
    .set({
      ...postData,
      updatedAt: new Date()
    })
    .where(eq(schema.posts.id, id))
    .returning();
}

export async function assignPostToCategories(postId, categoryIds) {
  // Delete existing mappings
  await db.delete(schema.postCategoryMappings)
    .where(eq(schema.postCategoryMappings.postId, postId));
  
  // Create new mappings
  const mappings = categoryIds.map(categoryId => ({
    postId,
    categoryId
  }));
  
  return db.insert(schema.postCategoryMappings)
    .values(mappings)
    .returning();
}