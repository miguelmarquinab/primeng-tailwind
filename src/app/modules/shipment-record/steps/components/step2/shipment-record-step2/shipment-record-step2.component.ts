import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { PersonFormComponent } from '@shipment-record/steps/components/step1/shipment-record-who-sender-form/person-form.component';
import { PersonConstant } from '@shipment-record/contansts/person.constant';
import { ShipmentRecordStepsConstant } from '@shipment-record/contansts/shipment-record-step.constant';
import { ShipmentRecordWhatSendComponent } from '@shipment-record/steps/components/step2/shipment-record-what-send/shipment-record-what-send.component';
import { ArticleCategoriesService } from '@shipment-record/services/article-categories.service';
import { Subject, takeUntil } from 'rxjs';
import { ArticleCategoriesEntityResponse } from '@shipment-record/models/article-categories.model';
import { ShipmentRecordDestinationComponent } from '@shipment-record/steps/components/step2/shipment-record-destination/shipment-record-destination.component';
import { AppConstant } from '@shared/contants/app.constant';
import { ReturnChargePayload } from '@shipment-record/models/return-charge.model';
import { CartSessionStorageService } from '@shipment-record/services/cart-session-storage.service';
import { WhoSenderFormData } from '@shipment-record/models/who-sender-form.model';
import { CartItemWhatSendPayload, PersonPayload } from '@shipment-record/models/cart.model';
import { NgClass } from '@angular/common';
import { CartService } from '@shipment-record/services/cart.service';

@Component({
    selector: 'app-shipment-record-step2',
    imports: [Accordion, AccordionContent, AccordionHeader, AccordionPanel, PersonFormComponent, ShipmentRecordWhatSendComponent, ShipmentRecordDestinationComponent, NgClass],
    templateUrl: './shipment-record-step2.component.html',
    styleUrls: ['./shipment-record-step2.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ShipmentRecordStep2Component implements OnInit, OnDestroy {
    // default
    // panelsDisabled: boolean[] = [false, true, true, true]; // panel 0 habilitado, panel 1 deshabilitado
    // protected currentAccordionIndex = 0;

    panelsDisabled: boolean[] = [false, false, false, false]; // panel 0 habilitado, panel 1 deshabilitado
    protected currentAccordionIndex = 2;

    articleCategories: ArticleCategoriesEntityResponse[] = [];

    returnChargePayload: ReturnChargePayload | null = null;
    protected readonly PersonConstant = PersonConstant;
    protected readonly ShipmentRecordStepsConstant = ShipmentRecordStepsConstant;
    protected readonly AppConstant = AppConstant;
    private readonly articleCategoriesService: ArticleCategoriesService = inject(ArticleCategoriesService);
    private readonly cartSessionService = inject(CartSessionStorageService);
    private readonly cartService = inject(CartService);
    private readonly destroy$ = new Subject<void>();
    @ViewChild('accordionScrollContainer', { static: false }) accordionScrollContainer?: ElementRef<HTMLElement>;

    ngOnInit() {
        this.getArticleCategories();
    }

    onAccordionChange(event: any) {
        const index = event.index ??0;
        this.scrollAccordionToTop(index);
    }

    private scrollAccordionToTop(index: number = 0) {
        setTimeout(() => {
            const container = this.accordionScrollContainer?.nativeElement;
            if (!container) return;
            const newTop = 54 * index;
            container.scrollTo({ top: newTop, behavior: 'smooth' });
        }, 500);
    }

    submitWhoSenderForm(event: WhoSenderFormData) {
        const payload: PersonPayload = {
            document_type: event.documentType ?? undefined,
            document_number: event.documentNumber ?? undefined,
            first_names: event.firstName ?? undefined,
            last_name: event.lastName ?? undefined
        };
        this.cartSessionService.setItemPerson(0, payload);
        this.enablePanel(1);
        this.currentAccordionIndex = 1;
        this.scrollAccordionToTop(1);
    }

    submitWhatSenderForm(event: CartItemWhatSendPayload) {
        this.cartSessionService.setItemWhatSend(0, event);
        this.currentAccordionIndex = 2;
        this.enablePanel(2);
        this.scrollAccordionToTop(2);
    }

    submitDestinationForm() {
        // this.currentAccordionIndex = 3;
        // this.enablePanel(3);
        // this.scrollAccordionToTop(3);
        this.cartService.setStepNumber(3);

    }

    onReturnChargeChanged(payload: ReturnChargePayload) {
        this.returnChargePayload = payload;
    }

    enablePanel(index: number) {
        this.panelsDisabled[index] = false;
    }

    getArticleCategories() {
        this.articleCategoriesService
            .getAll()
            .pipe(takeUntil(this.destroy$))
            .subscribe((response) => {
                this.articleCategories = response.data ?? [];
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
