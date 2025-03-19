// JavaScript version of product storage for testing
const { Pool } = require('pg');
require('dotenv').config();

// Initialize the database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Constants for inventory management
const INVENTORY_LOW_THRESHOLD = 5; // Below this is considered "low stock"
const INVENTORY_CRITICAL_THRESHOLD = 2; // Below this is considered "critical stock"

// Product Storage Functions
const productStorage = {
  /**
   * Create a new product
   */
  async createProduct(product) {
    const client = await pool.connect();
    try {
      const {
        name, description, price, imageUrl, active, featured, inventory,
        sku, vendorId, categoryId, weight, dimensions
      } = product;
      
      const query = `
        INSERT INTO products (
          name, description, price, image_url, active, featured, inventory,
          sku, vendor_id, category_id, weight, dimensions, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
        RETURNING *
      `;
      
      const values = [
        name, description, price, imageUrl, active, featured, inventory,
        sku, vendorId, categoryId, weight, dimensions
      ];
      
      const result = await client.query(query, values);
      return result.rows;
    } finally {
      client.release();
    }
  },

  /**
   * Get a product by ID
   */
  async getProductById(id) {
    const client = await pool.connect();
    try {
      const query = 'SELECT * FROM products WHERE id = $1';
      const result = await client.query(query, [id]);
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  /**
   * Get products with optional filtering and pagination
   */
  async getProducts(params = {}) {
    const client = await pool.connect();
    try {
      let query = 'SELECT * FROM products WHERE 1=1';
      const values = [];
      let valueIndex = 1;
      
      // Add filter conditions if provided
      if (params.vendorId) {
        query += ` AND vendor_id = $${valueIndex++}`;
        values.push(params.vendorId);
      }
      
      if (params.categoryId) {
        query += ` AND category_id = $${valueIndex++}`;
        values.push(params.categoryId);
      }
      
      if (params.featured !== undefined) {
        query += ` AND featured = $${valueIndex++}`;
        values.push(params.featured);
      }
      
      if (params.active !== undefined) {
        query += ` AND active = $${valueIndex++}`;
        values.push(params.active);
      }
      
      if (params.minPrice !== undefined) {
        query += ` AND price >= $${valueIndex++}`;
        values.push(params.minPrice);
      }
      
      if (params.maxPrice !== undefined) {
        query += ` AND price <= $${valueIndex++}`;
        values.push(params.maxPrice);
      }
      
      if (params.search) {
        query += ` AND (name ILIKE $${valueIndex} OR description ILIKE $${valueIndex})`;
        values.push(`%${params.search}%`);
        valueIndex++;
      }
      
      // Calculate total count for pagination
      const countResult = await client.query(`SELECT COUNT(*) FROM (${query}) AS count_query`, values);
      const total = parseInt(countResult.rows[0].count);
      
      // Add pagination
      const limit = params.limit || 10;
      const page = params.page || 1;
      const offset = (page - 1) * limit;
      
      query += ` ORDER BY created_at DESC LIMIT $${valueIndex++} OFFSET $${valueIndex++}`;
      values.push(limit, offset);
      
      const result = await client.query(query, values);
      
      return {
        products: result.rows,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } finally {
      client.release();
    }
  },

  /**
   * Update a product
   */
  async updateProduct(id, product) {
    const client = await pool.connect();
    try {
      const updateFields = Object.keys(product)
        .filter(key => key !== 'id' && key !== 'updatedAt')
        .map((key, index) => {
          // Convert camelCase to snake_case for database columns
          const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          return `${snakeKey} = $${index + 2}`;
        });
      
      updateFields.push('updated_at = NOW()');
      
      const query = `
        UPDATE products 
        SET ${updateFields.join(', ')}
        WHERE id = $1
        RETURNING *
      `;
      
      const values = [id, ...Object.values(product).filter(val => val !== product.id && val !== product.updatedAt)];
      
      const result = await client.query(query, values);
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  /**
   * Delete a product
   */
  async deleteProduct(id) {
    const client = await pool.connect();
    try {
      const query = 'DELETE FROM products WHERE id = $1 RETURNING *';
      const result = await client.query(query, [id]);
      return result.rows;
    } finally {
      client.release();
    }
  },

  /**
   * Get product categories
   */
  async getProductCategories() {
    const client = await pool.connect();
    try {
      const query = 'SELECT * FROM product_categories WHERE active = true ORDER BY name ASC';
      const result = await client.query(query);
      return result.rows;
    } finally {
      client.release();
    }
  },

  /**
   * Create product category
   */
  async createProductCategory(category) {
    const client = await pool.connect();
    try {
      const { name, description, slug, parentId } = category;
      const query = `
        INSERT INTO product_categories (name, description, slug, parent_id, active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING *
      `;
      const values = [name, description, slug, parentId, category.active === undefined ? true : category.active];
      const result = await client.query(query, values);
      return result.rows;
    } finally {
      client.release();
    }
  },

  /**
   * Update product inventory
   * @param {number} productId - The ID of the product to update
   * @param {number} quantity - The quantity to adjust inventory by (negative for decrease, positive for increase)
   * @param {Object} options - Additional options
   * @param {boolean} options.allowNegative - Whether to allow inventory to go below zero (default: false)
   * @returns {Promise<Object>} The updated product
   */
  async updateInventory(productId, quantity, options = {}) {
    const client = await pool.connect();
    try {
      // Start a transaction
      await client.query('BEGIN');

      // Get the current inventory level
      const currentProductQuery = 'SELECT * FROM products WHERE id = $1';
      const currentProductResult = await client.query(currentProductQuery, [productId]);
      
      if (currentProductResult.rows.length === 0) {
        throw new Error(`Product with ID ${productId} not found`);
      }
      
      const currentProduct = currentProductResult.rows[0];
      const currentInventory = currentProduct.inventory || 0;
      const newInventory = currentInventory + quantity;
      
      // Check if inventory would go negative and we're not allowing that
      if (newInventory < 0 && !options.allowNegative) {
        await client.query('ROLLBACK');
        throw new Error(`Insufficient inventory for product ID ${productId}. Current inventory: ${currentInventory}, requested change: ${quantity}`);
      }
      
      // Update the inventory
      const updateQuery = `
        UPDATE products 
        SET inventory = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `;
      
      const updateResult = await client.query(updateQuery, [newInventory, productId]);
      
      // Create an inventory change log entry
      const logQuery = `
        INSERT INTO inventory_changes 
        (product_id, previous_quantity, change_quantity, new_quantity, change_reason, changed_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `;
      
      await client.query(logQuery, [
        productId,
        currentInventory,
        quantity,
        newInventory,
        options.reason || (quantity > 0 ? 'manual_restock' : 'order_fulfillment')
      ]);
      
      // If inventory is now below the threshold, create a low stock alert
      if (newInventory <= INVENTORY_LOW_THRESHOLD) {
        const alertLevel = newInventory <= INVENTORY_CRITICAL_THRESHOLD ? 'critical' : 'low';
        
        const alertQuery = `
          INSERT INTO inventory_alerts
          (product_id, alert_level, quantity, created_at, status)
          VALUES ($1, $2, $3, NOW(), 'active')
          ON CONFLICT (product_id, status) 
          DO UPDATE SET 
            alert_level = $2,
            quantity = $3,
            updated_at = NOW()
        `;
        
        await client.query(alertQuery, [productId, alertLevel, newInventory]);
      } else {
        // If inventory is now above threshold, resolve any existing alerts
        const resolveAlertsQuery = `
          UPDATE inventory_alerts
          SET status = 'resolved', updated_at = NOW()
          WHERE product_id = $1 AND status = 'active'
        `;
        
        await client.query(resolveAlertsQuery, [productId]);
      }
      
      // Commit the transaction
      await client.query('COMMIT');
      
      return updateResult.rows[0];
    } catch (error) {
      // Rollback in case of error
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Get products with low inventory
   * @param {Object} options - Filter options
   * @param {number} options.threshold - Custom threshold (default: INVENTORY_LOW_THRESHOLD)
   * @param {number} options.vendorId - Filter by vendor ID
   * @param {number} options.categoryId - Filter by category ID
   * @returns {Promise<Array>} Low inventory products
   */
  async getLowInventoryProducts(options = {}) {
    const client = await pool.connect();
    try {
      const threshold = options.threshold || INVENTORY_LOW_THRESHOLD;
      
      let query = `
        SELECT p.*, pc.name as category_name, v.business_name as vendor_name
        FROM products p
        LEFT JOIN product_categories pc ON p.category_id = pc.id
        LEFT JOIN vendors v ON p.vendor_id = v.id
        WHERE p.inventory <= $1 AND p.active = true
      `;
      
      const values = [threshold];
      let valueIndex = 2;
      
      if (options.vendorId) {
        query += ` AND p.vendor_id = $${valueIndex++}`;
        values.push(options.vendorId);
      }
      
      if (options.categoryId) {
        query += ` AND p.category_id = $${valueIndex++}`;
        values.push(options.categoryId);
      }
      
      query += ' ORDER BY p.inventory ASC';
      
      const result = await client.query(query, values);
      return result.rows;
    } finally {
      client.release();
    }
  },

  /**
   * Get active inventory alerts
   * @param {Object} options - Filter options
   * @param {string} options.alertLevel - Filter by alert level ('low' or 'critical')
   * @param {number} options.vendorId - Filter by vendor ID
   * @returns {Promise<Array>} Active inventory alerts
   */
  async getInventoryAlerts(options = {}) {
    const client = await pool.connect();
    try {
      let query = `
        SELECT a.*, p.name as product_name, p.sku as product_sku, 
               v.business_name as vendor_name, p.inventory as current_inventory
        FROM inventory_alerts a
        JOIN products p ON a.product_id = p.id
        JOIN vendors v ON p.vendor_id = v.id
        WHERE a.status = 'active'
      `;
      
      const values = [];
      let valueIndex = 1;
      
      if (options.alertLevel) {
        query += ` AND a.alert_level = $${valueIndex++}`;
        values.push(options.alertLevel);
      }
      
      if (options.vendorId) {
        query += ` AND p.vendor_id = $${valueIndex++}`;
        values.push(options.vendorId);
      }
      
      query += ' ORDER BY a.created_at DESC';
      
      const result = await client.query(query, values);
      return result.rows;
    } finally {
      client.release();
    }
  },

  /**
   * Get inventory change history for a product
   * @param {number} productId - The product ID
   * @param {Object} options - Filter options
   * @param {Date} options.startDate - Filter changes after this date
   * @param {Date} options.endDate - Filter changes before this date
   * @returns {Promise<Array>} Inventory change history
   */
  async getInventoryHistory(productId, options = {}) {
    const client = await pool.connect();
    try {
      let query = `
        SELECT ic.*, p.name as product_name, p.sku as product_sku
        FROM inventory_changes ic
        JOIN products p ON ic.product_id = p.id
        WHERE ic.product_id = $1
      `;
      
      const values = [productId];
      let valueIndex = 2;
      
      if (options.startDate) {
        query += ` AND ic.changed_at >= $${valueIndex++}`;
        values.push(options.startDate);
      }
      
      if (options.endDate) {
        query += ` AND ic.changed_at <= $${valueIndex++}`;
        values.push(options.endDate);
      }
      
      query += ' ORDER BY ic.changed_at DESC';
      
      const result = await client.query(query, values);
      return result.rows;
    } finally {
      client.release();
    }
  }
};

module.exports = { productStorage };