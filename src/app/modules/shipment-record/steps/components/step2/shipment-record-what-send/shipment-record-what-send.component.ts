import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { AppConstant } from '@shared/contants/app.constant';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { InputErrorMessageComponent } from '@shared/components/form/input-error-message/input-error-message.component';
import { InputNumber } from 'primeng/inputnumber';
import { Checkbox } from 'primeng/checkbox';
import { Message } from 'primeng/message';
import { ArticleCategoriesEntityResponse } from '@shipment-record/models/article-categories.model';
import { Button } from 'primeng/button';
import { CartItemWhatSendPayload } from '@shipment-record/models/cart.model';
import { Tooltip } from 'primeng/tooltip';
import { ValidationDirective } from '@shared/directives/validation.directive';

@Component({
    selector: 'app-shipment-record-what-send',
    imports: [Tabs, TabList, Tab, TabPanels, TabPanel, ReactiveFormsModule, Select, NgClass, InputErrorMessageComponent, InputNumber, Checkbox, Message, Button, NgTemplateOutlet, Tooltip, ValidationDirective],
    templateUrl: './shipment-record-what-send.component.html',
    styleUrl: './shipment-record-what-send.component.scss'
})
export class ShipmentRecordWhatSendComponent implements OnInit {
    standardSizes = [
        { label: 'Sobre', value: 'letter', dimensions: '', maxWeight: '500g', imgSrc: 'shared/images/letter-1.svg', large: 0, width: 0, height: 0, weight: 0.5 },
        { label: 'Pequeño', value: 'small', dimensions: '20X20X19 cm', maxWeight: '500g', imgSrc: 'shared/images/box-1.svg', large: 20, width: 20, height: 19, weight: 0.5 },
        { label: 'Mediano', value: 'middle', dimensions: '25X25X22 cm', maxWeight: '500g', imgSrc: 'shared/images/box-1.svg', large: 25, width: 25, height: 22, weight: 0.5 },
        { label: 'Grande', value: 'big', dimensions: '28X28X25 cm', maxWeight: '3kg', imgSrc: 'shared/images/box-1.svg', large: 28, width: 28, height: 25, weight: 3 },
        { label: 'Extra Grande', value: 'extra-big', dimensions: '30X30X30 cm', maxWeight: '4 Kg', imgSrc: 'shared/images/box-1.svg', large: 30, width: 30, height: 30, weight: 4 }
    ];
    currentSize: any = null;

    whatSendForm!: FormGroup;
    @Input() articleCategories: ArticleCategoriesEntityResponse[] = [];
    @Output() submitForm = new EventEmitter<CartItemWhatSendPayload>();
    currentTab = 0;
    currentSizeModal: any = null;
    protected readonly AppConstant = AppConstant;
    private readonly formBuilder: FormBuilder = inject(FormBuilder);

    ngOnInit() {
        this.initForm();
        this.changeTab(0);
    }

    changeTab(index: number) {
        this.currentTab = index;
        if (this.currentTab === 0) {
            this.whatSendForm.reset();
            const ctrl = this.whatSendForm.get('standardSize');
            // Aplicar required y forzar recalculo de validación
            ctrl?.setValidators([Validators.required]);
            ctrl?.updateValueAndValidity();
        }
        if (this.currentTab === 1) {
            this.currentSize = null;
            this.currentSizeModal = null;
            this.whatSendForm.reset();
            const ctrl = this.whatSendForm.get('standardSize');
            // Remover validadores y forzar recalculo de validación
            ctrl?.clearValidators();
            ctrl?.updateValueAndValidity();
        }
    }

    initForm() {
        this.whatSendForm = this.formBuilder.group({
            category: [0, [Validators.required, Validators.min(1)]],
            articleValue: [null, [Validators.required, Validators.min(0.1)]],
            large: [null, [Validators.min(1), Validators.max(110)]],
            width: [null, [Validators.min(1), Validators.max(110)]],
            height: [null, [Validators.min(1), Validators.max(110)]],
            weight: [null, [Validators.min(0.1), Validators.max(25)]],
            isFragile: [0],
            standardSize: [null]
        });

        this.whatSendForm.get('standardSize')?.valueChanges.subscribe((size) => {
            // this.selectStandardSize(value);
            this.currentSizeModal = this.getCurrentSizeModal(size);
        });
    }

    selectStandardSize(size: any) {
        this.currentSize = size;
        this.currentSizeModal = this.getCurrentSizeModal(size);
        this.whatSendForm.get('standardSize')?.patchValue(this.currentSizeModal.value);
    }

    getCurrentSizeModal(size: any) {
        return this.standardSizes.find((s) => s.value === size);
    }

    handleSubmitSender() {
        const payload = this.buildPayload();
        this.submitForm.emit(payload);
    }

    buildPayload(): CartItemWhatSendPayload {
        console.log(this.currentTab);
        console.log(this.currentSizeModal);
        if (this.currentTab === 0) {
            if (!this.currentSizeModal) {
                throw new Error('Standard size not selected');
            }
        }

        if (this.currentTab === 1) {
            if (this.whatSendForm.invalid) {
                console.log(this.whatSendForm.value);
                throw new Error('Formulario inválido');
            }
        }
        const height = this.currentTab === 0 ? this.currentSizeModal.height : this.whatSendForm.value.height;
        const width = this.currentTab === 0 ? this.currentSizeModal.width : this.whatSendForm.value.width;
        const large = this.currentTab === 0 ? this.currentSizeModal.large : this.whatSendForm.value.large;
        const weight = this.currentTab === 0 ? this.currentSizeModal.weight : this.whatSendForm.value.weight;
        return {
            height,
            width,
            length: large,
            weight,
            article_id: this.whatSendForm.value.category,
            declared_value: this.whatSendForm.value.articleValue,
            fragile: this.whatSendForm.value.isFragile
        };
    }
}
