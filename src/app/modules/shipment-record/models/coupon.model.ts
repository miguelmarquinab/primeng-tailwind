export interface CouponEntityResponse {
  session_id?: string;
  coupon_code?: string;
  is_valid?: boolean;
  code?: string;
  message?: string;
  next_step?: string;
}
