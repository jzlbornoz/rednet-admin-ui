# Documentacion de Endpoints de API — neo_bot

## Indice General

1. [Informacion General](#informacion-general)
2. [Endpoints de Salud](#endpoints-de-salud)
3. [Webhook de WhatsApp](#webhook-de-whatsapp)
4. [API Publica](#api-publica)
5. [API de Administracion](#api-de-administracion)

---

## Informacion General

### Base URL

```
Produccion: https://api.neo-bot.com
Desarrollo: http://localhost:3000
```

### Formato de Respuesta

Todas las respuestas siguen un formato estandar JSON. Los endpoints exitosos retornan objetos con la estructura del recurso solicitado. Los errores retornan un objeto con la propiedad `error` que contiene el mensaje de error.

### Autenticacion

- **JWT (JSON Web Token)**: Los endpoints protegidos utilizan el header `Authorization: Bearer <token>`
- El token se obtiene mediante el endpoint de login (`POST /api/admin/auth/login`)

### CORS

La API permite solicitudes desde los siguientes origenes:

- `http://localhost:5173` (desarrollo)
- `https://neo-bot-ui.vercel.app` (produccion)

---

## Endpoints de Salud

### GET /health

Endpoint de verificacion del estado del servidor. No requiere autenticacion.

**Respuesta exitosa (200)**

```json
{
  "status": "ok",
  "timestamp": "2026-05-04T15:30:00.000Z"
}
```

**Ejemplo de Request**

```bash
curl -X GET http://localhost:3000/health
```

---

## Webhook de WhatsApp

### GET /webhook

Endpoint de verificacion del webhook de WhatsApp Cloud API. Se utiliza para verificar que el webhook esta correctamente configurado.

**Parametros de Query**

| Parametro | Tipo | Requerido | Descripcion |
|-----------|------|-----------|-------------|
| hub.mode | string | Si | Modo de verificacion (debe ser "subscribe") |
| hub.verify_token | string | Si | Token de verificacion definido en WHATSAPP_VERIFY_TOKEN |
| hub.challenge | string | Si | Cadena de verificacion retornada por Meta |

**Cabeceras**

No se requieren cabeceras especiales.

**Respuesta exitosa (200)**

Retorna el valor de `hub.challenge` enviado en la solicitud.

```text
<challenge_value>
```

**Respuesta de error (403)**

```json
{
  "error": "Forbidden"
}
```

**Ejemplo de Request**

```bash
curl -X GET "http://localhost:3000/webhook?hub.mode=subscribe&hub.verify_token=my_verify_token&hub.challenge=test_challenge"
```

---

### POST /webhook

Endpoint principal para recibir mensajes entrantes desde WhatsApp Cloud API. Procesa mensajes de texto, imagenes, audio, videos, documentos, stickers, ubicaciones y mensajes interactivos (botones y listas).

**Cabeceras**

| Cabecera | Valor |
|----------|-------|
| Content-Type | application/json |

**Body (WhatsAppWebhookPayload)**

El payload sigue el formato de WhatsApp Cloud API. Estructura general:

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "+1234567890",
              "phone_number_id": "PHONE_NUMBER_ID"
            },
            "messages": [
              {
                "from": "5491155555555",
                "id": "wamid.XXX",
                "timestamp": "1234567890",
                "text": {
                  "body": "Hola"
                },
                "type": "text"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

**Tipos de mensajes soportados**

- `text`: Mensajes de texto
- `image`: Imagenes con caption opcional
- `audio`: Mensajes de voz
- `video`: Videos
- `document`: Documentos adjuntos
- `sticker`: Stickers
- `location`: Ubicaciones con latitud y longitud
- `interactive`: Mensajes interactivos (botones o listas)

**Respuesta exitosa (200)**

El servidor retorna diferentes estados segun el procesamiento:

```json
{
  "status": "welcome_sent"
}
```

```json
{
  "status": "menu_sent"
}
```

```json
{
  "status": "processed"
}
```

```json
{
  "status": "human_attending"
}
```

**Posibles valores de status**

| Status | Descripcion |
|--------|-------------|
| welcome_sent | Se envio el mensaje de bienvenida por primera vez |
| menu_sent | Se envio el menu principal |
| processed | El mensaje fue procesado por el router del bot |
| human_attending | La sesion esta siendo atendida por un agente humano |
| no_message | No se detecto ningun mensaje en el payload |
| error | Ocurrio un error durante el procesamiento |

**Ejemplo de Request**

```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "123456789",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "+5491155555555",
            "phone_number_id": "123456789"
          },
          "messages": [{
            "from": "5491155555555",
            "id": "wamid.abc123",
            "timestamp": "1234567890",
            "text": {
              "body": "Hola"
            },
            "type": "text"
          }]
        },
        "field": "messages"
      }]
    }]
  }'
```

---

## API Publica

Todos los endpoints en esta seccion son publicos y no requieren autenticacion. Se utilizan para acceder a recursos del sistema.

### Usuarios

#### GET /api/users

Obtiene todos los usuarios registrados en el sistema.

**Parametros de Query**

No requiere parametros.

**Respuesta exitosa (200)**

```json
{
  "users": [
    {
      "id": "uuid",
      "phoneNumber": "+5491155555555",
      "name": "Juan Perez",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

**Respuesta de error (500)**

```json
{
  "error": "Error fetching users"
}
```

**Ejemplo de Request**

```bash
curl -X GET http://localhost:3000/api/users
```

---

#### GET /api/users/:phoneNumber

Obtiene un usuario especifico por su numero de telefono.

**Parametros de Path**

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| phoneNumber | string | Numero de telefono del usuario (formato internacional) |

**Respuesta exitosa (200)**

```json
{
  "user": {
    "id": "uuid",
    "phoneNumber": "+5491155555555",
    "name": "Juan Perez",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
}
```

**Respuesta de error (404)**

```json
{
  "error": "User not found"
}
```

**Respuesta de error (500)**

```json
{
  "error": "Error fetching user"
}
```

**Ejemplo de Request**

```bash
curl -X GET http://localhost:3000/api/users/%2B5491155555555
```

---

### Tickets

#### GET /api/tickets

Obtiene todos los tickets del sistema.

**Parametros de Query**

No requiere parametros.

**Respuesta exitosa (200)**

```json
{
  "tickets": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "type": "soporte",
      "status": "abierto",
      "description": "Problema con el servicio",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

**Respuesta de error (500)**

```json
{
  "error": "Error fetching tickets"
}
```

**Ejemplo de Request**

```bash
curl -X GET http://localhost:3000/api/tickets
```

---

#### GET /api/tickets/open

Obtiene todos los tickets abiertos (con estado "abierto").

**Parametros de Query**

No requiere parametros.

**Respuesta exitosa (200)**

```json
{
  "tickets": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "type": "soporte",
      "status": "abierto",
      "description": "Problema con el servicio",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

**Respuesta de error (500)**

```json
{
  "error": "Error fetching open tickets"
}
```

**Ejemplo de Request**

```bash
curl -X GET http://localhost:3000/api/tickets/open
```

---

#### GET /api/tickets/user/:userId

Obtiene todos los tickets de un usuario especifico.

**Parametros de Path**

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| userId | string | ID del usuario |

**Respuesta exitosa (200)**

```json
{
  "tickets": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "type": "soporte",
      "status": "abierto",
      "description": "Problema con el servicio",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

**Respuesta de error (500)**

```json
{
  "error": "Error fetching user tickets"
}
```

**Ejemplo de Request**

```bash
curl -X GET http://localhost:3000/api/tickets/user/550e8400-e29b-41d4-a716-446655440000
```

---

#### PATCH /api/tickets/:id/status

Actualiza el estado de un ticket especifico.

**Parametros de Path**

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| id | string | ID del ticket |

**Body**

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| status | string | Si | Nuevo estado del ticket |

**Valores validos para status**

- `abierto`: Ticket recien creado o sin atender
- `en_proceso`: Ticket siendo atendido por un agente
- `cerrado`: Ticket resuelto y cerrado

**Respuesta exitosa (200)**

```json
{
  "ticket": {
    "id": "uuid",
    "userId": "user-uuid",
    "type": "soporte",
    "status": "en_proceso",
    "description": "Problema con el servicio",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-02T00:00:00.000Z"
  }
}
```

**Respuesta de error (400)**

```json
{
  "error": "Invalid status"
}
```

**Respuesta de error (500)**

```json
{
  "error": "Error updating ticket"
}
```

**Ejemplo de Request**

```bash
curl -X PATCH http://localhost:3000/api/tickets/550e8400-e29b-41d4-a716-446655440000/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "en_proceso"
  }'
```

---

### Pagos

#### GET /api/payments

Obtiene todos los pagos del sistema.

**Parametros de Query**

No requiere parametros.

**Respuesta exitosa (200)**

```json
{
  "payments": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "amount": 1500.00,
      "currency": "ARS",
      "status": "pendiente",
      "paymentMethod": "transferencia",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

**Respuesta de error (500)**

```json
{
  "error": "Error fetching payments"
}
```

**Ejemplo de Request**

```bash
curl -X GET http://localhost:3000/api/payments
```

---

#### GET /api/payments/pending

Obtiene todos los pagos pendientes (con estado "pendiente").

**Parametros de Query**

No requiere parametros.

**Respuesta exitosa (200)**

```json
{
  "payments": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "amount": 1500.00,
      "currency": "ARS",
      "status": "pendiente",
      "paymentMethod": "transferencia",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

**Respuesta de error (500)**

```json
{
  "error": "Error fetching pending payments"
}
```

**Ejemplo de Request**

```bash
curl -X GET http://localhost:3000/api/payments/pending
```

---

#### GET /api/payments/user/:userId

Obtiene todos los pagos de un usuario especifico.

**Parametros de Path**

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| userId | string | ID del usuario |

**Respuesta exitosa (200)**

```json
{
  "payments": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "amount": 1500.00,
      "currency": "ARS",
      "status": "pendiente",
      "paymentMethod": "transferencia",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

**Respuesta de error (500)**

```json
{
  "error": "Error fetching user payments"
}
```

**Ejemplo de Request**

```bash
curl -X GET http://localhost:3000/api/payments/user/550e8400-e29b-41d4-a716-446655440000
```

---

#### PATCH /api/payments/:id/status

Actualiza el estado de un pago especifico.

**Parametros de Path**

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| id | string | ID del pago |

**Body**

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| status | string | Si | Nuevo estado del pago |

**Valores validos para status**

- `pendiente`: Pago esperando verificacion
- `verificado`: Pago confirmado y valido
- `rechazado`: Pago rechazado por el sistema

**Respuesta exitosa (200)**

```json
{
  "payment": {
    "id": "uuid",
    "userId": "user-uuid",
    "amount": 1500.00,
    "currency": "ARS",
    "status": "verificado",
    "paymentMethod": "transferencia",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-02T00:00:00.000Z"
  }
}
```

**Respuesta de error (400)**

```json
{
  "error": "Invalid status"
}
```

**Respuesta de error (500)**

```json
{
  "error": "Error updating payment"
}
```

**Ejemplo de Request**

```bash
curl -X PATCH http://localhost:3000/api/payments/550e8400-e29b-41d4-a716-446655440000/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "verificado"
  }'
```

---

### Prospectos

#### GET /api/prospects

Obtiene todos los prospectos del sistema.

**Parametros de Query**

No requiere parametros.

**Respuesta exitosa (200)**

```json
{
  "prospects": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "phoneNumber": "+5491155555555",
      "name": "Juan Perez",
      "status": "nuevo",
      "notes": "Interesado en plan premium",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

**Respuesta de error (500)**

```json
{
  "error": "Error fetching prospects"
}
```

**Ejemplo de Request**

```bash
curl -X GET http://localhost:3000/api/prospects
```

---

#### GET /api/prospects/new

Obtiene todos los prospectos nuevos (con estado "nuevo").

**Parametros de Query**

No requiere parametros.

**Respuesta exitosa (200)**

```json
{
  "prospects": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "phoneNumber": "+5491155555555",
      "name": "Juan Perez",
      "status": "nuevo",
      "notes": "Interesado en plan premium",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

**Respuesta de error (500)**

```json
{
  "error": "Error fetching new prospects"
}
```

**Ejemplo de Request**

```bash
curl -X GET http://localhost:3000/api/prospects/new
```

---

#### GET /api/prospects/user/:userId

Obtiene todos los prospectos de un usuario especifico.

**Parametros de Path**

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| userId | string | ID del usuario |

**Respuesta exitosa (200)**

```json
{
  "prospects": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "phoneNumber": "+5491155555555",
      "name": "Juan Perez",
      "status": "nuevo",
      "notes": "Interesado en plan premium",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

**Respuesta de error (500)**

```json
{
  "error": "Error fetching user prospects"
}
```

**Ejemplo de Request**

```bash
curl -X GET http://localhost:3000/api/prospects/user/550e8400-e29b-41d4-a716-446655440000
```

---

#### PATCH /api/prospects/:id/status

Actualiza el estado de un prospecto especifico.

**Parametros de Path**

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| id | string | ID del prospecto |

**Body**

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| status | string | Si | Nuevo estado del prospecto |
| notes | string | No | Notas adicionales sobre el prospecto |

**Valores validos para status**

- `nuevo`: Prospecto recien creado
- `contactado`: Prospecto que ha sido contactado
- `convertido`: Prospecto que se convirtio en cliente
- `perdido`: Prospecto que no se concreto

**Respuesta exitosa (200)**

```json
{
  "prospect": {
    "id": "uuid",
    "userId": "user-uuid",
    "phoneNumber": "+5491155555555",
    "name": "Juan Perez",
    "status": "contactado",
    "notes": "Llamada realizada el 2 de mayo",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-02T00:00:00.000Z"
  }
}
```

**Respuesta de error (400)**

```json
{
  "error": "Invalid status"
}
```

**Respuesta de error (500)**

```json
{
  "error": "Error updating prospect"
}
```

**Ejemplo de Request**

```bash
curl -X PATCH http://localhost:3000/api/prospects/550e8400-e29b-41d4-a716-446655440000/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "contactado",
    "notes": "Llamada realizada el 2 de mayo"
  }'
```

---

### Feedback

#### GET /api/feedback

Obtiene todos los feedbacks del sistema.

**Parametros de Query**

No requiere parametros.

**Respuesta exitosa (200)**

```json
{
  "feedback": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "rating": 5,
      "comment": "Excelente servicio",
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

**Respuesta de error (500)**

```json
{
  "error": "Error fetching feedback"
}
```

**Ejemplo de Request**

```bash
curl -X GET http://localhost:3000/api/feedback
```

---

#### GET /api/feedback/user/:userId

Obtiene todos los feedbacks de un usuario especifico.

**Parametros de Path**

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| userId | string | ID del usuario |

**Respuesta exitosa (200)**

```json
{
  "feedback": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "rating": 5,
      "comment": "Excelente servicio",
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

**Respuesta de error (500)**

```json
{
  "error": "Error fetching user feedback"
}
```

**Ejemplo de Request**

```bash
curl -X GET http://localhost:3000/api/feedback/user/550e8400-e29b-41d4-a716-446655440000
```

---

#### GET /api/feedback/stats/rating

Obtiene el promedio de rating de todos los feedbacks.

**Parametros de Query**

No requiere parametros.

**Respuesta exitosa (200)**

```json
{
  "averageRating": 4.5
}
```

**Respuesta de error (500)**

```json
{
  "error": "Error fetching rating stats"
}
```

**Ejemplo de Request**

```bash
curl -X GET http://localhost:3000/api/feedback/stats/rating
```

---

### Estadisticas

#### GET /api/stats

Obtiene estadisticas generales del sistema. Incluye el total de usuarios, tickets abiertos, pagos pendientes y prospectos nuevos.

**Parametros de Query**

No requiere parametros.

**Respuesta exitosa (200)**

```json
{
  "stats": {
    "totalUsers": 150,
    "openTickets": 12,
    "pendingPayments": 5,
    "newProspects": 8
  }
}
```

**Respuesta de error (500)**

```json
{
  "error": "Error fetching stats"
}
```

**Ejemplo de Request**

```bash
curl -X GET http://localhost:3000/api/stats
```

---

## API de Administracion

Todos los endpoints en esta seccion requieren autenticacion mediante JWT. Incluir la cabecera `Authorization: Bearer <token>` en las solicitudes.

### Autenticacion

#### POST /api/admin/auth/login

Inicia sesion como administrador y obtiene un token JWT.

**Body**

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| email | string | Si | Correo electronico del administrador |
| password | string | Si | Contrasena del administrador |

**Respuesta exitosa (200)**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "uuid",
    "email": "admin@neobot.com",
    "name": "Admin Principal"
  }
}
```

**Respuesta de error (400)**

```json
{
  "error": "Email and password are required"
}
```

**Respuesta de error (401)**

```json
{
  "error": "Invalid credentials"
}
```

**Ejemplo de Request**

```bash
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@neobot.com",
    "password": "mi_contrasena_segura"
  }'
```

---

#### GET /api/admin/auth/me

Obtiene la informacion del administrador autenticado. Requiere JWT.

**Cabeceras**

| Cabecera | Valor |
|----------|-------|
| Authorization | Bearer <token_jwt> |

**Respuesta exitosa (200)**

```json
{
  "admin": {
    "id": "uuid",
    "email": "admin@neobot.com",
    "name": "Admin Principal",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

**Respuesta de error (401)**

```json
{
  "error": "No token provided"
}
```

```json
{
  "error": "Invalid or expired token"
}
```

**Respuesta de error (404)**

```json
{
  "error": "Admin not found"
}
```

**Ejemplo de Request**

```bash
curl -X GET http://localhost:3000/api/admin/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Conversaciones

#### GET /api/admin/conversations

Obtiene una lista paginada de todas las conversaciones. Requiere JWT.

**Cabeceras**

| Cabecera | Valor |
|----------|-------|
| Authorization | Bearer <token_jwt> |

**Parametros de Query**

| Parametro | Tipo | Default | Descripcion |
|-----------|------|---------|-------------|
| page | number | 1 | Numero de pagina |
| limit | number | 20 | Cantidad de resultados por pagina |
| status | string | - | Filtrar por estado (ACTIVE, CLOSED, ARCHIVED) |
| search | string | - | Buscar por numero de telefono o nombre |

**Respuesta exitosa (200)**

```json
{
  "conversations": [
    {
      "id": "uuid",
      "phoneNumber": "+5491155555555",
      "contactName": "Juan Perez",
      "status": "ACTIVE",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-02T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Respuesta de error (401)**

```json
{
  "error": "No token provided"
}
```

**Ejemplo de Request**

```bash
curl -X GET "http://localhost:3000/api/admin/conversations?page=1&limit=20&status=ACTIVE" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### GET /api/admin/conversations/:id

Obtiene una conversacion especifica por su ID. Requiere JWT.

**Cabeceras**

| Cabecera | Valor |
|----------|-------|
| Authorization | Bearer <token_jwt> |

**Parametros de Path**

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| id | string | ID de la conversacion |

**Respuesta exitosa (200)**

```json
{
  "conversation": {
    "id": "uuid",
    "phoneNumber": "+5491155555555",
    "contactName": "Juan Perez",
    "status": "ACTIVE",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-02T00:00:00.000Z"
  }
}
```

**Respuesta de error (401)**

```json
{
  "error": "No token provided"
}
```

**Respuesta de error (404)**

```json
{
  "error": "Conversation not found"
}
```

**Ejemplo de Request**

```bash
curl -X GET http://localhost:3000/api/admin/conversations/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### GET /api/admin/conversations/:id/messages

Obtiene los mensajes de una conversacion especifica. Requiere JWT.

**Cabeceras**

| Cabecera | Valor |
|----------|-------|
| Authorization | Bearer <token_jwt> |

**Parametros de Path**

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| id | string | ID de la conversacion |

**Parametros de Query**

| Parametro | Tipo | Default | Descripcion |
|-----------|------|---------|-------------|
| limit | number | 50 | Cantidad maxima de mensajes |
| cursor | string | - | Token de paginacion para obtener mensajes anteriores |

**Respuesta exitosa (200)**

```json
{
  "messages": [
    {
      "id": "uuid",
      "conversationId": "conv-uuid",
      "type": "TEXT",
      "direction": "INBOUND",
      "content": "Hola, necesito ayuda",
      "status": "READ",
      "createdAt": "2026-01-01T10:00:00.000Z"
    },
    {
      "id": "uuid",
      "conversationId": "conv-uuid",
      "type": "TEXT",
      "direction": "OUTBOUND",
      "content": "Hola Juan, en que puedo ayudarte?",
      "status": "DELIVERED",
      "createdAt": "2026-01-01T10:01:00.000Z"
    }
  ],
  "nextCursor": "message_id_123"
}
```

**Respuesta de error (401)**

```json
{
  "error": "No token provided"
}
```

**Ejemplo de Request**

```bash
curl -X GET "http://localhost:3000/api/admin/conversations/550e8400-e29b-41d4-a716-446655440000/messages?limit=50" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### PATCH /api/admin/conversations/:id/status

Actualiza el estado de una conversacion. Requiere JWT.

**Cabeceras**

| Cabecera | Valor |
|----------|-------|
| Authorization | Bearer <token_jwt> |

**Parametros de Path**

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| id | string | ID de la conversacion |

**Body**

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| status | string | Si | Nuevo estado de la conversacion |

**Valores validos para status**

- `ACTIVE`: Conversacion activa, en curso
- `CLOSED`: Conversacion finalizada
- `ARCHIVED`: Conversacion archivada

**Respuesta exitosa (200)**

```json
{
  "conversation": {
    "id": "uuid",
    "phoneNumber": "+5491155555555",
    "contactName": "Juan Perez",
    "status": "CLOSED",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-02T00:00:00.000Z"
  }
}
```

**Respuesta de error (400)**

```json
{
  "error": "Invalid status. Must be ACTIVE, CLOSED, or ARCHIVED"
}
```

**Respuesta de error (401)**

```json
{
  "error": "No token provided"
}
```

**Respuesta de error (404)**

```json
{
  "error": "Conversation not found"
}
```

**Ejemplo de Request**

```bash
curl -X PATCH http://localhost:3000/api/admin/conversations/550e8400-e29b-41d4-a716-446655440000/status \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CLOSED"
  }'
```

---

### Estadisticas de Admin

#### GET /api/admin/stats

Obtiene estadisticas de uso de la plataforma. Requiere JWT.

**Cabeceras**

| Cabecera | Valor |
|----------|-------|
| Authorization | Bearer <token_jwt> |

**Parametros de Query**

No requiere parametros.

**Respuesta exitosa (200)**

```json
{
  "totalConversations": 150,
  "activeConversations": 12,
  "totalMessages": 4500,
  "totalMessagesToday": 85
}
```

**Descripcion de campos**

| Campo | Descripcion |
|-------|-------------|
| totalConversations | Numero total de conversaciones en el sistema |
| activeConversations | Numero de conversaciones con estado ACTIVE |
| totalMessages | Numero total de mensajes enviados y recibidos |
| totalMessagesToday | Numero de mensajes enviados hoy |

**Respuesta de error (401)**

```json
{
  "error": "No token provided"
}
```

**Ejemplo de Request**

```bash
curl -X GET http://localhost:3000/api/admin/stats \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Tabla Resumen de Endpoints

| Metodo | Ruta | Autenticacion | Descripcion |
|--------|------|---------------|-------------|
| GET | /health | No | Verificacion del estado del servidor |
| GET | /webhook | No | Verificacion del webhook de WhatsApp |
| POST | /webhook | No | Receptor de mensajes de WhatsApp |
| GET | /api/users | No | Listar todos los usuarios |
| GET | /api/users/:phoneNumber | No | Obtener usuario por telefono |
| GET | /api/tickets | No | Listar todos los tickets |
| GET | /api/tickets/open | No | Listar tickets abiertos |
| GET | /api/tickets/user/:userId | No | Listar tickets de un usuario |
| PATCH | /api/tickets/:id/status | No | Actualizar estado de ticket |
| GET | /api/payments | No | Listar todos los pagos |
| GET | /api/payments/pending | No | Listar pagos pendientes |
| GET | /api/payments/user/:userId | No | Listar pagos de un usuario |
| PATCH | /api/payments/:id/status | No | Actualizar estado de pago |
| GET | /api/prospects | No | Listar todos los prospectos |
| GET | /api/prospects/new | No | Listar prospectos nuevos |
| GET | /api/prospects/user/:userId | No | Listar prospectos de un usuario |
| PATCH | /api/prospects/:id/status | No | Actualizar estado de prospecto |
| GET | /api/feedback | No | Listar todos los feedbacks |
| GET | /api/feedback/user/:userId | No | Listar feedbacks de un usuario |
| GET | /api/feedback/stats/rating | No | Obtener promedio de rating |
| GET | /api/stats | No | Obtener estadisticas generales |
| POST | /api/admin/auth/login | No | Iniciar sesion de administrador |
| GET | /api/admin/auth/me | JWT | Obtener info del admin actual |
| GET | /api/admin/conversations | JWT | Listar conversaciones |
| GET | /api/admin/conversations/:id | JWT | Obtener conversacion por ID |
| GET | /api/admin/conversations/:id/messages | JWT | Obtener mensajes de conversacion |
| PATCH | /api/admin/conversations/:id/status | JWT | Actualizar estado de conversacion |
| GET | /api/admin/stats | JWT | Obtener estadisticas de admin |

---

## Codigos de Estado HTTP

| Codigo | Descripcion |
|--------|-------------|
| 200 | Solicitud exitosa |
| 400 | Solicitud incorrecta (parametros invalidos) |
| 401 | No autorizado (token faltante o invalido) |
| 403 | Prohibido (token de verificacion incorrecto) |
| 404 | Recurso no encontrado |
| 500 | Error interno del servidor |

---

## Notas Adicionales

- Todos los timestamps en las respuestas siguen el formato ISO 8601 (UTC)
- Los IDs en las respuestas son valores UUID v4
- Los numeros de telefono se almacenan en formato internacional con prefijo (ej: +5491155555555)
- El token JWT tiene una expiracion configurada en el servicio de autenticacion
- El webhook de WhatsApp procesa mensajes de forma asincronica y retorna inmediatamente
- Las conversaciones del bot se gestionan mediante una maquina de estados definida en `src/constants/states.ts`
