export interface PersonFormConfig {
    firstName: PersonInputConfig;
    lastName?: PersonInputConfig;
    cellphone: PersonInputConfig;
    email: PersonInputConfig;
    companyName?: PersonInputConfig;
}

export interface PersonInputConfig {
    placeholder: string;
}
