import { Component, Input } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';
import { NgStyle } from '@angular/common';

@Component({
    selector: 'app-shipment-record-step-progress',
    imports: [ProgressBarModule, NgStyle],
    templateUrl: './shipment-record-step-progress.component.html',
    styleUrl: './shipment-record-step-progress.component.scss'
})
export class ShipmentRecordStepProgressComponent {
    @Input() stepNumber = 1;
}
