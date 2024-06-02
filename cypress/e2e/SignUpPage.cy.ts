import * as selectors from "../support/signupSelectors";
import { faker } from '@faker-js/faker';
import { UserDetails } from "../support/types";

// Helper function to fill the sign-up form
const fillSignUpForm = (firstName: string, lastName: string, email: string, password: string) => {
    cy.getById(selectors.INPUT_FIRSTNAME).clear().type(firstName);
    cy.getById(selectors.INPUT_LASTNAME).clear().type(lastName);
    cy.getById(selectors.INPUT_EMAIL).clear().type(email);
    cy.getById(selectors.INPUT_PASSWORD).clear().type(password);
};

// Helper function to visit sign-up page
const visitSignUpPage = () => {
    cy.visit('https://thinking-tester-contact-list.herokuapp.com/');
    cy.getById(selectors.SIGNUP_BUTTON).should('be.visible').click();
    cy.url().should('contain', '/addUser');
};

const assertErrorMessages = (errorMessages: any, missingFields: string[] = []) => {
    cy.getById(selectors.ERROR_MESSAGE).should('be.visible').and('contain.text', errorMessages.common);

    if (missingFields.indexOf('firstName') === -1) {
        cy.getById(selectors.ERROR_MESSAGE).should('contain.text', errorMessages.firstName);
    }
    if (missingFields.indexOf('lastName') === -1) {
        cy.getById(selectors.ERROR_MESSAGE).should('contain.text', errorMessages.lastName);
    }
    if (missingFields.indexOf('email') === -1) {
        cy.getById(selectors.ERROR_MESSAGE).should('contain.text', errorMessages.email);
    }
    if (missingFields.indexOf('password') === -1) {
        cy.getById(selectors.ERROR_MESSAGE).should('contain.text', errorMessages.password);
    }
};

describe('Sign Up page', () => {
    it('Successfully sign up', () => {
        cy.intercept('**/users').as('userCreated');

        const userDetails: UserDetails = {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            password: faker.internet.password()
        };

        visitSignUpPage();
        fillSignUpForm(userDetails.firstName, userDetails.lastName, userDetails.email, userDetails.password);
        cy.getById(selectors.SUBMIT_BUTTON).should('be.visible').click();

        cy.wait('@userCreated').then(xhr => {
            const responseBody = xhr.response.body;
            const user = responseBody.user;
            const token = responseBody.token;

            expect(xhr.response.statusCode).to.equal(201);
            expect(user).to.have.property('_id').that.is.not.empty;
            expect(user.firstName).to.equal(userDetails.firstName);
            expect(user.lastName).to.equal(userDetails.lastName);
            expect(user.email).to.equal(userDetails.email.toLowerCase());
            expect(token).to.not.be.empty;
        });

        cy.url().should('contain', '/contactList');
    });

    it('Sign Up with Empty Fields [Negative test case]', () => {

        visitSignUpPage();
        cy.getById(selectors.SUBMIT_BUTTON).should('be.visible').click();

        cy.fixture('errorMessages').then((signUpData) => {
            assertErrorMessages(signUpData.signupErrorMessage);
        });

        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();

        cy.getById(selectors.INPUT_FIRSTNAME).clear().type(firstName);
        cy.getById(selectors.INPUT_LASTNAME).clear().type(lastName);
        cy.getById(selectors.SUBMIT_BUTTON).should('be.visible').click();

        cy.fixture('errorMessages').then((signUpData) => {
            assertErrorMessages(signUpData.signupErrorMessage, ['firstName', 'lastName']);
        });
    });

    it('Sign Up with Existing Email [Negative test case]', () => {

        visitSignUpPage();

        const userDetails: UserDetails = {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            password: faker.internet.password()
        };

        cy.createUser(userDetails).then((xhr) => {
            expect(xhr.status).to.equal(201);
        });

        fillSignUpForm(userDetails.firstName, userDetails.lastName, userDetails.email, userDetails.password);
        cy.getById(selectors.SUBMIT_BUTTON).should('be.visible').click();

        cy.fixture('errorMessages').then((signUpData) => {
            cy.getById(selectors.ERROR_MESSAGE).should('contain.text', signUpData.signupErrorMessage.emailInUse);
        });

    });
});
