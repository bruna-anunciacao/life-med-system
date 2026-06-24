-- AlterTable
ALTER TABLE "professional_profiles" ADD COLUMN     "address" TEXT,
ADD COLUMN     "payments" JSONB,
ADD COLUMN     "price" DOUBLE PRECISION;
