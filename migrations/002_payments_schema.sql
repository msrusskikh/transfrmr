-- Payments table for storing verified payments
CREATE TABLE payments (
    order_id VARCHAR(35) PRIMARY KEY,
    status VARCHAR(50) NOT NULL,
    amount INTEGER NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups by order_id (already primary key, but explicit index for clarity)
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_verified_at ON payments(verified_at);
