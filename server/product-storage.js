// JavaScript version of product storage for testing
const { Pool } = require('pg');
require('dotenv').config();

// Initialize the database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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
  }
};

module.exports = { productStorage };