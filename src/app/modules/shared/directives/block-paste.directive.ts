import { Directive, HostListener } from '@angular/core';

@Directive({
    standalone: true,
    selector: '[appBlockPaste]'
})
export class BlockPasteDirective {
    @HostListener('paste', ['$event'])
    onPaste(event: ClipboardEvent): void {
        event.preventDefault();
    }
}
