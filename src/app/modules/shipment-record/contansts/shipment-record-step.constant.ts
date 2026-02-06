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
}
