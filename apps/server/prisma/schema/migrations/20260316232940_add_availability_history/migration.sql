-- AlterTable
ALTER TABLE "availability" ADD COLUMN     "valid_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "valid_until" TIMESTAMP(3);
