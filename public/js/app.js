/**
 * Stripe Connect Marketplace Frontend Application
 * Main JavaScript file for the frontend interface
 */

// API URL configuration
const API_BASE_URL = '/api';

// State management
let state = {
  user: null,
  isAuthenticated: false,
  cart: [],
  products: [],
  vendors: [],
  currentPage: 1,
  totalPages: 1,
  filters: {
    priceMax: 1000,
    categories: []
  }
};

// DOM Elements
const dom = {
  productList: document.querySelector('.product-list'),
  vendorList: document.querySelector('.vendor-list'),
  cartCount: document.querySelector('.cart-count'),
  searchForm: document.querySelector('.search-bar'),
  priceSlider: document.getElementById('price-slider'),
  priceValue: document.getElementById('price-value'),
  categoryCheckboxes: document.querySelectorAll('.categories input[type="checkbox"]'),
  applyFiltersBtn: document.querySelector('.apply-filters'),
  prevPageBtn: document.getElementById('prev-page'),
  nextPageBtn: document.getElementById('next-page'),
  currentPageEl: document.getElementById('current-page'),
  totalPagesEl: document.getElementById('total-pages')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Check authentication status
  checkAuthStatus();
  
  // Load cart from localStorage
  loadCart();
  
  // Initialize pages based on current URL
  initializePage();
  
  // Set up event listeners
  setupEventListeners();
});

// Authentication check
async function checkAuthStatus() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    state.isAuthenticated = false;
    state.user = null;
    updateAuthUI();
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      state.user = data.user;
      state.isAuthenticated = true;
      updateAuthUI();
    } else {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      state.isAuthenticated = false;
      state.user = null;
      updateAuthUI();
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    state.isAuthenticated = false;
    state.user = null;
    updateAuthUI();
  }
}

// Update UI based on authentication status
function updateAuthUI() {
  const authLinks = document.querySelectorAll('nav ul');
  
  if (authLinks.length > 0) {
    if (state.isAuthenticated) {
      // User is logged in
      authLinks[0].innerHTML = `
        <li><a href="/" class="${window.location.pathname === '/' ? 'active' : ''}">Home</a></li>
        <li><a href="/products" class="${window.location.pathname === '/products' ? 'active' : ''}">Products</a></li>
        <li><a href="/account" class="${window.location.pathname === '/account' ? 'active' : ''}">My Account</a></li>
        ${state.user && state.user.role === 'vendor' ? 
          `<li><a href="/vendor" class="${window.location.pathname === '/vendor' ? 'active' : ''}">Vendor Dashboard</a></li>` : ''}
        ${state.user && state.user.role === 'admin' ? 
          `<li><a href="/admin" class="${window.location.pathname === '/admin' ? 'active' : ''}">Admin</a></li>` : ''}
        <li><a href="#" id="logout-btn">Logout</a></li>
        <li><a href="/cart" class="cart-link">Cart <span class="cart-count">${getCartItemCount()}</span></a></li>
      `;
      
      // Add logout listener
      document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
      });
    } else {
      // User is not logged in
      authLinks[0].innerHTML = `
        <li><a href="/" class="${window.location.pathname === '/' ? 'active' : ''}">Home</a></li>
        <li><a href="/products" class="${window.location.pathname === '/products' ? 'active' : ''}">Products</a></li>
        <li><a href="/login" class="${window.location.pathname === '/login' ? 'active' : ''}">Login</a></li>
        <li><a href="/register" class="${window.location.pathname === '/register' ? 'active' : ''}">Register</a></li>
        <li><a href="/cart" class="cart-link">Cart <span class="cart-count">${getCartItemCount()}</span></a></li>
      `;
    }
  }
}

// Logout function
function logout() {
  localStorage.removeItem('authToken');
  state.isAuthenticated = false;
  state.user = null;
  updateAuthUI();
  // Redirect to home page
  window.location.href = '/';
}

// Load cart from localStorage
function loadCart() {
  const cart = localStorage.getItem('cart');
  if (cart) {
    state.cart = JSON.parse(cart);
    updateCartUI();
  }
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(state.cart));
  updateCartUI();
}

// Update cart UI
function updateCartUI() {
  if (dom.cartCount) {
    dom.cartCount.textContent = getCartItemCount();
  }
}

// Get cart item count
function getCartItemCount() {
  return state.cart.reduce((total, item) => total + item.quantity, 0);
}

// Add item to cart
function addToCart(product, quantity = 1) {
  const existingItem = state.cart.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      vendorId: product.vendorId,
      vendorName: product.vendorName,
      quantity
    });
  }
  
  saveCart();
  
  // Show confirmation
  showNotification(`${product.name} added to cart`);
}

