export interface DocumentType {
    label?: string;
    shortLabel?: string;
    minLength: number;
    maxLength: number;
    documentNumberPattern: string;
    value?: string;
    labelFirstName?: string;
    labelFirstNamePlaceHolder?: string;
}
