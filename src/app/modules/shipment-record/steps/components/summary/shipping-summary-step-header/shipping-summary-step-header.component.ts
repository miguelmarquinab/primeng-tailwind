import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'app-shipping-summary-step-header',
    imports: [],
    templateUrl: './shipping-summary-step-header.component.html',
    styleUrl: './shipping-summary-step-header.component.scss',
    standalone: true,
    encapsulation: ViewEncapsulation.None
})
export class ShippingSummaryStepHeaderComponent {
    @Input() caption: string = '';
}
