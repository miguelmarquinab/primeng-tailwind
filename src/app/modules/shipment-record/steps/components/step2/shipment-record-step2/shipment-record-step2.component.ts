import { Component, DestroyRef, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild, ViewEncapsulation } from '@angular/core';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { Button } from 'primeng/button';
import { PersonFormComponent } from '@shipment-record/steps/components/step1/shipment-record-who-sender-form/person-form.component';
import { ACCORDION_SCROLL, SHIPMENT_TYPE, ShipmentRecordStepsConstant } from '@shipment-record/contansts/shipment-record-step.constant';
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
import { StandardSizeService } from '@shipment-record/services/standard-size.service';
import { StandardSizeEntityResponse } from '@shipment-record/models/standard-size.model';
import { HeadquartersEntityResponse } from '@shipment-record/models/headquarters.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-shipment-record-step2',
    imports: [Accordion, AccordionContent, AccordionHeader, AccordionPanel, Button, PersonFormComponent, ShipmentRecordWhatSendComponent, ShipmentRecordDestinationComponent, NgClass],
    templateUrl: './shipment-record-step2.component.html',
    encapsulation: ViewEncapsulation.None
})
export class ShipmentRecordStep2Component implements OnInit, OnDestroy {
    protected panelsDisabled = signal<boolean[]>([false, true, true]);
    protected currentAccordionIndex = signal(0);

    // protected panelsDisabled = signal<boolean[]>([false, false, false]);
    // protected currentAccordionIndex = signal(2);

    articleCategories = signal<ArticleCategoriesEntityResponse[]>([]);

