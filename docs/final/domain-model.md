# Chumes - Domain Model

## 1. Introducción

Este documento define el modelo de dominio de la aplicación de gestión para **Chumes Todo en Mantelería**.

El sistema está diseñado para administrar:

* Cotizaciones de alquiler y venta.
* Gestión de eventos.
* Disponibilidad de inventario.
* Reservas de activos.
* Manejo de proveedores externos.
* Pagos, anticipos, garantías y devoluciones.
* Segmentación de clientes.
* Auditoría de operaciones.

El objetivo principal es mantener separadas las responsabilidades del negocio:

```
Cliente
   ↓
Cotización
   ↓
Evento
   ↓
Inventario
   ↓
Pago
```

Una cotización representa una intención comercial.

Un evento representa un compromiso real del negocio.

---

# 2. Bounded Contexts

El sistema se divide en los siguientes dominios:

```
Identity
Clientes
Catálogo
Ventas
Eventos
Inventario
Abastecimiento
Finanzas
Configuración
Auditoría
```

---

# 3. Identity Management

## Propósito

Gestionar usuarios internos que utilizan la aplicación.

La autenticación será manejada externamente mediante Clerk.

La información operativa del usuario será manejada dentro del sistema.

---

## Entidades

## Profile

Representa un usuario interno de Chumes.

Ejemplo:

```
José Badilla
Rol:
Manager
```

Responsabilidades:

* Identificar usuarios internos.
* Asociar permisos.
* Controlar actividad del usuario.

---

## Role

Define los permisos dentro del sistema.

Roles iniciales:

```
ADMIN

MANAGER

OPERATOR
```

---

# 4. Cliente

## Propósito

Administrar las personas y organizaciones que solicitan servicios.

Un cliente puede ser:

```
Persona física

Empresa

Gobierno

Event Planner

Salón de eventos
```

---

## Entidades

## Client

Representa la entidad comercial.

Información:

* Nombre.
* Identificación.
* Tipo de cliente.
* Información de contacto.

---

## Client Contact

Permite manejar múltiples contactos.

Ejemplo:

Empresa:

```
Eventos XYZ

Contactos:

Juan
María
```

---

# 5. Catálogo

## Propósito

Administrar los productos y servicios ofrecidos.

---

## Product

Representa un activo o producto comercial.

Ejemplos:

```
Mantel blanco

Silla Tiffany

Mesa redonda

Camino de mesa azul
```

Un producto puede utilizarse para:

```
Alquiler

Venta

Servicio
```

---

## Product Category

Agrupa productos.

Ejemplo:

```
Mantelería

Sillas

Mesas

Decoración
```

---

## Tax

Representa impuestos disponibles.

Los impuestos son configurables y aplicados por línea de cotización.

Ejemplo:

```
IVA 13%

Exento
```

---

# 6. Cotizaciones

## Propósito

Representar una propuesta comercial enviada al cliente.

Una cotización:

* Tiene productos.
* Tiene precios.
* Puede tener descuentos.
* Puede tener impuestos.
* No reserva inventario.

---

## Entidades

## Quotation

Representa la propuesta completa.

Ejemplo:

```
Cotización #00123

Cliente:
María

Total:
₡300000
```

---

## Quotation Item

Representa cada línea comercial.

Ejemplo:

```
100 manteles blancos

Precio alquiler:
₡1500
```

Puede representar:

```
RENTAL

SALE

SERVICE
```

---

## Discount Code

Permite aplicar descuentos mediante códigos.

Ejemplo:

```
SALON10

10%
```

Actualmente no maneja:

* Comisiones.
* Partners.
* Liquidaciones.

---

# 7. Eventos

## Propósito

Representar un compromiso confirmado con un cliente.

Un evento nace cuando:

* El cliente acepta la cotización.
* Se valida disponibilidad.
* Se confirma la reserva.

---

## Event

Representa la ejecución real del servicio.

Información:

* Fecha evento.
* Fecha entrega.
* Fecha recogida.
* Cliente.
* Estado.

---

## Event Item

Representa lo que el evento requiere.

Ejemplo:

```
Evento boda:

200 sillas

300 manteles
```

---

## Event Location

Representa ubicaciones relacionadas.

Ejemplo:

```
Lugar evento

Lugar entrega

Lugar recogida
```

---

# 8. Inventario

## Propósito

Controlar disponibilidad y movimientos de activos.

---

El inventario funciona mediante movimientos.

No se modifica directamente.

---

## Inventory Balance

Representa cantidad actual.

Ejemplo:

```
Mantel blanco:

500 unidades
```

---

## Inventory Movement

Representa cambios.

Ejemplos:

```
INITIAL

PURCHASE

PRODUCTION

EVENT_OUT

EVENT_RETURN

DAMAGE

LOSS

ADJUSTMENT
```

---

Ejemplo:

Entrega:

```
-200 manteles
```

Retorno:

```
+195 manteles
```

Daño:

```
-5 manteles
```

---

## Inventory Reservation

Representa inventario comprometido para eventos futuros.

Una reserva:

NO disminuye inventario físico.

---

# 9. Abastecimiento externo

## Propósito

Manejar productos que deben conseguirse con terceros.

Ejemplo:

Cliente necesita:

```
300 sillas
```

Chumes tiene:

```
200
```

Proveedor externo:

```
100
```

---

## Supplier

Representa proveedores externos.

---

## Event Procurement

Representa necesidad de abastecimiento.

Ejemplo:

```
Evento X

Faltan:

100 sillas
```

---

## Supplier Quote

Representa una oferta del proveedor.

Ejemplo:

```
Proveedor:

100 sillas

Costo:

₡500 unidad
```

El costo externo:

NO modifica automáticamente el precio del cliente.

---

# 10. Finanzas

## Propósito

Gestionar flujo monetario.

---

Separación importante:

## Venta

Dinero ganado por servicio.

## Garantía

Dinero retenido temporalmente.

---

## Payment Requirement

Define lo esperado.

Ejemplo:

```
Anticipo:

30%
```

---

## Payment

Representa dinero recibido.

Ejemplo:

```
Cliente pagó:

₡100000
```

---

## Refund

Representa dinero devuelto.

Ejemplo:

```
Garantía devuelta:

₡50000
```

---

# 11. Cancelaciones

## Propósito

Gestionar cancelación de eventos.

Las devoluciones NO son automáticas.

---

## Event Cancellation

Guarda:

* Motivo.
* Usuario solicitante.
* Usuario aprobador.
* Monto autorizado.

---

Un administrador decide excepciones.

---

# 12. Configuración

## Business Settings

Información general del negocio.

Ejemplo:

```
Nombre empresa

Logo

Moneda

Impuesto default
```

---

# 13. Auditoría

## Audit Logs

Registra cambios importantes.

Ejemplos:

Cambio precio:

Antes:

```
1500
```

Después:

```
1800
```

Acciones:

```
CREATE

UPDATE

DELETE

APPROVE

REFUND

CANCEL
```

---

# 14. Principios de diseño

## Separación de responsabilidades

Cotización ≠ Evento

Evento ≠ Pago

Inventario ≠ Venta

---

## Historial primero

Los cambios importantes nunca deben perder información.

---

## Configurable

Evitar valores quemados.

---

## Preparado para crecimiento

El sistema debe permitir evolucionar hacia:

* Partners.
* Comisiones.
* Marketing.
* Facturación electrónica.
* Logística.
* Multiusuario.
* Reportes avanzados.

---

# Fin del Domain Model
