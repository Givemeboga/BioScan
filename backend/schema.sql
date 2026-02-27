/* =========================
   ENUMS
========================= */

CREATE TYPE statut_user AS ENUM ('ACTIVE', 'INACTIVE');

CREATE TYPE statut_document AS ENUM (
    'BROUILLON',
    'EN_COURS',
    'VALIDE',
    'REJETE',
    'ARCHIVE'
);

CREATE TYPE statut_notification AS ENUM ('UNREAD', 'READ');
CREATE TYPE statut_otp AS ENUM ('EXPIRE', 'UTILISE', 'ACTIF');

/* =========================
   UTILISATEUR
========================= */

CREATE TABLE utilisateur (
    utilisateur_id BIGSERIAL PRIMARY KEY,
    nom_utilisateur VARCHAR(100),
    email VARCHAR(255),
    mot_de_passe TEXT,
    telephone VARCHAR(30),
    adresse TEXT,
    date_naissance DATE,
    statut statut_user,
    date_generation TIMESTAMP,
    date_mise_a_jour TIMESTAMP
);
ALTER TABLE utilisateur
ADD COLUMN role_id BIGINT;

ALTER TABLE utilisateur
ADD CONSTRAINT fk_user_role
FOREIGN KEY (role_id)
REFERENCES role(role_id);
INSERT INTO role (nom, description) VALUES
('Administrateur', 'Accès complet au système'),
('Patient', 'Utilisateur patient'),
('Technicien biologiste', 'Responsable analyses biologiques'),
('Medecin', 'Médecin consultant');



/* =========================
   SPECIALISATIONS UTILISATEUR
========================= */

CREATE TABLE medecin_biologiste (
    medecin_id BIGSERIAL PRIMARY KEY,
    utilisateur_id BIGINT UNIQUE REFERENCES utilisateur(utilisateur_id)
);

CREATE TABLE administrateur (
    administrateur_id BIGSERIAL PRIMARY KEY,
    utilisateur_id BIGINT UNIQUE REFERENCES utilisateur(utilisateur_id)
);

CREATE TABLE technicien_biologiste (
    technicien_id BIGSERIAL PRIMARY KEY,
    utilisateur_id BIGINT UNIQUE REFERENCES utilisateur(utilisateur_id)
);

CREATE TABLE patient (
    patient_id BIGSERIAL PRIMARY KEY,
    utilisateur_id BIGINT UNIQUE REFERENCES utilisateur(utilisateur_id)
);

-- Migration : table patient_preferences
-- À exécuter une seule fois dans votre base PostgreSQL

CREATE TABLE IF NOT EXISTS patient_preferences (
    patient_id    INTEGER PRIMARY KEY REFERENCES patient(patient_id) ON DELETE CASCADE,
    notifications BOOLEAN NOT NULL DEFAULT true,
    newsletter    BOOLEAN NOT NULL DEFAULT false,
    updated_at    TIMESTAMP DEFAULT NOW()
);

-- Insérer des préférences par défaut pour tous les patients existants
INSERT INTO patient_preferences (patient_id, notifications, newsletter)
SELECT patient_id, true, false
FROM patient
ON CONFLICT (patient_id) DO NOTHING;
/* =========================
   BILAN BIOLOGIQUE
========================= */

CREATE TABLE bilan_biologique (
    bilan_id BIGSERIAL PRIMARY KEY,
    statut statut_document,
    type VARCHAR(100),
    nom_fichier TEXT,
    date_generation TIMESTAMP,
    patient_id BIGINT REFERENCES patient(patient_id),
    technicien_id BIGINT REFERENCES technicien_biologiste(technicien_id)
);
ALTER TABLE bilan_biologique
ADD COLUMN medecin_id BIGINT;

ALTER TABLE bilan_biologique
ADD CONSTRAINT fk_bilan_medecin
FOREIGN KEY (medecin_id)
REFERENCES medecin_biologiste(medecin_id)
ON DELETE SET NULL;
/* =========================
   RAPPORT MEDICAL
========================= */

CREATE TABLE rapport_medical (
    rapport_medical_id BIGSERIAL PRIMARY KEY,
    statut statut_document,
    date_generation TIMESTAMP,
    date_validation TIMESTAMP,
    bilan_id BIGINT REFERENCES bilan_biologique(bilan_id),
    patient_id BIGINT REFERENCES patient(patient_id),
    medecin_id BIGINT REFERENCES medecin_biologiste(medecin_id)
);

/* =========================
   RAPPORT ANOMALIE
========================= */

CREATE TABLE rapport_anomalie (
    rapport_anomalie_id BIGSERIAL PRIMARY KEY,
    version VARCHAR(50),
    statut statut_document,
    type_anomalie VARCHAR(100),
    date_generation TIMESTAMP,
    patient_id BIGINT REFERENCES patient(patient_id),
    medecin_id BIGINT REFERENCES medecin_biologiste(medecin_id)
);
ALTER TABLE rapport_anomalie
    ADD COLUMN bilan_id BIGINT
    REFERENCES bilan_biologique(bilan_id)
    ON DELETE CASCADE;

/* =========================
   VALIDATION ANOMALIE
========================= */

CREATE TABLE validation_anomalie (
    validation_anomalie_id BIGSERIAL PRIMARY KEY,
    decision VARCHAR(50),
    commentaire TEXT,
    date_validation TIMESTAMP,
    rapport_anomalie_id BIGINT REFERENCES rapport_anomalie(rapport_anomalie_id),
    medecin_id BIGINT REFERENCES medecin_biologiste(medecin_id)
);

