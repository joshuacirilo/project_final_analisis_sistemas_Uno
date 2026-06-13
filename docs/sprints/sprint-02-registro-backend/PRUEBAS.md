# Pruebas — Registro de usuarios (FE + BE)

> **Sprint 2:** [README.md](./README.md) · **Sprint completo:** [registro-usuarios/README.md](../registro-usuarios/README.md)

Guía de pruebas **automatizadas** y **manuales** para el módulo de registro.

**URL de la aplicación:** http://127.0.0.1:8000/  
**Tenant demo:** `00000000-0000-4000-8000-000000000001`  
**Contraseña válida de ejemplo:** `Password1!`

---

## 1. Prerrequisitos

```bash
# Terminal 1
php artisan serve

# Terminal 2
npm run dev
```

Abrir **http://127.0.0.1:8000/** (no usar `:5173` directamente; ese puerto es solo para assets de Vite).

---

## 2. Tests automatizados (PHPUnit)

```bash
php artisan test --filter=AuthRegister
```

### Casos positivos

| Test | Escenario | Resultado |
|------|-----------|-----------|
| `test_register_creates_user_and_returns_token` | Datos válidos | 201 + JWT + rol Recepcionista |
| `test_register_allows_same_email_in_different_tenant` | Mismo email, otro hospital | 201 |
| `test_register_normalizes_email_to_lowercase` | `Maria@Example.COM` | 201, email en minúsculas |

### Casos fallidos

| Test | Escenario | HTTP |
|------|-----------|------|
| `test_register_rejects_duplicate_email_in_same_tenant` | Email repetido | 422 |
| `test_register_rejects_weak_password` | Sin mayúscula/símbolo | 422 |
| `test_register_rejects_password_confirmation_mismatch` | Confirmación distinta | 422 |
| `test_register_rejects_invalid_name` | Nombre de 1 carácter | 422 |
| `test_register_rejects_invalid_email_format` | `not-an-email` | 422 |
| `test_register_rejects_name_with_invalid_characters` | `Juan123` | 422 |
| `test_register_rejects_missing_required_fields` | Body vacío | 422 |
| `test_register_requires_tenant_header` | Sin `X-Tenant-ID` | 400 |
| `test_register_rejects_unknown_tenant` | UUID inexistente | 404 |

---

## 3. Pruebas manuales en UI

### Casos positivos

| ID | Pasos | Datos | Resultado esperado |
|----|-------|-------|-------------------|
| **P1** | Completar formulario y enviar | Tenant demo, María López, email nuevo, `Password1!` x2 | Redirect a `/registro-exitoso` con resumen del paciente |
| **P2** | Registrar con email en mayúsculas | `Nuevo@Example.COM` | Registro OK; email guardado en minúsculas |
| **P3** | Tras P1, clic en "Registrar otro paciente" | — | Vuelve a `/` con formulario limpio y sin sesión |

### Casos fallidos

| ID | Pasos | Datos | Resultado esperado |
|----|-------|-------|-------------------|
| **F1** | Tenant inexistente | `00000000-0000-0000-0000-000000000099` | Banner rojo: "Tenant no encontrado." o "El hospital indicado no existe" |
| **F2** | Repetir email de P1 | Mismo email + tenant demo | Error en campo email: "El correo electrónico ya está registrado en este hospital." |
| **F3** | Contraseña débil | `password` / `password` | Error en password (reglas de fortaleza) |
| **F4** | Confirmación distinta | `Password1!` / `OtherPass1!` | "Las contraseñas no coinciden." |
| **F5** | Nombre corto | `A` | Error en name (mín. 2 caracteres) |
| **F6** | Nombre con números | `Juan123` | Error en name (solo letras) |
| **F7** | Email inválido | `correo@` | Error en email |
| **F8** | Tenant vacío | Borrar UUID | Error local: "El ID de tenant es obligatorio." |

---

## 4. Pruebas manuales con cURL

### P1 — Registro exitoso

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "X-Tenant-ID: 00000000-0000-4000-8000-000000000001" \
  -d "{\"name\":\"María López\",\"email\":\"nuevo.usuario@example.com\",\"password\":\"Password1!\",\"password_confirmation\":\"Password1!\"}"
```

**Esperado:** HTTP `201`, JSON con `access_token` y `user.roles[0].name = Recepcionista`.

---

### F1 — Tenant inexistente

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "X-Tenant-ID: 00000000-0000-0000-0000-000000000099" \
  -d "{\"name\":\"María López\",\"email\":\"test@example.com\",\"password\":\"Password1!\",\"password_confirmation\":\"Password1!\"}"
```

**Esperado:** HTTP `404`, `"message": "Tenant no encontrado."`

---

### F2 — Email duplicado

Ejecutar P1 dos veces con el **mismo email**.

**Esperado:** HTTP `422`, error en `email`: "El correo electrónico ya está registrado en este hospital."

---

### F3 — Contraseña débil

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "X-Tenant-ID: 00000000-0000-4000-8000-000000000001" \
  -d "{\"name\":\"Test User\",\"email\":\"debil@example.com\",\"password\":\"password\",\"password_confirmation\":\"password\"}"
```

**Esperado:** HTTP `422`, error en `password`.

---

### F4 — Contraseñas no coinciden

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "X-Tenant-ID: 00000000-0000-4000-8000-000000000001" \
  -d "{\"name\":\"Test User\",\"email\":\"mismatch@example.com\",\"password\":\"Password1!\",\"password_confirmation\":\"OtherPass1!\"}"
```

**Esperado:** HTTP `422`, `"Las contraseñas no coinciden."`

---

### F5 — Sin cabecera tenant

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"sintenant@example.com\",\"password\":\"Password1!\",\"password_confirmation\":\"Password1!\"}"
```

**Esperado:** HTTP `400`, `"La cabecera X-Tenant-ID es obligatoria."`

---

## 5. Checklist de integración FE-BE

- [ ] Formulario en `/` envía POST a `/api/v1/auth/register`
- [ ] Cabecera `X-Tenant-ID` se envía vía `auth.setTenantId`
- [ ] Errores 422 se muestran por campo en español
- [ ] Error 404 de tenant muestra banner rojo
- [ ] Registro exitoso redirige a `/registro-exitoso`
- [ ] "Registrar otro paciente" limpia sesión y vuelve a `/`
- [ ] `/inicio` y `/login` redirigen a `/`
- [ ] `php artisan test --filter=AuthRegister` — 12 tests pasando

---

## 6. Solución de problemas

| Problema | Causa | Solución |
|----------|-------|----------|
| Página gris "Laravel Vite" | Acceso a `:5173` | Usar **http://127.0.0.1:8000/** |
| Error de red / CORS | API en otro origen | Verificar `VITE_API_URL` en `.env` o usar same-origin (`/api/v1`) |
| 404 Tenant | UUID incorrecto | Usar tenant demo del seeder |
| 422 email duplicado | Usuario ya existe | Cambiar email o borrar BD de prueba |

---

*Pruebas del módulo Registro de usuarios — Sprint integración FE-BE.*
