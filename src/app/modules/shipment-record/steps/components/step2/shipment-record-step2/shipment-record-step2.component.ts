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
import { PersonFormData, WhoSenderFormData } from '@shipment-record/models/who-sender-form.model';

import { NgClass } from '@angular/common';
import { CartService } from '@shipment-record/services/cart.service';
import { CartSessionStorage } from '@shipment-record/models/cart-session-storage.model';
import { CartItemDestinationPayload, CartItemEntityResponse, CartItemPayload, CartItemReturnChargePayload, CartItemWhatSendPayload, CartItemWhoPersonReceivesPayload } from '@shipment-record/models/cart-item.model';
import { LocalStorageService } from '@shared/services/storage/local-storage.service';

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

    returnChargePayload!: CartItemReturnChargePayload | undefined;
    protected readonly ShipmentRecordStepsConstant = ShipmentRecordStepsConstant;
    protected readonly AppConstant = AppConstant;
    private readonly articleCategoriesService: ArticleCategoriesService = inject(ArticleCategoriesService);
    private readonly cartSessionService = inject(CartSessionStorageService);
    private readonly localStorageService = inject(LocalStorageService);
    private readonly cartService = inject(CartService);
    private readonly destroy$ = new Subject<void>();
    @ViewChild('accordionScrollContainer', { static: false }) accordionScrollContainer?: ElementRef<HTMLElement>;

    cartData!: CartSessionStorage;
    cartItem!: CartItemPayload;
    currentItemUuid!: string;
    currentCartItem!: CartItemEntityResponse;
    currentWhoReceiveFormData!: PersonFormData;

    ngOnInit() {
        this.getArticleCategories();
        this.cartItem = {};
        this.cartData = this.cartSessionService.getCartData();
        this.currentItemUuid = this.cartSessionService.getCurrentItemUuid() ?? '';
        if (this.currentItemUuid) {
            this.currentCartItem = this.getCurrentCartItemByUuid(this.currentItemUuid);
        }

        if (this.currentCartItem) {
            this.currentWhoReceiveFormData = this.buildCurrentWhoReceiveFormData();
            console.log(this.currentCartItem.what_send);
            this.panelsDisabled = [false, false, false]; // panel 0 habilitado, panel 1 deshabilitado
            this.currentAccordionIndex = 2;
        }
        console.log('Step2', this.currentItemUuid, this.currentCartItem);
    }

    buildCurrentWhoReceiveFormData(): WhoSenderFormData {
        return {
            document_type: this.currentCartItem.who_receive?.document_type ?? '',
            document_number: this.currentCartItem.who_receive?.document_number ?? '',
            phone: this.currentCartItem.who_receive?.phone ?? '',
            first_names: this.currentCartItem.who_receive?.first_names ?? '',
            last_name: this.currentCartItem.who_receive?.last_name ?? ''
        };
    }

    getCurrentCartItemByUuid(uuid: string): CartItemEntityResponse {
        const cartItems = this.cartSessionService.getCartData()?.items ?? [];
        return cartItems.find((item) => item.uuid === uuid) as CartItemEntityResponse;
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

        // if(!this.returnChargePayload) {
        //     this.returnChargePayload = {
        //         address_card: this.currentCartItem.return_charge?.address_card,
        //         address: this.currentCartItem.return_charge?.address_card,
        //         longitude: this.currentCartItem.return_charge?.latitude,
        //         latitude: this.currentCartItem.return_charge?.longitude,
        //         office_id: this.currentCartItem.return_charge?.office_id,
        //         reference: this.currentCartItem.return_charge?.reference ?? '',
        //         polygon: this.currentCartItem.return_charge?.polygon,
        //     };
        // }
        this.cartItem.destination = this.buildDestinationPayload(event);
        console.log(this.cartItem?.destination?.delivery_type);
        this.cartItem.service = {
            return_charge: false,
            delivery_type: this.cartItem?.destination?.delivery_type
        };

        if (this.returnChargePayload) {
            this.cartItem.service.return_charge = true;
            this.cartItem.return_charge = this.returnChargePayload;
        }

        console.log(this.cartItem);

        // return;

        const cartSessionUuid = this.cartSessionService.getCartId() ?? '';
        if (this.currentCartItem) {
            this.cartService.updateItem(cartSessionUuid, this.currentCartItem.uuid ?? '', this.cartItem).subscribe({
                next: (response) => {
                    console.log('Item Updated:', response);

                    // const appliedCouponCode = this.cartSessionService.getAppliedCouponCode();
                    //
                    // const loadCart$ = appliedCouponCode ? this.cartService.applyCoupon(cartSessionUuid, appliedCouponCode) : this.cartService.getByUuid(cartSessionUuid);
                    //
                    // loadCart$.subscribe({
                    //     next: (response) => {
                    //         this.cartSessionService.setItems(response.data?.items ?? []);
                    //         this.cartSessionService.setPricing(response.data?.pricing ?? {});
                    //         this.cartService.setStepNumber(3);
                    //     }
                    // });
                },
                complete: () => {
                    this.updateCartSession();
                }
            });

            return;
        }

        this.cartService.createItem(cartSessionUuid, this.cartItem).subscribe({
            next: (response) => {
                console.log('Item creado:', response);

                // const appliedCouponCode = this.cartSessionService.getAppliedCouponCode();
                //
                // const loadCart$ = appliedCouponCode ? this.cartService.applyCoupon(cartSessionUuid, appliedCouponCode) : this.cartService.getByUuid(cartSessionUuid);
                //
                // loadCart$.subscribe({
                //     next: (response) => {
                //
                //         this.cartSessionService.setItems(response.data?.items ?? []);
                //         this.cartSessionService.setPricing(response.data?.pricing ?? {});
                //         this.cartService.setStepNumber(3);
                //     }
                // });
                this.updateCartSession();
            }
        });
    }

    updateCartSession() {
        const cartSessionUuid = this.cartSessionService.getCartId() ?? '';
        this.cartService.getByUuid(cartSessionUuid).subscribe({
            next: (response) => {
                this.cartSessionService.setCurrentItemUuid('');
                this.cartSessionService.setItems(response.data?.items ?? []);
                this.cartSessionService.setPricing(response.data?.pricing ?? {});
                this.cartService.setStepNumber(3);
            }
        });
    }

    buildDestinationPayload(event: any): CartItemDestinationPayload {
        console.log('buildDestinationPayload', event);
        return event;
    }

    onReturnChargeChanged(payload?: CartItemReturnChargePayload | null) {
        this.returnChargePayload = payload ?? undefined;
        console.log('Return charge changed:', payload);
    }

    enablePanel(index: number) {
        this.panelsDisabled[index] = false;
    }

    getArticleCategories() {
        const articleCategoriesCacheKey = 'articleCategories';
        const cachedCategories = this.localStorageService.get(articleCategoriesCacheKey);
        if (cachedCategories) {
            this.articleCategories = cachedCategories;
            return;
        }

        this.articleCategoriesService
            .getAll()
            .pipe(takeUntil(this.destroy$))
            .subscribe((response) => {
                this.articleCategories = response.data ?? [];
                this.localStorageService.set(articleCategoriesCacheKey, this.articleCategories);
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
        return {
            shipment_type: 2,
            weight: event.weight,
            fragile: event.fragile,
            height: event.height,
            width: event.width,
            length: event.length,
            article_id: event.article_id,
            declared_value: event.declared_value,
            size_id: event.size_id,
            custom_size: event.custom_size
        };
    }
}
