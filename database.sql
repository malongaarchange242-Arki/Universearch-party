-- Schéma de base de données PassEvent
-- Schéma PostgreSQL pour la plateforme SaaS PassEvent
-- Généré à partir du schéma Prisma

-- ============================================
-- TABLE UTILISATEURS
-- ============================================
-- Stocke les informations des utilisateurs
CREATE TABLE IF NOT EXISTS "users" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  school VARCHAR(255),
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index sur email pour recherches plus rapides
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users"("email");

-- ============================================
-- TABLE ÉVÉNEMENTS
-- ============================================
-- Stocke les informations des événements
CREATE TABLE IF NOT EXISTS "events" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,  -- en XAF
  date TIMESTAMP NOT NULL,
  location VARCHAR(255) NOT NULL,
  "createdBy" UUID NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index pour meilleures performances
CREATE INDEX IF NOT EXISTS "idx_events_createdBy" ON "events"("createdBy");
CREATE INDEX IF NOT EXISTS "idx_events_date" ON "events"("date");

-- ============================================
-- TABLE PAIEMENTS
-- ============================================
-- Stocke les enregistrements de transactions de paiement
CREATE TABLE IF NOT EXISTS "payments" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "eventId" UUID NOT NULL REFERENCES "events"(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL DEFAULT 0,  -- en XAF
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',  -- EN ATTENTE, SUCCÈS, ÉCHOUÉ, EXPIRÉ
  "momoReference" VARCHAR(255) NOT NULL,
  "externalId" VARCHAR(255),
  "customerName" VARCHAR(255),  -- Nom du client
  "phoneNumber" VARCHAR(20),  -- Numéro MTN MoMo
  quantity INTEGER DEFAULT 1,  -- Nombre de tickets
  "transactionId" VARCHAR(255),  -- ID Transaction fourni par le client
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index pour meilleures performances
CREATE INDEX IF NOT EXISTS "idx_payments_userId" ON "payments"("userId");
CREATE INDEX IF NOT EXISTS "idx_payments_eventId" ON "payments"("eventId");
CREATE INDEX IF NOT EXISTS "idx_payments_momoReference" ON "payments"("momoReference");
CREATE INDEX IF NOT EXISTS "idx_payments_status" ON "payments"("status");
CREATE INDEX IF NOT EXISTS "idx_payments_transactionId" ON "payments"("transactionId");
CREATE INDEX IF NOT EXISTS "idx_payments_phoneNumber" ON "payments"("phoneNumber");

-- ============================================
-- TABLE BILLETS
-- ============================================
-- Stocke les billets générés après paiement réussi
CREATE TABLE IF NOT EXISTS "tickets" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "eventId" UUID NOT NULL REFERENCES "events"(id) ON DELETE CASCADE,
  "paymentId" UUID NOT NULL UNIQUE REFERENCES "payments"(id) ON DELETE CASCADE,
  "qrCode" TEXT NOT NULL,  -- Code QR encodé en Base64 ou URL
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',  -- ACTIF, UTILISÉ, EXPIRÉ
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index pour meilleures performances
CREATE INDEX IF NOT EXISTS "idx_tickets_userId" ON "tickets"("userId");
CREATE INDEX IF NOT EXISTS "idx_tickets_eventId" ON "tickets"("eventId");
CREATE INDEX IF NOT EXISTS "idx_tickets_paymentId" ON "tickets"("paymentId");
CREATE INDEX IF NOT EXISTS "idx_tickets_status" ON "tickets"("status");

-- ============================================
-- VUES (Optionnel)
-- ============================================

-- Vue : Événements des utilisateurs
CREATE OR REPLACE VIEW user_events_view AS
SELECT 
  u.id as user_id,
  u.name as user_name,
  u.email as user_email,
  e.id as event_id,
  e.title as event_title,
  e.price,
  e.date,
  e.location,
  COUNT(t.id) as total_tickets_sold
FROM "users" u
LEFT JOIN "events" e ON e."createdBy" = u.id
LEFT JOIN "tickets" t ON t."eventId" = e.id
GROUP BY u.id, e.id;

-- Vue : Revenus par événement
CREATE OR REPLACE VIEW event_revenue_view AS
SELECT 
  e.id as event_id,
  e.title as event_title,
  e.date,
  COUNT(p.id) as total_payments,
  COUNT(CASE WHEN p.status = 'SUCCESSFUL' THEN 1 END) as successful_payments,
  SUM(CASE WHEN p.status = 'SUCCESSFUL' THEN p.amount ELSE 0 END) as total_revenue,
  COUNT(t.id) as total_tickets_generated
FROM "events" e
LEFT JOIN "payments" p ON p."eventId" = e.id
LEFT JOIN "tickets" t ON t."eventId" = e.id
GROUP BY e.id;

-- Vue : Activité des utilisateurs
CREATE OR REPLACE VIEW user_activity_view AS
SELECT 
  u.id as user_id,
  u.name as user_name,
  u.email as user_email,
  COUNT(p.id) as total_payments,
  COUNT(CASE WHEN p.status = 'SUCCESSFUL' THEN 1 END) as successful_payments,
  SUM(CASE WHEN p.status = 'SUCCESSFUL' THEN p.amount ELSE 0 END) as total_spent,
  COUNT(t.id) as total_tickets
FROM "users" u
LEFT JOIN "payments" p ON p."userId" = u.id
LEFT JOIN "tickets" t ON t."userId" = u.id
GROUP BY u.id;

-- ============================================
-- COMMENTAIRES POUR LA DOCUMENTATION
-- ============================================
COMMENT ON TABLE "users" IS 'Stocke les profils utilisateurs pour la plateforme PassEvent';
COMMENT ON TABLE "events" IS 'Stocke les informations des événements créés par les utilisateurs';
COMMENT ON TABLE "payments" IS 'Stocke les enregistrements de transactions de paiement depuis MTN MoMo';
COMMENT ON TABLE "tickets" IS 'Stocke les billets générés après paiements réussis';

COMMENT ON COLUMN "payments"."amount" IS 'Montant en XAF (ex: 2500 = 2 500 XAF)';
COMMENT ON COLUMN "events"."price" IS 'Prix en XAF (ex: 2500 = 2 500 XAF)';
COMMENT ON COLUMN "payments"."momoReference" IS 'ID de référence de l''API MTN MoMo';
COMMENT ON COLUMN "tickets"."qrCode" IS 'Code QR encodé en Base64 ou URL vers l''image du code QR';
