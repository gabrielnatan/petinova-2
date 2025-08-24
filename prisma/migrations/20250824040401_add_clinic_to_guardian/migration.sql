/*
  Warnings:

  - Added the required column `clinicId` to the `guardians` table without a default value. This is not possible if the table is not empty.

*/

-- First, add the column as nullable
ALTER TABLE "public"."guardians" ADD COLUMN "clinicId" TEXT;

-- Update existing guardians to use the first available clinic
-- If there are guardians without pets, assign them to the first clinic
-- If they have pets, use the clinic from their pets
UPDATE "public"."guardians" SET "clinicId" = (
  CASE 
    WHEN EXISTS (SELECT 1 FROM "public"."pets" WHERE "guardianId" = "guardians"."id" LIMIT 1)
    THEN (SELECT "clinicId" FROM "public"."pets" WHERE "guardianId" = "guardians"."id" LIMIT 1)
    ELSE (SELECT "id" FROM "public"."clinics" ORDER BY "createdAt" ASC LIMIT 1)
  END
);

-- Now make the column NOT NULL
ALTER TABLE "public"."guardians" ALTER COLUMN "clinicId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."guardians" ADD CONSTRAINT "guardians_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "public"."clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
