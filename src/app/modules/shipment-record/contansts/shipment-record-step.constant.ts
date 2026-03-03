import { StepConfig } from '@shipment-record/models/steps.modal';
import { StandardSize } from '@shipment-record/models/standard-size.model';

export class ShipmentRecordStepsConstant {
    static readonly STEP1_CONFIG: StepConfig = {
        person: {
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
        }
    };
    static readonly STEP2_CONFIG: StepConfig = {
        person: {
            firstName: {
                placeholder: 'Escribe los nombres'
            },
            lastName: {
                placeholder: 'Escribe los apellidos'
            },
            cellphone: {
                placeholder: 'Escribe el número de celular'
            },
            email: {
                placeholder: 'Escribe tu correo electrónico'
            },
            companyName: {
                placeholder: 'Escribe la razón social'
            }
        }
    };

    static readonly WHO_PAY_TYPE_ONLINE = {
        value: 'online',
        icon: 'shared/images/credit-card.svg',
        title: 'Pago en linea',
        description: 'Pago con tarjeta de débito/crédito o Pagoefectivo.'
    };

    static readonly WHO_PAY_TYPE_DESTINATION = {
        value: 'destination',
        icon: 'shared/images/safe-delivery-01.svg',
        title: 'Pago en destino',
        description: 'Pago del envío contra entrega.'
    };

    static readonly WHO_PAY_TYPE_STORE = {
        value: 'store',
        icon: 'shared/images/store-04-icon.svg',
        title: 'Pago en tienda',
        description: 'Pago al entregar en tienda.'
    };

    static readonly ZERO_RESULTS = 'ZERO_RESULTS';
}

export enum WhatsSendTabIndex {
    STANDARD = 0,
    CUSTOM = 1
}

export const STANDARD_SIZES: StandardSize[] = [
    { label: 'Sobre', value: 'letter', dimensions: '', maxWeight: '500g', imgSrc: 'shared/images/letter-1.svg', large: 0, width: 0, height: 0, weight: 0.5 },
    { label: 'Pequeño', value: 'small', dimensions: '20X20X19 cm', maxWeight: '500g', imgSrc: 'shared/images/box-1.svg', large: 20, width: 20, height: 19, weight: 0.5 },
    { label: 'Mediano', value: 'middle', dimensions: '25X25X22 cm', maxWeight: '500g', imgSrc: 'shared/images/box-1.svg', large: 25, width: 25, height: 22, weight: 0.5 },
    { label: 'Grande', value: 'big', dimensions: '28X28X25 cm', maxWeight: '3kg', imgSrc: 'shared/images/box-1.svg', large: 28, width: 28, height: 25, weight: 3 },
    { label: 'Extra Grande', value: 'extra-big', dimensions: '30X30X30 cm', maxWeight: '4 Kg', imgSrc: 'shared/images/box-1.svg', large: 30, width: 30, height: 30, weight: 4 }
];

export const VALIDATION_LIMITS = {
    ARTICLE_VALUE_DEFAULT: 10000,
    ARTICLE_VALUE_DESTINATION: 500,
    MIN_ARTICLE_VALUE: 0.0101,
    MAX_DIMENSION: 110,
    MIN_DIMENSION: 1,
    MAX_WEIGHT: 25,
    MIN_WEIGHT: 0.1
};

export enum DELIVERY_TYPE {
    HOME = 'D',
    OFFICE = 'O'
}
