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
import { CartSessionStorageService } from '@shipment-record/services/cart-session-storage.service';
import { WhoSenderFormData } from '@shipment-record/models/who-sender-form.model';

import { NgClass } from '@angular/common';
import { CartService } from '@shipment-record/services/cart.service';
import { CartSessionStorage } from '@shipment-record/models/cart-session-storage.model';
import { CartItemDestinationPayload, CartItemPayload, CartItemReturnChargePayload, CartItemWhatSendPayload, CartItemWhoPersonReceivesPayload } from '@shipment-record/models/cart-item.model';

@Component({
    selector: 'app-shipment-record-step2',
    imports: [Accordion, AccordionContent, AccordionHeader, AccordionPanel, PersonFormComponent, ShipmentRecordWhatSendComponent, ShipmentRecordDestinationComponent, NgClass],
    templateUrl: './shipment-record-step2.component.html',
    styleUrls: ['./shipment-record-step2.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ShipmentRecordStep2Component implements OnInit, OnDestroy {
    //// default
    panelsDisabled: boolean[] = [false, true, true, true]; // panel 0 habilitado, panel 1 deshabilitado
    protected currentAccordionIndex = 0;

    // panelsDisabled: boolean[] = [false, false, false, false]; // panel 0 habilitado, panel 1 deshabilitado
    // protected currentAccordionIndex = 2;

    articleCategories: ArticleCategoriesEntityResponse[] = [];

    returnChargePayload!: CartItemReturnChargePayload | null;
    protected readonly PersonConstant = PersonConstant;
    protected readonly ShipmentRecordStepsConstant = ShipmentRecordStepsConstant;
    protected readonly AppConstant = AppConstant;
    private readonly articleCategoriesService: ArticleCategoriesService = inject(ArticleCategoriesService);
    private readonly cartSessionService = inject(CartSessionStorageService);
    private readonly cartService = inject(CartService);
    private readonly destroy$ = new Subject<void>();
    @ViewChild('accordionScrollContainer', { static: false }) accordionScrollContainer?: ElementRef<HTMLElement>;

    cartData!: CartSessionStorage;
    cartItem!: CartItemPayload;

    ngOnInit() {
        this.getArticleCategories();
        this.cartItem = {};
        this.cartData = this.cartSessionService.getCartData();
    }

    onAccordionChange(event: any) {
        const index = event.index ?? 0;
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
        this.cartItem.who_receive = this.buildPersonWhoReceive(event);
        this.enablePanel(1);
        this.currentAccordionIndex = 1;
        this.scrollAccordionToTop(1);
        console.log(this.cartItem);
    }

    submitWhatSenderForm(event: CartItemWhatSendPayload) {
        console.log('submitWhatSenderForm');
        console.log(event);
        this.currentAccordionIndex = 2;
        this.enablePanel(2);
        this.scrollAccordionToTop(2);
        this.cartItem.what_send = this.buildWhatSendPayload(event);
        console.log(this.cartItem);
    }

    submitDestinationForm(event: any) {
        console.log('submitDestinationForm', event);
        console.log('this.returnChargePayload', this.returnChargePayload);
        this.cartItem.destination = this.buildDestinationPayload(event);
        this.cartItem.service = {
            return_charge: false,
            delivery_type: this.cartItem?.destination?.delivery_type
        };
        if (this.returnChargePayload) {
            this.cartItem.service.return_charge = true;
            this.cartItem.return_charge = this.returnChargePayload;
        }
        console.log(this.cartItem);
        const cartSessionUuid = this.cartSessionService.getCartId() ?? '';
        this.cartService.createItem(cartSessionUuid, this.cartItem).subscribe({
            next: (response) => {
                console.log('Item creado:', response);
                const loadCart$ = this.cartSessionService.getAppliedCouponCode()
                    ? this.cartService.applyCoupon(cartSessionUuid)
                    : this.cartService.getByUuid(cartSessionUuid);
                loadCart$.subscribe({
                    next: (response) => {
                        this.cartSessionService.setItems(response.data?.items ?? []);
                        this.cartSessionService.setPricing(response.data?.pricing ?? {});
                        this.cartService.setStepNumber(3);
                    }
                });
            }
        });
    }

    buildDestinationPayload(event: any): CartItemDestinationPayload {
        console.log('buildDestinationPayload', event);
        return event;
    }

    onReturnChargeChanged(payload: CartItemReturnChargePayload) {
        this.returnChargePayload = payload;
        console.log('Return charge changed:', payload);
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

    buildPersonWhoReceive(event: WhoSenderFormData): CartItemWhoPersonReceivesPayload {
        return {
            document_type: event.document_type ?? undefined,
            document_number: event.document_number ?? undefined,
            first_names: event.first_names ?? undefined,
            last_name: event.last_name ?? undefined,
            phone: event.phone ?? undefined
        };
    }

    buildWhatSendPayload(event: any): CartItemWhatSendPayload {
        // {
        //     "height": 30,
        //     "width": 30,
        //     "length": 30,
        //     "weight": 4,
        //     "article_id": 13,
        //     "declared_value": 123,
        //     "fragile": null
        // }

        // weight?: number;**
        // shipment_type?: number;
        // fragile?: boolean; **
        // height?: number; **
        // width?: number; **
        // length?: number; **
        // article_id?: number; **
        return {
            // // ...this.cartItem,
            // declared_value: event.declared_value,
            shipment_type: 2,
            weight: event.weight,
            fragile: event.fragile,
            height: event.height,
            width: event.width,
            length: event.length,
            article_id: event.article_id,
            declared_value: event.declared_value
        };
    }
}
