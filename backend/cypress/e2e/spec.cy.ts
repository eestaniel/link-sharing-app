// npx cypress run
// get environment variables
/// <reference types="cypress" />

describe('Authentication E2E Tests', () => {
  Cypress.on("uncaught:exception", (err) => {
    // Cypress and React Hydrating the document don't get along
    // for some unknown reason. Hopefully, we figure out why eventually
    // so we can remove this.
    // https://github.com/remix-run/remix/issues/4822#issuecomment-1679195650
    // https://github.com/cypress-io/cypress/issues/27204
    if (
        /hydrat/i.test(err.message) ||
        /Minified React error #418/.test(err.message) ||
        /Minified React error #423/.test(err.message)
    ) {
      return false
    }
  });

  let token: string;

  // This runs before each test
  beforeEach(() => {
    // This runs before each test
    cy.visit('http://localhost:5173'); // Replace with the URL of your app
  });


  it('Verify Login Page', () => {
    // visit the app and check if the title is correct
    // check if the title is correct
    cy.get('h1').contains('Login');

    // assert that the login form is present
    cy.get('form').should('be.visible');
  })

  it('Login with test credentials', () => {
    // input test credentials and submit the form
    const email = Cypress.env('TEST_EMAIL');
    const password = Cypress.env('TEST_PASSWORD');

    // focus email input and type email
    cy.get('input[name="email"]').should('be.visible').focus().type(email);
    cy.get('input[name="password"]').should('be.visible').focus().type(password);
    cy.get('button[type="submit"]').click();

    // check if the user is redirected to the dashboard
    cy.url().should('include', '/dashboard');

    // get cookie and store it to use in the next test
    cy.getCookie('token').then((cookie) => {
      token = cookie.value;
    });

    // check if button to sign out is present
    cy.get('button').contains('Sign Out').should('be.visible');
  })
  it('Sign out properly', () => {
    cy.setCookie('token', token);
    cy.visit('http://localhost:5173/dashboard');

    // sign-out and verify that the user is redirected to the login page localhost:5173
    cy.get('button').contains('Sign Out').click();
    cy.url().should('eq', 'http://localhost:5173/');
  })
})