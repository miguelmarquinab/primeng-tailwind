import { Component, inject, OnInit } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { PersonFormComponent } from '@shipment-record/steps/components/step1/shipment-record-who-sender-form/person-form.component';
import { ShipmentRecordOriginFormComponent } from '@shipment-record/steps/components/step1/shipment-record-origin-form/shipment-record-origin-form.component';
import { WhoSenderFormData } from '@shipment-record/models/who-sender-form.model';
import { CartSessionStorageService } from '@shipment-record/services/cart-session-storage.service';
import { CartService } from '@shipment-record/services/cart.service';
import { HeadquartersEntityResponse } from '@shipment-record/models/headquarters.model';
import { HeadquartersService } from '@shipment-record/services/headquarters.service';
import { CreateCartPayload, OriginPayload, PersonPayload } from '@shipment-record/models/cart.model';
import { PersonConstant } from '@shipment-record/contansts/person.constant';
import { Subject, takeUntil } from 'rxjs';
import { ShipmentRecordWhoPayFormComponent } from '@shipment-record/steps/components/step1/shipment-record-who-pay-form/shipment-record-who-pay-form.component';

@Component({
    selector: 'app-shipment-record-step1',
    imports: [AccordionModule, InputTextModule, SelectModule, ButtonModule, PersonFormComponent, ShipmentRecordOriginFormComponent, ShipmentRecordWhoPayFormComponent],
    templateUrl: './shipment-record-step1.component.html',
    styleUrl: './shipment-record-step1.component.scss'
})
export class ShipmentRecordStep1Component implements OnInit {
    /**
     * Only for dev
     */
    // currentAccordionIndex = 1;
    // panelsDisabled: boolean[] = [false, false, false]; /** panel 0 habilitado, panel 1 deshabilitado */

    /**
     * Config for Normal Flow
     */
    currentAccordionIndex = 0;
    panelsDisabled: boolean[] = [false, true, true]; /** panel 0 habilitado, panel 1 deshabilitado */
    cartData!: any;
    headquarters: HeadquartersEntityResponse[] = [];
    person!: PersonPayload;
    whoSend!: WhoSenderFormData;
    whoPay!: any;
    currentHeadquarter!: HeadquartersEntityResponse;
    protected readonly PersonConstant = PersonConstant;
    private readonly cartSessionService = inject(CartSessionStorageService);
    private readonly cartService = inject(CartService);
    private readonly headquartersService = inject(HeadquartersService);
    private readonly destroy$ = new Subject<void>();

    ngOnInit(): void {
        this.cartData = this.cartSessionService.getCartData();
        this.getAllHeadquarters();
    }

    submitWhoSenderForm(event: WhoSenderFormData) {
        this.whoSend = event;
        this.currentAccordionIndex = 1;
        this.panelsDisabled[1] = false;
        this.cartSessionService.setHeaderWhoSender(this.buildPersonPayload());
        this.cartService
            //.create()
            .create(this.buildCreateCartBody())
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.cartSessionService.setCardId(response.session_id);
                }
            });
    }

    buildPersonPayload(): PersonPayload {
        console.log(this.whoSend);

        return {
            document_type: this.whoSend.document_type ?? '',
            document_number: this.whoSend.document_number ?? '',
            first_names: this.whoSend.first_names ?? '',
            last_name: this.whoSend.last_name ?? '',
            phone: this.whoSend.phone ?? '',
            email: this.whoSend.email ?? '',
            employee_id: this.whoSend.employee_id,
            discount_shipments_count: this.whoSend.discount_shipments_count,
            rounding_factor: this.whoSend.rounding_factor,
            package_headquarter_code: this.whoSend.package_headquarter_code,
            tax_affectation_type_id: this.whoSend.tax_affectation_type_id,
            person_legal_area: this.whoSend.person_legal_area
        };
    }

    buildOriginPayload(): OriginPayload {
        return {
            headquarter_id: this.currentHeadquarter.headquarter_id,
            ubigeo_id: this.currentHeadquarter.ubigeo_id,
            headquarter_name: this.currentHeadquarter.headquarter_name,
            address: this.currentHeadquarter.address,
            ubigeo: this.currentHeadquarter.ubigeo_concatenated
        };
    }

    handleSubmitOriginForm(event: any) {
        console.log('handleSubmitOriginForm', event);

        this.currentHeadquarter = this.getHeadquarterById(event.origin);
        if (this.currentHeadquarter) {
            const originPayload = this.buildOriginPayload();
            this.cartSessionService.setHeaderOrigin(originPayload);
            const sessionUuid = this.cartSessionService.getCartId();
            if (!sessionUuid) {
                return;
            }

            /* Refactory */
            // const payload = this.cartSessionService.buildCartPayload();
            const payload = this.cartSessionService.buildCartPayload().origin;
            if (!payload) {
                return;
            }

            /* Refactory */
            //this.cartService.update(sessionUuid, payload).subscribe({
            this.cartService.setOrigin(sessionUuid, payload).subscribe({
                next: (response) => {
                    this.currentAccordionIndex = 2;
                    this.panelsDisabled[2] = false;
                    // this.cartService.setStepNumber(2);
                }
            });
        }
    }

    submitWhoPayForm(event: any) {
        console.log('submitWhoPayForm', event);
        console.log('whoPay', event.whoPay.paymentType);
        console.log('whoPay', event.detail);
        const paymentType = event.whoPay.paymentType;
        const whoPayDetail = event.detail;

        /* Start Refactory */
        // this.cartSessionService.setWhoPay(paymentType, whoPayDetail);
        // this.cartService.setStepNumber(2);

        const sessionUuid = this.cartSessionService.getCartId();

        if (!sessionUuid) {
            return;
        }

        this.cartService.setWhoPays(sessionUuid, { who_pays: paymentType }).subscribe({
            next: () => {
                this.cartSessionService.setWhoPay(paymentType, whoPayDetail);
                this.cartService.setStepNumber(2);
            }
        });

        /* End Refactory */
        this.whoPay = event;
        this.cartSessionService.setWhoPay(paymentType, whoPayDetail);
        this.cartService.setStepNumber(2);
    }

    getHeadquarterById(headquarterId: string): HeadquartersEntityResponse {
        console.log(headquarterId)
        console.log(typeof headquarterId)
        return (
            this.headquarters.find((headquarter) => headquarter.headquarter_id === headquarterId) || {
                headquarter_id: '0',
                name: '',
                address: '',
                ubigeo_concatenated: ''
            }
        );
    }
    onAccordionChange(event: any) {
        this.currentAccordionIndex = event.index;
    }

    getAllHeadquarters() {
        this.headquartersService.getAll().subscribe({
            next: (headquarters) => {
                this.headquarters = headquarters.data ?? [];
            },
            error: (error) => {
                console.log(error);
            }
        });
    }

    personDocumentChanged(event: boolean) {
        if (event) {
            this.panelsDisabled[1] = true;
        }
    }

    buildCreateCartBody(): CreateCartPayload {
        return {
            person: this.buildPersonPayload()
        };
    }
}
