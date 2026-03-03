export interface Person {}

export interface PersonEntityResponse {
    document_number: string;
    document_type?: string;
    first_names?: string;
    last_name_maternal?: string;
    last_name_paternal?: string;
    full_name?: string;
    contributor_status?: string;
    registered_ruc_count?: number;
    phone?: string;
    email?: string;
    person_id?: string;
    person_type_id?: string;
    document_type_code?: string;
    from_cache?: boolean;
    juridical_area_id?: number;
    package_headquarter_code?: string;
    discount_shipments_count?: number;
    rounding_factor?: number;
    tax_affectation_type?: string;
    employee_id?: number;
}

export interface PersonValidatePayload {
    surname?: string;
}

export interface PersonValidateEntityResponse {
    valid?:           boolean;
    match?:           boolean;
    checked_field?:   string;
    source?:          string;
    from_cache?:      boolean;
    document_number?: string;
}
