# Despliegue de NMRC

Arquitectura de producción:

- **Storefront** → Vercel (Vite estático)
- **Dashboard** → Vercel (Vite estático)
- **API (NestJS)** → Render (Web Service)
- **Base de datos** → Supabase (PostgreSQL)

El orden importa: **Supabase → Render → Vercel** (cada capa necesita la URL de la anterior).

---

## 1) Supabase (base de datos)

1. Crea un proyecto en [supabase.com](https://supabase.com) (elige una región cercana, p.ej. `us-east`).
2. Define una contraseña de base de datos y guárdala.
3. Ve a **Project Settings → Database → Connection string** y copia DOS cadenas:
   - **Transaction / Pooled** (puerto `6543`, host `...pooler.supabase.com`) → será `DATABASE_URL`
     (agrégale `?pgbouncer=true` al final).
   - **Direct connection** (puerto `5432`) → será `DIRECT_URL`.

> Prisma usa `DATABASE_URL` (pooled) para las consultas y `DIRECT_URL` para crear/sincronizar tablas.

---

## 2) Render (API)

1. En [render.com](https://render.com): **New → Blueprint** y conecta el repo `NotJarethGG/NMRC`.
   Render detecta [`render.yaml`](render.yaml) y crea el servicio `nmrc-api`.
2. Completa las variables marcadas:
   - `DATABASE_URL` y `DIRECT_URL` (de Supabase, paso 1).
   - `CORS_ORIGINS` = los dominios de Vercel (paso 3), separados por coma. (Puedes dejarlo y
     editarlo después de crear los proyectos en Vercel.)
   - `PUBLIC_URL` = la URL de este servicio, p.ej. `https://nmrc-api.onrender.com`.
   - `SINPE_NUMBER` / `WHATSAPP_NUMBER` con tus datos reales.
3. Deploy. En el arranque, `start:prod` ejecuta `prisma db push` y **crea las tablas en Supabase**.
4. **Cargar datos demo (una vez):** desde tu máquina, con las URLs de Supabase exportadas:
   ```bash
   cd apps/api
   DATABASE_URL="...6543...?pgbouncer=true" DIRECT_URL="...5432..." npx prisma db seed
   ```
   (O usa la pestaña SQL de Supabase / Render Shell.)

> Nota: el plan free de Render **duerme** tras ~15 min de inactividad (primer request ~50s).

---

## 3) Vercel (storefront + dashboard)

Crea **dos** proyectos desde el mismo repo:

| Proyecto | Root Directory | Variable de entorno |
|---|---|---|
| nmrc-storefront | `apps/storefront` | `VITE_API_URL = https://nmrc-api.onrender.com/api` |
| nmrc-admin | `apps/admin` | `VITE_API_URL = https://nmrc-api.onrender.com/api` |

- Vercel detecta Vite automáticamente (build `vite build`, output `dist`). El
  [`vercel.json`](apps/storefront/vercel.json) añade el rewrite SPA para el router.
- Tras desplegar, copia las dos URLs de Vercel y ponlas en `CORS_ORIGINS` del servicio de Render.

---

## Imágenes de productos (importante)

Las imágenes subidas desde el dashboard se guardan en el disco del API. En Render el disco es
**efímero** (se borran al redesplegar). Los productos del seed usan URLs de Unsplash, así que se ven
bien; para subir imágenes propias en producción hay que mover el upload a **Cloudinary** (gratis) —
cambio aislado en `apps/api/src/upload`.

## Desarrollo local

Ahora la DB es PostgreSQL. Para correr local apunta `apps/api/.env` a Supabase (o a un Postgres
local). XAMPP/MySQL ya no se usa. Luego:
```bash
npm install
cd apps/api && npx prisma db push && npx prisma db seed
npm run dev:api   # + dev:store + dev:admin
```
