import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[appInputRegex]',
    standalone: true
})
export class InputRegexDirective {
    @Input() appInputRegex: string | RegExp = '';
    @Input() allowEmpty: boolean = true;

    constructor(private readonly el: ElementRef) {}

    @HostListener('input', ['$event'])
    onInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        const value = input.value;

        if (this.allowEmpty && value === '') {
            return;
        }

        const regex = typeof this.appInputRegex === 'string' ? new RegExp(this.appInputRegex) : this.appInputRegex;

        if (!regex.test(value)) {
            input.value = value.slice(0, -1);
            input.dispatchEvent(new Event('input'));
        }
    }

    @HostListener('paste', ['$event'])
    onPaste(event: ClipboardEvent): void {
        event.preventDefault();
        const pastedText = event.clipboardData?.getData('text') || '';

        const regex = typeof this.appInputRegex === 'string' ? new RegExp(this.appInputRegex) : this.appInputRegex;

        if (regex.test(pastedText)) {

            document.execCommand('insertText', false, pastedText);
        }
    }
}
