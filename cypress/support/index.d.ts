declare namespace Cypress {
    interface Chainable {
        /**
         * Custom command to press a key on the active element.
         * @example cy.pressKey("Enter")
         */
        pressKey: (val: string) => void;
    }
}
