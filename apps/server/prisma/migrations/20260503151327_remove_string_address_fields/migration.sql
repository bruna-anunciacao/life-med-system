/*
  Warnings:

  - You are about to drop the column `address` on the `manager_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `patient_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `professional_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "manager_profiles" DROP COLUMN "address";

-- AlterTable
ALTER TABLE "patient_profiles" DROP COLUMN "address";

-- AlterTable
ALTER TABLE "professional_profiles" DROP COLUMN "address";
