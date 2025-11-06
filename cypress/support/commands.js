// Custom Cypress commands for lineup builder testing

Cypress.Commands.add('visitLineupBuilder', () => {
  cy.visit('/lineup');
});

Cypress.Commands.add('selectFormation', (formationCode) => {
  cy.get('select[data-testid="formation-picker"]').select(formationCode);
});

Cypress.Commands.add('doubleClickPlayer', (playerName) => {
  cy.contains('[data-testid="available-player-card"]', playerName).dblclick();
});

Cypress.Commands.add('getSaveButton', () => {
  cy.contains('button', /Save Lineup|Save Changes/);
});

Cypress.Commands.add('getToast', () => {
  cy.get('.fixed.top-4.right-4 > div').first();
});
