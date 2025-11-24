# Sistema de Control de Música vía MQTT

Este documento describe los handlers MQTT implementados para controlar el reproductor de música desde la API/Dashboard.

## Topics MQTT

Todos los topics siguen el patrón: `pancy/request/music/{guildId}/{action}`

### 1. Play/Resume
**Topic:** `music/{guildId}/play`
**Payload:** `{}`

Reanuda la reproducción si está pausada.

**Respuesta:**
```json
{
  "success": true,
  "message": "Reproducción reanudada",
  "track": "Nombre de la canción"
}
```

**Errores:**
- No hay reproductor activo
- La música ya está reproduciéndose

---

### 2. Pause
**Topic:** `music/{guildId}/pause`
**Payload:** `{}`

Pausa la reproducción actual.

**Respuesta:**
```json
{
  "success": true,
  "message": "Reproducción pausada",
  "track": "Nombre de la canción"
}
```

**Errores:**
- No hay reproductor activo
- La música ya está pausada

---

### 3. Skip (Siguiente/Anterior)
**Topic:** `music/{guildId}/skip`
**Payload:**
```json
{
  "direction": "next" | "previous"
}
```

Salta a la siguiente canción o reinicia la actual (si direction="previous").

**Respuesta:**
```json
{
  "success": true,
  "message": "Canción saltada",
  "previousTrack": "Canción anterior",
  "nextTrack": "Nueva canción"
}
```

**Errores:**
- No hay reproductor activo
- No hay canción reproduciéndose

---

### 4. Skip to Index
**Topic:** `music/{guildId}/skip/{index}`
**Payload:**
```json
{
  "index": 3
}
```

Salta a una posición específica en la cola.

**Respuesta:**
```json
{
  "success": true,
  "message": "Saltando a la canción #4",
  "track": "Nombre de la canción"
}
```

**Errores:**
- No hay reproductor activo
- Índice inválido
- Índice fuera de rango

---

## Endpoints API REST

### POST /api/guilds/:guildId/music/play
Reanuda la reproducción.

### POST /api/guilds/:guildId/music/pause
Pausa la reproducción.

### POST /api/guilds/:guildId/music/skip
Body: `{ "direction": "next" | "previous" }`

### POST /api/guilds/:guildId/music/skip/:index
Salta a una posición específica en la cola.

---

## Códigos de Estado HTTP

- **200**: Operación exitosa
- **400**: Parámetros inválidos (guildId faltante, índice inválido, etc.)
- **500**: Error interno del servidor o del bot
- **504**: Timeout - El bot no respondió en 5 segundos

---

## Eventos Socket.io

El bot publica eventos en tiempo real a través de Socket.io cuando el estado de la música cambia:

- `music:update` - Estado general actualizado
- `music:paused` - Música pausada
- `music:resume` - Música reanudada
- `music:skip` - Canción saltada

El frontend se suscribe a estos eventos para actualizar la UI en tiempo real.

---

## Flujo de Datos

```
Frontend (Dashboard)
    ↓ HTTP POST
API (pancyapi)
    ↓ MQTT Request
Bot (PancyBotCode)
    ↓ MQTT Response
API (pancyapi)
    ↓ HTTP Response
Frontend (Dashboard)
    ↓ Socket.io (tiempo real)
Frontend actualizado automáticamente
```

---

## Timeouts y Reintentos

- **Timeout MQTT:** 5 segundos
- **No hay reintentos automáticos** (para evitar comandos duplicados)
- El frontend muestra un toast de error si la operación falla
- El estado real se sincroniza vía Socket.io

---

## Seguridad

⚠️ **Pendiente:** Implementar autorización en los endpoints
- Validar que el usuario tiene permisos en el servidor
- Validar sesión/JWT
- Rate limiting por usuario/guild

---

## Debugging

### Logs del Bot
Los handlers MQTT registran logs con el prefijo `[MQTT]`:
```
✓ Handlers MQTT de música registrados [MQTT]
```

### Logs de la API
Los errores MQTT se registran en consola:
```
MQTT request music/{guildId}/play failed: Error
```

### Frontend
Los errores se muestran como toasts en la esquina inferior derecha.

