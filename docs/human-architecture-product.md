# Chumes Intranet - Business Rules & Product Specification V1

## 1. What is Chumes

Chumes is a rental and sales business for event materials including tablecloths, chair covers, furniture, and decorative items.

The system manages:
- Customers
- Quotes
- Events
- Inventory
- Deliveries
- Payments

---

## 2. How the Business Works

### Step 1: Customer Request

Clients request pricing without fixed dates or locations.

---

### Step 2: Quotation

A quote is generated based on:
- Products
- Estimated location
- Estimated delivery cost

---

### Step 3: Customer Approval

Customer confirms intent to proceed.

---

### Step 4: Event Creation

Only after approval, an event is created and inventory is validated.

---

## 3. Key Business Rules

### 3.1 Inventory

- Products are limited in stock
- If stock is insufficient:
  - Items can be produced
  - Items can be rented externally

---

### 3.2 Deposits

- Deposits are optional
- Amount is decided case by case
- Can be fixed or percentage
- Refund depends on event outcome

---

### 3.3 Cancellations

- Default policy: 7 days before event = full refund
- Exceptions can be approved manually by admin

---

### 3.4 Delivery

- Delivery cost depends on zones
- Cost is suggested by system
- Final price can be adjusted manually
- Discounts may apply for special customers

---

### 3.5 Partners (Business Relationships)

Clients may have commercial agreements:

- Event planners → discount model
- Venues → referral or commission model (future)

---

### 3.6 Payments

- Payments are tracked per event
- Deposits are separate from payments
- Revenue reports exclude deposits

---

## 4. Operational Flexibility

The system is designed to:
- Suggest values
- Allow human override
- Track decisions for reporting

---

## 5. Future Features

- WhatsApp integration
- Google Calendar sync
- Customer portal
- Email marketing
- Automated invoicing