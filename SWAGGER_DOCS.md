# Documentación Swagger/OpenAPI - API Clínica Odontológica

## 🚀 Acceso a la Documentación

Una vez que el servidor esté ejecutándose, puedes acceder a la documentación interactiva de Swagger en:

**🔗 URL:** [http://localhost:3000/docs](http://localhost:3000/docs)

## 📋 Características Implementadas

### ✅ **Documentación Completa de Endpoints**

#### 🔐 **Autenticación (`/api/auth`)**
- **POST** `/login` - Iniciar sesión y obtener token JWT
- **POST** `/register` - Crear nuevos usuarios (solo admin)
- **POST** `/setup-admin` - Configurar primer administrador
- **GET** `/users` - Listar usuarios del sistema

#### 👤 **Pacientes (`/api/pacientes`)**
- **GET/POST/PATCH/DELETE** - CRUD completo de pacientes
- Validaciones de datos de entrada
- Respuestas documentadas por código de estado

#### 📅 **Turnos (`/api/turnos`)**
- **GET/POST/PATCH/DELETE** - Gestión de citas
- **PATCH** `/:id/checkin` - Check-in de pacientes
- Control de estados de turnos

#### 📋 **Historias Clínicas (`/api/historias`)**
- **POST** - Crear historia con cuestionario completo
- **GET** `/paciente/:id` - Historias por paciente
- **GET/PATCH/DELETE** - Gestión individual
- DTOs anidados para cuestionarios complejos

#### 🦷 **Odontogramas (`/api/odontogramas`)**
- **POST** - Crear con versionado automático
- **GET** `/historia/:id/latest` - Última versión
- **GET** `/historia/:id` - Todas las versiones
- Sistema de versiones documentado

#### 📎 **Adjuntos (`/api/adjuntos`)**
- **POST** `/upload` - Subida de archivos con validaciones
- **GET** `/:id/download` - Descarga de archivos
- **GET** `/historia/:id` - Adjuntos por historia
- Tipos de archivo permitidos documentados

### 🔒 **Autenticación Bearer Token**

La documentación incluye:
- Configuración automática de Bearer Auth
- Botón "Authorize" para configurar token
- Persistencia de autorización entre solicitudes
- Ejemplos de headers de autenticación

### 📊 **Esquemas de Datos Detallados**

#### **DTOs de Entrada:**
```typescript
// Ejemplo: CreateHistoriaDto
{
  "pacienteId": 1,
  "cuestionario": {
    "motivo_consulta": {
      "motivo_consulta": "Dolor en muela del juicio"
    },
    "antecedentes": {
      "enfermedades": "Hipertensión",
      "medicamentos": "Losartán 50mg",
      "alergias": "Penicilina"
    },
    "examen_clinico": {
      "estado_general": "Paciente consciente",
      "presion_arterial": "120/80 mmHg"
    }
  },
  "observaciones": "Requiere seguimiento"
}
```

#### **Respuestas Tipadas:**
- Códigos de estado HTTP documentados
- Esquemas de respuesta exitosa
- Esquemas de errores con ejemplos
- Metadatos de paginación cuando aplica

### 🏷️ **Organización por Tags**

Los endpoints están organizados en secciones:
- `auth` - Autenticación y autorización
- `pacientes` - Gestión de pacientes
- `turnos` - Gestión de turnos y citas
- `historias` - Historias clínicas
- `odontogramas` - Odontogramas con versionado
- `adjuntos` - Gestión de archivos médicos

### 📝 **Descripciones Detalladas**

Cada endpoint incluye:
- **Summary**: Descripción corta
- **Description**: Explicación detallada de la funcionalidad
- **Parameters**: Documentación de parámetros de ruta y query
- **Request Body**: Esquemas de datos de entrada
- **Responses**: Códigos de estado y esquemas de respuesta
- **Examples**: Valores de ejemplo para todos los campos

### 🔧 **Validaciones Documentadas**

#### **Subida de Archivos:**
```yaml
# Documentación de /adjuntos/upload
content-type: multipart/form-data
max-file-size: 5MB
allowed-types:
  - image/jpeg
  - image/png  
  - image/gif
  - application/pdf
  - application/msword
  - text/plain
```

#### **Enum Values:**
- **UserRole**: admin, recepcion, estudiante, docente
- **TipoAdjunto**: radiografia, foto_intraoral, documento, etc.
- **TurnoEstado**: programado, confirmado, completado, cancelado

### 🚀 **Características Avanzadas**

#### **Try It Out:**
- Interfaz interactiva para probar endpoints
- Generación automática de código curl
- Validación en tiempo real de parámetros
- Respuestas en vivo del servidor

#### **Modelos de Datos:**
- Sección "Schemas" con todos los modelos
- Referencias cruzadas entre DTOs
- Validaciones de campos mostradas
- Tipos de datos TypeScript preservados

## 🎯 **Casos de Uso Principales**

### 1. **Configuración Inicial:**
```bash
# Usar Swagger para crear primer admin
POST /auth/setup-admin
{
  "nombre": "Dr. Administrador",
  "email": "admin@clinica.com", 
  "password": "admin123",
  "rol": "admin"
}
```

### 2. **Flujo de Historia Clínica:**
1. **Login** → Obtener token
2. **Crear/Buscar paciente** → GET/POST /pacientes
3. **Crear historia** → POST /historias (con cuestionario)
4. **Crear odontograma** → POST /odontogramas (versión 1)
5. **Subir archivos** → POST /adjuntos/upload

### 3. **Versionado de Odontogramas:**
```bash
# Primera versión (automático: version = 1)
POST /odontogramas { historiaId: 1, datos: {...} }

# Segunda versión (automático: version = 2)  
POST /odontogramas { historiaId: 1, datos: {...} }

# Obtener última versión
GET /odontogramas/historia/1/latest
```

### 4. **Gestión de Archivos:**
```bash
# Subir radiografía
POST /adjuntos/upload
Form Data:
- file: [archivo.jpg]
- historiaId: 1
- tipo: radiografia
- descripcion: "Radiografía panorámica"

# Descargar archivo
GET /adjuntos/{id}/download
```

## 🔍 **Testing con Swagger**

### **Autenticación:**
1. Hacer login en `/auth/login`
2. Copiar `access_token` de la respuesta
3. Hacer click en "Authorize" (🔒)
4. Introducir: `Bearer [token]`
5. Todos los endpoints protegidos funcionarán

### **Subida de Archivos:**
1. Ir a `/adjuntos/upload`
2. Click "Try it out"
3. Seleccionar archivo (< 5MB)
4. Completar form data
5. Ejecutar y ver respuesta

### **DTOs Complejos:**
- Los formularios de Swagger generan automáticamente
- Estructura anidada de cuestionarios visible
- Validaciones en tiempo real
- Ejemplos pre-cargados

## 📱 **Configuración de Swagger**

### **Configuración en `main.ts`:**
```typescript
const config = new DocumentBuilder()
  .setTitle('API Clínica Odontológica')
  .setDescription('Sistema integral de gestión')
  .setVersion('2.0')
  .addBearerAuth()
  .addTag('auth', 'Autenticación')
  // ... más tags
  .build();
```

### **Decoradores Utilizados:**
- `@ApiTags()` - Agrupación de endpoints
- `@ApiOperation()` - Título y descripción
- `@ApiResponse()` - Respuestas por código
- `@ApiParam()` - Parámetros de ruta
- `@ApiBody()` - Cuerpo de solicitud
- `@ApiProperty()` - Propiedades de DTOs
- `@ApiBearerAuth()` - Autenticación JWT
- `@ApiConsumes()` - Tipo de contenido

## 🏆 **Beneficios de la Documentación**

### **Para Desarrolladores:**
- ✅ Referencia completa y actualizada
- ✅ Testing interactivo sin herramientas externas
- ✅ Generación automática de código cliente
- ✅ Validación de contratos de API

### **Para Frontend:**
- ✅ Especificación OpenAPI exportable
- ✅ Generación de clientes TypeScript
- ✅ Mock servers para desarrollo
- ✅ Contratos de API versionados

### **Para QA/Testing:**
- ✅ Casos de prueba documentados
- ✅ Validaciones de entrada/salida
- ✅ Códigos de error documentados
- ✅ Flujos de trabajo completos

---

## 🚀 **Acceso Rápido**

**🌐 API Base:** `http://localhost:3000/api`

**📖 Documentación:** `http://localhost:3000/docs`

**🔄 Actualización:** La documentación se actualiza automáticamente con los cambios del código.

---

**¡Documentación Swagger completamente implementada y funcional!** ✨