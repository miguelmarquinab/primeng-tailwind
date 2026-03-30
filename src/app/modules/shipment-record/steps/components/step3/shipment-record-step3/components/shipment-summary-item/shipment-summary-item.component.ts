import { DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-shipment-summary-item',
    imports: [DecimalPipe],
    templateUrl: './shipment-summary-item.component.html'
})
export class ShipmentSummaryItemComponent {
    @Input() index!: number;
    @Input() city!: string;
    @Input() customer!: string;
    @Input() description!: string;
    @Input() address!: string;
    @Input() total!: number;
}
