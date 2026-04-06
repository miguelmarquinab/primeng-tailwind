import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador que asegura que una cadena no tenga espacios en blanco al inicio o al final.
 * Devuelve null (válido) si el valor está vacío o no tiene espacios en los extremos.
 * Retorna { trimmed: true } cuando la cadena tiene espacios al inicio o fin.
 *
 * @example
 * // Usage in a form control
 * this.form = this.fb.group({
 *   name: ['', [Validators.required, TrimValidator()]]
 * });
 */
export function TrimValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;
        if (value === null || value === undefined || value === '') {
            return null;
        }
        const text = String(value);
        if (text !== text.trim()) {
            return { trimmed: true };
        }
        return null;
    };
}
