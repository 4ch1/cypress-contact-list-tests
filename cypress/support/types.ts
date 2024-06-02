export interface UserDetails {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface ContactDetails {
    firstName: string;
    lastName: string;
    email?: string;
    birthdate?: string;
    phone?: string;
    street1?: string;
    street2?: string;
    city?: string;
    stateProvince?: string;
    postalCode?: string;
    country?: string;

}
