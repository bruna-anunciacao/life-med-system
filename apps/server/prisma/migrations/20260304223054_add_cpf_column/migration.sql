/*
  Warnings:

  - A unique constraint covering the columns `[cpf]` on the table `patient_profiles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cpf` to the `patient_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "patient_profiles" ADD COLUMN     "cpf" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "patient_profiles_cpf_key" ON "patient_profiles"("cpf");
