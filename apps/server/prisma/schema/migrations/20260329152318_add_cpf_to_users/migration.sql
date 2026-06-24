/*
  Warnings:

  - You are about to drop the column `cpf` on the `patient_profiles` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "patient_profiles_cpf_key";

-- AlterTable
ALTER TABLE "patient_profiles" DROP COLUMN "cpf";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "cpf" TEXT NOT NULL DEFAULT '00000000000',
ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false;
