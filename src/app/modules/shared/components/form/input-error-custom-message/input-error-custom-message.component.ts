import { Component, Input } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

@Component({
    selector: 'app-input-error-custom-message',
    imports: [],
    templateUrl: './input-error-custom-message.component.html',
    styleUrl: './input-error-custom-message.component.scss'
})
export class InputErrorCustomMessageComponent {
    @Input() errorText = '';
    @Input() control!: AbstractControl | null;

    getControlName(): string | null {
        const formGroup = this.control?.parent as FormGroup;
        if (!formGroup) return null;

        return Object.keys(formGroup.controls).find((name) => this.control === formGroup.get(name)) || null;
    }
}
