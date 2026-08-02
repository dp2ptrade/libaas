/*
# Add increment_coupon_usage function

1. New Functions
- `increment_coupon_usage(coupon_code text)`: Safely increments the used_count on a coupon when an order uses it.
- SECURITY DEFINER with explicit search_path, EXECUTE revoked from anon/authenticated.
*/

CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE coupons
  SET used_count = used_count + 1
  WHERE code = upper(coupon_code);
END;
$$;

REVOKE EXECUTE ON FUNCTION increment_coupon_usage(text) FROM anon, authenticated, PUBLIC;
