export interface CartItem {
}

export interface CartItemPayload {
    who_receive?: CartItemWhoPersonReceivesPayload;
    what_send?: CartItemWhatSendPayload;
    destination?: CartItemDestinationPayload;

    /// ////////////
    uuid?: string;
    weight?: number;
    shipment_type?: number;
    declared_value?: number;
    fragile?: boolean;
    height?: number;
    width?: number;
    length?: number;
    return_charge?: boolean;
    article_id?: number;
    delivery_type?: string;
    deliver_to_office?: number;
}

export interface CartItemDestinationPayload {
    // ubigeo?: string;
    ubigeo_id?: string;
    address?: string;
    reference?: string;
    polygon?: string;
    office_id?: number;

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

// who receives

export interface CartItemWhoPersonReceivesPayload {
    document_number?: string;
    document_type?: string;
    first_names?: string;
    last_name?: string;
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
}
