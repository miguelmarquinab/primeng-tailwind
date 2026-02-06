import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador que asegura que el texto comience con '10' o '20'.
 * Devuelve null cuando es válido o cuando el valor está vacío (dejar que Validators.required lo maneje).
 * Retorna { startWith10Or20: true } cuando no cumple.
 */
export function RUCValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value ?? '';
        if (value === null || value === undefined || value === '') {
            // No forzamos required aquí; dejamos que Validators.required lo controle
            return null;
        }
        const text = String(value);
        if (text.startsWith('10') || text.startsWith('20')) {
            return null;
        }
        return { startWith10Or20: true };
    };
}

