-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "cancelled_at" TIMESTAMP(3),
ADD COLUMN     "cancelled_by_manager_id" TEXT,
ADD COLUMN     "scheduled_by_manager_id" TEXT;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_scheduled_by_manager_id_fkey" FOREIGN KEY ("scheduled_by_manager_id") REFERENCES "manager_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_cancelled_by_manager_id_fkey" FOREIGN KEY ("cancelled_by_manager_id") REFERENCES "manager_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
