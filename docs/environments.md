# Ambientes: desarrollo local, staging y producción

## ¿Tu flujo es correcto?

Sí. Lo habitual es:

1. **Desarrollo local** — Cambias `schema.prisma`, corres **`pnpm db:migrate`** contra Postgres en **Docker** (o una base “dev” desechable). Revisas el SQL generado y haces commit de `prisma/migrations/`.
2. **Staging** — Contra la base de **Supabase staging**, corres **`pnpm db:deploy:staging`** para aplicar las mismas migraciones que ya están en Git. Pruebas la app (Vercel Preview, API en DO staging, etc.).
3. **Producción** — Si staging está bien, **`pnpm db:deploy:production`** (o el mismo comando en CI) contra **Supabase producción**, luego despliegas web/API.

Así nunca “inventas” SQL en prod: solo aplicas lo versionado.

---

## Archivos de variables en el repo

| Archivo                              | Uso                                                                                                                                                                | ¿En Git?      |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| `packages/database/.env.development` | **Local**: Prisma CLI (`db:generate`, `db:migrate`, `db:deploy` en la raíz) lo cargan con `dotenv-cli`. Incluye **`DATABASE_URL`** y **`DIRECT_URL`** (ver abajo). | No (ignorado) |
| `packages/database/.env.staging`     | Solo al ejecutar **`pnpm db:deploy:staging`**. URL del proyecto **Supabase staging**.                                                                              | No            |
| `packages/database/.env.production`  | Solo al ejecutar **`pnpm db:deploy:production`**. URL **Supabase producción**.                                                                                     | No            |
| `*.env*.example`                     | Plantillas sin secretos.                                                                                                                                           | Sí            |

Copia los `.example` a los archivos reales en tu máquina (no los subas).

### `DATABASE_URL` vs `DIRECT_URL` (Prisma 7 + Supabase)

