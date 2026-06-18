Chumes Intranet - Arquitectura Funcional V1
1. Visión General

Chumes Intranet es una plataforma web interna diseñada para administrar las operaciones de alquiler y venta de mantelería, mobiliario y accesorios para eventos.

El sistema busca centralizar la gestión de clientes, cotizaciones, reservas, eventos, inventario, pagos y alianzas comerciales en una única plataforma.

La primera versión estará enfocada en optimizar el flujo operativo actual de Chumes, reduciendo la dependencia de herramientas externas como Google Calendar, hojas de cálculo y procesos manuales.

2. Objetivos del Negocio
Objetivos Operativos
Centralizar la información de clientes.
Gestionar cotizaciones de forma rápida y organizada.
Controlar disponibilidad de inventario por fecha.
Reducir errores por sobreventa o sobre-reserva.
Llevar control de pagos y adelantos.
Gestionar entregas y recogidas.
Registrar daños y pérdidas de inventario.
Objetivos Comerciales
Gestionar alianzas con event planners.
Gestionar alianzas con salones de eventos.
Aplicar descuentos automáticos por convenio.
Medir ventas generadas por aliados comerciales.
Preparar la plataforma para campañas de marketing futuras.
Objetivos Estratégicos
Construir una plataforma escalable.
Preparar integración futura con Google Calendar.
Preparar integración futura con Facturación Electrónica de Costa Rica.
Preparar integración futura con Email Marketing.
Preparar integración futura con Firma Digital y Contratos Electrónicos.
3. Alcance de la Versión 1 (MVP)
Incluido
Autenticación de usuarios.
Gestión de clientes.
Gestión de aliados comerciales.
Gestión de productos.
Gestión de inventario.
Gestión de cotizaciones.
Gestión de reservas y eventos.
Gestión de pagos.
Calendario interno.
Registro de daños y pérdidas.
Dashboard administrativo.
No Incluido
Facturación electrónica.
WhatsApp Business API.
Email marketing.
Firma digital.
Portal de clientes.
Aplicación móvil.
4. Flujo General del Negocio
Flujo Comercial

Solicitud de Cliente
→ Cotización
→ Validación del Cliente
→ Definición de Fecha y Lugar
→ Validación de Disponibilidad
→ Reserva
→ Adelanto
→ Entrega
→ Pago Final
→ Recogida
→ Inspección
→ Cierre del Evento

Flujo de Inventario

Inventario Disponible
→ Reserva
→ Entrega
→ Recogida
→ Inspección
→ Disponible Nuevamente

Flujo de Daños

Recogida
→ Inspección
→ Daño Detectado
→ Cobro al Cliente
→ Ajuste de Inventario

5. Principios de Negocio
Disponibilidad

Un producto no podrá ser reservado si existe una reserva activa durante el período solicitado.

Recuperación de Inventario

Después de una recogida, el inventario permanecerá bloqueado durante un período de recuperación definido por la empresa.

Inicialmente se utilizará una regla global de recuperación de 1 día.

Cotizaciones

Las cotizaciones podrán crearse sin fecha o lugar definidos.

Reservas

Una reserva solamente podrá crearse cuando exista una fecha definida y disponibilidad confirmada.

Pagos

El sistema permitirá registrar adelantos, pagos parciales y pagos finales.

Clientes Exonerados

El sistema deberá soportar clientes exentos de impuestos para futuras integraciones de facturación electrónica.

Aliados Comerciales

Los aliados comerciales podrán generar descuentos especiales y serán rastreados como fuente de negocio.