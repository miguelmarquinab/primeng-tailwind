import { Directive, HostListener, Input } from '@angular/core';

@Directive({
    standalone: true,
    selector: '[appInputOnlyNumber]'
})
export class OnlyNumberDirective {
    @Input() allowDecimal = false;
    @Input() allowNegative = false;

    @HostListener('input', ['$event'])
    onInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        input.value = this.sanitizeValue(input.value);
    }

    private sanitizeValue(value: string): string {
        let sanitized = value;
        if (this.allowDecimal && this.allowNegative) {
            sanitized = this.sanitizeDecimalNegative(sanitized);
        } else if (this.allowDecimal) {
            sanitized = this.sanitizeDecimal(sanitized);
        } else if (this.allowNegative) {
            sanitized = this.sanitizeNegative(sanitized);
        } else {
            sanitized = this.sanitizeInteger(sanitized);
        }
        return sanitized;
    }

    private sanitizeDecimalNegative(value: string): string {
        value = value.replaceAll(/[^0-9.-]/g, '');
        // Solo permite un punto decimal y un guion al inicio
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts.slice(1).join('');
        }
        value = value.replaceAll(/(?!^)-/g, '');
        return value;
    }

    private sanitizeDecimal(value: string): string {
        value = value.replaceAll(/[^0-9.]/g, '');
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts.slice(1).join('');
        }
        return value;
    }

    private sanitizeNegative(value: string): string {
        value = value.replaceAll(/[^0-9-]/g, '');
        value = value.replaceAll(/(?!^)-/g, '');
        return value;
    }

    private sanitizeInteger(value: string): string {
        return value.replaceAll(/[^0-9]/g, '');
    }
}
