import * as selectors from "../support/contactListSelectors";
import {faker} from "@faker-js/faker";
import {ContactDetails, UserDetails} from "../support/types";


const assertErrorMessages = (errorMessages: any, missingFields: string[] = []) => {
    cy.getById(selectors.ERROR_MESSAGE).should('be.visible').and('contain.text', errorMessages.common);

    if (missingFields.indexOf('firstName') === -1) {
        cy.getById(selectors.ERROR_MESSAGE).should('contain.text', errorMessages.firstName);
    }
    if (missingFields.indexOf('lastName') === -1) {
        cy.getById(selectors.ERROR_MESSAGE).should('contain.text', errorMessages.lastName);
    }
};
describe('Contact List page', () => {
    it('Add new contact with valid data', () => {
        cy.intercept('POST','**/contacts').as('contactCreated');
        const contactDetails: ContactDetails = {
            firstName: faker.person.firstName(),
            lastName: faker.person.firstName(),
            email: faker.internet.email(),
            birthdate: faker.date.birthdate().toISOString().slice(0,10),
            phone: faker.phone.number("##########"),
            street1: faker.location.streetAddress(),
            street2: faker.location.streetAddress(),
            stateProvince: faker.location.state(),
            city: faker.location.city(),
            postalCode: faker.location.zipCode(),
            country: faker.location.country()
        };

        cy.loginViaAPI("/contactList")
        cy.getById(selectors.ADD_NEW_CONTACT_BUTTON).should('be.visible').click()
        cy.getById(selectors.INPUT_FIRSTNAME).clear().type(contactDetails.firstName)
        cy.getById(selectors.INPUT_LASTNAME).clear().type(contactDetails.lastName)
        cy.getById(selectors.INPUT_EMAIL).clear().type(contactDetails.email)
        cy.getById(selectors.INPUT_BIRTHDATE).clear().type(contactDetails.birthdate)
        cy.getById(selectors.INPUT_PHONE).clear().type(contactDetails.phone)
        cy.getById(selectors.INPUT_ADDRESS_1).clear().type(contactDetails.street1)
        cy.getById(selectors.INPUT_ADDRESS_2).clear().type(contactDetails.street2)
        cy.getById(selectors.INPUT_STATE).clear().type(contactDetails.stateProvince)
        cy.getById(selectors.INPUT_CITY).clear().type(contactDetails.city)
        cy.getById(selectors.INPUT_POSTAL_CODE).clear().type(contactDetails.postalCode)
        cy.getById(selectors.INPUT_COUNTRY).clear().type(contactDetails.country)
        cy.getById(selectors.SUBMIT_BUTTON).should('be.visible').click()

        cy.wait('@contactCreated').then(xhr => {
            const responseBody = xhr.response.body;
            expect(xhr.response.statusCode).to.equal(201);
            expect(responseBody).to.have.property('_id').that.is.not.empty;
            expect(responseBody.firstName).to.equal(contactDetails.firstName);
            expect(responseBody.lastName).to.equal(contactDetails.lastName);
            expect(responseBody.email).to.equal(contactDetails.email.toLowerCase());
            expect(responseBody.birthdate).to.equal(contactDetails.birthdate);
            expect(responseBody.phone).to.equal(contactDetails.phone);
            expect(responseBody.street1).to.equal(contactDetails.street1);
            expect(responseBody.street2).to.equal(contactDetails.street2);
            expect(responseBody.stateProvince).to.equal(contactDetails.stateProvince);
            expect(responseBody.postalCode).to.equal(contactDetails.postalCode);
            expect(responseBody.country).to.equal(contactDetails.country);
            expect(responseBody.city).to.equal(contactDetails.city);
        });
    });

    it('Add new contact empty fields [Negative test case]', () => {
        cy.intercept('POST','**/contacts').as('contactCreated');
        const firstName = faker.person.firstName();
        cy.loginViaAPI("/contactList")
        cy.getById(selectors.ADD_NEW_CONTACT_BUTTON).should('be.visible').click()
        cy.getById(selectors.SUBMIT_BUTTON).should('be.visible').click()
        cy.fixture('errorMessages').then((signUpData) => {
            assertErrorMessages(signUpData.contactListErrorMessage);
        });
        cy.getById(selectors.INPUT_FIRSTNAME).clear().type(firstName)
        cy.getById(selectors.SUBMIT_BUTTON).should('be.visible').click()
        cy.fixture('errorMessages').then((signUpData) => {
            assertErrorMessages(signUpData.contactListErrorMessage, ['firstName']);
        });
    });
    it('Contact List Display', () => {
        cy.intercept('POST','**/contacts').as('contactCreated');
        const contactDetails: ContactDetails = {
            firstName: faker.person.firstName(),
            lastName: faker.person.firstName(),
            email: faker.internet.email(),
            birthdate: faker.date.birthdate().toISOString().slice(0,10),
            phone: faker.phone.number("##########"),
            street1: faker.location.streetAddress(),
            street2: faker.location.streetAddress(),
            stateProvince: faker.location.state(),
            city: faker.location.city(),
            postalCode: faker.location.zipCode(),
            country: faker.location.country()
        };

        cy.loginViaAPI("/contactList").then((token) => {
            cy.createContact(contactDetails, token).then((xhr) => {
                expect(xhr.status).to.equal(201);
            });
        });
        cy.reload()
        cy.getById('myTable').find('.contactTableBodyRow').each(($row, index, $rows) => {
                cy.wrap($row).find('td').then(($tds) => {
                    // Assuming contactDetails is available in the current scope
                    expect($tds.eq(1).text()).to.equal(contactDetails.firstName + ' ' + contactDetails.lastName);
                    expect($tds.eq(2).text()).to.equal(contactDetails.birthdate);
                    expect($tds.eq(3).text()).to.equal(contactDetails.email.toLowerCase());
                    expect($tds.eq(4).text()).to.equal(contactDetails.phone);
                    expect($tds.eq(5).text()).to.equal(contactDetails.street1 + ' ' + contactDetails.street2);
                    expect($tds.eq(6).text()).to.contain(contactDetails.city);
                    expect($tds.eq(6).text()).to.contain(contactDetails.postalCode);
                    expect($tds.eq(6).text()).to.contain(contactDetails.stateProvince);
                    expect($tds.eq(7).text()).to.equal(contactDetails.country);
                });
            });
    });
});
