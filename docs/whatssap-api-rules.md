# WhatsApp Webhook — Plan maestro de implementación

> **Documento de referencia para implementar la integración de WhatsApp Business Cloud API con el CRM.**
>
> Este documento define el comportamiento esperado, las reglas de negocio y el alcance de la primera versión.
>
> **IMPORTANTE:** Antes de modificar código existente, analizar la arquitectura actual del proyecto, las tablas de Supabase, los modelos existentes de Customer/Event y los formularios actuales. No crear estructuras duplicadas si ya existe una solución equivalente.

---

# 1. Objetivo del módulo

El objetivo es integrar WhatsApp Business Cloud API con el CRM para evitar que potenciales clientes se pierdan porque el usuario no tuvo tiempo de registrarlos manualmente.

Actualmente pueden llegar múltiples mensajes por WhatsApp, especialmente durante fines de semana o mientras el usuario está trabajando en eventos.

El sistema debe detectar automáticamente los mensajes entrantes y determinar si el número telefónico corresponde a:

1. Un Customer existente con un Event abierto.
2. Un Customer existente sin Event abierto.
3. Un número que todavía no existe como Customer.

La V1 **NO debe crear automáticamente Customers ni Events**.

La V1 debe crear una bandeja de contactos detectados automáticamente que permita al usuario decidir qué hacer posteriormente.

---

# 2. Objetivo de negocio

El problema que se quiere solucionar es:

> "Un cliente me escribió por WhatsApp, pero no tuve tiempo de registrarlo en el CRM y posteriormente se me olvidó darle seguimiento."

El módulo debe garantizar que ese contacto quede registrado como pendiente de revisión.

El principio fundamental es:

```text
WhatsApp
    ↓
Webhook
    ↓
CRM
    ↓
Detectar contacto
    ↓
Registrar oportunidad
    ↓
Usuario decide qué hacer
```

El Webhook no debe tomar decisiones comerciales por el usuario.

---

# 3. Alcance de la V1

La V1 debe:

* Recibir Webhooks de WhatsApp.
* Validar que el Webhook sea legítimo.
* Procesar mensajes entrantes.
* Obtener el número telefónico del remitente.
* Normalizar el número.
* Buscar el Customer por teléfono.
* Determinar si existe un Event abierto.
* Crear un registro en `automatic_customers` cuando corresponda.
* Evitar registros duplicados.
* Contabilizar múltiples mensajes del mismo contacto.
* Mostrar los contactos pendientes en el CRM.
* Permitir descartar un contacto.
* Permitir crear un Customer desde el contacto.
* Permitir crear un Event desde el contacto.
* Prellenar el teléfono.
* Asociar automáticamente el Customer existente cuando corresponda.
* Mantener el estado predeterminado de Event ya existente en el CRM.
* Mantener historial del registro automático.

---

# 4. Fuera del alcance de la V1

NO implementar en esta versión:

* Creación automática de Customers.
* Creación automática de Events.
* Respuestas automáticas de WhatsApp.
* Chatbot.
* IA para interpretar mensajes.
* Cotizaciones automáticas.
* Extracción automática de fecha.
* Extracción automática de cantidad de personas.
* Extracción automática de tipo de evento.
* Clasificación automática del lead.
* Obtención automática del nombre del contacto.
* APIs externas para obtener nombres.
* Bandeja completa de conversaciones WhatsApp.
* Automatización de seguimiento.
* Mensajes de marketing.
* Envío automático de plantillas.

Estas funcionalidades podrán implementarse posteriormente.

---

# 5. Arquitectura general

La arquitectura esperada es:

