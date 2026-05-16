-- Remove o default antigo e permite NULL
ALTER TABLE "users" ALTER COLUMN "cpf" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "cpf" DROP NOT NULL;

-- Normaliza CPFs legados (placeholder "00000000000" e strings vazias) para NULL
UPDATE "users" SET "cpf" = NULL WHERE "cpf" IN ('00000000000', '');

-- Constraint de unicidade (NULLs são permitidos múltiplas vezes no Postgres)
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");
