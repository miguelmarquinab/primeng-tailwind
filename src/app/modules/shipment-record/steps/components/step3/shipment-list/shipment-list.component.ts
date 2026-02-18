import { DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-shipment-list',
    imports: [DecimalPipe],
    templateUrl: './shipment-list.component.html'
})
export class ShipmentListComponent {
    @Input() index!: number;
    @Input() city!: string;
    @Input() customer!: string;
    @Input() description!: string;
    @Input() address!: string;
    @Input() total!: number;
}
