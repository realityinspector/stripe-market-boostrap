// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Initialize dashboard
  initDashboard();
  
  // Set up event listeners
  document.getElementById('refreshData').addEventListener('click', refreshDashboardData);
  document.getElementById('timeRange').addEventListener('change', refreshDashboardData);
  
  // Modal handling
  const modal = document.getElementById('vendorModal');
  const closeBtn = document.getElementsByClassName('close')[0];
  
  closeBtn.addEventListener('click', function() {
    modal.style.display = 'none';
  });
  
  window.addEventListener('click', function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
  
  // Vendor status update
  document.getElementById('updateStatus').addEventListener('click', updateVendorStatus);
});

// Initialize dashboard data
async function initDashboard() {
  try {
    // Verify admin authentication
    const authResponse = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    const authData = await authResponse.json();
    
    if (!authResponse.ok || authData.user.role !== 'admin') {
      // Redirect to login if not an admin
      window.location.href = '/login?redirect=/admin/dashboard';
      return;
    }
    
    // Set admin name
    document.querySelector('.admin-name').textContent = authData.user.name || 'Admin User';
    
    // Load dashboard data
    await Promise.all([
      loadAnalytics(),
      loadVendors(),
      loadTransactions(),
      initCharts()
    ]);
    
  } catch (error) {
    console.error('Error initializing dashboard:', error);
    showErrorMessage('Failed to load dashboard data. Please try again.');
  }
}