```text
                    WhatsApp
                       │
                       │ Webhook
                       ▼
             ┌──────────────────┐
             │   Next.js API    │
             │                  │
             │ /api/webhooks/   │
             │     whatsapp     │
             └────────┬─────────┘
                      │
                      ▼
               Validar evento
                      │
                      ▼
             Normalizar teléfono
                      │
                      ▼
              Buscar Customer
                      │
             ┌────────┴────────┐
             │                 │
            NO                SÍ
             │                 │
             ▼                 ▼
      Buscar Automatic    Buscar Event
         Customer           abierto
             │                 │
             │          ┌──────┴──────┐
             │          │             │
             │         SÍ            NO
             │          │             │
             │          ▼             ▼
             │        No hacer     Automatic
             │        nada         Customer
             │
             ▼
      Crear/actualizar
      Automatic Customer
             │
             ▼
        CRM / WhatsApp Leads
             │
       ┌─────┼──────────┐
       │     │          │
       ▼     ▼          ▼
    Desechar Customer  Customer
              +         + Event
            Customer
```

---

# 6. Entidades principales

El módulo debe mantener separadas estas entidades:

```text
customers
events
automatic_customers
```

Conceptualmente:

```text
automatic_customer
        │
        │ opcional
        ▼
    customer
        │
        ▼
      events
```

Un `automatic_customer` NO es un Customer.

Es un registro temporal/de revisión que representa un contacto detectado automáticamente.

---

# 7. Customer

Un Customer representa un cliente real registrado en el CRM.

La identificación de Customers provenientes de WhatsApp será exclusivamente por número telefónico.

No utilizar:

* Nombre.
* Nombre de perfil de WhatsApp.
* Foto.
* Información inferida.
* IA.
* Datos externos.

La V1 utiliza:

```text
normalized_phone
```

como identificador de negocio.

---

# 8. Event

En este CRM un Event representa conceptualmente un Deal.

El módulo debe utilizar los Events existentes en el sistema.

No crear nuevos estados.

El módulo debe distinguir:

```text
Event abierto
Event ganado
Event perdido
```

Los nombres y valores exactos deben reutilizar los existentes en el proyecto.

---

# 9. Tabla `automatic_customers`

Crear una tabla:

```text
automatic_customers
```

Esta tabla representa contactos detectados automáticamente que todavía requieren revisión.

NO debe reemplazar `customers`.

NO debe aparecer como Customer normal.

Debe funcionar como una bandeja de WhatsApp Leads.

---

# 10. Campos preliminares de `automatic_customers`

La estructura exacta debe adaptarse al esquema existente, pero conceptualmente debe contemplar:

```text
id
phone
normalized_phone
source
status
customer_id
message_count
first_message_at
last_message_at
created_at
updated_at
```

## Descripción

### `id`

Primary key.

### `phone`

Número original recibido desde WhatsApp.

### `normalized_phone`

Número utilizado para búsquedas y prevención de duplicados.

### `source`

Origen.

Valor esperado:

```text
whatsapp
```

### `status`

Estado del Automatic Customer.

Valores iniciales:

```text
pending
discarded
converted
```

### `customer_id`

Nullable.

Si el número ya corresponde a un Customer existente, guardar la relación.

### `message_count`

Cantidad de mensajes recibidos mientras el contacto está siendo gestionado.

### `first_message_at`

Fecha/hora del primer mensaje detectado.

### `last_message_at`

Fecha/hora del mensaje más reciente.

---

# 11. Regla fundamental: un contacto = un lead

Un mismo número puede enviar múltiples mensajes.

No se debe crear un Automatic Customer por cada mensaje.

Ejemplo:

```text
+50688990000

Mensaje 1
Mensaje 2
Mensaje 3
Mensaje 4
```

Debe existir:

```text
1 automatic_customer
message_count = 4
```

No:

```text
4 automatic_customers
```

La unidad de seguimiento es el contacto.

El mensaje es una actividad del contacto.

---

# 12. Prevención de duplicados

Debe existir como máximo un `automatic_customer` pendiente por número normalizado.

Regla conceptual:

```text
UNIQUE(normalized_phone) WHERE status = 'pending'
```

La implementación debe utilizar una restricción/índice PostgreSQL apropiado.

No confiar únicamente en lógica del frontend o en:

```text
SELECT → INSERT
```

porque dos Webhooks concurrentes podrían generar registros duplicados.

La integridad debe estar respaldada por la base de datos.

---

# 13. Idempotencia del Webhook