/* =========================
   ANALYSEUR IA
========================= */

CREATE TABLE analyseur_ia (
    analyseur_id BIGSERIAL PRIMARY KEY,
    nom_analyseur VARCHAR(100),
    version VARCHAR(50),
    type VARCHAR(100),
    description TEXT
);

/* =========================
   LIEN ANALYSEUR ↔ BILAN / RAPPORTS
========================= */

CREATE TABLE analyse_bilan (
    analyseur_id BIGINT REFERENCES analyseur_ia(analyseur_id),
    bilan_id BIGINT REFERENCES bilan_biologique(bilan_id),
    PRIMARY KEY (analyseur_id, bilan_id)
);

CREATE TABLE analyse_rapport_medical (
    analyseur_id BIGINT REFERENCES analyseur_ia(analyseur_id),
    rapport_medical_id BIGINT REFERENCES rapport_medical(rapport_medical_id),
    PRIMARY KEY (analyseur_id, rapport_medical_id)
);

CREATE TABLE analyse_rapport_anomalie (
    analyseur_id BIGINT REFERENCES analyseur_ia(analyseur_id),
    rapport_anomalie_id BIGINT REFERENCES rapport_anomalie(rapport_anomalie_id),
    PRIMARY KEY (analyseur_id, rapport_anomalie_id)
);

/* =========================
   ROLES & PERMISSIONS
========================= */

CREATE TABLE role (
    role_id BIGSERIAL PRIMARY KEY,
    nom VARCHAR(50),
    description TEXT
);

CREATE TABLE permissions (
    permission_id BIGSERIAL PRIMARY KEY,
    nom_permission VARCHAR(100),
    description TEXT
);

CREATE TABLE role_permissions (
    role_id BIGINT REFERENCES role(role_id),
    permission_id BIGINT REFERENCES permissions(permission_id),
    PRIMARY KEY (role_id, permission_id)
);

/* =========================
   OTP
========================= */

CREATE TABLE code_otp (
    otp_id BIGSERIAL PRIMARY KEY,
    code_generer VARCHAR(10),
    raison VARCHAR(100),
    statut statut_otp,
    expiration TIMESTAMP,
    date_generation TIMESTAMP,
    utilisateur_id BIGINT REFERENCES utilisateur(utilisateur_id)
);

/* =========================
   JOURNAL AUDIT
========================= */

CREATE TABLE journal_audit (
    journal_id BIGSERIAL PRIMARY KEY,
    type_action VARCHAR(100),
    details JSON,
    date_generation TIMESTAMP,
    agent_utilisateur VARCHAR(255),
    utilisateur_id BIGINT REFERENCES utilisateur(utilisateur_id)
);

/* =========================
   EVENEMENT SECURITE
========================= */

CREATE TABLE evenement_securite (
    evenement_id BIGSERIAL PRIMARY KEY,
    type_evenement VARCHAR(100),
    ip VARCHAR(50),
    status VARCHAR(50),
    agent_utilisateur VARCHAR(255),
    utilisateur_id BIGINT REFERENCES utilisateur(utilisateur_id)
);

/* =========================
   NOTIFICATIONS
========================= */

CREATE TABLE notifications (
    notification_id BIGSERIAL PRIMARY KEY,
    description TEXT,
    titre VARCHAR(255),
    statut statut_notification,
    date_generation TIMESTAMP,
    date_mise_a_jour TIMESTAMP,
    utilisateur_id BIGINT REFERENCES utilisateur(utilisateur_id)
);
UPDATE notifications
SET date_generation = '2026-02-13'
WHERE date_generation::text LIKE '20026%';

UPDATE notifications
SET date_mise_a_jour = '2026-02-13'
WHERE date_mise_a_jour::text LIKE '20026%';

UPDATE utilisateur
SET
    telephone = '12345678',
    adresse = 'Monastir, Tunisie',
    date_naissance = '1998-01-01',
    role_id = 3,
    date_generation = NOW(),
    date_mise_a_jour = NOW()
WHERE utilisateur_id IN (1,2,3,4,5,6);

INSERT INTO utilisateur (
    nom_utilisateur, email, mot_de_passe, telephone, adresse, date_naissance, statut, date_generation, date_mise_a_jour
) VALUES
('Alice Dupont', 'alice.dupont@email.com', 'pass123', '12345678', '10 rue A, Paris', '1990-03-15', 'ACTIVE', NOW(), NOW()),
('Bob Martin', 'bob.martin@email.com', 'pass456', '87654321', '25 rue B, Lyon', '1985-07-22', 'ACTIVE', NOW(), NOW()),
('Charlie Bernard', 'charlie.bernard@email.com', 'pass789', '11223344', '5 rue C, Marseille', '2000-01-30', 'INACTIVE', NOW(), NOW());
INSERT INTO patient (utilisateur_id) VALUES
(1), -- correspond à Alice Dupont
(2), -- correspond à Bob Martin
(3); -- correspond à Charlie Bernard
-- Insérer quelques bilans biologiques pour tests
INSERT INTO bilan_biologique
(bilan_id, type, statut, date_generation, nom_fichier, patient_id, technicien_id)
VALUES
(1, 'Sang', 'BROUILLON', NOW(), 'bilan_sang_001.pdf', 1, 5),
(2, 'Urine', 'EN_COURS', NOW(), 'bilan_urine_002.xlsx', 2, 5),
(3, 'Cholestérol', 'VALIDE', NOW(), 'bilan_chol_003.pdf', 3, 5);