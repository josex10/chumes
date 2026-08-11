## SE NECESITA INGRESAR LOS PUNTOS DEL 1 AL 3




# 4. Productos e Inventario

## Objetivo

Administrar todos los elementos comercializados por Chumes, incluyendo productos de alquiler, venta, combos comerciales, precios, costos de reposición y movimientos de inventario.

Este módulo será la fuente principal para:

* Cotizaciones.
* Eventos.
* Disponibilidad.
* Control de pérdidas.
* Daños.
* Reportes operativos.

---

# 4.1 Categorías de Producto

## Propósito

Clasificar productos para facilitar:

* Búsqueda.
* Reportes.
* Organización del catálogo.
* Marketing futuro.

---

## Reglas de Negocio

### RN-051

Todo producto deberá pertenecer a una categoría.

---

### RN-052

Una categoría podrá contener múltiples productos.

---

## Tabla: product_categories

| Campo       | Tipo        |
| ----------- | ----------- |
| id          | BIGINT PK   |
| code        | TEXT UNIQUE |
| name        | TEXT        |
| description | TEXT NULL   |
| is_active   | BOOLEAN     |
| created_at  | TIMESTAMP   |
| updated_at  | TIMESTAMP   |

---

## Datos iniciales

```text
TABLE_LINENS
CHAIR_COVERS
CHAIRS
TABLES
DECORATION
ACCESSORIES
OTHER
```

---

# 4.2 Tipo de Inventario

## Propósito

Definir cómo será controlado el inventario de un producto.

---

## Tabla: product_tracking_types

| Campo       | Tipo        |
| ----------- | ----------- |
| id          | BIGINT PK   |
| code        | TEXT UNIQUE |
| name        | TEXT        |
| description | TEXT        |
| is_active   | BOOLEAN     |

---

## Datos iniciales

```text
QUANTITY
ASSET
```

---

## Reglas

### RN-053

Los productos nuevos serán creados inicialmente como QUANTITY.

---

### RN-054

El sistema soportará tracking individual futuro mediante ASSET.

---

# 4.3 Tipo de Producto

## Propósito

Diferenciar productos físicos y agrupaciones comerciales.

---

## Tabla: product_types

| Campo       | Tipo        |
| ----------- | ----------- |
| id          | BIGINT PK   |
| code        | TEXT UNIQUE |
| name        | TEXT        |
| description | TEXT        |
| is_active   | BOOLEAN     |

---

## Datos iniciales

```text
SIMPLE
BUNDLE
```

---

# 4.4 Productos

## Propósito

Representar cualquier elemento que pueda ser cotizado.

---

## Reglas de Negocio

### RN-055

Todo elemento cotizable debe existir como producto.

---

### RN-056

Productos similares con diferente color/material serán productos independientes.

Ejemplo:

Correcto:

```text
Mantel Blanco

Mantel Negro
```

No:

```text
Mantel
Color Blanco
Color Negro
```

---

### RN-057

Un producto puede ser de alquiler, venta o ambos.

---

## Tabla: products

| Campo            | Tipo               |
| ---------------- | ------------------ |
| id               | UUID PK            |
| product_number   | TEXT UNIQUE        |
| category_id      | BIGINT FK          |
| tracking_type_id | BIGINT FK          |
| product_type_id  | BIGINT FK          |
| name             | TEXT               |
| description      | TEXT NULL          |
| rental_available | BOOLEAN            |
| sale_available   | BOOLEAN            |
| current_stock    | NUMERIC(12,2)      |
| minimum_stock    | NUMERIC(12,2) NULL |
| is_active        | BOOLEAN            |
| created_at       | TIMESTAMP          |
| updated_at       | TIMESTAMP          |
| created_by       | UUID               |
| updated_by       | UUID               |

---

## Ejemplo

```text
PRD-000001

Nombre:
Mantel Blanco

Tipo:
SIMPLE

Tracking:
QUANTITY

Stock:
500
```