Los Webhooks pueden ser reenviados.

El mismo mensaje no debe procesarse dos veces.

Cuando WhatsApp proporcione un identificador único del mensaje/evento, este debe utilizarse para detectar duplicados.

Flujo:

```text
Webhook recibido
       ↓
Obtener message/event ID
       ↓
¿Ya fue procesado?
       │
       ├── YES → No procesar nuevamente
       │
       └── NO → Procesar
```

La solución debe diseñarse de forma idempotente.

No depender exclusivamente de `message_count` para detectar duplicados.

---

# 14. Normalización del teléfono

Antes de consultar Customers o Automatic Customers, normalizar el número.

Ejemplos:

```text
+506 8899-0000
50688990000
```

deben poder convertirse a una representación consistente.

Para Costa Rica se debe considerar el código de país `506`.

Sin embargo, no hardcodear reglas que impidan posteriormente soportar otros países si el CRM puede recibir números internacionales.

La lógica final debe determinar:

```text
normalized_phone
```

y utilizarlo en las búsquedas.

---

# 15. Flujo del Webhook

## Paso 1 — Recibir evento

Meta envía:

```text
POST /api/webhooks/whatsapp
```

El endpoint recibe el payload.

---

## Paso 2 — Validar Webhook

Validar la autenticidad de la solicitud de acuerdo con la implementación recomendada por Meta.

No procesar el payload como confiable antes de completar las validaciones necesarias.

---

## Paso 3 — Validar payload

Comprobar que exista la información necesaria.

Como mínimo:

```text
message ID
sender phone
message type
timestamp
```

Si falta información crítica:

* Registrar error.
* No crear registros.
* Responder correctamente al Webhook.

---

## Paso 4 — Idempotencia

Comprobar si el mensaje/evento ya fue procesado.

Si ya fue procesado:

```text
return success
```

sin repetir operaciones.

---

## Paso 5 — Normalizar teléfono

Convertir el número recibido a:

```text
normalized_phone
```

---

## Paso 6 — Buscar Customer

Buscar Customer utilizando el número normalizado.

```text
customers.normalized_phone
```

Si el esquema actual no tiene `normalized_phone`, analizar cómo agregarlo sin romper funcionalidades existentes.

---

# 16. Caso A — Customer no existe

Si:

```text
Customer = NO
```

buscar si existe un:

```text
automatic_customer
status = pending
normalized_phone = X
```

### Si NO existe

Crear:

```text
automatic_customer
```

con:

```text
status = pending
message_count = 1
first_message_at = current timestamp
last_message_at = current timestamp
source = whatsapp
```

### Si YA existe

No crear otro registro.

Actualizar:

```text
message_count = message_count + 1
last_message_at = current timestamp
updated_at = current timestamp
```

---

# 17. Caso B — Customer existe + Event abierto

Si:

```text
Customer = YES
Event abierto = YES
```

NO crear:

* Customer.
* Automatic Customer.
* Event.

No modificar el Event existente.

El proceso termina.

Motivo de negocio:

El cliente probablemente está realizando una consulta relacionada con una reserva existente.

---

# 18. Caso C — Customer existe + NO Event abierto

Si:

```text
Customer = YES
Event abierto = NO
```

crear o actualizar un:

```text
automatic_customer
```

El registro debe mantener:

```text
customer_id = existing customer ID
```

De esta forma la interfaz sabrá:

```text
Customer encontrado:
María Rodríguez
```

y podrá ofrecer directamente:

```text
Crear Event
```

sin crear otro Customer.

---

# 19. Events cerrados

Si un Customer tiene Events en estados:

```text
Won
Lost
```

pero ninguno abierto:

```text
Event abierto = NO
```

debe considerarse el caso:

```text
Customer existente + nueva oportunidad
```

y crear un Automatic Customer pendiente.

---

# 20. WhatsApp Leads

Crear una sección del CRM para revisar:

```text
WhatsApp Leads
```

La interfaz debe mostrar como mínimo:

```text
Teléfono
Customer asociado
Cantidad de mensajes
Primer mensaje
Último mensaje
Estado
Fecha
```

Ejemplo:

```text
WhatsApp Leads

+506 8899-0000
Customer: No registrado
3 mensajes
Último mensaje: hace 5 minutos
Estado: Pendiente

[Revisar]
[Crear Customer]
[Desechar]
```

---

# 21. Customer existente

Si el Customer ya existe:

```text
WhatsApp Lead

Phone:
+506 8888-7777

Customer:
María Rodríguez

[Crear Event]
[Desechar]
```

No mostrar:

```text
Crear Customer
```

porque ya existe.

---

# 22. Acción "Desechar"

El usuario puede decidir que un contacto no necesita seguimiento.

Ejemplos:

* Padre/madre/familia.
* Amigo.
* Proveedor.
* Mensaje equivocado.
* Contacto no comercial.

Cambiar:

```text
status = discarded
```

No eliminar físicamente el registro en la V1.

El registro deja de aparecer entre pendientes.

---

# 23. Acción "Crear Customer"

Para un número que no existe:

Abrir el formulario existente de Customer.

El teléfono debe llegar prellenado:

```text
Phone:
+506 8899-0000
```

El usuario completa:

```text
Name
Customer Type
etc.
```

No intentar obtener el nombre automáticamente.

Al guardar correctamente:

```text
automatic_customer.status = converted
automatic_customer.customer_id = newly created customer
```

---

# 24. Acción "Crear Customer + Event"

Para un número que no existe:

```text
WhatsApp Lead
       ↓
Crear Customer
       ↓
Customer creado
       ↓
Abrir formulario Event
       ↓
Customer preseleccionado
       ↓
Usuario completa información
       ↓
Crear Event
```

El Event NO debe crearse automáticamente.

Debe utilizar el formulario y las reglas actuales del CRM.

---

# 25. Acción "Crear Event"

Para un Customer existente sin Event abierto:

```text
WhatsApp Lead
       ↓
Customer existente
       ↓
Crear Event
       ↓
Formulario Event
       ↓
Customer preseleccionado
```

El usuario completa los datos restantes.

Al crear correctamente:

```text
automatic_customer.status = converted
```

---

# 26. Estado de Event

Utilizar el estado inicial existente en el CRM.

No crear estados específicos para WhatsApp.

No modificar la lógica existente de creación de Events.

---

# 27. Nombre del contacto

La V1 NO intentará determinar automáticamente el nombre.

El número telefónico es suficiente para crear el WhatsApp Lead.

Ejemplo:

```text
Phone:
+50688990000
```

No crear:

```text
Automatic-WhatsApp-88990000
```

como Customer.

El concepto anterior de generar nombres automáticos queda descartado.

El registro vive en:

```text
automatic_customers
```

hasta que el usuario decida convertirlo.

---

# 28. Obtención futura del nombre

Queda como investigación para una versión futura.

Antes de implementar cualquier solución:

* Revisar qué información proporciona actualmente WhatsApp Cloud API.
* Determinar si el nombre del perfil está disponible.
* Revisar permisos.
* Revisar limitaciones.
* Determinar si el dato es confiable.
* Evaluar APIs externas solamente si realmente son necesarias.
* Revisar costos.

No agregar APIs externas en la V1.

---

# 29. Manejo de múltiples mensajes

Cuando un contacto tenga un Automatic Customer pendiente:

```text
message_count++
last_message_at = now()
```

No crear otro registro.

Ejemplo:

```text
automatic_customers

phone: +50688990000
status: pending
message_count: 7
first_message_at: 2026-08-22 10:20
last_message_at: 2026-08-22 18:45
```

Esto permitirá priorizar leads activos.

---

# 30. Futuro historial de mensajes

Aunque la V1 no requiere una bandeja completa de conversaciones, diseñar la solución pensando en una futura tabla:

```text
whatsapp_messages
```

Relación conceptual:

```text
automatic_customer
       │
       │ 1:N
       ▼
whatsapp_messages
```

Un mensaje representa una actividad.

