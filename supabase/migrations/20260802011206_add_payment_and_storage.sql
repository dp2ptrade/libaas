/*
# Add payment reference columns and storage bucket for product images

1. Modified Tables
- `orders`: add `payment_reference` column already exists - verify. Add `payment_details` jsonb column for storing transaction metadata from bKash/Nagad/Stripe.

2. Storage
- Create `product-images` bucket (public) for admin product image uploads.
- Create `email-logs` table to track order notification emails sent by edge functions.

3. Security
- Storage policies: only authenticated users can upload to product-images bucket; public can read.
- email-logs table: only authenticated users can read; edge function (service role) can insert.
*/

-- Add payment_details column to orders for storing gateway response metadata
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'payment_details'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_details jsonb;
  END IF;
END $$;

-- Create email-logs table for tracking order notification emails
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  recipient text NOT NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  sent_at timestamptz DEFAULT now()
);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_email_logs_auth" ON email_logs;
CREATE POLICY "select_email_logs_auth" ON email_logs
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_email_logs_service" ON email_logs;
CREATE POLICY "insert_email_logs_service" ON email_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- Insert the storage bucket (using DO block for idempotency)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product-images bucket
-- Public read access
DROP POLICY IF EXISTS "public_read_product_images" ON storage.objects;
CREATE POLICY "public_read_product_images" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'product-images');

-- Authenticated users can upload (admins)
DROP POLICY IF EXISTS "auth_upload_product_images" ON storage.objects;
CREATE POLICY "auth_upload_product_images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images');

-- Authenticated users can update/delete (admins)
DROP POLICY IF EXISTS "auth_update_product_images" ON storage.objects;
CREATE POLICY "auth_update_product_images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "auth_delete_product_images" ON storage.objects;
CREATE POLICY "auth_delete_product_images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-images');
