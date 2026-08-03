CREATE TABLE IF NOT EXISTS "platform_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "platform_name" TEXT NOT NULL DEFAULT 'Velnox Commerce Platform',
    "commission_percent" DECIMAL(5,2) NOT NULL DEFAULT 5,
    "auto_approve_merchants" BOOLEAN NOT NULL DEFAULT false,
    "require_product_review" BOOLEAN NOT NULL DEFAULT true,
    "payment_credit_card" BOOLEAN NOT NULL DEFAULT true,
    "payment_prompt_pay" BOOLEAN NOT NULL DEFAULT true,
    "payment_bank_transfer" BOOLEAN NOT NULL DEFAULT true,
    "payment_cod" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "platform_settings" ("id", "updated_at") VALUES ('default', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;