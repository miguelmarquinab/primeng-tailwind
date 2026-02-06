import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2, ViewContainerRef, ComponentRef, Injector } from '@angular/core';
import { merge, startWith, Subject, takeUntil } from 'rxjs';
import { AbstractControl, NgControl } from '@angular/forms';
import { InputErrorMessageComponent } from '@shared/components/form/input-error-message/input-error-message.component';

@Directive({
    selector: '[appValidation]',
    standalone: true
})
export class ValidationDirective implements OnInit, OnDestroy, AfterViewInit {
    @Input() validationMessages: { [key: string]: string } = {};
    @Input() appValidationShowValidationOn: 'always' | 'touched' | 'dirty' | 'blur' = 'always';
    @Input() errorClass: string = 'error-message';
    @Input() inputErrorClass: string = 'input-error';
    @Input() validateOnInit: boolean = false;
    // Nuevo input: mensaje de error explícito (prioritario sobre validationMessages)
    @Input() appValidationErrorMessage: string | null = null;

    private readonly destroy$ = new Subject<void>();
    private errorComponentRef: ComponentRef<InputErrorMessageComponent> | null = null;
    private control: AbstractControl | null = null;
    private hasInteracted = false;

    constructor(
        private readonly el: ElementRef,
        private readonly renderer: Renderer2,
        private readonly ngControl: NgControl,
        private readonly vcr: ViewContainerRef,
        private readonly injector: Injector
    ) {}

    ngOnInit() {
        this.control = this.ngControl.control;
    }

    ngAfterViewInit() {
        if (this.control) {
            this.setupValidation();
            this.setupEventListeners();
        }
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.removeErrorElement();
    }

    private setupValidation() {
        if (!this.control) return;

        merge(this.control.statusChanges, this.control.valueChanges)
            .pipe(
                startWith(null),
                takeUntil(this.destroy$)
            )
            .subscribe(() => {
                this.updateValidationDisplay();
            });

        if (this.validateOnInit) {
            setTimeout(() => this.updateValidationDisplay(), 0);
        }
    }

    private setupEventListeners() {

        this.renderer.listen(this.el.nativeElement, 'focusout', () => {
            this.hasInteracted = true;
            this.updateValidationDisplay();
        });

        this.renderer.listen(this.el.nativeElement, 'focusin', () => {
            this.hasInteracted = true;
        });


        this.renderer.listen(this.el.nativeElement, 'input', () => {
            this.hasInteracted = true;
            setTimeout(() => this.updateValidationDisplay(), 0);
        });
    }

    private updateValidationDisplay() {
        if (!this.control) return;

        const shouldShowError = this.shouldShowError();
        if (shouldShowError && this.control.errors) {
            this.showError();
        } else {
            this.hideError();
        }
    }

    private shouldShowError(): boolean {
        if (!this.control) return false;
        if (!this.control.invalid) return false;

        switch (this.appValidationShowValidationOn) {
            case 'always':
                return true;
            case 'touched':
                return this.control.touched || this.hasInteracted;
            case 'dirty':
                return this.control.dirty;
            case 'blur':

                return this.hasInteracted || this.control.touched;
            default:
                return true;
        }
    }

    private showError() {
        if (!this.control?.errors) return;

        const errorMessage = this.getErrorMessage();
        if (!this.errorComponentRef) {
            this.createErrorElement();
        }

        if (this.errorComponentRef) {
            this.errorComponentRef.instance.errorText = errorMessage;
            this.errorComponentRef.instance.control = this.control;
            const native = this.errorComponentRef.location.nativeElement as HTMLElement;
            this.renderer.setStyle(native, 'display', 'block');
            this.renderer.setStyle(native, 'opacity', '1');
            this.errorComponentRef.changeDetectorRef.detectChanges();
        }

        this.renderer.addClass(this.el.nativeElement, this.inputErrorClass);
    }

    private hideError() {
        if (this.errorComponentRef) {
            const native = this.errorComponentRef.location.nativeElement as HTMLElement;
            this.renderer.setStyle(native, 'display', 'none');
            this.renderer.setStyle(native, 'opacity', '0');
        }

        this.renderer.removeClass(this.el.nativeElement, this.inputErrorClass);
    }

    private createErrorElement() {
        this.errorComponentRef = this.vcr.createComponent(InputErrorMessageComponent, { injector: this.injector });
        this.errorComponentRef.instance.errorText = '';
        this.errorComponentRef.instance.control = this.control;
        this.errorComponentRef.changeDetectorRef.detectChanges();

        const nativeEl = this.errorComponentRef.location.nativeElement as HTMLElement;
        this.renderer.addClass(nativeEl, this.errorClass);
        this.renderer.setStyle(nativeEl, 'display', 'none');
        this.renderer.setStyle(nativeEl, 'opacity', '0');
        this.renderer.setStyle(nativeEl, 'transition', 'opacity 0.3s ease');

        let parent = this.el.nativeElement.parentNode;
        if (parent?.classList?.contains('p-inputgroup')) {
            this.renderer.appendChild(parent.parentNode, nativeEl);
        } else {
            this.renderer.insertBefore(parent, nativeEl, this.el.nativeElement.nextSibling);
        }
    }

    private removeErrorElement() {
        if (this.errorComponentRef) {
            try {
                this.errorComponentRef.destroy();
            } catch {}
            this.errorComponentRef = null;
        }
    }

    private getErrorMessage(): string {
        if (!this.control?.errors) return '';

        const firstErrorKey = Object.keys(this.control.errors)[0];


        if (this.appValidationErrorMessage) {
            return this.interpolateMessage(this.appValidationErrorMessage, this.control.errors[firstErrorKey]);
        }


        if (this.validationMessages[firstErrorKey]) {
            return this.interpolateMessage(this.validationMessages[firstErrorKey], this.control.errors[firstErrorKey]);
        }

        return this.getDefaultErrorMessage(firstErrorKey, this.control.errors[firstErrorKey]);
    }

    private interpolateMessage(message: string, errorValue: any): string {
        if (!errorValue || typeof errorValue !== 'object') return message;

        const pattern = /{{(\w+)}}/g;
        return message.replaceAll(pattern, (match: string, key: string) => {
            return errorValue[key] || match;
        });
    }

    private getDefaultErrorMessage(errorKey: string, errorValue: any): string {
        const defaultMessages: { [key: string]: string } = {
            required: 'Este campo es requerido',
            email: 'Ingrese un email válido',
            minlength: `Mínimo ${errorValue?.requiredLength || ''} caracteres (actual: ${errorValue?.actualLength || ''})`,
            maxlength: `Máximo ${errorValue?.requiredLength || ''} caracteres (actual: ${errorValue?.actualLength || ''})`,
            min: `El valor mínimo es ${errorValue?.min || ''}`,
            max: `El valor máximo es ${errorValue?.max || ''}`,
            pattern: 'El formato no es válido',

            onlyInteger: 'El valor debe contener solo números',
            alfaNumeric: 'El valor debe ser alfanumérico',
            latitude: 'La latitud debe estar entre -90 y 90',
            longitude: 'La longitud debe estar entre -180 y 180'
        };
        return defaultMessages[errorKey] || 'Campo inválido';
    }
}
