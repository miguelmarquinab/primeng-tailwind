import { PersonFormConfig } from '@shipment-record/models/person.modal';

export class PersonConstant {
    static readonly DEFAULT_CONFIG: PersonFormConfig = {
        firstName: {
            placeholder: 'Escribe tus nombres'
        },
        lastName: {
            placeholder: 'Escribe tus apellidos'
        },
        cellphone: {
            placeholder: 'Escribe tu número de celular'
        },
        email: {
            placeholder: 'Escribe tu correo electrónico'
        },
        companyName: {
            placeholder: 'Escribe la razón social'
        }
    };

    static readonly PERSON_DOWN_STATE = 'BAJA DE OFICIO - NO HALLADO DESTINATA';
    static readonly PERSON_ACTIVE_STATE = 'ACTIVO';
}
