/*
# Create site_content table for inline editable text

1. New Tables
- `site_content`: Stores key-value pairs of editable text content across the site.
  Each row has a unique key (e.g. "hero_title", "about_paragraph_1"), a value (the text),
  a type (text, longtext, html, image_url), and a page identifier for grouping.

2. Security
- RLS enabled on site_content.
- Public can read all content (anon + authenticated).
- Only admins can insert/update/delete content.
*/

CREATE TABLE IF NOT EXISTS site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL DEFAULT '',
  content_type text NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'longtext', 'html', 'image_url')),
  page text NOT NULL DEFAULT 'home',
  label text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_site_content_key ON site_content(key);
CREATE INDEX IF NOT EXISTS idx_site_content_page ON site_content(page);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_content_public_select" ON site_content;
CREATE POLICY "site_content_public_select" ON site_content
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "site_content_admin_insert" ON site_content;
CREATE POLICY "site_content_admin_insert" ON site_content
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "site_content_admin_update" ON site_content;
CREATE POLICY "site_content_admin_update" ON site_content
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "site_content_admin_delete" ON site_content;
CREATE POLICY "site_content_admin_delete" ON site_content
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Updated_at trigger
DROP TRIGGER IF EXISTS site_content_updated_at ON site_content;
CREATE TRIGGER site_content_updated_at
  BEFORE UPDATE ON site_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed default content
INSERT INTO site_content (key, value, content_type, page, label) VALUES
  ('hero_eyebrow', 'The Libaas Gallery — Est. 2026', 'text', 'home', 'Hero Eyebrow'),
  ('hero_title', 'Threads of Heritage', 'text', 'home', 'Hero Title'),
  ('hero_subtitle', 'Worn with grace, designed for distinction.', 'text', 'home', 'Hero Subtitle'),
  ('hero_cta_primary', 'Explore Collection', 'text', 'home', 'Hero Primary Button'),
  ('hero_cta_secondary', 'Our Story', 'text', 'home', 'Hero Secondary Button'),
  ('manifesto_title', 'Where Heritage Meets the Contemporary', 'text', 'home', 'Manifesto Title'),
  ('manifesto_body', 'We weave the soul of Bangladeshi craftsmanship into every garment. Each piece is a conversation between centuries-old textile traditions and the clean lines of modern design — created for those who wear their identity with quiet confidence.', 'longtext', 'home', 'Manifesto Body'),
  ('feature_1_title', 'Artisanal Craft', 'text', 'home', 'Feature 1 Title'),
  ('feature_1_desc', 'Hand-finished by master tailors', 'text', 'home', 'Feature 1 Description'),
  ('feature_2_title', 'Premium Fabrics', 'text', 'home', 'Feature 2 Title'),
  ('feature_2_desc', 'Sourced from the finest mills', 'text', 'home', 'Feature 2 Description'),
  ('feature_3_title', 'Free Delivery', 'text', 'home', 'Feature 3 Title'),
  ('feature_3_desc', 'On all orders over ৳5,000', 'text', 'home', 'Feature 3 Description'),
  ('feature_4_title', 'Easy Returns', 'text', 'home', 'Feature 4 Title'),
  ('feature_4_desc', '7-day return guarantee', 'text', 'home', 'Feature 4 Description'),
  ('new_arrivals_title', 'New Arrivals', 'text', 'home', 'New Arrivals Title'),
  ('new_arrivals_subtitle', 'Fresh silhouettes, just landed', 'text', 'home', 'New Arrivals Subtitle'),
  ('about_hero_title', 'Our Story', 'text', 'about', 'About Hero Title'),
  ('about_hero_subtitle', 'A celebration of Bangladeshi textile heritage, reimagined for the modern wardrobe.', 'longtext', 'about', 'About Hero Subtitle'),
  ('footer_tagline', 'Artisanal heritage, reimagined for the modern wardrobe.', 'text', 'home', 'Footer Tagline')
ON CONFLICT (key) DO NOTHING;