Un Automatic Customer representa el contacto/oportunidad pendiente.

No mezclar ambas responsabilidades.

---

# 31. Seguridad

El Webhook debe utilizar las validaciones oficiales de Meta.

Implementar:

* Verificación inicial del Webhook.
* Validación de solicitudes.
* Verificación de firma cuando corresponda.
* Secrets mediante environment variables.
* No exponer Access Tokens.
* No almacenar secrets en Git.
* No exponer secrets al frontend.
* Validación del payload.
* Logging seguro.

Variables conceptuales:

```text
WHATSAPP_ACCESS_TOKEN
WHATSAPP_VERIFY_TOKEN
WHATSAPP_APP_SECRET
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_BUSINESS_ACCOUNT_ID
```

Los nombres deben adaptarse al proyecto.

---

# 32. Environment variables

Nunca colocar credenciales directamente en código.

Usar:

```text
.env.local
```

y variables de entorno en producción.

Nunca commitear:

```text
.env.local
```

Los valores reales no deben aparecer en:

* Código.
* Logs.
* Frontend.
* Capturas.
* Repositorio.

---

# 33. Endpoint

Crear un endpoint siguiendo la arquitectura actual del proyecto.

La ruta conceptual es:

```text
/api/webhooks/whatsapp
```

Debe soportar:

```text
GET
POST
```

### GET

Se utilizará para la verificación inicial del Webhook.

### POST

Recibirá eventos de WhatsApp.

---

# 34. No acoplar WhatsApp directamente al frontend

El flujo debe ser:

```text
WhatsApp
   ↓
Next.js API
   ↓
Service / Business Logic
   ↓
Supabase
```

No:

```text
WhatsApp
   ↓
Frontend
   ↓
Supabase
```

Toda la lógica sensible debe ejecutarse en servidor.

---

# 35. Separación de responsabilidades

Evitar colocar toda la lógica dentro de:

```text
route.ts
```

El endpoint debe ser delgado.

Conceptualmente:

```text
/api/webhooks/whatsapp
        ↓
WhatsAppWebhookService
        ↓
WhatsAppLeadService
        ↓
CustomerService
        ↓
EventService
        ↓
Supabase
```

Adaptar los nombres y estructura a la arquitectura actual del proyecto.

No crear una arquitectura completamente nueva si el proyecto ya tiene servicios equivalentes.

---

# 36. Manejo de errores

Debe contemplar:

## Payload inválido

Registrar y finalizar de forma controlada.

## Número inválido

No crear registros.

## Customer lookup falla

Registrar error y no continuar con operaciones dependientes.

## Supabase falla

Registrar error.

Evitar estados parciales.

## Duplicate event

No procesar nuevamente.

## Unexpected error

Registrar con contexto suficiente para debugging sin revelar secretos.

---

# 37. Logging

Implementar logging estructurado cuando sea posible.

Los logs deberían permitir identificar:

```text
Webhook recibido
Message ID
Número normalizado
Customer encontrado
Event abierto encontrado
Automatic Customer creado
Automatic Customer actualizado
Evento duplicado
Error de base de datos
```

NO registrar:

* Access tokens.
* App secrets.
* Verify tokens.
* Información sensible innecesaria.

---

# 38. Orden de implementación

No implementar todo de una vez.

Seguir este orden:

## Fase 1 — Meta Developer

Configurar:

* Meta Developer Account.
* Meta App.
* WhatsApp Cloud API.
* Número de prueba.
* WhatsApp Business Account.
* Phone Number ID.
* Access Token.
* Webhook.

No conectar todavía el número real del negocio.

---

## Fase 2 — Webhook básico

Crear:

```text
GET /api/webhooks/whatsapp
POST /api/webhooks/whatsapp
```

Primero comprobar:

```text
Meta
 ↓
Webhook
 ↓
Next.js
```

sin modificar Supabase.

Enviar un mensaje de prueba y verificar que el servidor recibe correctamente el payload.

---

## Fase 3 — Validación e idempotencia

Implementar:

