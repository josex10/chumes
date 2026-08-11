# Chumes Intranet - Architecture Specification V1

## 1. System Overview

Chumes Intranet is a transactional system designed to manage rental and sale operations for event-related inventory including textiles, furniture, and accessories.

The system is built using:

- Next.js (App Router)
- TypeScript
- Supabase (PostgreSQL)
- Clerk (Authentication)

The core domain is centered around quotations, events, inventory allocation, logistics, and financial tracking.

---

## 2. Core Domain Principles

### 2.1 Quote-to-Event Model

- Quotations do NOT reserve inventory.
- Inventory is reserved only when an Event is successfully created.
- Event creation is the single source of truth for operational commitment.

---

### 2.2 Human-in-the-loop Decision System

The system provides calculated suggestions but allows manual overrides for:

- Delivery fees
- Deposits
- Discounts
- Refunds
- External procurement decisions

---

### 2.3 Inventory Model

Inventory is composed of:

- Internal stock (owned by Chumes)
- External supply (third-party rental procurement)

Availability is dynamically computed based on event allocations.

---

## 3. Domain Entities

### 3.1 Client

Represents any entity interacting commercially with Chumes.

Types:
- FINAL_CLIENT
- EVENT_PLANNER
- EVENT_VENUE
- COMPANY
- GOVERNMENT

---

### 3.2 Client Type

Defines segmentation for reporting and rules.

---

### 3.3 Business Agreement (implicit via Client role)

Defines commercial behavior:

- Discount-based model
- Commission-based model (future)
- Mixed model (future)

---

### 3.4 Product

Represents rentable or sellable items.

Fields:
- id
- name
- category_id
- rental_price
- sale_price (optional)
- cost_of_damage

---

### 3.5 Inventory

Represents stock units per product.

Stock is computed, not statically stored.

---

### 3.6 Quotation

Lifecycle entity used to generate commercial proposals.

#### Status

- DRAFT
- SENT
- CUSTOMER_APPROVED
- PENDING_AVAILABILITY
- CONVERTED
- REJECTED
- EXPIRED

---

### 3.7 Event

Operational execution entity.

#### Status

- RESERVED
- DELIVERED
- PICKED_UP
- INSPECTION_PENDING
- COMPLETED
- CANCELLED

---

### 3.8 Payment

Represents monetary transactions excluding deposits.

Types:
- ADVANCE
- PARTIAL
- FINAL

---

### 3.9 Security Deposit

Independent financial entity.

Not part of revenue.

Fields:
- type (FIXED | PERCENTAGE)
- suggested_amount
- final_amount
- status

Status:
- REQUESTED
- RECEIVED
- PARTIALLY_APPLIED
- APPLIED
- REFUNDED

---

### 3.10 Incident

Tracks damages or losses.

Status:
- OPEN
- CHARGED
- WAIVED
- CLOSED

---

### 3.11 Delivery Zone

Defines logistic pricing regions.

Fields:
- name
- suggested_fee
- editable_fee (per quotation/event)

---

### 3.12 External Supply Request

Represents missing inventory fulfilled externally.

Fields:
- product_id
- quantity
- supplier_reference
- cost

---

## 4. Business Flow

### 4.1 Quotation Flow

DRAFT → SENT → CUSTOMER_APPROVED → EVENT_CREATION → CONVERTED

---

### 4.2 Event Creation Flow

1. Validate inventory availability
2. Compute missing supply
3. Allow:
   - internal fulfillment
   - external procurement
4. Create event
5. Reserve inventory
6. Persist logistics & financials

---

### 4.3 Cancellation Flow

- Policy-based suggestion engine
- Admin override allowed
- Refund tracked independently

---

## 5. Financial Rules

- Deposits are excluded from revenue reporting
- Payments are revenue only if linked to service execution
- Refunds are separate ledger entries

---

## 6. Logistics Rules

- Delivery is zone-based
- Each zone has a suggested fee
- Final fee is always editable
- Both values are stored for analytics

---

## 7. Inventory Rules

- Availability is computed, not stored
- External supply is valid fulfillment method
- Event reservation is the locking mechanism

---

## 8. Future Considerations

- Google Calendar integration
- WhatsApp integration
- Email marketing segmentation
- Invoice generation (Costa Rica compliance)




## REGLAS DE NEGOCIO RN

### RN-01: Conflictos de Inventario

La existencia de conflictos de inventario NO impide la creación de un evento.

Cuando la disponibilidad calculada sea menor que la cantidad requerida, el sistema deberá:

- Permitir la creación del evento.
- Registrar el conflicto detectado.
- Marcar el evento como "Con Conflictos de Inventario".
- Mostrar el conflicto en los paneles de seguimiento operativo.

Los conflictos podrán resolverse mediante:

- Confección de inventario adicional.
- Alquiler a proveedores externos.
- Reprogramación logística.
- Ajustes autorizados por la administración.

### RN-02:  n evento puede originarse a partir de una cotización aprobada o ser creado directamente por un usuario autorizado.


## CASOS DE USO CU


### CU-002: Convertir Cotización en Evento

#### Flujo Principal

1. El usuario selecciona una cotización aprobada.
2. El sistema solicita la información final del evento.
3. El sistema calcula la disponibilidad para las fechas indicadas.
4. El sistema crea el evento.

#### Flujo Alternativo A1: Conflicto de Inventario

1. El sistema detecta faltantes de inventario.
2. El sistema muestra el detalle de los conflictos encontrados.
3. El usuario puede continuar con la creación del evento.
4. El sistema registra los conflictos asociados al evento.
5. El evento queda marcado para seguimiento operativo.


## Estrategia de Disponibilidad

La disponibilidad es una recomendación operativa y no una restricción absoluta.

El sistema deberá identificar conflictos de inventario y notificarlos oportunamente, pero no bloqueará la creación de eventos.

La responsabilidad de resolver dichos conflictos recae en la operación mediante:

- Confección.
- Abastecimiento externo.
- Reprogramación logística.
- Otras decisiones autorizadas.