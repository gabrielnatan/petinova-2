/*
  Warnings:

  - You are about to drop the column `age` on the `pets` table. All the data in the column will be lost.
  - Added the required column `clinicId` to the `pets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."pets" DROP COLUMN "age",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "clinicId" TEXT NOT NULL,
ADD COLUMN     "deathDate" TIMESTAMP(3),
ADD COLUMN     "environment" TEXT,
ADD COLUMN     "isNeutered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "size" TEXT;

-- AddForeignKey
ALTER TABLE "public"."pets" ADD CONSTRAINT "pets_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "public"."clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
