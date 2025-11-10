describe('Task Management Flow', () => {
  beforeEach(() => {
    // Clear state and create a fresh user for each test
    cy.clearLocalStorage();
    cy.clearCookies();
    
    // Register and login
    const timestamp = Date.now();
    const email = `tasktest${timestamp}@example.com`;
    
    cy.visit('/register');
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').first().type('password123');
    cy.get('input[type="password"]').last().type('password123');
    cy.get('button[type="submit"]').click();
    
    // Wait for redirect to home page
    cy.url().should('eq', 'http://localhost:5173/');
  });

  describe('Create Task', () => {
    it('should show validation error for empty title', () => {
      cy.contains('button', /Add Task/i).click();
      cy.get('form[aria-label="New task form"]').should('be.visible').within(() => {
        cy.get('#task-title', { timeout: 10000 }).should('be.visible');
        cy.contains('button', 'Create Task').click();
        cy.get('#title-error').should('contain.text', 'Title is required');
      });
    });

    it('should successfully create a new task', () => {
      cy.contains('button', /Add Task/i).click();
      cy.get('form[aria-label="New task form"]').should('be.visible').within(() => {
        cy.get('#task-title', { timeout: 10000 }).type('Test Task');
        cy.get('#task-description').type('This is a test task description');
        cy.get('#task-category').select('Work');
        cy.get('#task-priority').select('High');
        cy.get('#task-duedate').type('2025-12-31');
        cy.contains('button', 'Create Task').click();
      });
      
      // Task should appear in the list
      cy.contains('Test Task', { timeout: 10000 }).should('be.visible');
      cy.contains('This is a test task description').should('be.visible');
      cy.contains('Work').should('be.visible');
      cy.contains('HIGH').should('be.visible');
      
      // Success notification
      cy.contains(/created successfully/i, { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Read/Display Tasks', () => {
    it('should display empty state when no tasks exist', () => {
      cy.contains(/no tasks|get started|create your first task/i).should('be.visible');
    });

    it('should display task list with multiple tasks', () => {
      // Create first task (fill required fields)
      cy.contains('button', /Add Task/i).click();
      cy.wait(500);
      cy.get('form[aria-label="New task form"]').should('be.visible');
      cy.get('#task-title', { timeout: 10000 }).should('be.visible').clear().type('First Task', { delay: 0 });
      cy.get('#task-description').should('be.visible').clear().type('First task long description', { delay: 0 });
      cy.get('#task-duedate').clear().type('2025-12-31');
      cy.contains('button', 'Create Task').click();
      
      cy.contains('First Task', { timeout: 10000 }).should('be.visible');
      cy.get('form[aria-label="New task form"]').should('not.exist');
      
      // Wait for Firebase sync
      cy.wait(2000);
      
      // Create second task
      cy.contains('button', /Add Task/i).click();
      cy.wait(500);
      cy.get('form[aria-label="New task form"]').should('be.visible');
      cy.get('#task-title', { timeout: 10000 }).should('be.visible').clear().type('Second Task', { delay: 0 });
      cy.get('#task-description').should('be.visible').clear().type('Second task long description', { delay: 0 });
      cy.get('#task-duedate').clear().type('2025-12-31');
      cy.contains('button', 'Create Task').click();
      
      cy.contains('Second Task', { timeout: 10000 }).should('be.visible');
      cy.get('form[aria-label="New task form"]').should('not.exist');
      
      // Both tasks should be visible
      cy.contains('First Task').should('be.visible');
      cy.contains('Second Task').should('be.visible');
    });
  });

  describe('Update Task', () => {
    beforeEach(() => {
      // Create a task to edit (fill required fields)
      cy.contains('button', /Add Task/i).click();
      cy.get('form[aria-label="New task form"]').should('be.visible').within(() => {
        cy.get('#task-title', { timeout: 10000 }).type('Task to Edit');
        cy.get('#task-description').type('Original description long');
        cy.get('#task-category').select('Personal');
        cy.get('#task-duedate').type('2025-12-31');
        cy.contains('button', 'Create Task').click();
      });
      cy.contains('Task to Edit', { timeout: 10000 }).should('be.visible');
      cy.wait(2000);
    });

    it('should open edit form when Edit button is clicked', () => {
      cy.contains('Task to Edit').parent().parent().within(() => {
        cy.contains('button', 'Edit').click();
      });
      
    cy.get('input[aria-label="Task title"]').should('have.value', 'Task to Edit');
    cy.get('textarea[aria-label="Task description"]').should('have.value', 'Original description long');
    });

    it('should successfully update a task', () => {
      cy.contains('Task to Edit').parent().parent().within(() => {
        cy.contains('button', 'Edit').click();
      });
      
    cy.get('input[aria-label="Task title"]').clear().type('Updated Task Title');
    cy.get('textarea[aria-label="Task description"]').clear().type('Updated description that is long');
    cy.get('select[aria-label="Task priority"]').select('Medium');
      
      cy.contains('button', 'Save').click();
      
      // Updated content should appear
      cy.contains('Updated Task Title').should('be.visible');
  cy.contains('Updated description').should('be.visible');
  cy.contains('Personal').should('be.visible');
  cy.contains(/MEDIUM/i).should('be.visible');
      
      // Success notification
      cy.contains(/updated|saved/i, { timeout: 5000 }).should('be.visible');
    });

    it('should cancel task editing', () => {
      cy.contains('Task to Edit').parent().parent().within(() => {
        cy.contains('button', 'Edit').click();
      });
      
  cy.get('input[aria-label="Task title"]').clear().type('This should not save');
      cy.contains('button', 'Cancel').click();
      
      // Original title should still be visible
      cy.contains('Task to Edit').should('be.visible');
      cy.contains('This should not save').should('not.exist');
    });
  });

  describe('Toggle Task Completion', () => {
    beforeEach(() => {
      // Create a task to toggle (fill required fields)
      cy.contains('button', /Add Task/i).click();
      cy.get('form[aria-label="New task form"]').should('be.visible').within(() => {
        cy.get('#task-title', { timeout: 10000 }).type('Task to Complete');
        cy.get('#task-description').type('Toggle this completion task');
        cy.get('#task-duedate').type('2025-12-31');
        cy.contains('button', 'Create Task').click();
      });
      cy.contains('Task to Complete', { timeout: 10000 }).should('be.visible');
      cy.wait(2000);
    });

    it('should mark task as complete', () => {
      cy.contains('Task to Complete').parents('[role="article"]').within(() => {
        cy.contains('button', '✓ Complete').click();
      });
      // Button should switch to Undo and success notification shows
      cy.contains('Task to Complete').parents('[role="article"]').within(() => {
        cy.contains('button', '↩ Undo', { timeout: 5000 }).should('be.visible');
      });
      cy.contains(/completed/i, { timeout: 5000 }).should('be.visible');
    });

    it('should mark task as incomplete', () => {
      // First complete it
      cy.contains('Task to Complete').parents('[role="article"]').within(() => {
        cy.contains('button', '✓ Complete').click();
      });
      cy.contains('Task to Complete').parents('[role="article"]').within(() => {
        cy.contains('button', '↩ Undo', { timeout: 5000 }).click();
      });
      cy.contains(/incomplete/i, { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Delete Task', () => {
    beforeEach(() => {
      // Create a task to delete (fill required fields)
      cy.contains('button', /Add Task/i).click();
      cy.get('#task-title', { timeout: 10000 }).type('Task to Delete');
      cy.get('#task-description').type('Task that will be deleted');
      cy.get('#task-duedate').type('2025-12-31');
      cy.contains('button', 'Create Task').click();
      cy.contains('Task to Delete', { timeout: 10000 }).should('be.visible');
      cy.wait(2000);
    });

    it('should show confirmation modal when Delete is clicked', () => {
      cy.contains('Task to Delete').parent().parent().within(() => {
        cy.contains('button', 'Delete').click();
      });
      
  cy.contains(/are you sure|logout|delete/i).should('be.visible');
  cy.contains('button', 'Delete').should('be.visible');
  cy.contains('button', 'Cancel').should('be.visible');
    });

    it('should successfully delete a task when confirmed', () => {
      cy.contains('Task to Delete').parent().parent().within(() => {
        cy.contains('button', 'Delete').click();
      });
      
        cy.get('[role="dialog"]').should('be.visible').within(() => {
          cy.contains('button', 'Delete').click();
        });
      
      // Task should be removed
      cy.contains('Task to Delete').should('not.exist');
      
      // Success notification
  cy.contains(/deleted/i, { timeout: 5000 }).should('be.visible');
    });

    it('should cancel task deletion', () => {
      cy.contains('Task to Delete').parent().parent().within(() => {
        cy.contains('button', 'Delete').click();
      });
      
  cy.contains('button', 'Cancel').click();
      
      // Task should still be visible
      cy.contains('Task to Delete').should('be.visible');
    });
  });
});
