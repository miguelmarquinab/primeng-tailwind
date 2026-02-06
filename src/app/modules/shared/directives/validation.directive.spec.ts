import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ValidationDirective } from './validation.directive';

@Component({
    template: `
    <form [formGroup]="form">
        <div class="wrapper" [ngClass]="wrapperClass">
            <input formControlName="name" appValidation
                [validationMessages]="validationMessages"
                [appValidationShowValidationOn]="showOn"
                [inputErrorClass]="inputErrorClass"
                [errorClass]="errorClass"
                [validateOnInit]="validateOnInit"
            />
        </div>
    </form>`
})
class HostComponent {
    form = new FormGroup({ name: new FormControl('') });
    validationMessages: { [k: string]: string } = {};
    showOn: any = 'always';
    inputErrorClass = 'input-error';
    errorClass = 'error-message';
    validateOnInit = false;
    wrapperClass = '';
}

describe('ValidationDirective', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;
    let inputDe: DebugElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule],
            declarations: [HostComponent, ValidationDirective]
        }).compileComponents();

        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        inputDe = fixture.debugElement.query(By.css('input'));
    });

    function getErrorElement(): HTMLElement | null {
        return document.querySelector(`.${host.errorClass}`) as HTMLElement | null;
    }

    it('should create directive instance', () => {
        fixture.detectChanges();
        const dir = inputDe.injector.get(ValidationDirective);
        expect(dir).toBeTruthy();
    });

    it('should not show error when control has no errors', fakeAsync(() => {
        fixture.detectChanges();
        tick();
        const el = getErrorElement();
        expect(el).toBeNull();
        const input = inputDe.nativeElement as HTMLElement;
        expect(input.classList.contains(host.inputErrorClass)).toBeFalse();
    }));

    it('should show default required message when control is invalid and showValidationOn=always', fakeAsync(() => {
        host.form.controls['name'].setErrors({ required: true });
        fixture.detectChanges();
        // directive uses startWith and subscriptions in ngAfterViewInit, detectChanges + tick
        tick();

        const el = getErrorElement();
        expect(el).toBeTruthy();
        expect(el!.textContent!.trim()).toBe('Este campo es requerido');

        const input = inputDe.nativeElement as HTMLElement;
        expect(input.classList.contains(host.inputErrorClass)).toBeTrue();
    }));

    it('should use custom validationMessages with interpolation', fakeAsync(() => {
        host.validationMessages = { minlength: 'Mínimo {{requiredLength}} (actual {{actualLength}})' };
        host.form.controls['name'].setErrors({ minlength: { requiredLength: 5, actualLength: 2 } });
        fixture.detectChanges();
        tick();

        const el = getErrorElement();
        expect(el).toBeTruthy();
        expect(el!.textContent!.trim()).toBe('Mínimo 5 (actual 2)');
    }));

    it('should not show error when showValidationOn = touched until touched or interaction', fakeAsync(() => {
        host.showOn = 'touched';
        host.form.controls['name'].setErrors({ required: true });
        fixture.detectChanges();
        tick();

        // Not touched yet
        let el = getErrorElement();
        expect(el).toBeNull();

        // mark as touched
        host.form.controls['name'].markAsTouched();
        fixture.detectChanges();
        tick();

        el = getErrorElement();
        expect(el).toBeTruthy();
    }));

    it('validateOnInit should show errors immediately on init', fakeAsync(() => {
        host.validateOnInit = true;
        host.form.controls['name'].setErrors({ required: true });
        fixture.detectChanges();
        // directive queues updateValidationDisplay with setTimeout
        tick(0);

        const el = getErrorElement();
        expect(el).toBeTruthy();
    }));

    it('should hide error and remove inputErrorClass when errors cleared', fakeAsync(() => {
        host.form.controls['name'].setErrors({ required: true });
        fixture.detectChanges();
        tick();
        let el = getErrorElement();
        expect(el).toBeTruthy();
        const input = inputDe.nativeElement as HTMLElement;
        expect(input.classList.contains(host.inputErrorClass)).toBeTrue();

        // clear errors
        host.form.controls['name'].setErrors(null);
        host.form.controls['name'].markAsUntouched();
        fixture.detectChanges();
        tick();

        // The directive hides by setting display none; element may still exist in DOM but hidden
        el = getErrorElement();
        expect(el).toBeTruthy();
        const display = (el as HTMLElement).style.display;
        expect(display === 'none' || display === '').toBeTrue();
        expect(input.classList.contains(host.inputErrorClass)).toBeFalse();
    }));

    it('should append error element correctly when inside p-inputgroup (parent has class)', fakeAsync(() => {
        // Put the input inside a p-inputgroup by adding class on wrapper
        host.wrapperClass = 'p-inputgroup';
        host.form.controls['name'].setErrors({ required: true });
        fixture.detectChanges();
        tick();

        const el = getErrorElement();
        expect(el).toBeTruthy();
        // ensure the error element is not a direct child of the immediate parent (it should be appended to parent.parentNode)
        const inputParent = inputDe.nativeElement.parentNode as HTMLElement;
        expect(el!.parentElement).not.toBe(inputParent);
    }));
});

