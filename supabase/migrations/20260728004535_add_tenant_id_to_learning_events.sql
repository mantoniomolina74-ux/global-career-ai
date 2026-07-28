-- Agregar tenant_id para soporte multi-tenant
ALTER TABLE learning_events
ADD COLUMN tenant_id TEXT;

-- Índice para consultas por tenant
CREATE INDEX IF NOT EXISTS idx_learning_events_tenant_id
ON learning_events (tenant_id);

-- (Opcional) Si todos los registros futuros deben pertenecer a un tenant,
-- cuando la migración de datos esté completa podremos convertir esta columna
-- en NOT NULL mediante una migración posterior.