import { HeadquartersEntityResponse } from '@shipment-record/models/headquarters.model';
import { PersonEntityResponse } from '@/modules/people/models/person.model';
import { ReturnChargeDetail } from '@shipment-record/models/return-charge.model';
import { DestinationAddressFormState, DestinationStoreFormState } from '@shipment-record/models/destination-form.model';
import { CartItemEntityResponse } from '@shipment-record/models/cart-item.model';

export interface CartPayload {
    person?: PersonPayload;
    origin?: OriginPayload;
    items?: CartItemPayload[];
    pricing?: any;
}

export interface OriginPayload {
    headquarter_id?: number;
    ubigeo_id?: string | number;
    address?: string;
    headquarter_name?: string;
    ubigeo?: string;
    office_code?: number;
}

export interface PersonPayload {
    document_number?: string;
    document_type?: string;
    first_names?: string;
    last_name_paternal?: string;
    last_name_maternal?: string;
    last_name?: string;
    phone?: string;
    full_name?: string;
    email?: string;
    person_legal_area?: number;
    package_headquarter_code?: string;
    discount_shipments_count?: number;
    rounding_factor?: number;
    tax_affectation_type_id?: string;
    employee_id?: number;
}

export interface CartState {
    // sessionUuid?: string;
    reset?: boolean;
    person: PersonEntityResponse | null;
    origin: HeadquartersEntityResponse | null;
    items?: CartItemDraft[];
    // destinations?: any[]; // ajusta según tu modelo
    // createdAt?: Date;
}

export interface CartEntityResponse {
    session_id?: string;
    data?: CartEntityDataResponse;
    from_cache?: boolean;
}

export interface CartEntityDataResponse {
    person?: CartPersonEntityResponse;
    origin?: CartOriginEntityResponse;
    items?: CartItemEntityResponse[];
    pricing?: CartPricingEntityResponse;
    final_amount_for_payment?: number;
    nroPedidoPreventa?: string;
    presale_result?: CartPresaleResultEntityResponse;
    pagoefectivo_result?: CartPEEntityResponse;
}

export interface CartOriginEntityResponse {
    headquarter_id?: number;
    ubigeo_id?: string | number;
    office_code?: string;
    headquarter_name?: string;
    address?: string;
    ubigeo?: string;
}

export interface CartPricingEntityResponse {
    service_id?: number;
    exclusive_rate?: number;
    total?: number;
}

export interface CartPersonEntityResponse {
    document_type?: string;
    document_number?: string;
    first_names?: string;
    last_name?: string;
    cellphone?: string;
    email_address?: string;
}

export interface CartPresaleResultEntityResponse {
    presale_id?: string;
    nroPedidoPreventa?: string;
    remitos?: string;
    fecha?: string;
    hora?: string;
    tarjeta?: string;
}

export interface CartPEEntityResponse {
    cip_code?: string;
    currency?: string;
    amount?: number;
    expiration_date?: Date;
    cip_url?: string;
    qr_image?: null;
    nroPedidoPreventa?: string;
}


export interface CartPresaleLabelEntityResponse {
    filename?: string;
    mime_type?: string;
    pdf_base64?: string;
}

export interface CartItemPayload {
    weight?: number;
    shipment_type?: ShipmentType;
    declared_value?: number;
    height?: number;
    width?: number;
    length?: number;
    return_charge?: boolean;
    return_charge_detail?: CartItemReturnChargeDetailPayload;
    article_id?: number;
    fragile?: number | boolean;
    person?: CartItemPersonPayload;
    address?: CartItemAddressPayload;
}


export type CartItemDestinationType = 'home' | 'store';
export type ShipmentType = 'D' | 'O';

export interface CartItemDestinationPayload {
    type: CartItemDestinationType;
    address?: DestinationAddressFormState;
    store?: DestinationStoreFormState;
}

export interface CartItemOriginPayload {
    headquarter_id?: number;
    ubigeo_id?: string | number;
    headquarter_name?: string;
    address?: string;
    ubigeo?: string;
}

export interface CartItemAddressPayload {
    ubigeo?: string;
    ubigeo_id?: string | number;
    address?: string;
    reference?: string;
    address_id?: string;
    is_office?: boolean;
    office_code?: string | number;
    headquarter_id?: string | number;
    headquarter_name?: string;
}

export interface CartItemPersonPayload {
    document_number?: string;
    document_type?: string;
    first_names?: string;
    last_name?: string;
}

export interface CartItemReturnChargeDetailPayload {
    folios?: number;
    address?: CartItemAddressPayload;
}

export interface CartItemDraft {
    person?: PersonPayload;
    destination?: CartItemDestinationPayload;
    return_charge?: boolean;
    return_charge_detail?: ReturnChargeDetail;
    article_id?: number;
    declared_value?: number;
    length?: number;
    width?: number;
    height?: number;
    weight?: number;
    fragile?: number | boolean;
}

export interface CartNiubizSessionEntityResponse {
    session_key?: string;
    expiration?: string;
    merchant_id?: string;
    nroPedidoPreventa?: string;
}

// export type CartItemWhatSendPayload = Pick<CartItemDraft, 'article_id' | 'declared_value' | 'length' | 'width' | 'height' | 'weight' | 'fragile'>;

// export interface CartItemEntityResponse extends CartItemPayload {}