* Verificación del Webhook.
* Validación de firma.
* Validación del payload.
* Identificador del mensaje.
* Prevención de procesamiento duplicado.

---

## Fase 4 — Normalización

Implementar:

```text
phone → normalized_phone
```

Probar diferentes formatos.

---

## Fase 5 — Integración Customer

Implementar:

```text
buscar Customer por normalized_phone
```

Probar:

### Test A

Número no existe.

### Test B

Número existe.

---

## Fase 6 — Integración Event

Para Customer existente:

```text
buscar Events abiertos
```

Probar:

### Test A

Customer + Event abierto.

Resultado:

```text
No crear Automatic Customer.
```

### Test B

Customer + solamente Events Won/Lost.

Resultado:

```text
Crear Automatic Customer.
```

---

## Fase 7 — `automatic_customers`

Crear migración de Supabase.

Implementar:

* Tabla.
* Estados.
* Índices.
* Relaciones.
* Restricciones.
* Prevención de duplicados.

---

## Fase 8 — Múltiples mensajes

Implementar:

```text
message_count
first_message_at
last_message_at
```

Probar:

```text
1 número
10 mensajes
```

Resultado esperado:

```text
1 automatic_customer
message_count = 10
```

---

## Fase 9 — UI

Crear:

```text
WhatsApp Leads
```

Mostrar:

* Teléfono.
* Customer.
* Número de mensajes.
* Primera actividad.
* Última actividad.
* Estado.

---

## Fase 10 — Conversión

Implementar:

```text
Crear Customer
```

y:

```text
Crear Customer + Event
```

y para Customer existente:

```text
Crear Event
```

---

## Fase 11 — Pruebas completas

Crear pruebas para todos los escenarios:

### Test 1

Número nuevo.

Resultado:

```text
automatic_customer pending
```

### Test 2

Número nuevo + múltiples mensajes.

Resultado:

```text
1 automatic_customer
message_count > 1
```

### Test 3

Customer existente + Event abierto.

Resultado:

```text
No automatic_customer
```

### Test 4

Customer existente + Event Won.

Resultado:

```text
automatic_customer pending
```

### Test 5

Customer existente + Event Lost.

Resultado:

```text
automatic_customer pending
```

### Test 6

Customer existente + varios Events, uno abierto.

Resultado:

```text
No automatic_customer
```

### Test 7

Desechar lead.

Resultado:

```text
status = discarded
```

### Test 8

Crear Customer.

Resultado:

```text
Customer creado
automatic_customer = converted
```

### Test 9

Crear Event para Customer existente.

Resultado:

```text
Event creado
automatic_customer = converted
```

### Test 10

Webhook duplicado.

Resultado:

```text
No duplicar registros
```

---

# 39. Producción

Solo después de completar las pruebas con el número de prueba:

* Configurar el Business Manager/Business Portfolio correspondiente.
* Configurar el WhatsApp Business Account real.
* Configurar el número real de Chume's.
* Revisar requisitos de verificación de Meta.
* Configurar credenciales de producción.
* Configurar Webhook de producción.
* Verificar permisos.
* Probar mensajes reales.

**No alterar el número actual de WhatsApp del negocio hasta entender completamente el proceso de onboarding/migración correspondiente.**

---

# 40. Regla de no regresión

Antes de modificar código existente:

1. Analizar la arquitectura actual.
2. Identificar cómo se crean Customers.
3. Identificar cómo se crean Events.
4. Identificar cómo se determinan los estados.
5. Identificar cómo se manejan teléfonos.
6. Identificar autenticación/autorización.
7. Identificar patrones actuales de Supabase.
8. Reutilizar componentes existentes.

No duplicar:

* Customer forms.
* Event forms.
* Services.
* Repositories.
* Types.
* Validaciones.

si ya existen.

---

# 41. Regla para Cursor

Cursor debe **analizar primero y modificar después**.

Antes de crear archivos o migraciones:

1. Inspeccionar el proyecto.
2. Identificar las tablas actuales.
3. Identificar los tipos TypeScript existentes.
4. Identificar los servicios existentes.
5. Identificar los formularios Customer/Event.
6. Identificar el sistema de autenticación.
7. Identificar cómo se manejan los estados de Event.
8. Presentar un resumen de los archivos que modificará.
9. Presentar cualquier conflicto detectado.
10. Solo después implementar.

No asumir nombres de tablas, campos, servicios o componentes sin revisar el proyecto.

---

# 42. Regla contra sobreingeniería

La V1 debe mantenerse sencilla.

No implementar funcionalidades futuras antes de necesitarlas.

Especialmente:

```text
NO IA
NO chatbot
NO respuestas automáticas
NO clasificación automática
NO APIs externas
NO nombres automáticos
NO conversación completa
```

Primero resolver:

```text
WhatsApp
   ↓
Webhook
   ↓
Identificación
   ↓
Automatic Customer
   ↓
CRM
```

---

# 43. Definición de éxito de la V1

La V1 se considera terminada cuando:

1. Un mensaje enviado al WhatsApp de prueba llega al Webhook.
2. El Webhook valida correctamente la solicitud.
3. El número se normaliza.
4. El sistema puede determinar si el Customer existe.
5. El sistema puede determinar si existe un Event abierto.
6. Los números nuevos aparecen como WhatsApp Leads.
7. Un mismo número no genera múltiples leads pendientes.
8. Los múltiples mensajes incrementan `message_count`.
9. Un Customer con Event abierto no genera un nuevo lead.
10. Un Customer sin Event abierto genera un lead.
11. El usuario puede descartar un lead.
12. El usuario puede crear un Customer con teléfono prellenado.
13. El usuario puede crear un Event con Customer preseleccionado.
14. Los Events utilizan los estados existentes del CRM.
15. Los Webhooks duplicados no generan duplicados.
16. No existen secrets expuestos.
17. El número real de WhatsApp del negocio todavía no se ha puesto en riesgo durante el desarrollo.

---

# 44. Principio fundamental

El módulo debe seguir siempre este principio:

```text
                    MENSAJE WHATSAPP
                           ↓
                       WEBHOOK
                           ↓
                     IDENTIFICAR
                           ↓
                ┌──────────┴──────────┐
                │                     │
          Customer existe       Customer NO existe
                │                     │
                ▼                     ▼
        ¿Event abierto?       Automatic Customer
                │
         ┌──────┴──────┐
         │             │
        YES            NO
         │             │
         ▼             ▼
     No hacer       Automatic
       nada         Customer
                         │
                         ▼
                  DECISIÓN HUMANA
                         │
              ┌──────────┼──────────┐
              │          │          │
           Desechar   Customer   Customer
                         +        + Event
                      Customer
```

**El sistema detecta y organiza. El usuario decide y vende.**

---

# 45. Evolución futura

La arquitectura debe permitir evolucionar posteriormente hacia:

```text
V1
Webhook
 ↓
WhatsApp Leads
 ↓
Gestión manual

V2
Webhook
 ↓
WhatsApp Leads
 ↓
Información del contacto

V3
Webhook
 ↓
Historial de mensajes
 ↓
Conversación dentro del CRM

V4
Webhook
 ↓
IA
 ↓
Extracción de datos
 ↓
Lead enriquecido

V5
Webhook
 ↓
Automatización
 ↓
Respuestas
 ↓
Seguimiento
```

No implementar estas fases como parte de la V1.

---

# 46. Nota final para implementación

Este documento representa las **reglas de negocio deseadas**, no necesariamente la estructura exacta del código actual.

Antes de implementar:

* Inspeccionar el repositorio.
* Comparar este documento con la arquitectura existente.
* Identificar reutilización posible.
* Identificar inconsistencias.
* Proponer cambios antes de ejecutarlos.
* Mantener compatibilidad con funcionalidades existentes.

Cuando exista una diferencia entre este documento y la implementación actual del CRM, **no asumir automáticamente cuál es correcta**. Detenerse, explicar la diferencia y solicitar confirmación si la decisión puede afectar datos o comportamiento existente.
