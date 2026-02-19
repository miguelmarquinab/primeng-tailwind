import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-olva-error-message',
    imports: [],
    templateUrl: './olva-error-message.component.html',
    styleUrl: './olva-error-message.component.scss'
})
export class OlvaErrorMessageComponent {
    @Input() title = '';
    @Input() message = '';
    @Input() icon = 'shared/images/alert-square.svg';
}
