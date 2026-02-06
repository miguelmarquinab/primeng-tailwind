import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ShippingSummaryStepTimelineMarkerComponent } from '@shipment-record/steps/components/summary/shipping-summary-step-timeline-marker/shipping-summary-step-timeline-marker.component';
import { ShippingSummaryStepHeaderComponent } from '@shipment-record/steps/components/summary/shipping-summary-step-header/shipping-summary-step-header.component';
import { CartOriginEntityResponse, CartPersonEntityResponse } from '@shipment-record/models/cart.model';
import { Divider } from 'primeng/divider';
import { AppConstant } from '@shared/contants/app.constant';
import { TitleCasePipe } from '@angular/common';

@Component({
    selector: 'app-shipping-summary-step-origin',
    imports: [ShippingSummaryStepTimelineMarkerComponent, ShippingSummaryStepHeaderComponent, Divider, TitleCasePipe],
    templateUrl: './shipping-summary-step-origin.component.html',
    styleUrl: './shipping-summary-step-origin.component.scss',
    standalone: true
})
export class ShippingSummaryStepOriginComponent implements OnChanges {
    @Input() origin: CartOriginEntityResponse | null = null;
    @Input() whoSend: CartPersonEntityResponse | null = null;
    currentDocumentTypeLabel: string = '';

    ngOnChanges(simpleChanges: SimpleChanges): void {
        if (simpleChanges['whoSend']) {
            this.setCurrentDocumentTypeLabel();
        }
    }
    setCurrentDocumentTypeLabel(): void {
        this.currentDocumentTypeLabel = this.getDocumentTypeLabel(this.whoSend?.document_type || '');
    }
    getDocumentTypeLabel(documentTypeCode: string): string {
        return AppConstant.DOCUMENT_TYPES_WITH_INVOICE_TYPES.find((dt) => dt.value === documentTypeCode)?.label || documentTypeCode;
    }
}
