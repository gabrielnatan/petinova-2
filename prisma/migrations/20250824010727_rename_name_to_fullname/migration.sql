/*
  Warnings:

  - Column name renamed to fullName for consistency across the application
  
*/

-- Rename the 'name' column to 'fullName' in guardians table
ALTER TABLE "public"."guardians" RENAME COLUMN "name" TO "fullName";

-- Rename the 'name' column to 'fullName' in users table
ALTER TABLE "public"."users" RENAME COLUMN "name" TO "fullName";