declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to press a key on the active element.
     * @example cy.pressKey("Enter")
     */
    pressKey: (val: string) => void;

    /**
     * Custom command to release a key on the active element.
     * @example cy.releaseKey("Enter")
     */
    releaseKey: (val: string) => void;
  }
}
