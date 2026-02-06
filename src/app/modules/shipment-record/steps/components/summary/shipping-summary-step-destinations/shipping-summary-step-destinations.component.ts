import { Component } from '@angular/core';
import { ShippingSummaryStepHeaderComponent } from '@shipment-record/steps/components/summary/shipping-summary-step-header/shipping-summary-step-header.component';
import { ShippingSummaryStepTimelineMarkerComponent } from '@shipment-record/steps/components/summary/shipping-summary-step-timeline-marker/shipping-summary-step-timeline-marker.component';

@Component({
    selector: 'app-shipping-summary-step-destinations',
    imports: [ShippingSummaryStepHeaderComponent, ShippingSummaryStepTimelineMarkerComponent],
    templateUrl: './shipping-summary-step-destinations.component.html',
    styleUrl: './shipping-summary-step-destinations.component.scss',
    standalone: true
})
export class ShippingSummaryStepDestinationsComponent {
    destinations: any[] = [{}
        // , {}, {}, {}
    ];
}
