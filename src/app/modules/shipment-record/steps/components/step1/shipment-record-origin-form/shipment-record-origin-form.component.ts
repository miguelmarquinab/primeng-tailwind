import { Component, inject, Input, OnInit, output, signal } from '@angular/core';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { AppConstant } from '@shared/contants/app.constant';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeadquartersEntityResponse } from '@shipment-record/models/headquarters.model';

@Component({
    selector: 'app-shipment-record-origin-form',
    imports: [Button, Select, ReactiveFormsModule],
    templateUrl: './shipment-record-origin-form.component.html',
    styleUrl: './shipment-record-origin-form.component.scss'
})
export class ShipmentRecordOriginFormComponent implements OnInit {
    submitOrigin = output<{
        origin: number;
    }>();
    originForm!: FormGroup;

    @Input() headquarters: HeadquartersEntityResponse[] = [];

    // headquarters = signal<HeadquartersEntityResponse[]>([]);
    protected readonly AppConstant = AppConstant;
    private readonly formBuilder = inject(FormBuilder);

    ngOnInit() {
        this.formInit();
    }

    formInit() {
        this.originForm = this.formBuilder.group({
            origin: [0, [Validators.required, Validators.min(1)]]
        });
    }

    handleSubmitOrigin() {
        this.submitOrigin.emit(this.originForm.value);
    }
}
