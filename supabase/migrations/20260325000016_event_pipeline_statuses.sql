-- Refresh commercial/operational pipelines, add archive statuses, and
-- migrate current deals into the requested starting columns.

ALTER TABLE events
  ADD COLUMN archived_at TIMESTAMPTZ;

CREATE INDEX events_archived_at_idx ON events(archived_at);

INSERT INTO event_statuses (code, name, description, phase, sort_order) VALUES
  ('PREP_CURRENT_WEEK', 'Preparando - Semana Actual', 'Event in preparation for the current week', 'OPERATIONAL', 110),
  ('PREP_DAY_BEFORE', 'Preparando - Día Previo', 'Event in preparation the day before delivery', 'OPERATIONAL', 120),
  ('WON_ARCHIVED', 'Cerrado Ganado - Archivo', 'Won event moved to history', 'TERMINAL', 200);

-- Archive already-closed won events before COMPLETED becomes operational.
UPDATE events
SET
  status_id = (SELECT id FROM event_statuses WHERE code = 'WON_ARCHIVED'),
  archived_at = COALESCE(archived_at, updated_at, now())
WHERE status_id = (SELECT id FROM event_statuses WHERE code = 'COMPLETED');

-- Treat cancelled operational events as lost archives.
UPDATE events
SET
  status_id = (SELECT id FROM event_statuses WHERE code = 'LOST'),
  archived_at = COALESCE(archived_at, updated_at, now())
WHERE status_id = (SELECT id FROM event_statuses WHERE code = 'CANCELLED');

UPDATE events
SET archived_at = COALESCE(archived_at, updated_at, now())
WHERE status_id = (SELECT id FROM event_statuses WHERE code = 'LOST')
  AND archived_at IS NULL;

-- Existing commercial deals start in Cotizado - Pendiente de Aprobar.
UPDATE events
SET status_id = (SELECT id FROM event_statuses WHERE code = 'QUOTE_SENT')
WHERE status_id IN (
  SELECT id FROM event_statuses
  WHERE phase = 'COMMERCIAL'
    AND is_active = true
    AND code <> 'QUOTE_SENT'
);

-- Existing operational deals start in Reservado.
UPDATE events
SET status_id = (SELECT id FROM event_statuses WHERE code = 'RESERVED')
WHERE status_id IN (
  SELECT id FROM event_statuses
  WHERE phase = 'OPERATIONAL'
    AND is_active = true
    AND code <> 'RESERVED'
);

UPDATE event_statuses SET
  name = 'Solicitud - Inicial',
  description = 'New inquiry or lead',
  sort_order = 10
WHERE code = 'INQUIRY';

UPDATE event_statuses SET
  name = 'Seguimiento - Sin respuesta',
  description = 'Customer has not responded',
  sort_order = 20
WHERE code = 'NO_RESPONSE';

UPDATE event_statuses SET
  name = 'Seguimiento - Sin Cotizar',
  description = 'Follow-up before a quote exists',
  sort_order = 30
WHERE code = 'QUOTING';

UPDATE event_statuses SET
  name = 'Cotizado - Sin fecha',
  description = 'Quoted but event dates are missing',
  sort_order = 40
WHERE code = 'QUOTED_NO_DATES';

UPDATE event_statuses SET
  name = 'Cotizado - Pendiente de Aprobar',
  description = 'Quote waiting for customer approval',
  sort_order = 50
WHERE code = 'QUOTE_SENT';

UPDATE event_statuses SET
  name = 'Seguimiento - Semana Actual',
  description = 'Active follow-up for the current week',
  sort_order = 60
WHERE code = 'FOLLOW_UP';

UPDATE event_statuses SET
  name = 'Aprobado - Pendiente depósito',
  description = 'Commercially approved, waiting for deposit',
  sort_order = 70
WHERE code = 'APPROVED';

UPDATE event_statuses SET
  name = 'Reservado',
  description = 'Confirmed and inventory reserved',
  sort_order = 100
WHERE code = 'RESERVED';

UPDATE event_statuses SET
  name = 'Entregado',
  description = 'Equipment delivered',
  sort_order = 130
WHERE code = 'DELIVERED';

UPDATE event_statuses SET
  name = 'Listo para recolección',
  description = 'Equipment ready for pickup',
  sort_order = 140
WHERE code = 'PICKED_UP';

UPDATE event_statuses SET
  name = 'Inspección',
  description = 'Post-event inspection',
  sort_order = 150
WHERE code = 'INSPECTION_PENDING';

UPDATE event_statuses SET
  name = 'Cerrado Ganado',
  description = 'Won event still in the operational board',
  phase = 'OPERATIONAL',
  sort_order = 160
WHERE code = 'COMPLETED';

UPDATE event_statuses SET
  name = 'Cerrado Perdido - Archivo',
  description = 'Lost event moved to history',
  sort_order = 210
WHERE code = 'LOST';

UPDATE event_statuses SET
  is_active = false,
  sort_order = 220
WHERE code = 'CANCELLED';
