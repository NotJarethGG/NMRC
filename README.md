# GosthShop

Ecosistema de comercio para **GosthShop** — tienda de ropa exclusiva con estética de lujo
silencioso (inspirada en Fear of God). Monorepo con tres aplicaciones:

| App | Carpeta | Stack | Puerto |
|-----|---------|-------|--------|
| **Storefront** | `apps/storefront` | Vite + React + TS, Tailwind, framer-motion, Zustand, TanStack Query | 5173 |
| **Dashboard admin** | `apps/admin` | Vite + React + TS, Tailwind, Recharts | 5174 |
| **API** | `apps/api` | NestJS + Prisma + MySQL (XAMPP), JWT con roles | 3000 |

## Requisitos

- Node 20+
- **XAMPP** con MySQL/MariaDB corriendo (puerto 3306, usuario `root` sin contraseña por defecto)

## Puesta en marcha

```bash
# 1. Instalar dependencias (todo el monorepo)
npm install

# 2. Configurar la API
cp apps/api/.env.example apps/api/.env   # ajusta DATABASE_URL, SINPE_NUMBER, WHATSAPP_NUMBER

# 3. Crear el esquema y datos de ejemplo
npm run prisma:migrate     # crea la base 'gosthshop' y las tablas
npm run prisma:seed        # carga categorías, colecciones, productos y usuarios demo

# 4. Levantar las tres apps (en terminales separadas)
npm run dev:api
npm run dev:store
npm run dev:admin
```

- Storefront: http://localhost:5173
- Admin: http://localhost:5174
- API: http://localhost:3000/api

## Usuarios demo (contraseña: `password123`)

| Rol | Correo |
|-----|--------|
| ADMIN | `admin@gosthshop.com` |
| STAFF | `staff@gosthshop.com` |
| CLIENTE | `cliente@gosthshop.com` |

## Flujo de compra (SINPE)

1. El cliente se registra/inicia sesión, agrega productos a la bolsa y va a **checkout**.
2. Al confirmar, se crea un pedido en estado `PENDING` y se muestra el **número SINPE Móvil**,
   el monto exacto y un botón **"Enviar comprobante por WhatsApp"** (link `wa.me` con el pedido
   pre-llenado).
3. El cliente paga por SINPE y envía el comprobante por WhatsApp.
4. En el **dashboard → Pedidos**, el staff abre el pedido y pulsa **"Confirmar pago"**:
   el estado pasa a `PAID` y **se descuenta el inventario** automáticamente.

> La pasarela de pagos automática queda para una fase posterior; hoy el pago es por SINPE manual.

## Configuración de pago

En `apps/api/.env`:

```
SINPE_NUMBER="8888-8888"        # tu número SINPE Móvil
WHATSAPP_NUMBER="50688888888"   # tu WhatsApp en formato internacional (sin +)
```

## Imágenes

Las imágenes que subes desde el dashboard se guardan en `apps/api/uploads/` y se sirven en
`/uploads/...`. Para producción se recomienda migrar a un almacenamiento en la nube
(Cloudinary/S3) — es un cambio aislado en `apps/api/src/upload`.

## Nota sobre MariaDB de XAMPP

Si al migrar aparece un error tipo *"Column count of mysql.proc is wrong"* o *"mysql.proc is
corrupted"*, las tablas de sistema de MariaDB están desactualizadas. Solución (ejecutar como el
usuario del servidor o con la BD detenida):

```bash
/Applications/XAMPP/xamppfiles/bin/mysql_upgrade -u root
```

Este repositorio ya quedó funcionando contra tu instancia local de XAMPP.
