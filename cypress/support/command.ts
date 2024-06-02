/// <reference types="cypress" />
import { UserDetails, ContactDetails } from './types';
import {faker} from "@faker-js/faker";
Cypress.Commands.add('getById', (selector) => {
    return cy.get(`[id=${selector}]`)
})

Cypress.Commands.add('createUser', (userDetails: UserDetails) => {
    return cy.request({
        method: 'POST',
        url: `${Cypress.config('baseUrl')}/users`,
        headers: {
            'Content-Type': 'application/json',
        },
        body: userDetails
    })
});

Cypress.Commands.add('loginViaAPI', (url: string) => {
    const email = faker.internet.email();
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const password = faker.internet.password();
    const userDetails: UserDetails = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password
    };
    // Returning the promise chain
    return cy.createUser(userDetails).then((response) => {
        expect(response.status).to.equal(201);
        const token = response.body.token;
        // Setting the cookie
        cy.setCookie('token', token);
        cy.getCookie('token').should('have.property', 'value', token);
        // Visiting the URL after setting the cookie
        return cy.visit(url).then(() => {
            // Return the token for further chaining
            return token;
        });
    });
});

Cypress.Commands.add('createContact', (contactDetails: ContactDetails, token: string) => {
    return cy.request({
        method: 'POST',
        url: `${Cypress.config('baseUrl')}/contacts`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: contactDetails
    })
});