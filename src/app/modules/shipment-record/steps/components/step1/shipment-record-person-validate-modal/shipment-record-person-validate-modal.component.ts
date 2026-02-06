import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputText } from 'primeng/inputtext';
import { NgClass } from '@angular/common';
import { Button } from 'primeng/button';
import { PersonService } from '@/modules/people/person/services/person.service';
import { PersonEntityResponse, PersonValidateEntityResponse } from '@/modules/people/models/person.model';
import { RestrictCharsDirective } from '@shared/directives/restrict-chars.directive';
import { AppConstant } from '@shared/contants/app.constant';
import { Subject, takeUntil, tap } from 'rxjs';

@Component({
    selector: 'app-shipment-record-person-validate-modal',
    imports: [ReactiveFormsModule, InputText, NgClass, Button, RestrictCharsDirective],
    templateUrl: './shipment-record-person-validate-modal.component.html',
    standalone: true,
    styleUrl: './shipment-record-person-validate-modal.component.scss'
})
export class ShipmentRecordPersonValidateModalComponent implements OnInit, OnDestroy {
    personForm!: FormGroup;
    person!: PersonEntityResponse;
    documentNumber = '';
    isValidationFailed = false;
    protected readonly AppConstant = AppConstant;
    private readonly formBuilder = inject(FormBuilder);
    private readonly dynamicDialogRef = inject(DynamicDialogRef);
    private readonly dynamicDialogConfig = inject(DynamicDialogConfig);
    private readonly personService = inject(PersonService);

    private readonly destroy$ = new Subject<void>();
    ngOnInit(): void {
        this.documentNumber = this.dynamicDialogConfig.data?.documentNumber ?? '';
        this.person = this.dynamicDialogConfig.data?.person ?? {};

        this.formInit();
    }

    formInit() {
        this.personForm = this.formBuilder.group({
            firstName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]]
        });

        this.personForm
            .get('firstName')
            ?.valueChanges.pipe(
                tap(() => {
                    this.isValidationFailed = false;
                }),
                takeUntil(this.destroy$)
            )
            .subscribe();
    }

    onSubmitHandler() {
        if (this.personForm.invalid) return;

        this.personService
            .validatePerson(this.documentNumber, {
                surname: this.personForm.value.firstName
            })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response: PersonValidateEntityResponse) => {
                    this.isValidationFailed = !this.validateIdentity(this.person, response);

                    if (!this.isValidationFailed) {
                        this.isValidationFailed = false;
                        const values = this.personForm.value;
                        const responseData = {
                            ...values,
                            documentNumber: this.documentNumber,
                            person: this.person
                        };

                        this.dynamicDialogRef?.close(responseData);
                    }
                },
                error: (err) => {
                    // Manejar error
                    this.isValidationFailed = true;
                }
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    validateIdentity(person: PersonEntityResponse, response: PersonValidateEntityResponse): boolean {
        return person.document_number === this.documentNumber && response.document_number === this.documentNumber && response.valid === true;
    }
}
