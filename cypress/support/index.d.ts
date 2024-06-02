// cypress/support/index.d.ts

/// <reference types="cypress" />

import {ContactDetails, UserDetails} from './types';

declare global {
    namespace Cypress {
        interface Chainable<Subject = any> {

            getById(id: string): Chainable<JQuery<HTMLElement>>;


            createUser(userDetails: UserDetails): Chainable<any>;
            createContact(contactDetails: ContactDetails, token: string): Chainable<any>;
            loginViaAPI(url: string): Chainable<any>;
        }
    }
}

// Ensure this file is a module
export {};
