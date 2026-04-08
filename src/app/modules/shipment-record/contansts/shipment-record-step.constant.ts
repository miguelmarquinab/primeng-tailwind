import { StepConfig } from '@shipment-record/models/steps.modal';

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

export const VALIDATION_LIMITS = {
    ARTICLE_VALUE_DEFAULT: 10000000,
    ARTICLE_VALUE_DESTINATION: 1500,
    MIN_ARTICLE_VALUE: 0.0101,
    MAX_DIMENSION: 110,
    MIN_DIMENSION: 1,
    MAX_WEIGHT: 25,
    MIN_WEIGHT: 0.1,
    MIN_CATEGORY_ID: 1,
    DEFAULT_CATEGORY_ID: 0
};

export const HEADQUARTERS = {
    LIMA_ID: 43,
    DEFAULT_ID: '0'
};

export enum DELIVERY_TYPE {
    HOME = 'D',
    OFFICE = 'O'
}

export enum PAYMENT_TYPES_CODES {
    ONLINE = 'ONLINE',
    STORE = 'STORE',
    DESTINATION = 'DESTINATION'
}

export const PAYMENT_TYPES = [
    {
        code: 'ONLINE',
        title: 'Pago en línea',
        description: 'Pago con tarjeta de débito/crédito o PagoEfectivo.',
        icon_name: 'shared/images/credit-card.svg',
        sort_order: 1,
        requires_payment_method: true
    },
    {
        code: 'STORE',
        title: 'Pago en tienda',
        description: 'Pago al entregar en tienda.',
        icon_name: 'shared/images/safe-delivery-01.svg',
        sort_order: 2,
        requires_payment_method: false,
        payment_methods: []
    },
    {
        code: 'DESTINATION',
        title: 'Pago en destino',
        description: 'Pago del envío contra entrega.',
        icon_name: 'shared/images/store-04-icon.svg',
        sort_order: 3,
        requires_payment_method: false,
        payment_methods: []
    }
];

export const ACCORDION_SCROLL = {
    OFFSET_PER_PANEL: 54,
    DELAY_MS: 500
};

export enum SHIPMENT_TYPE {
    STANDARD = 2
}