- **`DATABASE_URL`**: **solo runtime** — `PrismaPg` en `src/client.ts`. En Supabase suele ser **Transaction pooler** (`*.pooler.supabase.com:6543`, `pgbouncer=true`). No uses esa URL para migraciones: puede romper locks/transacciones del CLI.
- **`DIRECT_URL`**: **solo Prisma CLI** — `prisma.config.ts` → `datasource.url` (`migrate`, `deploy`, `db pull`, …). Debe ser **Session pooler** en el **mismo host** pooler con puerto **5432**, o **Direct** `db.<ref>.supabase.co:5432`. Si Direct da **P1001** (p. ej. IPv6), prueba Session pooler en `:5432` del host pooler. [Guía Prisma](https://www.prisma.io/docs/guides/database/supabase).

En **Docker local** sin pooler, **misma cadena** en ambas variables.

Estas variables deben existir en **`packages/database/.env.development`** (y en CI según el comando que ejecutes).

---

## Comandos (desde la raíz del monorepo)

| Comando                     | Cuándo                              | Base que usa                                                                                                |
| --------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `pnpm db:migrate`           | Cambias el modelo en **local**      | **`packages/database/.env.development`** → Docker (recomendado)                                             |
| `pnpm db:generate`          | Tras migrar o clonar el repo        | Lee **`packages/database/.env.development`** (URLs deben existir; generate no abre sesión larga de migrate) |
| `pnpm db:deploy`            | Aplica migraciones en **local/dev** | Mismo archivo **`.env.development`** (misma convención que staging/prod con otros nombres)                  |
| `pnpm db:deploy:staging`    | Después de validar en local         | Lee **`.env.staging`**                                                                                      |
| `pnpm db:deploy:production` | Release a prod                      | Lee **`.env.production`**                                                                                   |
| `pnpm db:seed:staging`      | Datos demo en **Supabase staging**  | Lee **`.env.staging`** (después de `db:deploy:staging`)                                                     |
| `pnpm db:seed:production`   | Datos demo en **Supabase prod**     | Lee **`.env.production`** (después de `db:deploy:production`)                                               |

`db:generate`, `db:migrate` y `db:deploy` usan **`.env.development`**; los de staging/prod usan **`dotenv-cli`** con su archivo correspondiente.

### Seed en staging / producción

El script `prisma/seed.ts` es **idempotente** (upsert): puedes ejecutarlo más de una vez sin duplicar la empresa demo ni los usuarios por email.

Orden recomendado por entorno:

```bash
pnpm db:deploy:staging
pnpm db:seed:staging
```

```bash
pnpm db:deploy:production
pnpm db:seed:production
```

Credenciales por defecto (igual que en local): `prueba@ejemplo.com` / `Password123`. Opcional: `SEED_USER_PASSWORD=tuClave` en el mismo `.env.staging` o `.env.production` antes del seed.

**Producción:** el seed inserta datos de demostración y contraseñas conocidas; úsalo solo si quieres esa base poblada para pruebas o demos, no como sustituto de usuarios reales.

---

## Cómo controlar qué base usa la app al correr

No hay un único “interruptor” global: **cada capa** elige variables según **dónde corre** el proceso.

### 1) Tu PC — Prisma (migraciones / generate)

| Objetivo                                           | Qué haces                                                                                                                                              |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Base local (Docker)**                            | `packages/database/.env.development` con URL de Docker. `pnpm db:migrate`, `pnpm db:generate`, `pnpm db:deploy` cargan **ese** archivo explícitamente. |
| **Solo aplicar migraciones a Supabase staging**    | Archivo `packages/database/.env.staging` → `pnpm db:deploy:staging`.                                                                                   |
| **Solo aplicar migraciones a Supabase producción** | Archivo `packages/database/.env.production` → `pnpm db:deploy:production`.                                                                             |

Migraciones **no** arrancan Next ni Nest: solo conectan a la URL que indiques.

### 2) Tu PC — Next (`apps/web`) y Nest (`apps/api`)

Cada app tiene **sus propios** archivos (sin `.env` compartido en la raíz del monorepo):

| App     | Desarrollo local                                              | Staging en tu máquina                                                                                                      |
| ------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **web** | `apps/web/.env.development` (Next lo carga en `next dev`)     | `apps/web/.env.staging` + script `dev:staging` que pone `APP_ENV=staging`; `next.config.js` carga ese archivo con `dotenv` |
| **api** | `apps/api/.env.development` (`@nestjs/config` en `AppModule`) | `apps/api/.env.staging` cuando corres `dev:staging` (`APP_ENV=staging`)                                                    |

| Objetivo                                   | Comando / archivos                                                                                                                                                                      |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Desarrollo normal (Docker + localhost)** | `pnpm dev` en la raíz (`turbo run dev`) o `pnpm --filter web dev` / `api dev`. Copia los `*.example` a `.env.development` en cada app.                                                  |
| **Contra Supabase staging desde tu PC**    | `pnpm dev:staging` (ambas apps con Turbo) o `pnpm dev:web:staging` / `pnpm dev:api:staging`. Crea **`apps/web/.env.staging`** y **`apps/api/.env.staging`** a partir de los `.example`. |

**Turbo** en la raíz solo orquesta tareas y rastrea variables/`inputs` para caché; **no** inyecta `.env`. **Next**, **Nest** (`@nestjs/config`) y **Prisma** (en `packages/database`) cargan variables cada uno en su proceso.

**Next y `.env.local`:** si existe **`apps/web/.env.local`**, Next lo mezcla con `.env.development` y puede **sobrescribir** claves. Evita duplicar ahí `NEXT_PUBLIC_*` o `DATABASE_URL` si ya las definiste en `.env.staging` para pruebas de staging.

### 3) Vercel — Preview vs Production (no lo eliges con un comando)

| Despliegue                           | Variables que usa                                                                                              |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| **Preview** (rama/PR)                | Las del entorno **Preview** en el panel de Vercel → suele ser **staging** (Supabase staging, URL API staging). |
| **Production** (`main` o producción) | Las del entorno **Production** → **producción** real.                                                          |

Tú no “corres” la app en Vercel con un flag: **la URL del deploy** (preview vs producción) decide qué build y qué env inyectó Vercel.

### 4) DigitalOcean — API

Cada **servicio** (o Droplet) tiene su propio conjunto de variables: uno para **staging**, otro para **producción**. Ahí pones la `DATABASE_URL` de Supabase que corresponda.

---

## Resumen visual

```text
┌─────────────────┐     .env.development     ┌──────────────┐
│  Tu máquina     │ ────────────────────────►  │ Docker (dev) │
│  pnpm dev       │                            └──────────────┘
└─────────────────┘

┌─────────────────┐     .env.staging       ┌──────────────────┐
│  Tu máquina     │ ────────────────────────►  │ Supabase staging │
│  dev:staging    │                            └──────────────────┘
└─────────────────┘

┌─────────────────┐     env Preview          ┌──────────────────┐
│  Vercel Preview │ ──────────────────────►  │ Supabase staging │
└─────────────────┘

┌─────────────────┐     env Production       ┌───────────────────┐
│  Vercel Prod    │ ──────────────────────►  │ Supabase prod     │
└─────────────────┘
```

## Supabase

- Crea **dos proyectos** (staging y prod) o el esquema que uses en clase.
- Cada uno tiene su **connection string**; van en `.env.staging` y `.env.production` (solo `DATABASE_URL=...` dentro del archivo suele bastar para `dotenv-cli`).

---

## Seguridad

- No subas `.env`, `.env.staging`, `.env.production` a Git (ya están en `.gitignore`).
- En CI, **producción**: inyecta `DATABASE_URL` como **secret** y ejecuta `prisma migrate deploy` en el job de release, no en cada PR si no quieres tocar prod accidentalmente.

Para despliegue de Vercel/DO/Supabase en detalle, ver [deployment.md](./deployment.md).

## Turborepo: `inputs` con `.env*` y `.env` por paquete

Poner **`"inputs": ["$TURBO_DEFAULT$", ".env*"]`** en `turbo.json` **no** implica usar un **`.env` único en la raíz** del monorepo (`monorepo/.env`). Turbo [recomienda evitar](https://turborepo.com/docs/crafting-your-repository/using-environment-variables#handling-env-files) un `.env` compartido en la raíz para todas las apps: puede **mezclar variables**, dar **caché incorrecto** y **builds inconsistentes**.

Lo recomendado es **archivos `.env*` por paquete** (no un `.env` único en la raíz del monorepo), por ejemplo:

- `apps/web/.env.development` y `apps/web/.env.staging`
- `apps/api/.env.development` y `apps/api/.env.staging`
- `packages/database/.env.development` (comandos Prisma “de desarrollo” en ese paquete)

Los **`inputs`** son **relativos al paquete** que ejecuta la tarea. **`.env*`** significa: “si cambia cualquier archivo que coincida con ese glob **dentro de ese paquete**, invalida el hash de esa tarea”. No obliga a que exista un `.env` en el root del repo.

Resumen: **`.env*` en `turbo.json` = correcto** para invalidar caché; **`.env` global en la raíz compartido** = no recomendado.

### Modo estricto y `env` en `turbo.json`

En este repo, las tareas **`build`**, **`dev`** y **`dev:staging`** declaran en **`env`** las variables que Turbo debe considerar en modo estricto (p. ej. `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_*`). Las tareas **`dev`** y **`dev:staging`** incluyen además **`APP_ENV`** (solo la usa el script `dev:staging` de web/api para elegir `.env.staging`). Los paquetes que no usan esas tareas (p. ej. `lint`) no se ven afectados igual.

Si en CI falta una variable requerida por `env`, Turbo puede fallar: es intencional hasta que la declares en el workflow o uses `passThroughEnv` / `env-mode=loose` según la [documentación de Turbo](https://turborepo.com/docs/crafting-your-repository/using-environment-variables).
