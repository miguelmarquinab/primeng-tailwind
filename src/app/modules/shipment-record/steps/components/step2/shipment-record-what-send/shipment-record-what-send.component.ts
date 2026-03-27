import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
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
import { StandardSize } from '@shipment-record/models/standard-size.model';
import { STANDARD_SIZES, VALIDATION_LIMITS, WhatsSendTabIndex } from '@shipment-record/contansts/shipment-record-step.constant';
import { Subject, takeUntil } from 'rxjs';
import { CartItemWhatSendEntityResponse, CartItemWhatSendPayload } from '@shipment-record/models/cart-item.model';

@Component({
    selector: 'app-shipment-record-what-send',
    imports: [Tabs, TabList, Tab, TabPanels, TabPanel, ReactiveFormsModule, Select, NgClass, InputErrorMessageComponent, InputNumber, Message, Button, NgTemplateOutlet, Tooltip, ValidationDirective],
    templateUrl: './shipment-record-what-send.component.html',
    styleUrl: './shipment-record-what-send.component.scss'
})
export class ShipmentRecordWhatSendComponent implements OnInit, OnDestroy {
    readonly standardSizes: StandardSize[] = STANDARD_SIZES;
    currentSize: string | null = null;

    protected readonly WhatsSendTabIndex = WhatsSendTabIndex;
    whatSendForm!: FormGroup;
    @Input() articleCategories: ArticleCategoriesEntityResponse[] = [];
    @Input() cartItemWhatSendEntityResponse!: CartItemWhatSendEntityResponse | undefined;
    @Output() submitForm = new EventEmitter<CartItemWhatSendPayload>();

    currentTab = 0;
    currentSizeModal: StandardSize | null = null;
    private readonly formBuilder: FormBuilder = inject(FormBuilder);
    private readonly breakpointService = inject(BreakpointService);
    protected readonly isMobile = this.breakpointService.isMobile;

    @Input() cartData!: CartSessionStorage;
    articleValueMessage = '';

    private destroy$ = new Subject<void>();

    ngOnInit() {
        this.initForm();
        this.setupFormListeners();
        this.changeTab(WhatsSendTabIndex.STANDARD);
        this.setData();
    }

    setData() {
        if (this.cartItemWhatSendEntityResponse) {
            console.log(this.cartItemWhatSendEntityResponse);
            // large: 0, width: 0, height: 0, weight: 0.5
            // const standardSize = this.findStandardSize({
            //     // ...this.cartItemWhatSendEntityResponse,
            //     weight: this.cartItemWhatSendEntityResponse.weight,
            //     large: this.cartItemWhatSendEntityResponse.length,
            //     height: this.cartItemWhatSendEntityResponse.height,
            //     width: this.cartItemWhatSendEntityResponse.width
            // });

            // if (standardSize) {
            //     this.changeTab(WhatsSendTabIndex.STANDARD);
            //     this.selectStandardSize(standardSize.value ?? '');
            // }
            // console.log(standardSize);
            let values: any = {
                category: this.cartItemWhatSendEntityResponse.article_id,
                articleValue: this.cartItemWhatSendEntityResponse.declared_value
                // isFragile: this.cartItemWhatSendEntityResponse.fragile
            };
            if (!this.cartItemWhatSendEntityResponse.custom_size) {
                this.changeTab(WhatsSendTabIndex.STANDARD);
                this.selectStandardSize(this.cartItemWhatSendEntityResponse.size_id ?? '');
            } else {
                this.changeTab(WhatsSendTabIndex.CUSTOM);
                values = {
                    ...values,
                    width: this.cartItemWhatSendEntityResponse.width,
                    height: this.cartItemWhatSendEntityResponse.height,
                    large: this.cartItemWhatSendEntityResponse.length,
                    weight: this.cartItemWhatSendEntityResponse.weight
                };
            }
            this.whatSendForm.patchValue(values, {
                emitEvent: false
            });

            this.handleSubmitSender();
        }
    }

    getDefaultFormValues() {
        return {
            category: 0,
            articleValue: null,
            large: null,
            width: null,
            height: null,
            weight: null,
            // isFragile: 0,
            standardSize: null
        };
    }

