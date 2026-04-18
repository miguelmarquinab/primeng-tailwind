import { ChangeDetectionStrategy, Component, EventEmitter, inject, input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { InputErrorMessageComponent } from '@shared/components/form/input-error-message/input-error-message.component';
import { InputNumber } from 'primeng/inputnumber';
import { Message } from 'primeng/message';
import { ArticleCategoriesEntityResponse } from '@shipment-record/models/article-categories.model';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { ValidationDirective } from '@shared/directives/validation.directive';
import { BreakpointService } from '@shared/services/breakpoint/breakpoint.service';
import { CartSessionStorage } from '@shipment-record/models/cart-session-storage.model';
import { StandardSizeEntityResponse } from '@shipment-record/models/standard-size.model';
import { HEADQUARTERS, PAYMENT_TYPES_CODES, VALIDATION_LIMITS, WhatsSendTabIndex } from '@shipment-record/contansts/shipment-record-step.constant';
import { Subject, takeUntil } from 'rxjs';
import { CartItemWhatSendEntityResponse, CartItemWhatSendPayload } from '@shipment-record/models/cart-item.model';
import { HeadquartersEntityResponse } from '@shipment-record/models/headquarters.model';
import { Carousel } from 'primeng/carousel';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
    selector: 'app-shipment-record-what-send',
    imports: [Tabs, TabList, Tab, TabPanels, TabPanel, RadioButtonModule, ReactiveFormsModule, Select, NgClass, InputErrorMessageComponent, InputNumber, Message, Button, NgTemplateOutlet, Tooltip, ValidationDirective, Carousel],
    templateUrl: './shipment-record-what-send.component.html',
    styleUrl: './shipment-record-what-send.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ShipmentRecordWhatSendComponent implements OnInit, OnDestroy {
    standardSizes = input<StandardSizeEntityResponse[]>([]);
    currentSize: string | null = null;

    protected readonly WhatsSendTabIndex = WhatsSendTabIndex;
    whatSendForm!: FormGroup;
    articleCategories = input<ArticleCategoriesEntityResponse[]>([]);
    cartItemWhatSendEntityResponse = input<CartItemWhatSendEntityResponse | undefined>();
    @Output() submitForm = new EventEmitter<CartItemWhatSendPayload>();

    currentTab = 0;
    currentSizeModal: StandardSizeEntityResponse | null = null;
    private readonly formBuilder: FormBuilder = inject(FormBuilder);
    private readonly breakpointService = inject(BreakpointService);
    protected readonly isMobile = this.breakpointService.isMobile;

    cartData = input.required<CartSessionStorage>();
    currentOrigin = input.required<HeadquartersEntityResponse | null>();
    articleValueMessage = '';
    tabStandardDisabled = false;

    private destroy$ = new Subject<void>();

    ngOnInit() {
        this.initForm();
        this.setupFormListeners();
        // this.changeTab(WhatsSendTabIndex.STANDARD);
        this.changeTab(this.getFirstTab());
        this.setData();
        this.tabStandardDisabled = !this.isOriginLima();
    }

    getFirstTab() {
        if (this.isOriginLima()) {
            return WhatsSendTabIndex.STANDARD;
        }
        return WhatsSendTabIndex.CUSTOM;
    }

    isOriginLima() {
        return parseInt(this.currentOrigin()?.headquarter_id ?? HEADQUARTERS.DEFAULT_ID) === HEADQUARTERS.LIMA_ID;
    }

    setData() {
        const cartItem = this.cartItemWhatSendEntityResponse();
        if (cartItem) {
            let values: any = {
                category: cartItem.article_id,
                articleValue: cartItem.declared_value
            };
            if (!cartItem.custom_size) {
                this.changeTab(WhatsSendTabIndex.STANDARD);
                this.selectStandardSize(cartItem.size_id ?? '');
            } else {
                this.changeTab(WhatsSendTabIndex.CUSTOM);
                values = {
                    ...values,
                    width: cartItem.width,
                    height: cartItem.height,
                    large: cartItem.length,
                    weight: cartItem.weight
                };
            }

            this.whatSendForm.patchValue(values, {
                emitEvent: false
            });
        }
    }

    getDefaultFormValues() {
        return {
            category: VALIDATION_LIMITS.DEFAULT_CATEGORY_ID,
            articleValue: null,
            large: null,
            width: null,
            height: null,
            weight: null,
            standardSize: null
        };
    }

    changeTab(index: WhatsSendTabIndex) {
        this.currentTab = index;
        if (this.currentTab === WhatsSendTabIndex.STANDARD) {
            this.whatSendForm.reset(this.getDefaultFormValues());
            const ctrl = this.whatSendForm.get('standardSize');

            ctrl?.setValidators([Validators.required]);
            ctrl?.updateValueAndValidity();
        }
        if (this.currentTab === WhatsSendTabIndex.CUSTOM) {
            this.currentSize = null;
            this.currentSizeModal = null;
            this.whatSendForm.reset(this.getDefaultFormValues());
            this.whatSendForm.get('category')?.enable({
                emitEvent: false
            });
            const ctrl = this.whatSendForm.get('standardSize');

            ctrl?.clearValidators();
            ctrl?.updateValueAndValidity();
        }

        this.setValidators();
    }

    getFormConfig() {
        const { articleValue, articleValueMessage } = this.buildDestinationConfig();
        this.articleValueMessage = articleValueMessage;
        return {
            category: [VALIDATION_LIMITS.DEFAULT_CATEGORY_ID, [Validators.required, Validators.min(VALIDATION_LIMITS.MIN_CATEGORY_ID)]],
            articleValue: [null, [Validators.required, Validators.min(VALIDATION_LIMITS.MIN_ARTICLE_VALUE), Validators.max(articleValue)]],
            large: [null, [Validators.min(VALIDATION_LIMITS.LARGE_MIN_DIMENSION), Validators.max(VALIDATION_LIMITS.MAX_DIMENSION)]],
            width: [null, [Validators.min(VALIDATION_LIMITS.WIDTH_MIN_DIMENSION), Validators.max(VALIDATION_LIMITS.MAX_DIMENSION)]],
            height: [null, [Validators.min(VALIDATION_LIMITS.HEIGHT_MIN_DIMENSION), Validators.max(VALIDATION_LIMITS.MAX_DIMENSION)]],
            weight: [null, [Validators.min(VALIDATION_LIMITS.MIN_WEIGHT), Validators.max(VALIDATION_LIMITS.MAX_WEIGHT)]],
            standardSize: [null, [Validators.required]]
        };
    }

    setValidators() {
        const largeCtrl = this.whatSendForm.get('large');
        const widthCtrl = this.whatSendForm.get('width');
        const heightCtrl = this.whatSendForm.get('height');
        const weightCtrl = this.whatSendForm.get('weight');

        if (this.currentTab === WhatsSendTabIndex.STANDARD) {
            largeCtrl?.clearValidators();
            largeCtrl?.updateValueAndValidity();
            widthCtrl?.clearValidators();
            widthCtrl?.updateValueAndValidity();
            heightCtrl?.clearValidators();
            heightCtrl?.updateValueAndValidity();
            weightCtrl?.clearValidators();
            weightCtrl?.updateValueAndValidity();
        }
        if (this.currentTab === WhatsSendTabIndex.CUSTOM) {
            largeCtrl?.setValidators([Validators.required, Validators.min(VALIDATION_LIMITS.LARGE_MIN_DIMENSION), Validators.max(VALIDATION_LIMITS.MAX_DIMENSION)]);
            largeCtrl?.updateValueAndValidity();
            widthCtrl?.setValidators([Validators.required, Validators.min(VALIDATION_LIMITS.WIDTH_MIN_DIMENSION), Validators.max(VALIDATION_LIMITS.MAX_DIMENSION)]);
            widthCtrl?.updateValueAndValidity();
            heightCtrl?.setValidators([Validators.required, Validators.min(VALIDATION_LIMITS.HEIGHT_MIN_DIMENSION), Validators.max(VALIDATION_LIMITS.MAX_DIMENSION)]);
            heightCtrl?.updateValueAndValidity();
            weightCtrl?.setValidators([Validators.required, Validators.min(VALIDATION_LIMITS.MIN_WEIGHT), Validators.max(VALIDATION_LIMITS.MAX_WEIGHT)]);
            weightCtrl?.updateValueAndValidity();
        }
    }

    initForm() {
        const formValidations = this.getFormConfig();
        this.whatSendForm = this.formBuilder.group(formValidations);
    }

    private setupFormListeners() {
        this.whatSendForm
            .get('standardSize')
            ?.valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe((size) => {
                this.currentSizeModal = this.getCurrentSizeModal(size);
                console.log(size);
                console.log(this.currentSizeModal);
                const categoryControl = this.whatSendForm.get('category');
                if (size === 'letter') {
                    categoryControl?.patchValue(396, {
                        emitEvent: false
                    });
                    categoryControl?.disable({
                        emitEvent: false
                    });
                } else {
                    categoryControl?.enable({
                        emitEvent: false
                    });
                }
            });
    }

    buildDestinationConfig() {
        let articleValue = VALIDATION_LIMITS.ARTICLE_VALUE_DEFAULT;
        let articleValueMessage = 'No ingresaste un número válido.';
        if (this.cartData().header.whoPay === PAYMENT_TYPES_CODES.DESTINATION) {
            articleValueMessage = 'Tu envío está en el límite permitido.\n' + 'Verifica que no supere S/ 1500.00';
            articleValue = VALIDATION_LIMITS.ARTICLE_VALUE_DESTINATION;
        }

        if (this.cartData().header.whoPay === PAYMENT_TYPES_CODES.STORE) {
            articleValueMessage = 'Tu envío está en el límite permitido.\n' + 'Verifica que no supere S/ 10000.00';
            articleValue = VALIDATION_LIMITS.ARTICLE_VALUE_STORE;
        }

        return {
            articleValue,
            articleValueMessage
        };
    }
    selectStandardSize(size: string) {
        this.currentSize = size;
        this.currentSizeModal = this.getCurrentSizeModal(size);
        this.whatSendForm.get('standardSize')?.patchValue(this.currentSizeModal?.value);

        console.log(size);
        const categoryControl = this.whatSendForm.get('category');

        if (size === 'letter') {
            categoryControl?.patchValue(396, {
                emitEvent: false
            });
            categoryControl?.disable({
                emitEvent: false
            });
        } else {
            categoryControl?.enable({
                emitEvent: false
            });
        }
    }

    getCurrentSizeModal(size: string): StandardSizeEntityResponse | null {
        return this.standardSizes().find((s) => s.value === size) ?? null;
    }

    handleSubmitSender() {
        const payload = this.buildPayload();
        this.submitForm.emit(payload);
    }

    buildPayload(): CartItemWhatSendPayload {
        if (this.currentTab === WhatsSendTabIndex.STANDARD) {
            if (!this.currentSizeModal) {
                throw new Error('Standard size not selected');
            }
        }

        if (this.currentTab === WhatsSendTabIndex.CUSTOM) {
            if (this.whatSendForm.invalid) {
                throw new Error('Formulario inválido');
            }
        }
        const height = this.currentTab === WhatsSendTabIndex.STANDARD ? this.currentSizeModal?.height : this.whatSendForm.value.height;
        const width = this.currentTab === WhatsSendTabIndex.STANDARD ? this.currentSizeModal?.width : this.whatSendForm.value.width;
        const large = this.currentTab === WhatsSendTabIndex.STANDARD ? this.currentSizeModal?.large : this.whatSendForm.value.large;
        const weight = this.currentTab === WhatsSendTabIndex.STANDARD ? this.currentSizeModal?.weight : this.whatSendForm.value.weight;
        let articleId = this.whatSendForm.get('category')?.value;
        if (this.currentSize === 'letter') {
            articleId = 396;
        }
        return {
            height,
            width,
            length: large,
            weight,
            article_id: articleId,
            declared_value: this.whatSendForm.value.articleValue,
            custom_size: this.currentTab === WhatsSendTabIndex.CUSTOM,
            size_id: this.currentSize ?? ''
        };
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
