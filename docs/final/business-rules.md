# Chumes - Business Rules

## 1. Propósito
Este documento define las reglas de negocio que gobiernan el funcionamiento de la plataforma Chumes.

Estas reglas representan decisiones tomadas sobre la operación actual del negocio y deben ser consideradas antes de realizar cambios en el sistema.

---

# 2. Clientes

## RN-001 - Tipos de cliente

El sistema debe permitir clasificar clientes para reportes y segmentación comercial.

Tipos iniciales:

* Persona física.
* Empresa.
* Gobierno.
* Event Planner.
* Salón de eventos.

La clasificación del cliente no debe controlar automáticamente impuestos.

---

## RN-002 - Información de cliente

Un cliente puede tener múltiples contactos asociados.

Ejemplo:

Una empresa puede tener varios responsables.

---

## RN-003 - Segmentación

El tipo de cliente podrá utilizarse para:

* Reportes.
* Marketing.
* Comunicación comercial.

---

# 3. Cotizaciones

## RN-004 - Cotización como propuesta comercial

Una cotización representa una propuesta enviada al cliente.

Una cotización:

* No reserva inventario.
* No bloquea fechas.
* No garantiza disponibilidad.

---

## RN-005 - Aprobación de cotización

Cuando un cliente acepta una cotización:

El sistema debe iniciar el proceso de creación del evento.

---

## RN-006 - Validación de disponibilidad

Al crear un evento desde una cotización:

El sistema debe validar disponibilidad de inventario.

---

## RN-007 - Conflicto de inventario

Si existe conflicto:

El sistema debe informar al usuario.

El usuario podrá decidir:

* Cancelar proceso.
* Ajustar fechas.
* Resolver manualmente.
* Buscar abastecimiento externo.

---

## RN-008 - Cotización histórica

Una cotización aprobada debe conservar:

* Productos.
* Cantidades.
* Precios.
* Impuestos.
* Descuentos.

Los cambios futuros no deben modificar el historial.

---

# 4. Productos

## RN-009 - Productos reutilizables

Un producto puede representar:

* Alquiler.
* Venta.
* Servicio.

---

## RN-010 - Precio de alquiler y venta

Un producto puede tener:

* Precio alquiler.
* Precio venta.

Aunque actualmente normalmente se manejan separados, el modelo debe soportar ambos escenarios.

---

## RN-011 - Inventario por variante

Productos similares pero diferentes deben manejarse separados.

Ejemplo:

Mantel blanco:

≠

Mantel negro

---

Forro blanco:

≠

Forro licra

---

# 5. Inventario

## RN-012 - Inventario por movimientos

El inventario no debe modificarse directamente.

Toda variación debe registrarse mediante movimientos.

---

## RN-013 - Movimientos permitidos

Tipos iniciales:

* Inicial.
* Compra.
* Producción.
* Salida evento.
* Retorno evento.
* Daño.
* Pérdida.
* Ajuste.

---

## RN-014 - Reservas

Las reservas no disminuyen inventario físico.

Representan compromisos futuros.

---

## RN-015 - Disponibilidad

La disponibilidad debe calcularse:

Inventario físico

menos

Reservas activas

igual

Disponible

---

## RN-016 - Entrega de evento

El inventario solamente disminuye cuando el producto sale físicamente.

---

## RN-017 - Retorno de evento

Cuando retorna inventario:

Debe registrarse:

* Cantidad recibida.
* Daños.
* Pérdidas.

---

# 6. Eventos

## RN-018 - Evento como compromiso real

Un evento representa una operación confirmada.

---

## RN-019 - Fechas del evento

Un evento debe manejar:

* Fecha del evento.
* Fecha entrega.
* Fecha recogida.

---

## RN-020 - Lavado y preparación

El día de recogida puede afectar disponibilidad debido a:

* Lavado.
* Secado.
* Planchado.
* Preparación.

El sistema debe permitir advertencias de conflicto.

---

## RN-021 - Conflictos permitidos

Un evento puede crearse aunque exista una advertencia de inventario.

La decisión final será del usuario autorizado.

---

# 7. Abastecimiento externo

## RN-022 - Inventario externo

Un evento puede utilizar:

* Inventario propio.
* Inventario externo.
* Ambos.

---

## RN-023 - Costo externo

El costo de terceros no modifica automáticamente el precio del cliente.

---

## RN-024 - Decisión administrativa

La selección del proveedor externo es una decisión interna.

---

## RN-025 - Comparación proveedores

El sistema debe permitir registrar diferentes opciones de proveedores antes de seleccionar.

---

# 8. Pagos

## RN-026 - Separación financiera

El sistema debe diferenciar:

* Venta.
* Anticipo.
* Garantía.
* Devolución.

---

## RN-027 - Anticipo

El anticipo puede ser:

* Porcentaje.
* Monto fijo.
* No requerido.

---

## RN-028 - Garantía

La garantía no representa ingreso.

Es dinero retenido temporalmente.

---

## RN-029 - Pago final

El saldo pendiente debe calcularse contra pagos realizados.

---

# 9. Cancelaciones

## RN-030 - Cancelación manual

Las cancelaciones no generan devoluciones automáticas.

---

## RN-031 - Decisión administrativa

Un usuario autorizado decide:

* Monto devolución.
* Si aplica devolución.
* Motivo.

---

## RN-032 - Historial

Toda cancelación debe conservar:

* Usuario.
* Fecha.
* Motivo.
* Decisión tomada.

---

# 10. Impuestos

## RN-033 - Impuestos por línea

Los impuestos pertenecen a cada línea de cotización.

---

## RN-034 - Impuesto default

El sistema puede aplicar un impuesto predeterminado.

---

## RN-035 - Modificación manual

Un usuario autorizado puede cambiar o eliminar impuesto antes de confirmar.

---

# 11. Descuentos

## RN-036 - Código descuento

El sistema debe permitir aplicar códigos de descuento.

---

## RN-037 - Descuento comercial

El descuento afecta la cotización, no modifica inventario ni costos internos.

---

## RN-038 - Partners futuros

La lógica de comisiones y referidos queda fuera de V1.

---

# 12. Auditoría

## RN-039 - Acciones auditables

Debe existir historial para:

* Cambios de precio.
* Ajustes inventario.
* Cancelaciones.
* Devoluciones.
* Cambios importantes.

---

## RN-040 - Usuario responsable

Las acciones importantes deben guardar quién las realizó.

---

# 13. Configuración

## RN-041 - Valores configurables

Valores de negocio no deben estar quemados.

Ejemplos:

* Impuestos.
* Moneda.
* Datos empresa.

---

# 14. Principios generales

## RN-042 - La aplicación apoya decisiones

El sistema debe ayudar al usuario, no reemplazar decisiones comerciales.

---

## RN-043 - Historial primero

Los datos históricos no deben modificarse eliminando información.

---

## RN-044 - Preparado para crecimiento

El diseño debe permitir agregar:

* Marketing.
* Partners.
* Facturación electrónica.
* Logística.
* Reportes avanzados.

---

# Fin Business Rules