    changeTab(index: WhatsSendTabIndex) {
        this.currentTab = index;
        if (this.currentTab === WhatsSendTabIndex.STANDARD) {
            this.whatSendForm.reset(this.getDefaultFormValues());
            const ctrl = this.whatSendForm.get('standardSize');
            // Aplicar required y forzar recalculo de validación
            ctrl?.setValidators([Validators.required]);
            ctrl?.updateValueAndValidity();
        }
        if (this.currentTab === WhatsSendTabIndex.CUSTOM) {
            this.currentSize = null;
            this.currentSizeModal = null;
            this.whatSendForm.reset(this.getDefaultFormValues());
            const ctrl = this.whatSendForm.get('standardSize');
            // Remover validadores y forzar recalculo de validación
            ctrl?.clearValidators();
            ctrl?.updateValueAndValidity();
        }
    }

    // changeTab(index: WhatsSendTabIndex) {
    //     this.currentTab = index;
    //     this.whatSendForm.reset();
    //     const ctrl = this.whatSendForm.get('standardSize');
    //
    //     if (index === WhatsSendTabIndex.STANDARD) {
    //         ctrl?.setValidators([Validators.required]);
    //     } else {
    //         this.currentSize = null;
    //         this.currentSizeModal = null;
    //         ctrl?.clearValidators();
    //     }
    //     ctrl?.updateValueAndValidity();
    // }

    getFormConfig() {
        const { articleValue, articleValueMessage } = this.buildDestinationConfig();
        this.articleValueMessage = articleValueMessage;
        return {
            category: [0, [Validators.required, Validators.min(1)]],
            articleValue: [null, [Validators.required, Validators.min(VALIDATION_LIMITS.MIN_ARTICLE_VALUE), Validators.max(articleValue)]],
            large: [null, [Validators.min(VALIDATION_LIMITS.MIN_DIMENSION), Validators.max(VALIDATION_LIMITS.MAX_DIMENSION)]],
            width: [null, [Validators.min(VALIDATION_LIMITS.MIN_DIMENSION), Validators.max(VALIDATION_LIMITS.MAX_DIMENSION)]],
            height: [null, [Validators.min(VALIDATION_LIMITS.MIN_DIMENSION), Validators.max(VALIDATION_LIMITS.MAX_DIMENSION)]],
            weight: [null, [Validators.min(VALIDATION_LIMITS.MIN_WEIGHT), Validators.max(VALIDATION_LIMITS.MAX_WEIGHT)]],
            // isFragile: [0],
            standardSize: [null]
        };
    }
    initForm() {
        const formValidations = this.getFormConfig();
        console.log('formValidations:', formValidations);

        this.whatSendForm = this.formBuilder.group(formValidations);

        // this.whatSendForm
        //     .get('standardSize')
        //     ?.valueChanges.pipe(takeUntil(this.destroy$))
        //     .subscribe((size) => {
        //         this.currentSizeModal = this.getCurrentSizeModal(size);
        //     });
    }

    private setupFormListeners() {
        this.whatSendForm
            .get('standardSize')
            ?.valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe((size) => {
                this.currentSizeModal = this.getCurrentSizeModal(size);
            });
    }

    buildDestinationConfig() {
        let articleValue = VALIDATION_LIMITS.ARTICLE_VALUE_DEFAULT;
        let articleValueMessage = 'No ingresaste un número válido.';
        if (this.cartData.header.whoPay === 'DESTINATION') {
            articleValueMessage = 'Tu envío está en el límite permitido.\n' + 'Verifica que no supere S/ 1500.00';
            articleValue = VALIDATION_LIMITS.ARTICLE_VALUE_DESTINATION;
        }

        console.log(articleValue)
        console.log(articleValueMessage)
        return {
            articleValue,
            articleValueMessage
        };
    }
    selectStandardSize(size: string) {
        console.log('Select size', size);
        this.currentSize = size;
        this.currentSizeModal = this.getCurrentSizeModal(size);
        this.whatSendForm.get('standardSize')?.patchValue(this.currentSizeModal?.value);
    }

    getCurrentSizeModal(size: string): StandardSize | null {
        return this.standardSizes.find((s) => s.value === size) ?? null;
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
        return {
            height,
            width,
            length: large,
            weight,
            article_id: this.whatSendForm.value.category,
            declared_value: this.whatSendForm.value.articleValue,
            // fragile: this.whatSendForm.value.isFragile,
            custom_size: this.currentTab === WhatsSendTabIndex.CUSTOM,
            size_id: this.currentSize ?? ''
        };
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
