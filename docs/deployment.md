# Despliegue: Vercel (web) + DigitalOcean (API) + Supabase (DB)

Ambientes (local / staging / prod) y comandos `db:deploy:staging` / `db:deploy:production`: **[environments.md](./environments.md)**.

Guía paso a paso para **desarrollo local** vs **producción** (y opcional **staging** con previews de Vercel).

## Resumen de responsabilidades

| Dónde            | Qué guardas                                                                     |
| ---------------- | ------------------------------------------------------------------------------- |
| **Supabase**     | Postgres: dos proyectos si quieres _dev_ y _prod_ separados.                    |
| **DigitalOcean** | Contenedor o Droplet con Nest: `DATABASE_URL`, `CORS_*`, `PORT`.                |
| **Vercel**       | Next: `NEXT_PUBLIC_API_URL` (y `DATABASE_URL` **solo** si Prisma vive en Next). |

---

## Fase 0 — Local (ya lo tienes casi listo)

1. Postgres local (Docker) o una base **dev** en Supabase.
2. Copia variables de ejemplo:
   - `packages/database/.env.development.example` → `packages/database/.env.development`
   - `apps/api/.env.development.example` → `apps/api/.env.development`
   - `apps/web/.env.development.example` → `apps/web/.env.development`
3. Alinea `DATABASE_URL` en `packages/database` y `apps/api` (misma base en local).
4. `CORS_ORIGINS` debe incluir `http://localhost:3000` (puerto de Next).
5. `pnpm dev` en la raíz o por app.

---

## Fase 1 — Supabase (base de datos)

1. Crea cuenta en [Supabase](https://supabase.com).
2. **Producción:** New project → región cercana → anota la contraseña de la base.
3. **Settings → Database:** copia la **connection string** y asegúrate de tener **`sslmode=require`** en la query (p. ej. `?schema=public&sslmode=require`). Sin TLS, Prisma a veces devuelve **P1001**. Si no conecta, revisa que el proyecto no esté **pausado**, prueba sin VPN, y en redes raras prueba **Session pooler (IPv4)** en el modal de conexión de Supabase.
4. (Opcional **staging:**) segundo proyecto Supabase solo para previews / pruebas.

Migraciones contra Supabase (desde tu PC, con la URL de **ese** entorno):

```bash
# En packages/database/.env.development (Docker local o Supabase temporal)
pnpm db:migrate -- --name init
pnpm db:generate
```

En **servidores / CI** no uses `db:migrate`; aplica migraciones con el comando que cargue el **entorno correcto**, por ejemplo:

```bash
pnpm db:deploy:production
```

(o `pnpm db:deploy:staging` en un job de preview), según el archivo **`.env.production`** / **`.env.staging`** que configures en ese entorno (secretos o archivo generado en el job).

Para **solo** tu máquina contra la base de desarrollo, `pnpm db:deploy` usa **`packages/database/.env.development`**.

---

## Fase 2 — DigitalOcean (API Nest)

1. Cuenta DO + método de pago (el Student Pack puede incluir créditos: [GitHub Education](https://education.github.com/pack/)).
2. Opciones típicas:
   - **App Platform:** conecta el repo, build command `pnpm install && pnpm exec turbo run build --filter=api` (o build solo api según configures `root`), run command `node apps/api/dist/main` (ajusta rutas al layout real de `nest build` output).
   - **Droplet + Docker:** Dockerfile que construye el monorepo o solo `apps/api` y expone `PORT` (ej. 3001 detrás de Nginx con HTTPS).

3. **Variables de entorno** en DO (producción):

   | Variable                     | Valor                                                    |
   | ---------------------------- | -------------------------------------------------------- |
   | `NODE_ENV`                   | `production`                                             |
   | `PORT`                       | `3001` (o el que use tu proxy)                           |
   | `DATABASE_URL`               | URI de Supabase **producción**                           |
   | `CORS_ORIGINS`               | `https://TU-DOMINIO-VERCEL.vercel.app` (sin barra final) |
   | `CORS_ALLOW_VERCEL_PREVIEWS` | `true` si quieres aceptar previews `*.vercel.app`        |

4. HTTPS: en App Platform suele venir solo; en Droplet usa Caddy o Nginx + Let’s Encrypt.
5. Anota la URL pública del API (`https://api.tudominio.com`).

---

## Fase 3 — Vercel (front Next)

1. [Vercel](https://vercel.com) → Import project → tu repo GitHub.
2. **Root Directory:** `apps/web` (monorepo).
3. **Build command** (ejemplo): `cd ../.. && pnpm install && pnpm exec turbo run build --filter=web`  
   (Ajusta si tu Vercel “root” es la raíz del monorepo en lugar de `apps/web`; lo importante es que `turbo` ejecute `^db:generate` antes del build de web.)
4. **Install command:** `pnpm install` (desde raíz si el proyecto raíz es el monorepo).

5. **Environment variables** en Vercel:

   | Entorno                        | Variables                                                                                                                                  |
   | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
   | **Production**                 | `NEXT_PUBLIC_API_URL` = URL HTTPS del API en DO (producción).                                                                              |
   | **Preview** (opcional staging) | `NEXT_PUBLIC_API_URL` = URL del API de **staging** o la misma API con CORS que permita `*.vercel.app` (`CORS_ALLOW_VERCEL_PREVIEWS=true`). |

6. No subas secretos en `NEXT_PUBLIC_*`. La `DATABASE_URL` en Vercel **solo** si Next sigue usando Prisma en servidor; si todo pasa por Nest, **no** la pongas en Vercel.

---

## Fase 4 — Orden en cada release

1. Merge a `main` con migraciones nuevas en `packages/database/prisma/migrations`.
2. En el job de deploy del **API** (o manual una vez): `pnpm db:deploy:production` (carga **`packages/database/.env.production`** o el archivo que generes en CI con `DATABASE_URL` / `DIRECT_URL` de Supabase prod).
3. Desplegar **API** (DO), luego **web** (Vercel), o en paralelo si no hay breaking change en el contrato HTTP.

---

## Checklist rápido

- [ ] Supabase prod creado y migraciones probadas con `pnpm db:deploy:production` (desde CI o máquina con acceso y `.env.production`).
- [ ] DO con HTTPS y variables `DATABASE_URL`, `CORS_ORIGINS`, `PORT`.
- [ ] Vercel con `NEXT_PUBLIC_API_URL` apuntando al API.
- [ ] Probar login / fetch desde la web en producción (pestaña red: sin errores CORS).

Para detalles de build en Vercel con Turborepo, revisa [Turborepo + Vercel](https://vercel.com/docs/monorepos/turborepo).