// Show notification
function showNotification(message, type = 'success') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = message;
  
  // Add to DOM
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Initialize page based on current URL
function initializePage() {
  const path = window.location.pathname;
  
  // Home page
  if (path === '/' || path === '/index.html') {
    loadFeaturedProducts();
    loadFeaturedVendors();
  }
  
  // Products page
  else if (path === '/products' || path === '/products/') {
    loadProducts();
    initializeFilters();
  }
  
  // Product details page
  else if (path.match(/^\/products\/\d+/)) {
    const productId = path.split('/')[2];
    loadProductDetails(productId);
  }
  
  // Cart page
  else if (path === '/cart' || path === '/cart/') {
    renderCart();
  }
  
  // Checkout page
  else if (path === '/checkout' || path === '/checkout/') {
    initializeCheckout();
  }
}

// Load featured products for the home page
async function loadFeaturedProducts() {
  if (!dom.productList) return;
  
  try {
    dom.productList.innerHTML = '<div class="loading">Loading products...</div>';
    
    const response = await fetch(`${API_BASE_URL}/products?featured=true&limit=4`);
    
    if (response.ok) {
      const data = await response.json();
      state.products = data.products || [];
      
      if (state.products.length > 0) {
        renderProducts(state.products, dom.productList);
      } else {
        dom.productList.innerHTML = '<div class="no-results">No products found</div>';
      }
    } else {
      dom.productList.innerHTML = '<div class="error">Failed to load products</div>';
    }
  } catch (error) {
    console.error('Error loading featured products:', error);
    dom.productList.innerHTML = '<div class="error">Error loading products</div>';
  }
}

// Load featured vendors for the home page
async function loadFeaturedVendors() {
  if (!dom.vendorList) return;
  
  try {
    dom.vendorList.innerHTML = '<div class="loading">Loading vendors...</div>';
    
    const response = await fetch(`${API_BASE_URL}/vendors?featured=true&limit=4`);
    
    if (response.ok) {
      const data = await response.json();
      state.vendors = data.vendors || [];
      
      if (state.vendors.length > 0) {
        renderVendors(state.vendors);
      } else {
        dom.vendorList.innerHTML = '<div class="no-results">No vendors found</div>';
      }
    } else {
      dom.vendorList.innerHTML = '<div class="error">Failed to load vendors</div>';
    }
  } catch (error) {
    console.error('Error loading featured vendors:', error);
    dom.vendorList.innerHTML = '<div class="error">Error loading vendors</div>';
  }
}

// Load products for the products page
async function loadProducts(page = 1, filters = {}) {
  if (!dom.productList) return;
  
  try {
    dom.productList.innerHTML = '<div class="loading">Loading products...</div>';
    
    let url = `${API_BASE_URL}/products?page=${page}`;
    
    // Add filters to URL if provided
    if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
    if (filters.priceMax) url += `&price_max=${filters.priceMax}`;
    if (filters.categories && filters.categories.length > 0) {
      url += `&categories=${filters.categories.join(',')}`;
    }
    
    const response = await fetch(url);
    
    if (response.ok) {
      const data = await response.json();
      state.products = data.products || [];
      state.currentPage = data.page || 1;
      state.totalPages = data.totalPages || 1;
      
      if (state.products.length > 0) {
        renderProducts(state.products, dom.productList);
        updatePagination();
      } else {
        dom.productList.innerHTML = '<div class="no-results">No products found</div>';
      }
    } else {
      dom.productList.innerHTML = '<div class="error">Failed to load products</div>';
    }
  } catch (error) {
    console.error('Error loading products:', error);
    dom.productList.innerHTML = '<div class="error">Error loading products</div>';
  }
}