    returnChargePayload!: CartItemReturnChargePayload | undefined;
    protected readonly ShipmentRecordStepsConstant = ShipmentRecordStepsConstant;
    protected readonly AppConstant = AppConstant;
    private readonly articleCategoriesService: ArticleCategoriesService = inject(ArticleCategoriesService);
    private readonly cartSessionService = inject(CartSessionStorageService);
    private readonly localStorageService = inject(LocalStorageService);
    private readonly cartService = inject(CartService);
    private readonly standardSizeService = inject(StandardSizeService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly destroy$ = new Subject<void>();
    @ViewChild('accordionScrollContainer', { static: false }) accordionScrollContainer?: ElementRef<HTMLElement>;

    cartData!: CartSessionStorage;
    cartItem!: CartItemPayload;
    currentItemUuid!: string;
    currentCartItem!: CartItemEntityResponse;
    recipientFormData!: PersonFormData;
    standardSizes = signal<StandardSizeEntityResponse[]>([]);
    currentOrigin = signal<HeadquartersEntityResponse>({ headquarter_id: '0' });
    protected readonly addingNewItemFromStep3 = signal(false);
    protected readonly step2FormInstanceKey = signal(0);
    private step2FormGeneration = 0;

    ngOnInit() {
        this.getArticleCategories();
        this.getStandardSizes();
        this.currentOrigin.set(this.cartSessionService.getOrigin() as HeadquartersEntityResponse);

        const initialUuid = this.cartSessionService.getCurrentItemUuid() ?? '';
        this.loadStep2ContextFromUuid(initialUuid);

        this.cartSessionService.cartChanged$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((cart) => {
            const nextUuid = cart.header?.currentItemUuid ?? '';
            if (nextUuid === this.currentItemUuid) {
                return;
            }
            this.loadStep2ContextFromUuid(nextUuid);
        });
    }

    private loadStep2ContextFromUuid(uuid: string): void {
        this.step2FormGeneration += 1;
        this.step2FormInstanceKey.set(this.step2FormGeneration);

        this.currentItemUuid = uuid;
        this.cartItem = {};
        this.returnChargePayload = undefined;
        this.cartData = this.cartSessionService.getCartData();
        this.addingNewItemFromStep3.set(this.cartSessionService.isAddingNewItemFromStep3());

        if (!uuid) {
            this.currentCartItem = undefined as unknown as CartItemEntityResponse;
            this.recipientFormData = {
                document_type: '',
                document_number: '',
                phone: '',
                first_names: '',
                last_name: ''
            };
            this.panelsDisabled.set([false, true, true]);
            this.currentAccordionIndex.set(0);
            return;
        }

        const item = this.getCurrentCartItemByUuid(uuid);
        if (!item) {
            this.currentCartItem = undefined as unknown as CartItemEntityResponse;
            this.recipientFormData = {
                document_type: '',
                document_number: '',
                phone: '',
                first_names: '',
                last_name: ''
            };
            this.panelsDisabled.set([false, true, true]);
            this.currentAccordionIndex.set(0);
            return;
        }

        this.currentCartItem = item;
        this.recipientFormData = this.buildRecipientFormData();
        this.panelsDisabled.set([false, !item.who_receive, !item.destination]);
        this.changeCurrentAccordion(0);
    }

    buildRecipientFormData(): WhoSenderFormData {
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

    private scrollAccordionToTop(index: number) {
        setTimeout(() => {
            const container = this.accordionScrollContainer?.nativeElement;
            if (!container) return;
            const newTop = ACCORDION_SCROLL.OFFSET_PER_PANEL * index;
            container.scrollTo({ top: newTop, behavior: 'smooth' });
        }, ACCORDION_SCROLL.DELAY_MS);
    }

    submitRecipientForm(event: WhoSenderFormData) {
        this.cartItem.who_receive = this.buildRecipientPayload(event);
        this.changeCurrentAccordion(1);
    }

    submitWhatSenderForm(event: CartItemWhatSendPayload) {
        this.cartItem.what_send = this.buildWhatSendPayload(event);
        const cartSessionUuid = this.cartSessionService.getCartId() ?? '';
        if (this.currentCartItem) {
            this.updateItem(cartSessionUuid);
            return;
        }

        this.createItem(cartSessionUuid);
    }

    submitDestinationForm(event: CartItemDestinationPayload) {
        this.cartItem.destination = event;
        this.cartItem.service = {
            return_charge: false,
            delivery_type: this.cartItem?.destination?.delivery_type
        };

        if (this.returnChargePayload) {
            this.cartItem.service.return_charge = true;
            this.cartItem.return_charge = this.returnChargePayload;
        }

        this.changeCurrentAccordion(2);
    }

    createItem(cartSessionUuid: string) {
        this.cartService.createItem(cartSessionUuid, this.cartItem).subscribe({
            next: () => {
                this.updateCartSession();
            }
        });
    }

    updateItem(cartSessionUuid: string) {
        this.cartService.updateItem(cartSessionUuid, this.currentCartItem.uuid ?? '', this.cartItem).subscribe({
            complete: () => {
                this.updateCartSession();
            }
        });
    }

    updateCartSession() {
        const cartSessionUuid = this.cartSessionService.getCartId() ?? '';
        this.cartService.getByUuid(cartSessionUuid).subscribe({
            next: (response) => {
                this.cartSessionService.setCurrentItemUuid('');
                this.cartSessionService.setAddingNewItemFromStep3(false);
                this.cartSessionService.setItems(response.data?.items ?? []);
                this.cartSessionService.setPricing(response.data?.pricing ?? {});
                this.cartService.setStepNumber(3);
            }
        });
    }

    returnToStep3Summary(): void {
        this.cartSessionService.setAddingNewItemFromStep3(false);
        this.cartSessionService.setCurrentItemUuid('');
        this.cartService.setStepNumber(3);
    }

    changeCurrentAccordion(accordionIndex: number) {
        this.currentAccordionIndex.set(accordionIndex);
        this.enablePanel(accordionIndex);
        this.scrollAccordionToTop(accordionIndex);
    }

    private enablePanel(index: number) {
        const current = this.panelsDisabled();
        current[index] = false;
        this.panelsDisabled.set([...current]);
    }

    onReturnChargeChanged(payload?: CartItemReturnChargePayload | null) {
        this.returnChargePayload = payload ?? undefined;
    }

    getArticleCategories() {
        const articleCategoriesCacheKey = 'articleCategories';
        const cachedCategories = this.localStorageService.get(articleCategoriesCacheKey);
        if (cachedCategories) {
            this.articleCategories.set(cachedCategories);
            return;
        }

        this.articleCategoriesService
            .getAll()
            .pipe(takeUntil(this.destroy$))
            .subscribe((response) => {
                const categories = response.data ?? [];
                this.articleCategories.set(categories);
                this.localStorageService.set(articleCategoriesCacheKey, categories);
            });
    }

    getStandardSizes() {
        const standardSizesCacheKey = 'standardSizes';
        const cachedStandardSizes = this.localStorageService.get(standardSizesCacheKey);
        if (cachedStandardSizes) {
            this.standardSizes.set(cachedStandardSizes);
            return;
        }

        this.standardSizeService
            .getAll()
            .pipe(takeUntil(this.destroy$))
            .subscribe((response) => {
                const sizes = response.data ?? [];
                this.standardSizes.set(sizes);
                this.localStorageService.set(standardSizesCacheKey, sizes);
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    buildRecipientPayload(event: WhoSenderFormData): CartItemWhoPersonReceivesPayload {
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
            shipment_type: SHIPMENT_TYPE.STANDARD,
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
