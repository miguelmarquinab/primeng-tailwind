import { DELIVERY_TYPE } from '@shipment-record/contansts/shipment-record-step.constant';

export interface CartItem {}

export interface CartItemPayload {
    who_receive?: CartItemWhoPersonReceivesPayload;
    what_send?: CartItemWhatSendPayload;
    destination?: CartItemDestinationPayload;
    service?: CartItemServicePayload;
    return_charge?: CartItemReturnChargePayload;

    // /// ////////////
    // uuid?: string;
    // weight?: number;
    // shipment_type?: number;
    // declared_value?: number;
    // fragile?: boolean;
    // height?: number;
    // width?: number;
    // length?: number;
    // return_charge?: boolean;
    // article_id?: number;
    // delivery_type?: string;
    // deliver_to_office?: number;
}

export interface CartItemReturnChargePayload extends CartItemDestinationPayload {
    folio?: number;
    returnChargeControl?: boolean;
}
export interface CartItemDestinationPayload {
    // ubigeo?: string;
    ubigeo_id?: string;
    address?: string;
    reference?: string;
    polygon?: string;
    office_id?: number;
    delivery_type?: DELIVERY_TYPE;
    longitude?: number;
    latitude?: number;
    address_card?: string;
    // address_id?: string;
    // is_office?: boolean;
    // office_code?: null;
    // headquarter_id?: string;
    // headquarter_name?: string;

    // ubigeo_id: '1392';
    // address: 'AV ARGENTINA NRO 4458';
    // reference: 'Frente a la puerta principal';
    // polygon: 'string';
    // office_id: 123; // Solo para envío a Tienda o Agente
}
export interface CartItemDestinationFormState extends CartItemDestinationPayload {
    // type: string;
    valid?: boolean;
    cargo_flag?: string;
    // reference?: string; //???
}

export interface CartItemWhoPersonReceivesPayload {
    document_number?: string;
    document_type?: string;
    first_names?: string;
    last_name?: string;
    phone?: string;
}

export interface CartItemWhatSendPayload {
    weight?: number;
    shipment_type?: number;
    fragile?: boolean;
    height?: number;
    width?: number;
    length?: number;
    article_id?: number;
    declared_value?: number;
    size_id?: string;
    custom_size?: boolean;
}

export interface CartItemServicePayload {
    return_charge?: boolean;
    delivery_type?: DELIVERY_TYPE;
}

export interface CartItemEntityResponse {
    who_receive?: CartItemWhoReceiveEntityResponse;
    what_send?: CartItemWhatSendEntityResponse;
    destination?: CartItemDestinationEntityResponse;
    service?: CartItemServiceEntityResponse;
    pricing?: CartItemPricingEntityResponse;
    return_charge?: CartItemDestinationReturnChargeEntityResponse;
    uuid?: string;
}

export interface CartItemDestinationEntityResponse {
    ubigeo_id?: string;
    address?: string;
    reference?: string;
    polygon?: string;
    office_id?: number;
    longitude?: number;
    latitude?: number;
    address_card?: string;
    office?: CartItemDestinationOfficeEntityResponse;
    ubigeo?: CartItemDestinationUbigeoEntityResponse;
}
export interface CartItemDestinationReturnChargeEntityResponse extends CartItemDestinationEntityResponse {
    folio?: number;
}
export interface CartItemDestinationUbigeoEntityResponse {
    ubigeo_id?: string;
    department_code?: string;
    province_code?: string;
    district_code?: string;
    name?: string;
    representative_id?: string;
    ubigeo_concatenated?: string;
    ubigeo_code?: string;
    headquarter_code?: string;
    headquarter_id?: string;
    cargo_flag?: string;
    delivery_type?: string;
    destination_code?: string;
    department?: string;
    province?: string;
    district?: string;
    headquarter_name?: string;
    headquarter_address?: string;
    office_type?: null;
    latitude?: null;
    longitude?: null;
    receive_shipment?: boolean;
    pickup_shipment?: boolean;
    schedule?: null;
    is_agent?: boolean;
    department_latitude?: string;
    department_longitude?: string;
    is_open?: boolean;
}

export interface CartItemPricingEntityResponse {
    amount?: number;
}

export interface CartItemServiceEntityResponse {
    return_charge?: boolean;
    delivery_type?: string;
}
export interface CartItemDestinationOfficeEntityResponse {
    office_id?: string;
    nombres?: string;
    tipo?: string;
    ubigeo?: string;
    partner?: string;
    direccion?: string;
    lng?: string;
    lat?: string;
    department?: string;
    province?: string;
    district?: string;
    office_name?: string;
    office_address?: string;
}

export interface CartItemWhatSendEntityResponse {
    weight?: number;
    shipment_type?: number;
    declared_value?: number;
    fragile?: number;
    height?: number;
    width?: number;
    length?: number;
    article_id?: number;
    size_id?: string;
    custom_size?: boolean;
    article_category?: CartItemArticleCategoryEntityResponse;
}

export interface CartItemArticleCategoryEntityResponse {
    id?: number;
    code?: string;
    name?: string;
    description?: string;
}

export interface CartItemWhoReceiveEntityResponse {
    document_number?: string;
    document_type?: string;
    first_names?: string;
    last_name?: string;
    phone?: string;
}