// Render products
function renderProducts(products, container) {
  if (!container) return;
  
  let html = '';
  
  products.forEach(product => {
    html += `
      <div class="product-item">
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
  
  container.innerHTML = html;
}

// Render vendors
function renderVendors(vendors) {
  if (!dom.vendorList) return;
  
  let html = '';
  
  vendors.forEach(vendor => {
    html += `
      <div class="vendor-item">
        <div class="vendor-image" style="background-image: url('${vendor.logo_url || '/img/placeholder-vendor.jpg'}')"></div>
        <div class="vendor-info">
          <div class="vendor-name">${vendor.name}</div>
          <div class="vendor-status">${vendor.stripe_connected ? 'Verified Vendor' : 'Pending Verification'}</div>
          <div class="vendor-description">${vendor.description || ''}</div>
          <a href="/vendors/${vendor.id}" class="btn secondary">View Products</a>
        </div>
      </div>
    `;
  });
  
  dom.vendorList.innerHTML = html;
}

// Update pagination controls
function updatePagination() {
  if (!dom.currentPageEl || !dom.totalPagesEl || !dom.prevPageBtn || !dom.nextPageBtn) return;
  
  dom.currentPageEl.textContent = state.currentPage;
  dom.totalPagesEl.textContent = state.totalPages;
  
  // Disable/enable previous button
  if (state.currentPage <= 1) {
    dom.prevPageBtn.disabled = true;
  } else {
    dom.prevPageBtn.disabled = false;
  }
  
  // Disable/enable next button
  if (state.currentPage >= state.totalPages) {
    dom.nextPageBtn.disabled = true;
  } else {
    dom.nextPageBtn.disabled = false;
  }
}

// Load product details
async function loadProductDetails(productId) {
  const productDetails = document.querySelector('.product-details');
  if (!productDetails) return;
  
  try {
    productDetails.innerHTML = '<div class="loading">Loading product details...</div>';
    
    const response = await fetch(`${API_BASE_URL}/products/${productId}`);
    
    if (response.ok) {
      const product = await response.json();
      
      const html = `
        <div class="product-details-image" style="background-image: url('${product.image_url || '/img/placeholder-product.jpg'}')"></div>
        <div class="product-details-info">
          <h1>${product.name}</h1>
          <div class="product-details-vendor">by ${product.vendorName || 'Unknown Vendor'}</div>
          <div class="product-details-price">$${(product.price / 100).toFixed(2)}</div>
          <div class="product-details-description">${product.description || ''}</div>
          
          <form class="add-to-cart-form">
            <input type="number" min="1" value="1" class="quantity-input" id="quantity">
            <button type="submit" class="btn primary add-to-cart-button">Add to Cart</button>
          </form>
        </div>
      `;
      
      productDetails.innerHTML = html;
      
      // Add event listener for add to cart
      const addToCartForm = document.querySelector('.add-to-cart-form');
      if (addToCartForm) {
        addToCartForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const quantity = parseInt(document.getElementById('quantity').value, 10);
          addToCart(product, quantity);
        });
      }
    } else {
      productDetails.innerHTML = '<div class="error">Failed to load product details</div>';
    }
  } catch (error) {
    console.error('Error loading product details:', error);
    productDetails.innerHTML = '<div class="error">Error loading product details</div>';
  }
}

// Initialize filters on the products page
function initializeFilters() {
  if (!dom.priceSlider || !dom.priceValue || !dom.categoryCheckboxes || !dom.applyFiltersBtn) return;
  
  // Update price display when slider changes
  dom.priceSlider.addEventListener('input', () => {
    const value = dom.priceSlider.value;
    dom.priceValue.textContent = value;
    state.filters.priceMax = parseInt(value, 10);
  });
  
  // Handle category changes
  dom.categoryCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const categories = [];
      dom.categoryCheckboxes.forEach(cb => {
        if (cb.checked) {
          categories.push(cb.value);
        }
      });
      state.filters.categories = categories;
    });
  });
  
  // Apply filters button
  dom.applyFiltersBtn.addEventListener('click', () => {
    loadProducts(1, state.filters);
  });
  
  // Pagination buttons
  if (dom.prevPageBtn) {
    dom.prevPageBtn.addEventListener('click', () => {
      if (state.currentPage > 1) {
        loadProducts(state.currentPage - 1, state.filters);
      }
    });
  }
  
  if (dom.nextPageBtn) {
    dom.nextPageBtn.addEventListener('click', () => {
      if (state.currentPage < state.totalPages) {
        loadProducts(state.currentPage + 1, state.filters);
      }
    });
  }
}

// Render cart contents
function renderCart() {
  const cartContainer = document.querySelector('.cart-container');
  if (!cartContainer) return;
  
  if (state.cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="empty-cart">
        <h2>Your cart is empty</h2>
        <p>You haven't added any items to your cart yet.</p>
        <a href="/products" class="btn primary">Browse Products</a>
      </div>
    `;
    return;
  }
  
  let cartHtml = `
    <div class="cart-header">
      <div>Product</div>
      <div>Price</div>
      <div>Quantity</div>
      <div>Total</div>
      <div></div>
    </div>
  `;
  
  let subtotal = 0;
  
  state.cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    
    cartHtml += `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-product">
          <div class="cart-product-image" style="background-image: url('${item.image || '/img/placeholder-product.jpg'}')"></div>
          <div class="cart-product-details">
            <h3>${item.name}</h3>
            <div class="cart-product-vendor">by ${item.vendorName || 'Unknown Vendor'}</div>
          </div>
        </div>
        <div class="cart-price">$${(item.price / 100).toFixed(2)}</div>
        <div class="cart-quantity">
          <input type="number" min="1" value="${item.quantity}" class="update-quantity" data-id="${item.id}">
        </div>
        <div class="cart-total">$${(itemTotal / 100).toFixed(2)}</div>
        <div class="cart-actions">
          <button class="btn danger remove-item" data-id="${item.id}">Remove</button>
        </div>
      </div>
    `;
  });
  
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax;
  
  cartHtml += `
    <div class="cart-summary">
      <div class="cart-summary-row">
        <span>Subtotal</span>
        <span>$${(subtotal / 100).toFixed(2)}</span>
      </div>
      <div class="cart-summary-row">
        <span>Tax (5%)</span>
        <span>$${(tax / 100).toFixed(2)}</span>
      </div>
      <div class="cart-summary-row">
        <span>Total</span>
        <span>$${(total / 100).toFixed(2)}</span>
      </div>
    </div>
    
    <div class="cart-buttons">
      <a href="/products" class="btn secondary">Continue Shopping</a>
      <a href="/checkout" class="btn primary">Proceed to Checkout</a>
    </div>
  `;
  
  cartContainer.innerHTML = cartHtml;
  
  // Add event listeners for cart actions
  const updateQuantityInputs = document.querySelectorAll('.update-quantity');
  const removeButtons = document.querySelectorAll('.remove-item');
  
  updateQuantityInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      const id = e.target.getAttribute('data-id');
      const quantity = parseInt(e.target.value, 10);
      
      if (quantity > 0) {
        updateCartItemQuantity(id, quantity);
      }
    });
  });
  
  removeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      removeCartItem(id);
    });
  });
}

