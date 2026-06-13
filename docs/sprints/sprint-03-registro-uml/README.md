# Sprint 3 — UML del módulo Registro de usuarios

**Módulo:** Registro de usuarios  
**Estado:** Completado (último sprint)  
**Alcance:** Diagramas de clases y de secuencia del módulo implementado

> **Sprints anteriores:** [Sprint 1 — Análisis](../sprint-01-registro-usuarios/README.md) · [Sprint 2 — Implementación](../sprint-02-registro-backend/README.md) · [Sprint completo](../registro-usuarios/README.md)

---

## 1. Objetivo del sprint

Documentar la arquitectura del módulo de registro mediante:

- **Diagrama de clases** — entidades, capas backend y componentes frontend
- **Diagramas de secuencia** — flujos principales: registro exitoso, validación fallida y registrar otro paciente

---

## 2. Diagrama de clases — Backend (Laravel)

Representa las clases PHP involucradas en `POST /api/v1/auth/register`.

![Diagrama de clases — Backend](images/01-class-backend.png)

```mermaid
classDiagram
    direction TB

    class AuthController {
        +register(RegisterRequest) JsonResponse
        +login(Request) JsonResponse
        +me(Request) JsonResponse
        +logout(Request) JsonResponse
        +refresh(Request) JsonResponse
    }

    class RegisterRequest {
        +authorize() bool
        +prepareForValidation() void
        +rules() array
        +messages() array
        +attributes() array
    }

    class TenantMiddleware {
        +handle(Request, Closure) Response
    }

    class User {
        +id: bigint
        +tenant_id: string
        +name: string
        +email: string
        +password: string
        +tenant() BelongsTo
        +getJWTIdentifier() mixed
        +getJWTCustomClaims() array
        +assignRole(role: string) void
    }

    class Tenant {
        +id: string
        +name: string
        +slug: string
        +data: array
    }

    class Role {
        +id: bigint
        +name: string
        +guard_name: string
    }

    class JWTAuth {
        <<facade>>
        +fromUser(User) string
        +factory() JWTFactory
    }

    class FormRequest {
        <<abstract>>
        +validated() array
    }

    class Authenticatable {
        <<abstract>>
    }

    class BaseTenant {
        <<Stancl>>
    }

    AuthController --> RegisterRequest : usa
    AuthController --> User : crea
    AuthController --> JWTAuth : emite token
    RegisterRequest --|> FormRequest : extiende
    RegisterRequest --> Tenant : tenant_id unique
    RegisterRequest --> Role : role exists
    TenantMiddleware --> Tenant : busca por X-Tenant-ID
    User --|> Authenticatable : extiende
    User --> Tenant : belongsTo
    User --> Role : HasRoles
    Tenant --|> BaseTenant : extiende
```

### Relaciones con base de datos (Spatie Permission)

![Diagrama de clases — Base de datos](images/02-class-database.png)

```mermaid
classDiagram
    direction LR

    class users {
        +id PK
        +tenant_id FK
        +name
        +email
        +password
    }

    class tenants {
        +id PK
        +name
        +slug UK
    }

    class roles {
        +id PK
        +name
        +guard_name
    }

    class model_has_roles {
        +role_id FK
        +model_type
        +model_id FK
    }

    tenants "1" --> "*" users : contiene
    users "1" --> "*" model_has_roles : asignado
    roles "1" --> "*" model_has_roles : define
```

---

## 3. Diagrama de clases — Frontend (Vue 3)

Componentes y módulos del flujo de registro en el cliente.

![Diagrama de clases — Frontend](images/03-class-frontend.png)

```mermaid
classDiagram
    direction TB

    class RegisterPage {
        -form: RegisterForm
        -errors: FieldErrors
        -isSubmitting: boolean
        +handleSubmit() Promise
        +validateField(field) void
        +fieldBorderClass(field) string
    }

    class RegisterSuccessPage {
        -registeredUser: User
        +registerAgain() void
    }

    class AuthPageShell {
        +slot default
        +slot alert
    }

    class AuthStore {
        +token: string
        +tenantId: string
        +user: User
        +setTenantId(tenantId) void
        +register(payload) Promise
        +persistSession(payload) void
        +clearSession() void
    }

    class AxiosPlugin {
        +baseURL: string
        +interceptors: RequestInterceptor
    }

    class RegisterValidation {
        <<composable>>
        +validateRegisterForm(form) ValidationResult
        +mapApiErrors(apiErrors) MappedErrors
        +REGISTER_ROLE_OPTIONS: RoleOption[]
    }

    class VueRouter {
        +push(route) Promise
        +replace(route) Promise
    }

    class AuthGuard {
        +authGuard(to, from, next) void
    }

    class RegisterForm {
        <<DTO>>
        +tenantId: string
        +name: string
        +email: string
        +role: string
        +password: string
        +passwordConfirmation: string
    }

    RegisterPage --> AuthPageShell : usa layout
    RegisterSuccessPage --> AuthPageShell : usa layout
    RegisterPage --> AuthStore : register()
    RegisterPage --> RegisterValidation : validateRegisterForm
    RegisterPage --> RegisterValidation : mapApiErrors
    RegisterSuccessPage --> AuthStore : clearSession
    AuthStore --> AxiosPlugin : POST /auth/register
    RegisterPage --> VueRouter : push register-success
    RegisterSuccessPage --> VueRouter : push register
    AuthGuard --> VueRouter : beforeEach
    RegisterPage --> RegisterForm : contiene
```

