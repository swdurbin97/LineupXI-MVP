// Import commands
import './commands';

// Disable uncaught exception handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Return false to prevent failing the test
  return false;
});
