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
}
