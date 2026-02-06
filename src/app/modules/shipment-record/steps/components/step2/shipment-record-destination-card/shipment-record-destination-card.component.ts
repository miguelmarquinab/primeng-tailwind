import { Component, Input } from '@angular/core';
import { DestinationEntityResponse } from '@shipment-record/models/destination.model';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-shipment-record-destination-card',
    imports: [NgClass],
    templateUrl: './shipment-record-destination-card.component.html',
    styleUrl: './shipment-record-destination-card.component.scss'
})
export class ShipmentRecordDestinationCardComponent {
    @Input() destination!: DestinationEntityResponse;
    @Input() selected: boolean = false;
}
