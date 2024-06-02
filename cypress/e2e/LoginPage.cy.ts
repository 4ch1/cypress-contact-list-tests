import * as selectors from "../support/loginSelectors";
import { faker } from '@faker-js/faker';
import { UserDetails } from "../support/types";



describe('Login page', () => {
    it('Successful Login', () => {
        cy.intercept('**/users/login').as('loggedIn');
        const userDetails: UserDetails = {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            password: faker.internet.password()
        };

        cy.createUser(userDetails).then((xhr) => {
            expect(xhr.status).to.equal(201);
        });
        cy.visit('/')
        cy.getById(selectors.INPUT_EMAIL).clear().type(userDetails.email)
        cy.getById(selectors.INPUT_PASSWORD).clear().type(userDetails.password)
        cy.getById(selectors.SUBMIT_BUTTON).should('be.visible').click()
        cy.wait('@loggedIn').then(xhr => {
            expect(xhr.response.statusCode).to.equal(200);

        });
        cy.url().should('contain', '/contactList');
    });
    it('Login with Incorrect Password', () => {
        cy.intercept('**/users/login').as('loggedIn');
        const userDetails: UserDetails = {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            password: faker.internet.password()
        };

        cy.createUser(userDetails).then((xhr) => {
            expect(xhr.status).to.equal(201);
        });
        cy.visit('/')
        cy.getById(selectors.INPUT_EMAIL).clear().type(userDetails.email)
        cy.getById(selectors.INPUT_PASSWORD).clear().type(`${userDetails.password}d`)
        cy.getById(selectors.SUBMIT_BUTTON).should('be.visible').click()
        cy.fixture('errorMessages').then((signUpData) => {
            cy.getById(selectors.ERROR_MESSAGE).should('contain.text', signUpData.loginErrorMessage.wrongData);
        });
    });
});