// Update cart item quantity
function updateCartItemQuantity(id, quantity) {
  const item = state.cart.find(item => item.id === id);
  
  if (item) {
    item.quantity = quantity;
    saveCart();
    renderCart();
  }
}

// Remove item from cart
function removeCartItem(id) {
  state.cart = state.cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
}

// Initialize checkout
async function initializeCheckout() {
  const checkoutContainer = document.querySelector('.checkout-container');
  if (!checkoutContainer) return;
  
  // Make sure cart isn't empty
  if (state.cart.length === 0) {
    window.location.href = '/cart';
    return;
  }
  
  // Get the currency selector
  const currencySelect = document.getElementById('currency');
  const selectedCurrency = currencySelect ? currencySelect.value : 'usd';
  
  // Render checkout summary with the current currency
  renderCheckoutSummary(selectedCurrency);
  
  // Add event listener for checkout form
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);
  }
}

// Render checkout summary
function renderCheckoutSummary(currency = 'usd') {
  const checkoutSummary = document.querySelector('.checkout-summary');
  if (!checkoutSummary) return;
  
  // Get exchange rates (simplified for demo, in a real app these would come from an API)
  const exchangeRates = {
    usd: 1.0,      // Base currency
    eur: 0.85,     // USD to EUR
    gbp: 0.75,     // USD to GBP
    cad: 1.25,     // USD to CAD
    aud: 1.35,     // USD to AUD
    jpy: 110.0     // USD to JPY
  };
  
  const rate = exchangeRates[currency.toLowerCase()] || 1.0;
  const currencySymbols = {
    usd: '$',
    eur: '€',
    gbp: '£',
    cad: 'C$',
    aud: 'A$',
    jpy: '¥'
  };
  const symbol = currencySymbols[currency.toLowerCase()] || '$';
  
  let summaryHtml = `<h3>Order Summary</h3>`;
  
  let subtotal = 0;
  
  state.cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    
    // Convert to selected currency and format
    const convertedPrice = (itemTotal / 100) * rate;
    const formattedPrice = currency.toLowerCase() === 'jpy' 
      ? `${symbol}${Math.round(convertedPrice)}` 
      : `${symbol}${convertedPrice.toFixed(2)}`;
    
    summaryHtml += `
      <div class="checkout-item">
        <div>${item.name} x ${item.quantity}</div>
        <div data-usd-price="${(itemTotal / 100).toFixed(2)}">${formattedPrice}</div>
      </div>
    `;
  });
  
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax;
  
  // Convert to selected currency and format
  const convertedSubtotal = (subtotal / 100) * rate;
  const convertedTax = (tax / 100) * rate;
  const convertedTotal = (total / 100) * rate;
  
  // Format prices based on currency
  const formatPrice = (price) => {
    if (currency.toLowerCase() === 'jpy') {
      return `${symbol}${Math.round(price)}`;
    }
    return `${symbol}${price.toFixed(2)}`;
  };
  
  summaryHtml += `
    <div class="checkout-item">
      <div>Subtotal</div>
      <div data-usd-price="${(subtotal / 100).toFixed(2)}">${formatPrice(convertedSubtotal)}</div>
    </div>
    <div class="checkout-item">
      <div>Tax (5%)</div>
      <div data-usd-price="${(tax / 100).toFixed(2)}">${formatPrice(convertedTax)}</div>
    </div>
    <div class="checkout-item">
      <div><strong>Total</strong></div>
      <div data-usd-price="${(total / 100).toFixed(2)}"><strong>${formatPrice(convertedTotal)}</strong></div>
    </div>
  `;
  
  checkoutSummary.innerHTML = summaryHtml;
}

