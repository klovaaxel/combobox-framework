/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })

Cypress.Commands.add("pressKey", (val) => {
    const element = document.activeElement ?? document;
    element.dispatchEvent(new KeyboardEvent("keydown", { key: val }));
});

Cypress.Commands.add("releaseKey", (val) => {
    const element = document.activeElement ?? document;
    element.dispatchEvent(new KeyboardEvent("keyup", { key: val }));
});
