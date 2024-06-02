import * as selectors from "../support/contactDetailsSelectors";
import {faker} from "@faker-js/faker";
import {ContactDetails, UserDetails} from "../support/types";


const assertEditContact = (contactDetails: any, missingFields: string[] = []) => {

    if (missingFields.indexOf('firstName') === -1) {
        cy.getById(selectors.INPUT_FIRSTNAME).should('contain.text', contactDetails.firstName);
    }
    if (missingFields.indexOf('lastName') === -1) {
        cy.getById(selectors.INPUT_LASTNAME).should('contain.text', contactDetails.lastName);
    }
    if (missingFields.indexOf('email') === -1) {
        cy.getById(selectors.INPUT_EMAIL).should('contain.text', contactDetails.email.toLowerCase());
    }
    if (missingFields.indexOf('birthdate') === -1) {
        cy.getById(selectors.INPUT_BIRTHDATE).should('contain.text', contactDetails.birthdate);
    }
    if (missingFields.indexOf('street2') === -1) {
        cy.getById(selectors.INPUT_ADDRESS_2).should('contain.text', contactDetails.street2);
    }
    if (missingFields.indexOf('stateProvince') === -1) {
        cy.getById(selectors.INPUT_STATE).should('contain.text', contactDetails.stateProvince);
    }
};
describe('Contact List page', () => {
    it('Edit Contact', () => {
        cy.intercept('PUT','**/contacts/**').as('contactUpdated');
        cy.intercept('GET','**/contacts/**').as('getEditContact');
        const contactDetails: ContactDetails = {
            firstName: faker.person.firstName(),
            lastName: faker.person.firstName(),
            email: faker.internet.email(),
            birthdate: faker.date.birthdate().toISOString().slice(0,10),
        };

        cy.loginViaAPI("/contactList").then((token) => {
            cy.createContact(contactDetails, token).then((xhr) => {
                expect(xhr.status).to.equal(201);
            });
        });
        const editedContacts: ContactDetails = {
            firstName: faker.person.firstName(),
            lastName: faker.person.firstName(),
            email: faker.internet.email(),
            birthdate: faker.date.birthdate().toISOString().slice(0,10),
            street2: faker.location.streetAddress(),
            stateProvince: faker.location.state(),
        };
        cy.reload()
        cy.getById('myTable').find('.contactTableBodyRow').children().eq(1).click()
        cy.url().should('contain', '/contactDetails')
        assertEditContact(contactDetails, ['street2', 'stateProvince'])
        cy.getById(selectors.EDIT_CONTACT_BUTTON).should('be.visible').click()
        cy.url().should('contain', '/editContact')
        cy.wait('@getEditContact')
        cy.wait(500)
        cy.getById(selectors.INPUT_FIRSTNAME).clear().type(editedContacts.firstName)
        cy.getById(selectors.INPUT_LASTNAME).clear().type(editedContacts.lastName)
        cy.getById(selectors.INPUT_EMAIL).clear().type(editedContacts.email)
        cy.getById(selectors.INPUT_BIRTHDATE).clear().type(editedContacts.birthdate)
        cy.getById(selectors.INPUT_ADDRESS_2).clear().type(editedContacts.street2)
        cy.getById(selectors.INPUT_STATE).clear().type(editedContacts.stateProvince)
        cy.getById(selectors.SUBMIT_BUTTON).should('be.visible').click()
        cy.wait('@contactUpdated').then(xhr => {
            const responseBody = xhr.response.body;
            expect(xhr.response.statusCode).to.equal(200);
            expect(responseBody).to.have.property('_id').that.is.not.empty;
            expect(responseBody.firstName).to.equal(editedContacts.firstName);
            expect(responseBody.lastName).to.equal(editedContacts.lastName);
            expect(responseBody.email).to.equal(editedContacts.email.toLowerCase());
            expect(responseBody.birthdate).to.equal(editedContacts.birthdate);
            expect(responseBody.street2).to.equal(editedContacts.street2);
            expect(responseBody.stateProvince).to.equal(editedContacts.stateProvince);
        });
        assertEditContact(editedContacts)
    });

    it('Remove Contact', () => {
        cy.intercept('DELETE','**/contacts/**').as('contactDeleted');
        const contactDetails: ContactDetails = {
            firstName: faker.person.firstName(),
            lastName: faker.person.firstName(),
            email: faker.internet.email(),
            birthdate: faker.date.birthdate().toISOString().slice(0,10),
        };

        cy.loginViaAPI("/contactList").then((token) => {
            cy.createContact(contactDetails, token).then((xhr) => {
                expect(xhr.status).to.equal(201);
            });
        });
        cy.reload()
        cy.getById('myTable').find('.contactTableBodyRow').children().eq(1).click()
        cy.url().should('contain', '/contactDetails')
        cy.getById(selectors.DELETE_CONTACT_BUTTON).should('be.visible').click()
        cy.wait('@contactDeleted')
        cy.getById('myTable').should('not.exist')
    });

    it('Return to Contact List', () => {
        const contactDetails: ContactDetails = {
            firstName: faker.person.firstName(),
            lastName: faker.person.firstName(),
            email: faker.internet.email(),
            birthdate: faker.date.birthdate().toISOString().slice(0,10),
        };

        cy.loginViaAPI("/contactList").then((token) => {
            cy.createContact(contactDetails, token).then((xhr) => {
                expect(xhr.status).to.equal(201);
            });
        });
        cy.reload()
        cy.getById('myTable').find('.contactTableBodyRow').children().eq(1).click()
        cy.url().should('contain', '/contactDetails')
        cy.getById(selectors.RETURN_BUTTON).should('be.visible').click()
        cy.url().should('contain', '/contactList')
        cy.getById('myTable').find('.contactTableBodyRow').each(($row, index, $rows) => {
            cy.wrap($row).find('td').then(($tds) => {
                expect($tds.eq(1).text()).to.equal(contactDetails.firstName + ' ' + contactDetails.lastName);
                expect($tds.eq(2).text()).to.equal(contactDetails.birthdate);
                expect($tds.eq(3).text()).to.equal(contactDetails.email.toLowerCase());
            });
        });
    });
});
