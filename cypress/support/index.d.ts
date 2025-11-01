/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login a user
       * @example cy.login('test@example.com', 'password123')
       */
      login(email: string, password: string): Chainable<void>;
      
      /**
       * Custom command to register a new user
       * @example cy.register('test@example.com', 'password123')
       */
      register(email: string, password: string): Chainable<void>;
    }
  }
}

export {};
