# Hybridge Blog - API con Autenticación JWT

## Autor

Aaron Zapata - Ingeniería de Software

## Descripción

API RESTful con autenticación JWT usando Passport.js, protegiendo endpoints de Authors y Posts.

## Tecnologías

- Node.js + Express
- PostgreSQL + Sequelize ORM
- Passport.js (Local + JWT)
- bcryptjs
- jsonwebtoken

## Instalación

### 1. Clonar repositorio

```bash
git clone https://github.com/TU_USUARIO/hybridge-blog-auth.git
cd hybridge-blog-auth
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia `.env.example` a `.env` y configura tus credenciales:

```bash
cp .env.example .env
```

Edita `.env` con tus valores:

```
DB_USER=tu_usuario_postgres
DB_PASS=tu_password
JWT_SECRET=ejecuta: openssl rand -hex 32
```

### 4. Crear base de datos

```bash
npx sequelize-cli db:create
```

### 5. Ejecutar migraciones

```bash
npx sequelize-cli db:migrate
```

### 6. Iniciar servidor

```bash
npm run dev
```

Servidor corriendo en: http://localhost:3000

## Endpoints Protegidos ✅

Los siguientes endpoints requieren JWT en header `Authorization: Bearer <token>`:

### Authors

- `POST /api/authors` - Crear autor
- `PUT /api/authors/:id` - Editar autor
- `DELETE /api/authors/:id` - Eliminar autor

### Posts

- `POST /api/posts` - Crear post
- `PUT /api/posts/:id` - Editar post
- `DELETE /api/posts/:id` - Eliminar post

## Endpoints Públicos

- `POST /api/signup` - Registro
- `POST /api/login` - Login (obtener token)
- `GET /api/authors` - Listar autores
- `GET /api/posts` - Listar posts

## Flujo de Autenticación

1. **Registrarse**

```bash
POST /api/signup
{
  "name": "Tu Nombre",
  "email": "tu@email.com",
  "password": "tu_password"
}
```

2. **Login**

```bash
POST /api/login
{
  "email": "tu@email.com",
  "password": "tu_password"
}
```

Respuesta:

```json
{
  "token": "eyJhbGci...",
  "token_type": "Bearer"
}
```

3. **Usar token en requests protegidos**

```
Authorization: Bearer eyJhbGci...
```

## Capturas de Pantalla

Ver carpeta `/screenshots` para ejemplos de uso en Postman.

## Seguridad Implementada

- ✅ Passwords hasheados con bcrypt (10 rounds)
- ✅ JWT firmado con secret key
- ✅ Tokens con expiración (1 hora)
- ✅ Email único en base de datos
- ✅ Middleware de autenticación en rutas sensibles