// Load analytics data
async function loadAnalytics() {
  try {
    const response = await fetch('/api/admin/analytics', {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to load analytics data');
    }
    
    const data = await response.json();
    
    if (data.success && data.analytics) {
      // Update dashboard stats
      document.getElementById('totalUsers').textContent = data.analytics.users.total || 0;
      document.getElementById('customerCount').textContent = data.analytics.users.customers || 0;
      document.getElementById('vendorCount').textContent = data.analytics.users.vendors || 0;
      document.getElementById('totalProducts').textContent = data.analytics.products || 0;
      document.getElementById('totalOrders').textContent = data.analytics.orders || 0;
      document.getElementById('totalRevenue').textContent = formatCurrency(data.analytics.revenue || 0);
      
      // Calculate platform fee based on commission rate
      await loadCommissionRate(data.analytics.revenue);
    }
  } catch (error) {
    console.error('Error loading analytics:', error);
    showErrorMessage('Failed to load analytics data');
  }
}

// Load commission rate and calculate platform fee
async function loadCommissionRate(totalRevenue) {
  try {
    const response = await fetch('/api/admin/commission', {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to load commission rate');
    }
    
    const data = await response.json();
    
    if (data.success && data.commission) {
      const commissionRate = data.commission.rate || 10; // Default to 10% if not set
      const platformFee = (totalRevenue * commissionRate) / 100;
      document.getElementById('platformFee').textContent = formatCurrency(platformFee);
    }
  } catch (error) {
    console.error('Error loading commission rate:', error);
  }
}

// Load recent vendors
async function loadVendors() {
  try {
    const response = await fetch('/api/admin/vendors', {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to load vendors data');
    }
    
    const data = await response.json();
    
    if (data.success && data.vendors) {
      const vendorsTable = document.getElementById('vendorsTable').getElementsByTagName('tbody')[0];
      vendorsTable.innerHTML = '';
      
      // Get only the 5 most recent vendors
      const recentVendors = data.vendors.slice(0, 5);
      
      if (recentVendors.length === 0) {
        vendorsTable.innerHTML = '<tr><td colspan="5" class="text-center">No vendors found</td></tr>';
        return;
      }
      
      recentVendors.forEach(vendor => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>
            <div class="vendor-name">${vendor.business_name}</div>
            <div class="vendor-email">${vendor.email}</div>
          </td>
          <td><span class="status status-${vendor.status}">${capitalizeFirstLetter(vendor.status)}</span></td>
          <td>${vendor.product_count || 0}</td>
          <td>${formatCurrency(vendor.total_sales || 0)}</td>
          <td><button class="btn-action" data-vendor-id="${vendor.id}">View Details</button></td>
        `;
        
        vendorsTable.appendChild(row);
      });
      
      // Add event listeners to view buttons
      document.querySelectorAll('.btn-action[data-vendor-id]').forEach(button => {
        button.addEventListener('click', function() {
          const vendorId = this.getAttribute('data-vendor-id');
          openVendorModal(vendorId, data.vendors);
        });
      });
    }
  } catch (error) {
    console.error('Error loading vendors:', error);
    showErrorMessage('Failed to load vendors data');
  }
}

// Load recent transactions
async function loadTransactions() {
  try {
    const response = await fetch('/api/admin/transactions', {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to load transactions data');
    }
    
    const data = await response.json();
    
    if (data.success && data.transactions) {
      const transactionsTable = document.getElementById('transactionsTable').getElementsByTagName('tbody')[0];
      transactionsTable.innerHTML = '';
      
      // Get only the 5 most recent transactions
      const recentTransactions = data.transactions.slice(0, 5);
      
      if (recentTransactions.length === 0) {
        transactionsTable.innerHTML = '<tr><td colspan="6" class="text-center">No transactions found</td></tr>';
        return;
      }
      
      recentTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>#${transaction.id}</td>
          <td>${transaction.customer_name}</td>
          <td>${transaction.vendor_name}</td>
          <td>${formatCurrency(transaction.total_amount || 0)}</td>
          <td>${formatDate(transaction.created_at)}</td>
          <td><span class="status status-active">${transaction.status || 'Completed'}</span></td>
        `;
        
        transactionsTable.appendChild(row);
      });
    }
  } catch (error) {
    console.error('Error loading transactions:', error);
    showErrorMessage('Failed to load transactions data');
  }
}

// Initialize charts
async function initCharts() {
  // Revenue chart
  const revenueCtx = document.getElementById('revenueChart').getContext('2d');
  
  // Mock data for the chart - this would be replaced with real data from API
  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Revenue',
      backgroundColor: 'rgba(103, 114, 229, 0.2)',
      borderColor: 'rgba(103, 114, 229, 1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(103, 114, 229, 1)',
      data: [0, 0, 0, 0, 0, 0], // Initialize with zeros
      tension: 0.4
    }]
  };
  
  const revenueChart = new Chart(revenueCtx, {
    type: 'line',
    data: revenueData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '$' + value;
            }
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return '$' + context.parsed.y;
            }
          }
        }
      }
    }
  });
  
  // Orders chart
  const ordersCtx = document.getElementById('ordersChart').getContext('2d');
  
  // Mock data for the chart - this would be replaced with real data from API
  const ordersData = {
    labels: ['Completed', 'Processing', 'Cancelled'],
    datasets: [{
      data: [0, 0, 0], // Initialize with zeros
      backgroundColor: [
        'rgba(36, 180, 126, 0.7)',
        'rgba(246, 164, 235, 0.7)',
        'rgba(226, 89, 80, 0.7)'
      ],
      borderColor: [
        'rgba(36, 180, 126, 1)',
        'rgba(246, 164, 235, 1)',
        'rgba(226, 89, 80, 1)'
      ],
      borderWidth: 1
    }]
  };
  
  const ordersChart = new Chart(ordersCtx, {
    type: 'doughnut',
    data: ordersData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
  
  // Simulate fetching chart data from API
  try {
    // For demo purposes, using setTimeout to simulate API delay
    // In a real application, this would be real data from an API endpoint
    setTimeout(() => {
      // Update revenue chart with fake data
      revenueChart.data.datasets[0].data = [1200, 1900, 3000, 5000, 8000, 12000];
      revenueChart.update();
      
      // Update orders chart with fake data
      ordersChart.data.datasets[0].data = [25, 8, 3];
      ordersChart.update();
    }, 1000);
  } catch (error) {
    console.error('Error loading chart data:', error);
  }
}

// Open vendor modal with details
function openVendorModal(vendorId, vendors) {
  const vendor = vendors.find(v => v.id == vendorId);
  
  if (!vendor) return;
  
  document.getElementById('modalBusinessName').textContent = vendor.business_name;
  document.getElementById('modalOwnerName').textContent = vendor.name;
  document.getElementById('modalEmail').textContent = vendor.email;
  document.getElementById('modalStatus').textContent = capitalizeFirstLetter(vendor.status);
  document.getElementById('modalJoined').textContent = formatDate(vendor.created_at);
  document.getElementById('modalProducts').textContent = vendor.product_count || 0;
  document.getElementById('modalOrders').textContent = vendor.order_count || 0;
  document.getElementById('modalSales').textContent = formatCurrency(vendor.total_sales || 0);
  
  // Set current status in select dropdown
  document.getElementById('statusUpdate').value = vendor.status;
  
  // Store vendor ID in the button for the update action
  document.getElementById('updateStatus').setAttribute('data-vendor-id', vendor.id);
  
  // Show the modal
  document.getElementById('vendorModal').style.display = 'block';
}

// Update vendor status
async function updateVendorStatus() {
  try {
    const vendorId = this.getAttribute('data-vendor-id');
    const status = document.getElementById('statusUpdate').value;
    
    const response = await fetch(`/api/admin/vendors/${vendorId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update vendor status');
    }
    
    const data = await response.json();
    
    if (data.success) {
      // Close modal
      document.getElementById('vendorModal').style.display = 'none';
      
      // Refresh vendors data
      await loadVendors();
      
      showSuccessMessage('Vendor status updated successfully');
    } else {
      throw new Error(data.message || 'Failed to update vendor status');
    }
  } catch (error) {
    console.error('Error updating vendor status:', error);
    showErrorMessage('Failed to update vendor status: ' + error.message);
  }
}

// Refresh dashboard data based on selected time range
async function refreshDashboardData() {
  const timeRange = document.getElementById('timeRange').value;
  console.log(`Refreshing dashboard data for time range: ${timeRange}`);
  
  // Show loading state
  document.getElementById('refreshData').textContent = 'Loading...';
  document.getElementById('refreshData').disabled = true;
  
  try {
    // In a real application, the time range would be sent to the API
    // For now, just reload the data
    await Promise.all([
      loadAnalytics(),
      loadVendors(),
      loadTransactions()
    ]);
    
    showSuccessMessage('Dashboard data refreshed successfully');
  } catch (error) {
    console.error('Error refreshing dashboard data:', error);
    showErrorMessage('Failed to refresh dashboard data');
  } finally {
    // Reset button state
    document.getElementById('refreshData').textContent = 'Refresh Data';
    document.getElementById('refreshData').disabled = false;
  }
}

// Utility Functions

// Get authentication token from local storage
function getToken() {
  return localStorage.getItem('authToken') || '';
}

// Format currency values
function formatCurrency(value) {
  return '$' + parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Format date strings
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

// Capitalize first letter of a string
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Show success message
function showSuccessMessage(message) {
  // In a real application, this would show a proper toast notification
  alert(message);
}

// Show error message
function showErrorMessage(message) {
  // In a real application, this would show a proper toast notification
  console.error(message);
  alert('Error: ' + message);
}