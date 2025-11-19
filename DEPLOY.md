# Deploy con Docker - Odontología API

Esta guía te ayudará a desplegar la aplicación usando Docker con una base de datos externa.

## Prerequisitos

- Docker y Docker Compose instalados
- Acceso a una base de datos PostgreSQL externa (ej: AWS RDS, Google Cloud SQL, Azure Database, etc.)

## Configuración

### 1. Variables de Entorno

Copia el archivo de ejemplo y configura las variables:

```bash
cp .env.example .env
```

Edita `.env` con tus datos reales:

```env
# Variables de base de datos externa
DATABASE_HOST=tu-db-host.amazonaws.com
DATABASE_PORT=5432
DATABASE_USERNAME=tu_usuario
DATABASE_PASSWORD=tu_password_segura
DATABASE_NAME=odontologia_prod

# Variables de JWT
JWT_SECRET=un_jwt_secret_muy_seguro_y_largo_para_produccion
JWT_EXPIRATION_TIME=24h

# Puerto de la aplicación
PORT=3000

# Entorno
NODE_ENV=production
```

### 2. Deploy

#### Opción A: Script Automático (Windows)
```powershell
.\deploy.ps1
```

#### Opción B: Script Automático (Linux/Mac)
```bash
chmod +x deploy.sh
./deploy.sh
```

#### Opción C: Manual
```bash
# Detener contenedores existentes
docker-compose -f docker-compose.prod.yml down

# Construir e iniciar
docker-compose -f docker-compose.prod.yml up --build -d
```

## Comandos Útiles

### Ver logs
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Detener la aplicación
```bash
docker-compose -f docker-compose.prod.yml down
```

### Reiniciar
```bash
docker-compose -f docker-compose.prod.yml restart
```

### Ver estado de contenedores
```bash
docker-compose -f docker-compose.prod.yml ps
```

## Estructura de Archivos

- `docker-compose.yml` - Para desarrollo (incluye base de datos local)
- `docker-compose.prod.yml` - Para producción (solo backend)
- `Dockerfile` - Imagen de la aplicación
- `.env.example` - Plantilla de variables de entorno
- `deploy.ps1` - Script de deploy para Windows
- `deploy.sh` - Script de deploy para Linux/Mac

## Notas Importantes

1. **Seguridad**: Asegúrate de que el archivo `.env` no esté incluido en tu repositorio git
2. **Base de Datos**: La base de datos externa debe estar accesible desde donde ejecutes el contenedor
3. **Firewall**: Verifica que el puerto configurado esté abierto en tu firewall
4. **SSL**: Para producción, considera usar un proxy reverso con SSL (nginx, traefik, etc.)

## Troubleshooting

### Error de conexión a la base de datos
- Verifica que `DATABASE_HOST` sea accesible
- Confirma que las credenciales sean correctas
- Asegúrate de que el puerto `DATABASE_PORT` esté abierto

### Contenedor no inicia
```bash
# Ver logs detallados
docker-compose -f docker-compose.prod.yml logs

# Verificar que las variables estén cargadas
docker-compose -f docker-compose.prod.yml config
```