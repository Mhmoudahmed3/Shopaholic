-- ============================================================
-- Reham Shop — PostgreSQL Database Schema
-- Run this once: psql -d reham_shop -f db/schema.sql
-- Or via npm script: npm run db:setup
-- ============================================================

-- Enable UUID generation (requires the pgcrypto extension)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. USERS
--    Stores both customers (role='customer') and admins (role='admin').
--    Passwords are stored as bcrypt hashes — never plain text.
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(150)  NOT NULL,
    email         VARCHAR(255)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    role          VARCHAR(20)   NOT NULL DEFAULT 'customer'
                  CHECK (role IN ('customer', 'admin')),
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Index for login look-ups (email is always the lookup key)
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- ============================================================
-- 2. CATEGORIES
--    Hierarchical category structure using a self-referential FK.
--    Example: parent "Women" (parent_id IS NULL)
--             child  "Women > Shoes" (parent_id = women.id)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    slug        VARCHAR(100) NOT NULL UNIQUE,
    parent_id   UUID         REFERENCES categories(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories (parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug   ON categories (slug);

-- ============================================================
-- 3. PRODUCTS
--    Core product table. images is stored as a JSONB array of URLs.
--    category_id references categories(id).
--    type is the fine-grained label (e.g. 'shirts', 'sneakers').
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    name           VARCHAR(255)  NOT NULL,
    description    TEXT,
    price          NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    discount_price NUMERIC(10,2) CHECK (discount_price >= 0),
    stock          INTEGER       NOT NULL DEFAULT 0 CHECK (stock >= 0),
    category_id    UUID          REFERENCES categories(id) ON DELETE SET NULL,
    type           VARCHAR(100),
    images         JSONB         NOT NULL DEFAULT '[]',
    is_new         BOOLEAN       NOT NULL DEFAULT FALSE,
    popularity     INTEGER       NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_type     ON products (type);
-- Full-text search index on name + description
CREATE INDEX IF NOT EXISTS idx_products_fts ON products
    USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- ============================================================
-- 4. ORDERS
--    One order per checkout. shipping_address stored as JSONB
--    so it flexibly holds any address shape without extra tables.
--    status: pending → processing → shipped → delivered → cancelled
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status           VARCHAR(30)   NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    subtotal         NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
    tax              NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
    total            NUMERIC(10,2) NOT NULL CHECK (total >= 0),
    shipping_address JSONB,
    stripe_payment_intent_id VARCHAR(255),
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);

-- ============================================================
-- 5. ORDER_ITEMS
--    Line items for each order.
--    unit_price is LOCKED at the time of purchase (snapshot),
--    so price changes to the product don't alter historical orders.
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    UUID          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id  UUID          REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,   -- snapshot in case product is deleted
    quantity    INTEGER       NOT NULL CHECK (quantity > 0),
    unit_price  NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order   ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items (product_id);

-- ============================================================
-- 6. TRIGGER: auto-update updated_at on row changes
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables that have updated_at
DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY ARRAY['users','categories','products','orders'] LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_%s_updated_at
             BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
            tbl, tbl
        );
    END LOOP;
END $$;

-- ============================================================
-- 7. SEED: Default admin user
--    Password: Admin@1234 (bcrypt hash — change after first login!)
-- ============================================================
INSERT INTO users (name, email, password_hash, role)
VALUES (
    'Admin',
    'admin@rehamshop.com',
    '$2a$12$2IuWL4V7ww8Qe.zV6h5lauifFwI6D8nYw5pFY9TJxZKHi3p.aGUJi',
    'admin'
)
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- 8. SEED: Top-level categories
-- ============================================================
INSERT INTO categories (name, slug) VALUES
    ('Women', 'women'),
    ('Men', 'men'),
    ('Accessories', 'accessories'),
    ('Children', 'children')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Done! All tables created successfully.
-- ============================================================
