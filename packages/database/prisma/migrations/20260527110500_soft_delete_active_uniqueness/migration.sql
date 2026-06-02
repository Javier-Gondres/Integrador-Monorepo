-- En PostgreSQL, índices únicos compuestos con NULL permiten múltiples filas activas.
-- Estos índices parciales garantizan unicidad solo para registros activos (deletedAt IS NULL).

-- Limpieza preventiva de duplicados activos en User (conservar el más antiguo).
WITH duplicated_users AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY email
      ORDER BY "createdAt" ASC, id ASC
    ) AS row_num
  FROM "User"
  WHERE "deletedAt" IS NULL
)
UPDATE "User" u
SET
  "deletedAt" = NOW() + (du.row_num || ' milliseconds')::interval,
  "isActive" = false,
  "updatedAt" = NOW()
FROM duplicated_users du
WHERE u.id = du.id
  AND du.row_num > 1;

-- Limpieza preventiva de duplicados activos en Company (slug).
WITH duplicated_companies AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY slug
      ORDER BY "createdAt" ASC, id ASC
    ) AS row_num
  FROM "Company"
  WHERE "deletedAt" IS NULL
)
UPDATE "Company" c
SET
  "deletedAt" = NOW() + (dc.row_num || ' milliseconds')::interval,
  "isActive" = false,
  "updatedAt" = NOW()
FROM duplicated_companies dc
WHERE c.id = dc.id
  AND dc.row_num > 1;

-- Limpieza preventiva de duplicados activos en UserCompany (userId).
WITH duplicated_memberships AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "userId"
      ORDER BY "createdAt" ASC, id ASC
    ) AS row_num
  FROM "UserCompany"
  WHERE "deletedAt" IS NULL
)
UPDATE "UserCompany" uc
SET
  "deletedAt" = NOW() + (dm.row_num || ' milliseconds')::interval,
  "updatedAt" = NOW()
FROM duplicated_memberships dm
WHERE uc.id = dm.id
  AND dm.row_num > 1;

-- Limpieza preventiva de duplicados activos en Role (name).
WITH duplicated_roles AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY name
      ORDER BY id ASC
    ) AS row_num
  FROM "Role"
  WHERE "deletedAt" IS NULL
)
UPDATE "Role" r
SET
  "deletedAt" = NOW() + (dr.row_num || ' milliseconds')::interval
FROM duplicated_roles dr
WHERE r.id = dr.id
  AND dr.row_num > 1;

-- Garantiza unicidad entre registros activos.
CREATE UNIQUE INDEX "Company_slug_active_key"
ON "Company" ("slug")
WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX "Role_name_active_key"
ON "Role" ("name")
WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX "User_email_active_key"
ON "User" ("email")
WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX "UserCompany_userId_active_key"
ON "UserCompany" ("userId")
WHERE "deletedAt" IS NULL;
