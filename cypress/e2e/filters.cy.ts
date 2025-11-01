describe('Filter and Search Flow', () => {
  beforeEach(() => {
    // Clear state and create a fresh user
    cy.clearLocalStorage();
    cy.clearCookies();
    
    // Register and login
    const timestamp = Date.now();
    const email = `filtertest${timestamp}@example.com`;
    
    cy.visit('/register');
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').first().type('password123');
    cy.get('input[type="password"]').last().type('password123');
    cy.get('button[type="submit"]').click();
    
    cy.url().should('eq', 'http://localhost:5173/');
    
    // Create sample tasks with different properties
    const tasks = [
      { title: 'Work Meeting', category: 'Work', priority: 'High' },
      { title: 'Buy Groceries', category: 'Shopping', priority: 'Low' },
      { title: 'Gym Workout', category: 'Personal', priority: 'Medium' },
      { title: 'Project Review', category: 'Work', priority: 'High' },
      { title: 'Doctor Appointment', category: 'Personal', priority: 'High' },
    ];
    
    tasks.forEach((task, index) => {
      cy.contains('button', /Add Task/i).click();
      cy.wait(500);
      
      // Get and fill title field
      cy.get('form[aria-label="New task form"]').should('be.visible');
      cy.get('#task-title', { timeout: 10000 }).should('be.visible').clear().type(task.title, { delay: 0 });
      
      // Get and fill description field
      cy.get('#task-description').should('be.visible').clear().type(`${task.title} description long enough`, { delay: 0 });
      
      // Select category and priority
      cy.get('#task-category').select(task.category);
      cy.get('#task-priority').select(task.priority);
      cy.get('#task-duedate').clear().type('2025-12-31');
      
      // Submit form
      cy.contains('button', 'Create Task').click();
      
      // Wait for task to appear and form to close
      cy.contains(task.title, { timeout: 10000 }).should('be.visible');
      cy.get('form[aria-label="New task form"]').should('not.exist');
      
      // Wait between tasks for Firebase sync
      if (index < tasks.length - 1) {
        cy.wait(2000);
      }
    });
    
    cy.wait(2000);
  });

  describe('Category Filter', () => {
    it('should display all tasks when "All Categories" is selected', () => {
      cy.get('select[aria-label="Filter tasks by category"]').select('All Categories');
      
      cy.contains('Work Meeting').should('be.visible');
      cy.contains('Buy Groceries').should('be.visible');
      cy.contains('Gym Workout').should('be.visible');
      cy.contains('Project Review').should('be.visible');
      cy.contains('Doctor Appointment').should('be.visible');
    });

    it('should filter tasks by Work category', () => {
      cy.get('select[aria-label="Filter tasks by category"]').select('Work');
      
      cy.contains('Work Meeting').should('be.visible');
      cy.contains('Project Review').should('be.visible');
      
      cy.contains('Buy Groceries').should('not.exist');
      cy.contains('Gym Workout').should('not.exist');
      cy.contains('Doctor Appointment').should('not.exist');
    });

    it('should filter tasks by Personal category', () => {
      cy.get('select[aria-label="Filter tasks by category"]').select('Personal');
      
      cy.contains('Gym Workout').should('be.visible');
      cy.contains('Doctor Appointment').should('be.visible');
      
      cy.contains('Work Meeting').should('not.exist');
      cy.contains('Buy Groceries').should('not.exist');
      cy.contains('Project Review').should('not.exist');
    });

    it('should filter tasks by Shopping category', () => {
      cy.get('select[aria-label="Filter tasks by category"]').select('Shopping');
      
      cy.contains('Buy Groceries').should('be.visible');
      
      cy.contains('Work Meeting').should('not.exist');
      cy.contains('Gym Workout').should('not.exist');
      cy.contains('Project Review').should('not.exist');
      cy.contains('Doctor Appointment').should('not.exist');
    });
  });

  describe('Priority Filter', () => {
    it('should display all tasks when "All Priorities" is selected', () => {
      cy.get('select[aria-label="Filter tasks by priority level"]').select('All Priorities');
      
      cy.contains('Work Meeting').should('be.visible');
      cy.contains('Buy Groceries').should('be.visible');
      cy.contains('Gym Workout').should('be.visible');
      cy.contains('Project Review').should('be.visible');
      cy.contains('Doctor Appointment').should('be.visible');
    });

    it('should filter tasks by High priority', () => {
      cy.get('select[aria-label="Filter tasks by priority level"]').select('High');
      
      cy.contains('Work Meeting').should('be.visible');
      cy.contains('Project Review').should('be.visible');
      cy.contains('Doctor Appointment').should('be.visible');
      
      cy.contains('Buy Groceries').should('not.exist');
      cy.contains('Gym Workout').should('not.exist');
    });

    it('should filter tasks by Medium priority', () => {
      cy.get('select[aria-label="Filter tasks by priority level"]').select('Medium');
      
      cy.contains('Gym Workout').should('be.visible');
      
      cy.contains('Work Meeting').should('not.exist');
      cy.contains('Buy Groceries').should('not.exist');
      cy.contains('Project Review').should('not.exist');
      cy.contains('Doctor Appointment').should('not.exist');
    });

    it('should filter tasks by Low priority', () => {
      cy.get('select[aria-label="Filter tasks by priority level"]').select('Low');
      
      cy.contains('Buy Groceries').should('be.visible');
      
      cy.contains('Work Meeting').should('not.exist');
      cy.contains('Gym Workout').should('not.exist');
      cy.contains('Project Review').should('not.exist');
      cy.contains('Doctor Appointment').should('not.exist');
    });
  });

  describe('Completion Status Filter', () => {
    beforeEach(() => {
      // Mark some tasks as complete using toggle button
      cy.contains('Work Meeting').parents('[role="article"]').within(() => {
        cy.contains('button', '✓ Complete').click();
      });
      cy.wait(500);
      
      cy.contains('Buy Groceries').parents('[role="article"]').within(() => {
        cy.contains('button', '✓ Complete').click();
      });
      cy.wait(500);
    });

    it('should display all tasks when "All Tasks" status is selected', () => {
      cy.get('select[aria-label="Filter tasks by completion status"]').select('All Tasks');
      
      cy.contains('Work Meeting').should('be.visible');
      cy.contains('Buy Groceries').should('be.visible');
      cy.contains('Gym Workout').should('be.visible');
    });

    it('should filter to show only active tasks', () => {
      cy.get('select[aria-label="Filter tasks by completion status"]').select('Active');
      
      cy.contains('Gym Workout').should('be.visible');
      cy.contains('Project Review').should('be.visible');
      cy.contains('Doctor Appointment').should('be.visible');
      
      // Completed tasks should not be visible
      cy.contains('Work Meeting').should('not.exist');
      cy.contains('Buy Groceries').should('not.exist');
    });

    it('should filter to show only completed tasks', () => {
      cy.get('select[aria-label="Filter tasks by completion status"]').select('Completed');
      
      cy.contains('Work Meeting').should('be.visible');
      cy.contains('Buy Groceries').should('be.visible');
      
      // Active tasks should not be visible
      cy.contains('Gym Workout').should('not.exist');
      cy.contains('Project Review').should('not.exist');
      cy.contains('Doctor Appointment').should('not.exist');
    });
  });

  describe('Search Functionality', () => {
    it('should filter tasks by search query', () => {
      cy.get('input[placeholder*="Search"]').type('Work');
      
      // Should match tasks with "Work" in title or description
      cy.contains('Work Meeting').should('be.visible');
      cy.contains('Gym Workout').should('be.visible'); // Contains "Work"
      
      // Should not show tasks without "Work" in title or description
      cy.contains('Buy Groceries').should('not.exist');
      cy.contains('Doctor Appointment').should('not.exist');
      cy.contains('Project Review').should('not.exist');
    });

    it('should show all tasks when search is cleared', () => {
      cy.get('input[placeholder*="Search"]').type('Meeting');
      cy.contains('Work Meeting').should('be.visible');
      cy.contains('Buy Groceries').should('not.exist');
      
      cy.get('input[placeholder*="Search"]').clear();
      
      cy.contains('Work Meeting').should('be.visible');
      cy.contains('Buy Groceries').should('be.visible');
      cy.contains('Gym Workout').should('be.visible');
    });

    it('should show empty state when no tasks match search', () => {
      cy.get('input[placeholder*="Search"]').type('NonexistentTask');
      
      cy.contains(/no tasks found|no results/i).should('be.visible');
    });
  });

  describe('Combined Filters', () => {
    it('should apply multiple filters together', () => {
      // Filter by Work category AND High priority
      cy.get('select[aria-label="Filter tasks by category"]').select('Work');
      cy.get('select[aria-label="Filter tasks by priority level"]').select('High');
      
      cy.contains('Work Meeting').should('be.visible');
      cy.contains('Project Review').should('be.visible');
      
      // Other tasks should not be visible
      cy.contains('Buy Groceries').should('not.exist');
      cy.contains('Gym Workout').should('not.exist');
      cy.contains('Doctor Appointment').should('not.exist');
    });

    it('should combine search with category filter', () => {
      cy.get('select[aria-label="Filter tasks by category"]').select('Personal');
      cy.get('input[placeholder*="Search"]').type('Gym');
      
      cy.contains('Gym Workout').should('be.visible');
      cy.contains('Doctor Appointment').should('not.exist');
    });

    it('should combine all filters: category, priority, and search', () => {
      cy.get('select[aria-label="Filter tasks by category"]').select('Work');
      cy.get('select[aria-label="Filter tasks by priority level"]').select('High');
      cy.get('input[placeholder*="Search"]').type('Meeting');
      
      cy.contains('Work Meeting').should('be.visible');
      cy.contains('Project Review').should('not.exist');
    });
  });
});
