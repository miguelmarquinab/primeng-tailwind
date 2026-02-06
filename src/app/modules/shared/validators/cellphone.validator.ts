import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador que asegura que un número de celular empiece con '9'.
 * Devuelve null (válido) si el valor está vacío (dejar que Validators.required lo gestione)
 * o si comienza con '9'.
 * Retorna { startsWithNine: true } cuando no comienza con 9.
 */
export function CellphoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value ?? '';
        if (value === null || value === undefined || value === '') {
            return null; // no forzamos required aquí
        }
        const text = String(value).trim();
        if (text.startsWith('9')) {
            return null;
        }
        return { startsWithNine: true };
    };
}

