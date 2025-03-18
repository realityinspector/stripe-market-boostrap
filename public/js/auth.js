/**
 * Stripe Connect Marketplace Authentication Module
 * Handles login, registration, and other authentication functions
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
});

/**
 * Handle login form submission
 */
async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const submitButton = event.target.querySelector('button[type="submit"]');
  
  // Basic form validation
  if (!email || !password) {
    showAuthError('Please enter both email and password');
    return;
  }
  
  // Update button state
  submitButton.disabled = true;
  submitButton.textContent = 'Logging in...';
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // Store auth token
      localStorage.setItem('authToken', data.token);
      
      // Redirect based on user role
      if (data.user.role === 'admin') {
        window.location.href = '/admin';
      } else if (data.user.role === 'vendor') {
        window.location.href = '/vendor';
      } else {
        window.location.href = '/';
      }
    } else {
      const errorData = await response.json();
      showAuthError(errorData.message || 'Login failed. Please check your credentials.');
      
      // Reset button
      submitButton.disabled = false;
      submitButton.textContent = 'Login';
    }
  } catch (error) {
    console.error('Login error:', error);
    showAuthError('Login failed. Please try again later.');
    
    // Reset button
    submitButton.disabled = false;
    submitButton.textContent = 'Login';
  }
}

/**
 * Handle registration form submission
 */
async function handleRegister(event) {
  event.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('password-confirm').value;
  const role = document.getElementById('role').value;
  const submitButton = event.target.querySelector('button[type="submit"]');
  
  // Basic form validation
  if (!name || !email || !password || !passwordConfirm) {
    showAuthError('Please fill in all fields');
    return;
  }
  
  if (password !== passwordConfirm) {
    showAuthError('Passwords do not match');
    return;
  }
  
  // Password validation
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    showAuthError('Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character');
    return;
  }
  
  // Update button state
  submitButton.disabled = true;
  submitButton.textContent = 'Creating account...';
  
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password, role })
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // Store auth token
      localStorage.setItem('authToken', data.token);
      
      // Show success message and redirect
      showAuthSuccess('Account created successfully!');
      
      // Redirect based on user role
      if (role === 'vendor') {
        setTimeout(() => {
          window.location.href = '/vendor/onboarding';
        }, 1500);
      } else {
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      }
    } else {
      const errorData = await response.json();
      showAuthError(errorData.message || 'Registration failed. Please try again.');
      
      // Reset button
      submitButton.disabled = false;
      submitButton.textContent = 'Register';
    }
  } catch (error) {
    console.error('Registration error:', error);
    showAuthError('Registration failed. Please try again later.');
    
    // Reset button
    submitButton.disabled = false;
    submitButton.textContent = 'Register';
  }
}

/**
 * Show authentication error message
 */
function showAuthError(message) {
  // Remove any existing error messages
  const existingError = document.querySelector('.auth-error');
  if (existingError) {
    existingError.remove();
  }
  
  // Create error message element
  const errorElement = document.createElement('div');
  errorElement.className = 'auth-error';
  errorElement.textContent = message;
  
  // Find the form element and insert error before it
  const form = document.querySelector('.auth-card form');
  if (form) {
    form.insertBefore(errorElement, form.firstChild);
  }
}

/**
 * Show authentication success message
 */
function showAuthSuccess(message) {
  // Remove any existing messages
  const existingMessage = document.querySelector('.auth-message');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  // Create success message element
  const successElement = document.createElement('div');
  successElement.className = 'auth-message success';
  successElement.textContent = message;
  
  // Find the form element and replace it with success message
  const form = document.querySelector('.auth-card form');
  if (form) {
    form.innerHTML = '';
    form.appendChild(successElement);
  }
}