---

## 4. Diagrama de secuencia — Registro exitoso

Flujo completo desde el formulario hasta la pantalla de éxito.

![Secuencia — Registro exitoso](images/04-sequence-registro-exitoso.png)

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant RegisterPage
    participant Validation as useRegisterValidation
    participant AuthStore
    participant Axios
    participant TenantMW as TenantMiddleware
    participant RegisterReq as RegisterRequest
    participant AuthCtrl as AuthController
    participant User as User Model
    participant Role as Spatie Role
    participant JWT as JWTAuth
    participant SuccessPage as RegisterSuccessPage

    Usuario->>RegisterPage: Completa formulario y envía
    RegisterPage->>Validation: validateRegisterForm(form)
    Validation-->>RegisterPage: isValid = true

    RegisterPage->>AuthStore: register(payload)
    AuthStore->>AuthStore: setTenantId(tenantId)
    AuthStore->>Axios: POST /auth/register

    Axios->>TenantMW: Request + X-Tenant-ID
    TenantMW->>TenantMW: find(tenantId)
    TenantMW->>RegisterReq: pasa request con tenant

    RegisterReq->>RegisterReq: prepareForValidation()
    RegisterReq->>RegisterReq: rules() + validación OK
    RegisterReq->>AuthCtrl: validated()

    AuthCtrl->>User: create(name, email, password, tenant_id)
    AuthCtrl->>Role: assignRole(role seleccionado)
    AuthCtrl->>JWT: fromUser(user)
    JWT-->>AuthCtrl: access_token

    AuthCtrl-->>Axios: 201 JSON user + token
    Axios-->>AuthStore: response
    AuthStore->>AuthStore: persistSession()
    AuthStore-->>RegisterPage: OK

    RegisterPage->>SuccessPage: router.push(/registro-exitoso)
    SuccessPage-->>Usuario: Muestra resumen + rol asignado
```

---

## 5. Diagrama de secuencia — Validación fallida (422)

Cuando el servidor rechaza los datos (email duplicado, contraseña débil, rol inválido, etc.).

![Secuencia — Validación fallida 422](images/05-sequence-validacion-fallida.png)

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant RegisterPage
    participant Validation as useRegisterValidation
    participant AuthStore
    participant Axios
    participant TenantMW as TenantMiddleware
    participant RegisterReq as RegisterRequest

    Usuario->>RegisterPage: Envía formulario inválido
    RegisterPage->>Validation: validateRegisterForm(form)

    alt Error local detectado
        Validation-->>RegisterPage: isValid = false, errors
        RegisterPage-->>Usuario: Muestra errores por campo
    else Pasa validación local
        Validation-->>RegisterPage: isValid = true
        RegisterPage->>AuthStore: register(payload)
        AuthStore->>Axios: POST /auth/register
        Axios->>TenantMW: Request + X-Tenant-ID
        TenantMW->>RegisterReq: validación servidor
        RegisterReq-->>Axios: 422 Unprocessable Entity
        Axios-->>AuthStore: error response
        AuthStore-->>RegisterPage: throw error
        RegisterPage->>Validation: mapApiErrors(errors)
        Validation-->>RegisterPage: fieldErrors
        RegisterPage-->>Usuario: Errores en campos + banner
    end
```

---

## 6. Diagrama de secuencia — Tenant inválido (404)

![Secuencia — Tenant inválido 404](images/06-sequence-tenant-invalido.png)

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant RegisterPage
    participant AuthStore
    participant Axios
    participant TenantMW as TenantMiddleware

    Usuario->>RegisterPage: Envía con UUID tenant incorrecto
    RegisterPage->>AuthStore: register(payload)
    AuthStore->>Axios: POST /auth/register + X-Tenant-ID
    Axios->>TenantMW: handle()
    TenantMW->>TenantMW: Tenant::find(id) = null
    TenantMW-->>Axios: 404 Tenant no encontrado
    Axios-->>RegisterPage: error
    RegisterPage-->>Usuario: Banner rojo + error en campo tenant
