-- Migration: Add role column to utilisateur table
-- Description: Store user roles (ADMIN, MEDECIN, TECHNICIEN, PATIENT) directly on the utilisateur table

ALTER TABLE bioscan.utilisateur
ADD COLUMN IF NOT EXISTS role VARCHAR(50);

-- Update existing users with default role if needed
-- You can adjust this based on your requirements:
-- UPDATE bioscan.utilisateur SET role = 'PATIENT' WHERE role IS NULL;