---

# 4.5 Precios de Producto

## Propósito

Permitir múltiples modalidades comerciales.

---

## Tabla: product_price_types

| Campo       | Tipo        |
| ----------- | ----------- |
| id          | BIGINT PK   |
| code        | TEXT UNIQUE |
| name        | TEXT        |
| description | TEXT        |
| is_active   | BOOLEAN     |

---

## Datos iniciales

```text
RENTAL
SALE
```

---

## Tabla: product_prices

| Campo          | Tipo          |
| -------------- | ------------- |
| id             | UUID PK       |
| product_id     | UUID FK       |
| price_type_id  | BIGINT FK     |
| amount         | NUMERIC(12,2) |
| effective_from | DATE          |
| effective_to   | DATE NULL     |
| created_at     | TIMESTAMP     |
| created_by     | UUID          |

---

## Ejemplo

Producto:

```text
Mantel Blanco
```

Precio:

```text
RENTAL
₡1,500
```

---

Precio:

```text
SALE
₡12,000
```

---

# 4.6 Costos de Reposición

## Propósito

Mantener historial del costo real para pérdidas o daños.

---

## Reglas

### RN-058

El costo de reposición puede cambiar con el tiempo.

---

### RN-059

Los daños deberán calcularse usando el costo vigente.

---

## Tabla: product_costs

| Campo          | Tipo          |
| -------------- | ------------- |
| id             | UUID PK       |
| product_id     | UUID FK       |
| cost           | NUMERIC(12,2) |
| effective_from | DATE          |
| effective_to   | DATE NULL     |
| created_at     | TIMESTAMP     |
| created_by     | UUID          |

---

# 4.7 Productos Compuestos (Bundles)

## Propósito

Permitir crear paquetes comerciales.

---

## Ejemplo

```text
Paquete Boda
```

Incluye:

```text
100 Sillas

20 Mesas

100 Manteles
```

---

## Reglas

### RN-060

Los bundles no poseen inventario propio.

---

### RN-061

La disponibilidad de un bundle depende de sus componentes.

---

## Tabla: product_bundle_items

| Campo                | Tipo          |
| -------------------- | ------------- |
| id                   | UUID PK       |
| bundle_product_id    | UUID FK       |
| component_product_id | UUID FK       |
| quantity             | NUMERIC(12,2) |
| created_at           | TIMESTAMP     |
| created_by           | UUID          |

---

# 4.8 Movimientos de Inventario

## Propósito

Registrar todos los cambios de inventario.

---

## Tabla: inventory_movement_types

| Campo     | Tipo        |
| --------- | ----------- |
| id        | BIGINT PK   |
| code      | TEXT UNIQUE |
| name      | TEXT        |
| is_active | BOOLEAN     |

---

## Datos iniciales

```text
INITIAL_LOAD
PURCHASE
EVENT_OUT
EVENT_RETURN
DAMAGE
LOSS
ADJUSTMENT
```

---

## Tabla: inventory_movements

| Campo            | Tipo          |
| ---------------- | ------------- |
| id               | UUID PK       |
| product_id       | UUID FK       |
| movement_type_id | BIGINT FK     |
| quantity         | NUMERIC(12,2) |
| reference_id     | UUID NULL     |
| notes            | TEXT NULL     |
| created_at       | TIMESTAMP     |
| created_by       | UUID          |

---

# Relaciones

```text
product_categories
        |
        |
     products
        |
        +--- product_prices
        |
        +--- product_costs
        |
        +--- inventory_movements
        |
        +--- product_bundle_items
```

---

# Reglas importantes

El inventario disponible nunca será calculado únicamente con current_stock.

La disponibilidad operacional deberá considerar:

* Eventos futuros.
* Productos reservados.
* Fechas de entrega.
* Fechas de devolución.
* Conflictos de inventario.

```
Stock físico
-
Reservas activas
=
Disponibilidad operativa
```
