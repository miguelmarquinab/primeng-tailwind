/**
 * GET /v1/price/{sessionId} — response
 */
export interface PriceRateEntityResponse {
    coupon_id?: number | null;
    promotion_id?: number | null;
    coupon_code?: string | null;
    article_id?: number;
    office_id?: number | null;
    headquarter_id?: number;
    person_legal_area?: number;
    ubigeo_id?: number;
    service_id?: number;
    real_weight?: number;
    volumetric_weight?: number | null;
    consigned_weight?: number | null;
    declared_value?: number;
    discount_shipments_count?: number | null;
    entry_channel_flag?: string;
    package_headquarter_id?: number | null;
    id_sede_paquete_evaluado?: number | null;
    nro_version_client?: string;
    complement_service_ids?: string | null;
    standard_base_amount?: number;
    standard_overage_amount?: number;
    base_amount?: number;
    overage_amount?: number;
    insurance_amount?: number;
    other_costs_amount?: number;
    deliver_to_office?: number;
    flg_paquete_cliente?: boolean;
    error_message?: string | null;
    amount?: number;
    igv?: number;
}

export interface PriceItemEntityResponse {
    code?: string;
    description?: string;
    message?: string;
    rate?: PriceRateEntityResponse;
}

export interface PriceDataEntityResponse {
    items?: PriceItemEntityResponse[];
    total_amount?: number;
    currency?: string;
    igv_total?: number;
}

export interface PriceEntityResponse {
    data?: PriceDataEntityResponse;
}
