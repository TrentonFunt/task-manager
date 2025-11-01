describe('Authentication Flow', () => {
  beforeEach(() => {
    // Clear any existing auth state
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('User Registration', () => {
    it('should display registration form', () => {
      cy.visit('/register');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('have.length', 2);
      cy.get('button[type="submit"]').should('contain', 'Register');
    });

    it('should require email and password fields', () => {
      cy.visit('/register');
      
      // Form has required attributes
      cy.get('input[type="email"]').should('have.attr', 'required');
      cy.get('input[type="password"]').first().should('have.attr', 'required');
      cy.get('input[type="password"]').last().should('have.attr', 'required');
    });

    it('should show error for password mismatch', () => {
      cy.visit('/register');
      
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').first().type('password123');
      cy.get('input[type="password"]').last().type('different123');
      cy.get('button[type="submit"]').click();
      
      cy.contains('Passwords do not match').should('be.visible');
    });

    it('should show error for weak password', () => {
      cy.visit('/register');
      
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').first().type('weak');
      cy.get('input[type="password"]').last().type('weak');
      cy.get('button[type="submit"]').click();
      
      cy.contains('Password must be at least 6 characters').should('be.visible');
    });

    it('should successfully register a new user and redirect to tasks', () => {
      const timestamp = Date.now();
      const email = `test${timestamp}@example.com`;
      
      cy.visit('/register');
      
      cy.get('input[type="email"]').type(email);
      cy.get('input[type="password"]').first().type('password123');
      cy.get('input[type="password"]').last().type('password123');
      cy.get('button[type="submit"]').click();
      
      // Should redirect to home page (tasks)
      cy.url().should('eq', 'http://localhost:5173/');
      cy.contains('Task Manager').should('be.visible');
    });
  });

  describe('User Login', () => {
    it('should display login form', () => {
      cy.visit('/login');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('contain', 'Sign In');
    });

    it('should require email and password fields', () => {
      cy.visit('/login');
      
      // Form has required attributes
      cy.get('input[type="email"]').should('have.attr', 'required');
      cy.get('input[type="password"]').should('have.attr', 'required');
    });

    it('should show error for invalid credentials', () => {
      cy.visit('/login');
      
      cy.get('input[type="email"]').type('wrong@example.com');
      cy.get('input[type="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();
      
      cy.contains(/invalid|wrong|incorrect/i, { timeout: 10000 }).should('be.visible');
    });

    it('should successfully login and redirect to tasks', () => {
      // First register a user
      const timestamp = Date.now();
      const email = `logintest${timestamp}@example.com`;
      
      cy.visit('/register');
      cy.get('input[type="email"]').type(email);
      cy.get('input[type="password"]').first().type('password123');
      cy.get('input[type="password"]').last().type('password123');
      cy.get('button[type="submit"]').click();
      
      // Wait for registration and redirect
      cy.url().should('eq', 'http://localhost:5173/');
      
      // Click logout button
      cy.contains('button', 'Logout').click();
      // Confirm logout in modal (button also says "Logout")
      cy.contains('button', 'Logout').last().click({ force: true });
      
  // Now go to the login page explicitly
  cy.visit('/login');
      cy.get('input[type="email"]').type(email);
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      
      // Should be redirected to home page (tasks)
      cy.url().should('eq', 'http://localhost:5173/');
      cy.contains('Task Manager').should('be.visible');
    });
  });

  describe('User Logout', () => {
    it('should logout user and redirect to login', () => {
      // Register and login first
      const timestamp = Date.now();
      const email = `logouttest${timestamp}@example.com`;
      
      cy.visit('/register');
      cy.get('input[type="email"]').type(email);
      cy.get('input[type="password"]').first().type('password123');
      cy.get('input[type="password"]').last().type('password123');
      cy.get('button[type="submit"]').click();
      
      cy.url().should('eq', 'http://localhost:5173/');
      
      // Click logout button
      cy.contains('button', 'Logout').click();
      
      // Confirm logout in modal (button also says "Logout")
      cy.contains('button', 'Logout').last().click({ force: true });
      
      // Navigate to login page explicitly and verify
      cy.visit('/login');
      cy.get('form[aria-label="Login form"]').should('be.visible');
    });

    it('should cancel logout when clicking Stay', () => {
      // Register and login first
      const timestamp = Date.now();
      const email = `logoutcancel${timestamp}@example.com`;
      
      cy.visit('/register');
      cy.get('input[type="email"]').type(email);
      cy.get('input[type="password"]').first().type('password123');
      cy.get('input[type="password"]').last().type('password123');
      cy.get('button[type="submit"]').click();
      
      cy.url().should('eq', 'http://localhost:5173/');
      
      // Click logout button
      cy.contains('button', 'Logout').click();
      
      // Cancel logout (button says "Stay")
      cy.contains('button', 'Stay').click();
      
      // Should stay on home page
      cy.url().should('eq', 'http://localhost:5173/');
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to login when accessing home without authentication', () => {
      // Ensure unauthenticated view is accessible
      cy.clearLocalStorage();
      cy.clearCookies();
      cy.visit('/login');
      cy.get('form[aria-label="Login form"]').should('be.visible');
    });

    it('should stay on login when accessing it while authenticated', () => {
      // Register and login first
      const timestamp = Date.now();
      const email = `protectedroute${timestamp}@example.com`;
      
      cy.visit('/register');
      cy.get('input[type="email"]').type(email);
      cy.get('input[type="password"]').first().type('password123');
      cy.get('input[type="password"]').last().type('password123');
      cy.get('button[type="submit"]').click();
      
      cy.url().should('eq', 'http://localhost:5173/');
      
      // Verify user is on home page and authenticated
      cy.contains('Task Manager').should('be.visible');
    });
  });
});