// Handle checkout form submission
async function handleCheckoutSubmit(e) {
  e.preventDefault();
  
  const form = e.target;
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Processing...';
  
  // Get selected currency
  const currencySelect = document.getElementById('currency');
  const selectedCurrency = currencySelect ? currencySelect.value : 'usd';
  
  try {
    // Create payment intent
    const response = await fetch(`${API_BASE_URL}/payments/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        items: state.cart,
        currency: selectedCurrency.toLowerCase(),
        shippingAddress: {
          name: form.name.value,
          address: form.address.value,
          city: form.city.value,
          state: form.state.value,
          postalCode: form.postalCode.value,
          country: form.country.value
        }
      })
    });
    
    if (response.ok) {
      const { clientSecret } = await response.json();
      
      // Get order summary information
      let totalAmount = 0;
      let itemCount = 0;
      
      state.cart.forEach(item => {
        totalAmount += item.price * item.quantity;
        itemCount += item.quantity;
      });
      
      // Get currency symbol
      const currencySymbols = {
        usd: '$',
        eur: '€',
        gbp: '£',
        cad: 'C$',
        aud: 'A$',
        jpy: '¥'
      };
      const symbol = currencySymbols[selectedCurrency.toLowerCase()] || '$';
      
      // Format total amount according to currency
      const formattedAmount = selectedCurrency.toLowerCase() === 'jpy'
        ? `${symbol}${Math.round(totalAmount / 100)}`
        : `${symbol}${(totalAmount / 100).toFixed(2)}`;
      
      // Show success message
      form.innerHTML = `
        <div class="payment-confirmation">
          <div class="success-icon"><i class="fas fa-check-circle"></i></div>
          <h2>Order Placed Successfully!</h2>
          <div class="order-summary">
            <p class="summary-detail"><strong>Items:</strong> ${itemCount}</p>
            <p class="summary-detail"><strong>Total:</strong> ${formattedAmount}</p>
            <p class="summary-detail"><strong>Currency:</strong> ${selectedCurrency.toUpperCase()}</p>
          </div>
          <p>Thank you for your order. Your payment was successful.</p>
          <p>Order confirmation and details have been sent to your email.</p>
          <a href="/" class="btn primary">Return to Home</a>
        </div>
      `;
      
      // Clear cart
      state.cart = [];
      saveCart();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Payment failed');
    }
  } catch (error) {
    console.error('Checkout error:', error);
    submitButton.disabled = false;
    submitButton.textContent = 'Complete Payment';
    showNotification(`Payment failed: ${error.message}`, 'error');
  }
}

// Set up event listeners
function setupEventListeners() {
  // Search form
  if (dom.searchForm) {
    dom.searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const searchInput = dom.searchForm.querySelector('input');
      if (searchInput) {
        state.filters.search = searchInput.value;
        loadProducts(1, state.filters);
      }
    });
  }
}

// Utility function to format price
function formatPrice(price, currency = 'usd') {
  const currencySymbols = {
    usd: '$',
    eur: '€',
    gbp: '£',
    cad: 'C$',
    aud: 'A$',
    jpy: '¥'
  };
  
  const symbol = currencySymbols[currency.toLowerCase()] || '$';
  
  // Japanese Yen doesn't use decimal places
  if (currency.toLowerCase() === 'jpy') {
    return `${symbol}${Math.round(price / 100)}`;
  }
  
  return `${symbol}${(price / 100).toFixed(2)}`;
}