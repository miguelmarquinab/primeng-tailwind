import { Directive, ElementRef, HostListener, Renderer2, Optional, Host, OnInit, OnDestroy, Input } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
    selector: '[appDisplayShortText]',
    standalone: true
})
export class DisplayShortTextDirective implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();
    private _enable = true;

    /**
     * Controls whether the directive behavior is active.
     * When set to false the directive will restore the full value and remove readonly.
     */
    @Input()
    set enable(value: boolean) {
        this._enable = !!value;
        // sync immediately when input changes
        this.syncState();
    }

    get enable(): boolean {
        return this._enable;
    }

    constructor(
        private host: ElementRef<HTMLInputElement>,
        private renderer: Renderer2,
        @Optional() @Host() private ngControl?: NgControl
    ) {}

    // helpers to keep code DRY and easy to read
    private get native(): HTMLInputElement {
        return this.host.nativeElement as HTMLInputElement;
    }

    private get control() {
        return this.ngControl?.control;
    }

    ngOnInit(): void {
        // initial sync
        this.syncState();

        // keep in sync with FormControl status (disabled/enabled)
        if (this.control?.statusChanges) {
            this.control.statusChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.syncState());
        }

        // keep displayed value in sync with control value changes
        if (this.control?.valueChanges) {
            this.control.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((v) => this.onControlValueChange(v));
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private isDisabled(): boolean {
        return !!(this.native.disabled || this.control?.disabled);
    }

    private syncState() {
        // if directive is globally disabled via Input, ensure full value is restored and readonly cleared
        if (!this.enable) {
            this.setReadOnlyIfNeeded(false);
            this.restoreFull();
            return;
        }

        const disabled = this.isDisabled();
        this.setReadOnlyIfNeeded(disabled);
        if (disabled) {
            this.showAbbreviated();
        } else {
            this.restoreFull();
        }
    }

    private setReadOnlyIfNeeded(value: boolean) {
        if (this.native.readOnly !== value) {
            this.renderer.setProperty(this.native, 'readOnly', value);
        }
    }

    private getFullValue(): string {
        const controlVal = this.control?.value;
        if (typeof controlVal === 'string' && controlVal.length > 0) {
            return controlVal;
        }
        return this.native.value ?? '';
    }

    private abbreviate(value: string): string {
        if (!value) return '';
        const parts = value.trim().split(/\s+/);
        return parts.length === 1 ? parts[0] : `${parts[0]} ${parts[1].charAt(0)}`;
    }

    private setDisplayedValue(value: string, storeFull = false) {
        if (storeFull) {
            this.renderer.setAttribute(this.native, 'data-full-name', this.getFullValue());
        }
        if (this.native.value !== value) {
            this.renderer.setProperty(this.native, 'value', value);
        }
    }

    private showAbbreviated() {
        const full = this.getFullValue();
        const abbr = this.abbreviate(full);
        // keep original value available
        this.renderer.setAttribute(this.native, 'data-full-name', full);
        this.setDisplayedValue(abbr);
    }

    private restoreFull() {
        const fullFromControl = this.getFullValue();
        const stored = this.native.getAttribute('data-full-name');
        const full = fullFromControl || stored || '';
        this.setDisplayedValue(full);
    }

    private onControlValueChange(value: unknown) {
        const str = value == null ? '' : String(value);
        // when disabled, ensure abbreviated display reflects latest control value
        if (this.isDisabled()) {
            const abbr = this.abbreviate(str);
            this.renderer.setAttribute(this.native, 'data-full-name', str);
            this.setDisplayedValue(abbr);
        } else {
            // when enabled, keep displayed value in sync with control
            this.setDisplayedValue(str);
        }
    }

    @HostListener('blur')
    onBlur() {
        // only act when the feature is enabled and the field is disabled
        if (!this.enable || !this.isDisabled()) return;
        const full = this.getFullValue();
        const abbr = this.abbreviate(full);
        this.renderer.setAttribute(this.native, 'data-full-name', full);
        this.setDisplayedValue(abbr);
    }

    @HostListener('focus')
    onFocus() {
        if (!this.enable || !this.isDisabled()) return;
        const full = this.getFullValue() || this.native.getAttribute('data-full-name') || '';
        this.setDisplayedValue(full);
    }
}
