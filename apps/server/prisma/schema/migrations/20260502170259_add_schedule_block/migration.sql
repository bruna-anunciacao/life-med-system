-- CreateTable
CREATE TABLE "schedule_blocks" (
    "id" TEXT NOT NULL,
    "professional_id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "start_time" TEXT,
    "end_time" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_blocks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "schedule_blocks" ADD CONSTRAINT "schedule_blocks_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
