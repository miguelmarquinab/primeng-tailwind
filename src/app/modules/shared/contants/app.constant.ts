import { DocumentType } from '@shared/models/document-type.model';

export class AppConstant {
    // static readonly NAME_REGEX_PATTERN = '^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]*$';
    static readonly NAME_REGEX_PATTERN = '^[a-zA-ZáéíóúÁÉÍÓÚñÑ][a-zA-ZáéíóúÁÉÍÓÚñÑ ]*$';
    // static readonly COMPANY_REGEX_PATTERN = '^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ \\-&.,()]*$';
    static readonly COMPANY_REGEX_PATTERN = String.raw`^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ \-&.,()]*$`;
    static readonly ADDRESS_REGEX_PATTERN = String.raw`^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ \-&.,()]*$`;
    static readonly UBIGEO_REGEX_PATTERN = String.raw`^[a-zA-ZáéíóúÁÉÍÓÚñÑ \-]*$`;
    // static readonly EMAIL_REGEX_PATTERN = '[a-zA-Z0-9á-úÁ-Ú._@-]'
    // Regex de correo que acepta letras Unicode (incluye acentos), dígitos y signos permitidos
    static readonly EMAIL_REGEX_PATTERN = '[a-zA-Z0-9á-úÁ-Ú._@-]';
    static readonly ALPHANUMERIC_REGEX_PATTERN = '[a-zA-Z0-9]+';
    // static readonly NUMERIC_REGEX_PATTERN = '[0-9]*';
    static readonly NUMERIC_REGEX_PATTERN = '^[0-9]+$';
    // static readonly EMAIL_REGEX_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    // static readonly EMAIL_REGEX_PATTERN = '^[a-zA-Z0-9._%+-]+@[a-zA-Z]*$';
    static readonly DOCUMENT_TYPE_DEFAULT = '';
    static readonly DOCUMENT_TYPE_DEFAULT_LENGTH = 8;
    static readonly DOCUMENT_TYPE_DNI = 'dni';
    static readonly DOCUMENT_TYPE_DNI_LENGTH = 8;
    static readonly DOCUMENT_TYPE_RUC = 'ruc';
    static readonly DOCUMENT_TYPE_RUC_LENGTH = 11;
    static readonly DOCUMENT_TYPE_PASSPORT = 'pas';
    static readonly DOCUMENT_TYPE_PASSPORT_MIN_LENGTH = 8;
    static readonly DOCUMENT_TYPE_PASSPORT_MAX_LENGTH = 12;
    static readonly DOCUMENT_TYPE_CARNET = 'ce';
    static readonly DOCUMENT_TYPE_CARNET_MIN_LENGTH = 8;
    static readonly DOCUMENT_TYPE_CARNET_MAX_LENGTH = 12;
    static readonly DOCUMENT_TYPES_WITH_INVOICE_TYPES: DocumentType[] = [
        {
            value: this.DOCUMENT_TYPE_DNI,
            label: 'DNI (BOLETA)',
            minLength: this.DOCUMENT_TYPE_DNI_LENGTH,
            maxLength: this.DOCUMENT_TYPE_DNI_LENGTH,
            labelFirstName: 'Nombres',
            labelFirstNamePlaceHolder: 'Escribe tus nombres',
            documentNumberPattern: this.NUMERIC_REGEX_PATTERN,
            shortLabel: 'DNI'
        },
        {
            value: this.DOCUMENT_TYPE_RUC,
            label: 'RUC (FACTURA)',
            minLength: this.DOCUMENT_TYPE_RUC_LENGTH,
            maxLength: this.DOCUMENT_TYPE_RUC_LENGTH,
            labelFirstName: 'Razón Social',
            labelFirstNamePlaceHolder: 'Escribe la razón social',
            documentNumberPattern: this.NUMERIC_REGEX_PATTERN,
            shortLabel: 'RUC'
        },
        {
            value: this.DOCUMENT_TYPE_PASSPORT,
            label: 'PASAPORTE (BOLETA)',
            minLength: this.DOCUMENT_TYPE_PASSPORT_MIN_LENGTH,
            maxLength: this.DOCUMENT_TYPE_PASSPORT_MAX_LENGTH,
            labelFirstName: 'Nombre',
            labelFirstNamePlaceHolder: 'Escribe tus nombres',
            documentNumberPattern: this.ALPHANUMERIC_REGEX_PATTERN,
            shortLabel: 'PASAPORTE'
        },
        {
            value: this.DOCUMENT_TYPE_CARNET,
            label: 'CARNET EXTRANJERÍA (BOLETA)',
            minLength: this.DOCUMENT_TYPE_CARNET_MIN_LENGTH,
            maxLength: this.DOCUMENT_TYPE_CARNET_MAX_LENGTH,
            labelFirstName: 'Nombre',
            labelFirstNamePlaceHolder: 'Escribe tus nombres',
            documentNumberPattern: this.ALPHANUMERIC_REGEX_PATTERN,
            shortLabel: 'CARNET DE EXTRANJERÍA'
        }
    ];
    static readonly DOCUMENT_TYPES_WITHOUT_INVOICE_TYPES: DocumentType[] = [
        {
            value: this.DOCUMENT_TYPE_DNI,
            label: 'DNI',
            minLength: this.DOCUMENT_TYPE_DNI_LENGTH,
            maxLength: this.DOCUMENT_TYPE_DNI_LENGTH,
            labelFirstName: 'Nombres',
            labelFirstNamePlaceHolder: 'Escribe tus nombres',
            documentNumberPattern: this.NUMERIC_REGEX_PATTERN,
            shortLabel: 'DNI'
        },
        {
            value: this.DOCUMENT_TYPE_RUC,
            label: 'RUC',
            minLength: this.DOCUMENT_TYPE_RUC_LENGTH,
            maxLength: this.DOCUMENT_TYPE_RUC_LENGTH,
            labelFirstName: 'Razón Social',
            labelFirstNamePlaceHolder: 'Escribe la razón social',
            documentNumberPattern: this.NUMERIC_REGEX_PATTERN,
            shortLabel: 'RUC'
        },
        {
            value: this.DOCUMENT_TYPE_PASSPORT,
            label: 'PASAPORTE',
            minLength: this.DOCUMENT_TYPE_PASSPORT_MIN_LENGTH,
            maxLength: this.DOCUMENT_TYPE_PASSPORT_MAX_LENGTH,
            labelFirstName: 'Nombre',
            labelFirstNamePlaceHolder: 'Escribe tus nombres',
            documentNumberPattern: this.ALPHANUMERIC_REGEX_PATTERN,
            shortLabel: 'PASAPORTE'
        },
        {
            value: this.DOCUMENT_TYPE_CARNET,
            label: 'CARNET EXTRANJERÍA',
            minLength: this.DOCUMENT_TYPE_CARNET_MIN_LENGTH,
            maxLength: this.DOCUMENT_TYPE_CARNET_MAX_LENGTH,
            labelFirstName: 'Nombre',
            labelFirstNamePlaceHolder: 'Escribe tus nombres',
            documentNumberPattern: this.ALPHANUMERIC_REGEX_PATTERN,
            shortLabel: 'CARNET DE EXTRANJERÍA'
        }
    ];
}
