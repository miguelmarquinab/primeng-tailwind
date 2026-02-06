import { Directive, HostListener, Input, OnInit } from '@angular/core';

@Directive({
    selector: '[appRestrictChars]',
    standalone: true
})
export class RestrictCharsDirective implements OnInit {
    @Input() regexPatternAllowed: string = '';
    @Input() allowPaste = false;

    private regex!: RegExp;

    constructor() {}

    ngOnInit() {
        this.regex = this.buildRegexp();
    }

    @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
        this.regex = this.buildRegexp();
        const inputChar = event.key;
        const ignoredKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete'];
        if (event.altKey) {
            event.preventDefault();
            return;
        }
        if (!this.regex.test(inputChar) && !ignoredKeys.includes(inputChar)) {
            event.preventDefault();
        }
    }

    // @HostListener('paste', ['$event']) blockPaste(event: KeyboardEvent) {
    //     this.regex = this.buildRegexp();
    //
    //     if (!this.allowPaste) {
    //         event.preventDefault();
    //     }
    // }

    buildRegexp() {
        return new RegExp(this.regexPatternAllowed);
    }
}
