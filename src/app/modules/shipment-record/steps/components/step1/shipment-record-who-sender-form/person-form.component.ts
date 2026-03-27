import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { AppConstant } from '@shared/contants/app.constant';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DocumentType } from '@shared/models/document-type.model';
import { NgClass } from '@angular/common';
import { OnlyNumberDirective } from '@shared/directives/only-number.directive';
import { PersonFormData, WhoSenderFormData } from '@shipment-record/models/who-sender-form.model';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ShipmentRecordPersonValidateModalComponent } from '@shipment-record/steps/components/step1/shipment-record-person-validate-modal/shipment-record-person-validate-modal.component';
import { PersonService } from '@/modules/people/person/services/person.service';
import { catchError, debounceTime, EMPTY, filter, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { PersonEntityResponse } from '@/modules/people/models/person.model';
import { Message } from 'primeng/message';
import { InputRegexDirective } from '@shared/directives/input-regex.directive';
import { RestrictCharsDirective } from '@shared/directives/restrict-chars.directive';
import { InputErrorMessageComponent } from '@shared/components/form/input-error-message/input-error-message.component';
import { RUCValidator } from '@shared/validators/RUC.validator';
import { CellphoneValidator } from '@shared/validators/cellphone.validator';
import { PersonFormConfig } from '@shipment-record/models/person.modal';
import { PersonConstant } from '@shipment-record/contansts/person.constant';
import { DisplayShortTextDirective } from '@shared/directives/display-short-text.directive';

@Component({
    selector: 'app-person-form',
    imports: [AccordionModule, ButtonModule, InputTextModule, SelectModule, ReactiveFormsModule, OnlyNumberDirective, NgClass, Message, InputRegexDirective, RestrictCharsDirective, InputErrorMessageComponent, DisplayShortTextDirective],
    templateUrl: './person-form.component.html',
    styleUrls: ['./person-form.component.scss'],
    standalone: true,
    providers: [DialogService]
})
export class PersonFormComponent implements OnInit, OnDestroy {
    @Input() whoSenderData!: any;
    @Input() enableEmailField = true;
    @Input() documentTypes: DocumentType[] = AppConstant.DOCUMENT_TYPES_WITH_INVOICE_TYPES;
    // @Input() person!: PersonEntityResponse;
    peopleForm!: FormGroup;
    currentDocumentType: DocumentType = {
        value: '',
        minLength: 0,
        maxLength: 0,
        documentNumberPattern: ''
    };

    @Input() personConfig!: PersonFormConfig;
    @Input() enablePersonValidation = true;
    @Input() enableSetPersonData = true;
    @Input() enableBlur = false;
    @Input() documentTypeLabel = 'Tipo de documento y comprobante';
    @Output() submitWhoSenderForm = new EventEmitter<WhoSenderFormData>();
    @Output() documentNumberChanged = new EventEmitter<boolean>();

    ////
    @Input() personData!: PersonFormData;

    ref: DynamicDialogRef<any> | null = null;
    isClient = false;
    personExist = true;
    personIsLoading = false;
    personResponse!: PersonEntityResponse;
    protected readonly AppConstant = AppConstant;
    private readonly destroy$ = new Subject<void>();
    private readonly formBuilder = inject(FormBuilder);
    private readonly dialogService = inject(DialogService);
    private readonly personService = inject(PersonService);

    get isFormReady(): boolean {
        const form = this.peopleForm;
        let requiredFields = ['documentNumber', 'cellPhone'];
        if (this.currentDocumentType.value === AppConstant.DOCUMENT_TYPE_RUC) {
            requiredFields = ['documentNumber', 'firstName', 'cellPhone'];
            if (this.personExist) {
                requiredFields = ['documentNumber', 'cellPhone'];
            }
        } else if (!this.personExist) {
            requiredFields = ['documentNumber', 'firstName', 'lastName', 'cellPhone'];
        }
        if (this.enableEmailField) {
            requiredFields.push('emailAddress');
        }
        return requiredFields.every((field) => {
            const control = form.get(field);
            return control?.enabled && control?.valid;
        });
    }

    ngOnInit(): void {
        this.formInit();
    }

    formInit() {
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        this.peopleForm = this.formBuilder.group({
            documentType: [''],
            documentNumber: [
                {
                    value: '',
                    disabled: true
                },
                [Validators.required]
            ],
            firstName: [
                {
                    value: '',
                    disabled: true
                },
                [Validators.required]
            ],
            lastName: [
                {
                    value: '',
                    disabled: true
                },
                [Validators.required]
            ],
            cellPhone: [
                {
                    value: '',
                    disabled: true
                },
                [Validators.required, Validators.minLength(9), Validators.maxLength(9), CellphoneValidator()]
            ],
            emailAddress: [
                {
                    value: '',
                    disabled: true
                },
                [Validators.required, Validators.minLength(5), Validators.maxLength(100), Validators.email, Validators.pattern(emailPattern)]
            ]
        });

        if (!this.enableEmailField) {
            this.peopleForm.get('emailAddress')?.disable();
        }
        this.documentTypeEventHandler();
        this.documentNumberFormHandler();

        if (this.personData) {
            this.peopleForm.get('documentType')?.patchValue(this.personData.document_type);
            this.peopleForm.patchValue(
                {
                    documentNumber: this.personData.document_number,
                    firstName: this.personData.first_names,
                    lastName: this.personData.last_name,
                    cellPhone: this.personData.phone
                },
                {
                    emitEvent: false
                }
            );
            this.enableCellPhone();
            this.onSubmitHandler();
        }
    }

    isNeedOpenPersonValidateModal(documentTypeCode: string) {
        return [AppConstant.DOCUMENT_TYPE_DNI].includes(documentTypeCode);
    }

    setFormData() {
        this.peopleForm.patchValue({
            documentType: this.whoSenderData.documentType,
            documentNumber: this.whoSenderData.documentNumber,
            firstName: this.whoSenderData.firstName,
            lastName: this.whoSenderData.lastName,
            cellPhone: this.whoSenderData.cellPhone,
            emailAddress: this.whoSenderData.emailAddress
        });
    }
    setDocumentNumberValidation(documentType: DocumentType) {
        const documentNumber = this.peopleForm.get('documentNumber');
        const documentNumberValidators = [Validators.required, Validators.minLength(documentType.minLength), Validators.maxLength(documentType.maxLength), Validators.pattern(documentType.documentNumberPattern)];
        if (documentType.value === AppConstant.DOCUMENT_TYPE_RUC) {
            documentNumberValidators.push(RUCValidator());
        }
        documentNumber?.setValidators(documentNumberValidators);
        documentNumber?.updateValueAndValidity();
    }

    getDocumentType(documentTypeId: string): DocumentType {
        return (
            AppConstant.DOCUMENT_TYPES_WITH_INVOICE_TYPES.find((documentType) => {
                return documentType.value === documentTypeId;
            }) || { value: '', minLength: 0, maxLength: 0, documentNumberPattern: '' }
        );
    }

    openPersonValidateModal(documentNumber: string, person?: PersonEntityResponse) {
        this.ref = this.dialogService.open(ShipmentRecordPersonValidateModalComponent, {
            height: 'auto',
            width: '340px',
            modal: true,
            closable: true,
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw'
            },
            data: {
                documentNumber,
                person
            }
        });
        this.ref?.onClose.pipe(takeUntil(this.destroy$)).subscribe((data: any) => {
            if (data) {
                this.setPersonDataForm(data.person);
            }
        });
    }

    documentTypeEventHandler() {
        this.peopleForm
            .get('documentType')
            ?.valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe((documentTypeId: string) => {
                this.disableAllFields();
                this.personExist = true;
                this.personIsLoading = false;

                if (documentTypeId === '') {
                    this.peopleForm.get('documentNumber')?.disable();
                    return;
                }
                if (documentTypeId !== '') {
                    this.peopleForm.get('documentNumber')?.enable();
                    this.currentDocumentType = this.getDocumentType(documentTypeId);
                    this.setDocumentNumberValidation(this.currentDocumentType);
                }
            });
    }

    documentNumberFormHandler() {
        let debounceTimeMs = 3000;
        if (this.currentDocumentType.value === AppConstant.DOCUMENT_TYPE_RUC || this.currentDocumentType.value === AppConstant.DOCUMENT_TYPE_DNI) {
            debounceTimeMs = 10;
        }
        this.peopleForm
            .get('documentNumber')
            ?.valueChanges.pipe(
                tap({
                    next: (documentNumber: string) => {
                        this.documentNumberChangedHandler(true);
                    }
                }),
                debounceTime(debounceTimeMs),
                filter((documentNumber: string) => {
                    const control = this.peopleForm.get('documentNumber')!;
                    return !!documentNumber && control.enabled && control.valid;
                }),
                switchMap((documentNumber) => {
                    this.personIsLoading = true;

                    const docType = this.peopleForm.get('documentType')?.value;
                    return this.personService.getPerson(docType, documentNumber).pipe(
                        catchError((error) => {
                            if (error?.status === 404 || error?.status === 422) {
                                this.personIsLoading = false;
                                this.personExist = false;
                                this.peopleForm.get('firstName')?.enable();
                                if (this.currentDocumentType.value === AppConstant.DOCUMENT_TYPE_RUC) {
                                    this.peopleForm.get('lastName')?.disable();
                                } else {
                                    this.peopleForm.get('lastName')?.enable();
                                }

                                this.peopleForm.get('cellPhone')?.enable();
                                this.enableEmail();
                                this.peopleForm.patchValue(
                                    {
                                        firstName: '',
                                        lastName: '',
                                        cellPhone: '',
                                        emailAddress: ''
                                    },
                                    {
                                        emitEvent: false
                                    }
                                );
                            } else {
                                console.error(error);
                            }

                            return EMPTY;
                        })
                    );
                }),
                takeUntil(this.destroy$)
            )
            .subscribe({
                next: (person: PersonEntityResponse) => {
                    this.personIsLoading = false;
                    this.personResponse = person;
                    const documentNumber = person.document_number;
                    this.personExist = true;
                    const documentTypeCode = this.peopleForm.get('documentType')?.value;
                    if (this.enablePersonValidation) {
                        if (this.isNeedOpenPersonValidateModal(documentTypeCode)) {
                            this.openPersonValidateModal(documentNumber, person);
                        }
                    }
                    console.log(this.enableSetPersonData);
                    if (this.enableSetPersonData) {
                        this.setPersonDataForm(person);
                    }
                    if (this.currentDocumentType.value === AppConstant.DOCUMENT_TYPE_RUC) {
                        if (person.contributor_status === PersonConstant.PERSON_DOWN_STATE) {
                            // @TODO que se tiene que hacer?
                        }
                        this.peopleForm.get('firstName')?.patchValue(person.full_name);
                        this.peopleForm.get('firstName')?.disable();
                        this.enableCellPhone();
                        this.enableEmail();
                    }
                    if (!this.enableSetPersonData) {
                        if (this.currentDocumentType.value === AppConstant.DOCUMENT_TYPE_CARNET) {
                            this.setPersonDataForm(person);
                        }
                        if (this.currentDocumentType.value === AppConstant.DOCUMENT_TYPE_PASSPORT) {
                            this.setPersonDataForm(person);
                        }
                    }
                },
                complete: () => {
                    this.personIsLoading = false;
                }
            });
    }

    disableAllFields() {
        this.peopleForm.get('documentNumber')?.reset('');
        this.disableFirstName();
        this.disableLastName();
        this.disableCellPhone();
        this.disableEmail();
    }

    disableFirstName() {
        this.peopleForm.get('firstName')?.reset('');
        this.peopleForm.get('firstName')?.disable();
    }
    disableLastName() {
        this.peopleForm.get('lastName')?.reset('');
        this.peopleForm.get('lastName')?.disable();
    }

    disableCellPhone() {
        this.peopleForm.get('cellPhone')?.reset('');
        this.peopleForm.get('cellPhone')?.disable();
    }

    disableEmail() {
        this.peopleForm.get('emailAddress')?.reset('');
        this.peopleForm.get('emailAddress')?.disable();
    }

    enableCellPhone() {
        this.peopleForm.get('cellPhone')?.enable();
    }
    enableEmail() {
        if (this.enableEmailField) {
            this.peopleForm.get('emailAddress')?.enable();
        }
    }

    setPersonDataForm(person: PersonEntityResponse) {
        this.enableCellPhone();
        this.enableEmail();
        this.peopleForm.patchValue({
            firstName: person.first_names,
            lastName: `${person.last_name_paternal} ${person.last_name_maternal}`,
            emailAddress: person.email ?? '',
            cellPhone: person.phone ?? ''
        });
    }

    onSubmitHandler() {
        let firstName = this.peopleForm.get('firstName')?.value || '';
        let lastName = this.peopleForm.get('lastName')?.value || '';
        const documentType = this.peopleForm.get('documentType')?.value || '';
        const documentNumber = this.peopleForm.get('documentNumber')?.value || '';
        const emailAddress = this.peopleForm.get('emailAddress')?.value || '';
        const cellPhone = this.peopleForm.get('cellPhone')?.value || '';
        if (this.currentDocumentType.value === AppConstant.DOCUMENT_TYPE_RUC) {
            firstName = this.personResponse.full_name;
            lastName = '';
        }
        const dataToEmit: WhoSenderFormData = {
            first_names: firstName,
            last_name: lastName,
            document_number: documentNumber,
            document_type: documentType,
            email: emailAddress,
            phone: cellPhone,
            person_legal_area: this.personResponse?.juridical_area_id,
            package_headquarter_code: this.personResponse?.package_headquarter_code,
            discount_shipments_count: this.personResponse?.discount_shipments_count,
            rounding_factor: this.personResponse?.rounding_factor,
            tax_affectation_type_id: this.personResponse?.tax_affectation_type,
            employee_id: this.personResponse?.employee_id,
            personResponse: this.personResponse
        };
        console.log('onSubmitHandler', dataToEmit);
        this.submitWhoSenderForm.emit(dataToEmit);
    }

    documentNumberChangedHandler(change: boolean) {
        this.documentNumberChanged.emit(change);
        this.personExist = true;
        // this.cellphone = '';
        // this.documentNumber = '';
        this.disableFirstName();
        this.disableLastName();
        this.disableCellPhone();
        this.disableEmail();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        if (this.ref) {
            this.ref.close();
            this.ref = null;
        }
    }
}