```

---

## 7. Diagrama de secuencia — Registrar otro paciente

Flujo desde la pantalla de éxito de vuelta al formulario.

![Secuencia — Registrar otro paciente](images/07-sequence-registrar-otro.png)

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant SuccessPage as RegisterSuccessPage
    participant AuthStore
    participant AuthGuard
    participant RegisterPage

    Usuario->>SuccessPage: Clic en Registrar otro paciente
    SuccessPage->>AuthStore: clearSession()
    Note over AuthStore: Elimina token y user de localStorage
    SuccessPage->>RegisterPage: router.push(/)
    AuthGuard->>AuthGuard: token = null, permite acceso
    RegisterPage-->>Usuario: Formulario limpio listo para nuevo registro
```

---

## 8. Diagrama de secuencia — Vista general FE ↔ BE

Resumen de capas en una sola interacción.

![Secuencia — Vista general FE ↔ BE](images/08-sequence-vista-general.png)

```mermaid
sequenceDiagram
    box Frontend Vue 3
        participant UI as RegisterPage
        participant Store as Pinia authStore
        participant HTTP as Axios
    end

    box Backend Laravel 12
        participant MW as TenantMiddleware
        participant Req as RegisterRequest
        participant Ctrl as AuthController
        participant DB as Base de datos
    end

    UI->>Store: register()
    Store->>HTTP: POST /api/v1/auth/register
    HTTP->>MW: X-Tenant-ID
    MW->>Req: tenant en attributes
    Req->>Ctrl: validated data
    Ctrl->>DB: INSERT users
    Ctrl->>DB: INSERT model_has_roles
    Ctrl->>HTTP: 201 + JWT
    HTTP->>Store: persistSession
    Store->>UI: éxito
```

---

## 9. Leyenda de clases por capa

| Capa | Clases / archivos |
|------|-------------------|
| **Presentación (Vue)** | `RegisterPage.vue`, `RegisterSuccessPage.vue`, `AuthPageShell.vue` |
| **Estado (Pinia)** | `stores/auth.js` → `AuthStore` |
| **Validación cliente** | `composables/useRegisterValidation.js` |
| **HTTP** | `plugins/axios.js` |
| **Routing** | `router/index.js`, `router/guards.js` |
| **Controlador** | `AuthController` |
| **Validación servidor** | `RegisterRequest` |
| **Middleware** | `TenantMiddleware` |
| **Dominio** | `User`, `Tenant`, `Role` (Spatie) |
| **Auth** | `JWTAuth` (tymon/jwt-auth) |

---

## 10. Roles disponibles en el registro

| Rol (`role`) | Asignación |
|--------------|------------|
| Recepcionista | Valor por defecto en UI |
| Médico | Seleccionable |
| Enfermera | Seleccionable |
| TecnicoLab | Seleccionable |
| Admin | Seleccionable |

Validados con `Rule::exists('roles', 'name')` en `RegisterRequest`.

---

## 11. Imágenes exportadas (PNG)

Todas las imágenes están en la carpeta [`images/`](images/):

| # | Archivo | Descripción |
|---|---------|-------------|
| 1 | [01-class-backend.png](images/01-class-backend.png) | Clases backend Laravel |
| 2 | [02-class-database.png](images/02-class-database.png) | Tablas BD + Spatie |
| 3 | [03-class-frontend.png](images/03-class-frontend.png) | Clases frontend Vue |
| 4 | [04-sequence-registro-exitoso.png](images/04-sequence-registro-exitoso.png) | Secuencia registro OK |
| 5 | [05-sequence-validacion-fallida.png](images/05-sequence-validacion-fallida.png) | Secuencia error 422 |
| 6 | [06-sequence-tenant-invalido.png](images/06-sequence-tenant-invalido.png) | Secuencia error 404 |
| 7 | [07-sequence-registrar-otro.png](images/07-sequence-registrar-otro.png) | Secuencia otro paciente |
| 8 | [08-sequence-vista-general.png](images/08-sequence-vista-general.png) | Secuencia vista general |

Los archivos fuente Mermaid están en [`diagrams/`](diagrams/) por si necesitas regenerarlas con:

```bash
npx @mermaid-js/mermaid-cli -i diagrams/01-class-backend.mmd -o images/01-class-backend.png -b white
```

---

## 12. Referencias

| Recurso | Ubicación |
|---------|-----------|
| Sprint 2 — Implementación | [../sprint-02-registro-backend/README.md](../sprint-02-registro-backend/README.md) |
| Sprint completo | [../registro-usuarios/README.md](../registro-usuarios/README.md) |
| Pruebas | [../sprint-02-registro-backend/PRUEBAS.md](../sprint-02-registro-backend/PRUEBAS.md) |

---

*Sprint 3 — Diagramas UML (clases y secuencia) del módulo Registro de usuarios.*
