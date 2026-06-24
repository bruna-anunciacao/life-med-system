/*
  Warnings:

  - You are about to drop the column `specialty` on the `professional_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "professional_profiles" DROP COLUMN "specialty";

-- CreateTable
CREATE TABLE "specialties" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "specialties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProfessionalProfileToSpeciality" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProfessionalProfileToSpeciality_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "specialties_name_key" ON "specialties"("name");

-- CreateIndex
CREATE INDEX "_ProfessionalProfileToSpeciality_B_index" ON "_ProfessionalProfileToSpeciality"("B");

-- AddForeignKey
ALTER TABLE "_ProfessionalProfileToSpeciality" ADD CONSTRAINT "_ProfessionalProfileToSpeciality_A_fkey" FOREIGN KEY ("A") REFERENCES "professional_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfessionalProfileToSpeciality" ADD CONSTRAINT "_ProfessionalProfileToSpeciality_B_fkey" FOREIGN KEY ("B") REFERENCES "specialties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
