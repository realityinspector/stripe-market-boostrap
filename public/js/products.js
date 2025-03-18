/**
 * Stripe Connect Marketplace Products Module
 * Handles product listing, filtering, and pagination
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize product filters and pagination
  initializeProductsPage();
});

/**
 * Initialize products page functionality
 */
function initializeProductsPage() {
  // Price filter slider
  const priceSlider = document.getElementById('price-slider');
  const priceValue = document.getElementById('price-value');
  
  if (priceSlider && priceValue) {
    priceSlider.addEventListener('input', () => {
      priceValue.textContent = priceSlider.value;
    });
  }
  
  // Apply filters button
  const applyFiltersButton = document.querySelector('.apply-filters');
  if (applyFiltersButton) {
    applyFiltersButton.addEventListener('click', applyFilters);
  }
  
  // Pagination
  const prevPageButton = document.getElementById('prev-page');
  const nextPageButton = document.getElementById('next-page');
  
  if (prevPageButton) {
    prevPageButton.addEventListener('click', () => changePage('prev'));
  }
  
  if (nextPageButton) {
    nextPageButton.addEventListener('click', () => changePage('next'));
  }
  
  // Load products (initial load)
  loadProducts();
}

/**
 * Apply selected filters and reload products
 */
function applyFilters() {
  // Get price range
  const priceSlider = document.getElementById('price-slider');
  const maxPrice = priceSlider ? priceSlider.value : 1000;
  
  // Get selected categories
  const categoryCheckboxes = document.querySelectorAll('.categories input[type="checkbox"]:checked');
  const categories = Array.from(categoryCheckboxes).map(checkbox => checkbox.value);
  
  // Get search term
  const searchInput = document.querySelector('.search-bar input');
  const searchTerm = searchInput ? searchInput.value : '';
  
  // Build filter object
  const filters = {
    priceMax: maxPrice,
    categories: categories,
    search: searchTerm
  };
  
  // Reset to page 1 when applying new filters
  loadProducts(1, filters);
}

/**
 * Change the current page
 */
function changePage(direction) {
  const currentPageEl = document.getElementById('current-page');
  if (!currentPageEl) return;
  
  let currentPage = parseInt(currentPageEl.textContent, 10);
  
  if (direction === 'prev' && currentPage > 1) {
    loadProducts(currentPage - 1);
  } else if (direction === 'next') {
    loadProducts(currentPage + 1);
  }
}

/**
 * Load products with optional page and filters
 */
function loadProducts(page = 1, filters = {}) {
  const productList = document.querySelector('.product-list');
  if (!productList) return;
  
  // Show loading state
  productList.innerHTML = '<div class="loading">Loading products...</div>';
  
  // Build API URL with query parameters
  let apiUrl = `/api/products?page=${page}`;
  
  if (filters.priceMax) {
    apiUrl += `&price_max=${filters.priceMax}`;
  }
  
  if (filters.categories && filters.categories.length > 0) {
    apiUrl += `&categories=${filters.categories.join(',')}`;
  }
  
  if (filters.search) {
    apiUrl += `&search=${encodeURIComponent(filters.search)}`;
  }
  
  // Fetch products from API
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load products');
      }
      return response.json();
    })
    .then(data => {
      // Update product list
      renderProducts(data.products || []);
      
      // Update pagination
      updatePagination(data.page || 1, data.totalPages || 1);
    })
    .catch(error => {
      console.error('Error loading products:', error);
      productList.innerHTML = '<div class="error">Error loading products. Please try again.</div>';
    });
}

/**
 * Render product list
 */
function renderProducts(products) {
  const productList = document.querySelector('.product-list');
  if (!productList) return;
  
  if (products.length === 0) {
    productList.innerHTML = '<div class="no-results">No products found matching your criteria</div>';
    return;
  }
  
  let html = '';
  
  products.forEach(product => {
    html += `
      <div class="product-item" data-id="${product.id}">
        <div class="product-image" style="background-image: url('${product.image_url || '/img/placeholder-product.jpg'}')"></div>
        <div class="product-info">
          <div class="product-name">${product.name}</div>
          <div class="product-vendor">by ${product.vendorName || 'Unknown Vendor'}</div>
          <div class="product-price">$${(product.price / 100).toFixed(2)}</div>
          <div class="product-description">${product.description || ''}</div>
          <a href="/products/${product.id}" class="btn primary">View Details</a>
        </div>
      </div>
    `;
  });
  
  productList.innerHTML = html;
}

/**
 * Update pagination controls
 */
function updatePagination(currentPage, totalPages) {
  const currentPageEl = document.getElementById('current-page');
  const totalPagesEl = document.getElementById('total-pages');
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');
  
  if (!currentPageEl || !totalPagesEl || !prevPageBtn || !nextPageBtn) return;
  
  // Update page numbers
  currentPageEl.textContent = currentPage;
  totalPagesEl.textContent = totalPages;
  
  // Enable/disable previous page button
  if (currentPage <= 1) {
    prevPageBtn.disabled = true;
  } else {
    prevPageBtn.disabled = false;
  }
  
  // Enable/disable next page button
  if (currentPage >= totalPages) {
    nextPageBtn.disabled = true;
  } else {
    nextPageBtn.disabled = false;
  }
}