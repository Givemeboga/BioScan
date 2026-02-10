// src/pages/medecin/RapportMedical.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Modal,
  Grid,
  Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import './RapportMedical.css';

export default function RapportMedical() {
  const [openModal, setOpenModal] = useState(false);
  const [selectedRapport, setSelectedRapport] = useState(null);

  // Données exemple (remplace par tes données réelles / API)
  const rapports = [
    {
      id: 1,
      patient: 'Ahmed Ben Ali',
      age: 48,
      dateBilan: '05/02/2026',
      typeBilan: 'Hémogramme + Bilan hépatique',
      dateRapport: '06/02/2026',
      statut: 'En attente',
      priorite: 'Haute',
      bilanResume: 'Leucocytes 14.2 × 10⁹/L (élevé)\nALAT 85 U/L (élevée)\nASAT 62 U/L (élevée)\nBilirubine totale 28 µmol/L',
      rapportTexte: 'Suspicion de hépatite virale aiguë ou toxique. Recommandations :\n- Sérologies VHB, VHC, VHA\n- Échographie hépatique\n- Suivi biologique à J7',
    },
    {
      id: 2,
      patient: 'Fatma Trabelsi',
      age: 35,
      dateBilan: '04/02/2026',
      typeBilan: 'Bilan thyroïdien complet',
      dateRapport: '05/02/2026',
      statut: 'En attente',
      priorite: 'Moyenne',
      bilanResume: 'TSH 0.01 mUI/L\nT4 libre 34 pmol/L\nT3 libre 13.2 pmol/L\nAnticorps anti-TPO négatifs',
      rapportTexte: 'Hyperthyroïdie franche sans auto-immunité évidente. À explorer : adénome toxique ou Basedow atypique. Écho-Doppler thyroïdien recommandé.',
    },
    {
      id: 3,
      patient: 'Mohamed Jouini',
      age: 57,
      dateBilan: '03/02/2026',
      typeBilan: 'Bilan lipidique + Glycémie',
      dateRapport: '04/02/2026',
      statut: 'Terminé',
      priorite: 'Faible',
      bilanResume: 'Cholestérol total 6.8 mmol/L\nLDL 4.9 mmol/L\nHDL 0.9 mmol/L\nTriglycérides 2.8 mmol/L\nGlycémie à jeun 6.9 mmol/L',
      rapportTexte: 'Dyslipidémie mixte associée à un prédiabète. Recommandations : hygiène de vie renforcée, statine à envisager après réévaluation à 3 mois.',
    },
  ];

  const handleOpenModal = (rapport) => {
    setSelectedRapport(rapport);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRapport(null);
  };

  const handleValider = () => {
    alert('Rapport validé avec succès');
    handleCloseModal();
  };

  const handleRejeter = () => {
    alert('Rapport rejeté');
    handleCloseModal();
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', md: 900 },
    bgcolor: 'background.paper',
    borderRadius: 3,
    boxShadow: 24,
    p: 4,
    maxHeight: '90vh',
    overflowY: 'auto',
  };

  return (
    <div className="rapport-medical-page">
      <div className="page-header">
        <h1>Rapports Médicaux</h1>
        <p>Suivi et validation des rapports médicaux</p>
      </div>

      <TableContainer component={Paper} className="table-container">
        <Table sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell>Date bilan</TableCell>
              <TableCell>Type bilan</TableCell>
              <TableCell>Date rapport</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Priorité</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rapports.map((rapport) => (
              <TableRow
                key={rapport.id}
                className={rapport.priorite === 'Haute' ? 'row-urgent' : ''}
              >
                <TableCell>{rapport.patient} ({rapport.age} ans)</TableCell>
                <TableCell>{rapport.dateBilan}</TableCell>
                <TableCell>{rapport.typeBilan}</TableCell>
                <TableCell>{rapport.dateRapport}</TableCell>
                <TableCell>
                  <span className={`status-badge ${rapport.statut.toLowerCase().replace(/\s+/g, '-')}`}>
                    {rapport.statut}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`priorite-badge ${rapport.priorite.toLowerCase()}`}>
                    {rapport.priorite}
                  </span>
                </TableCell>
                <TableCell align="right">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleOpenModal(rapport)}
                    sx={{ bgcolor: '#0b5ed7', '&:hover': { bgcolor: '#0849b0' } }}
                  >
                    Voir rapport
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal MUI */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          {selectedRapport && (
            <>
              <Typography variant="h5" gutterBottom>
                Rapport – {selectedRapport.patient}
              </Typography>

              <Grid container spacing={4}>
                {/* Colonne gauche : Bilan */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Bilan du patient
                  </Typography>
                  <Box sx={{ bgcolor: '#f8fafc', p: 3, borderRadius: 2, border: '1px solid #e5e7eb' }}>
                    <Typography variant="subtitle2"><strong>Date :</strong> {selectedRapport.dateBilan}</Typography>
                    <Typography variant="subtitle2" sx={{ mt: 1 }}><strong>Type :</strong> {selectedRapport.typeBilan}</Typography>
                    <Typography variant="subtitle2" sx={{ mt: 2 }}><strong>Résultats :</strong></Typography>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: '8px 0 0' }}>
                      {selectedRapport.bilanResume}
                    </pre>
                  </Box>
                </Grid>

                {/* Colonne droite : Rapport */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Rapport médical
                  </Typography>
                  <Box sx={{ bgcolor: '#f8fafc', p: 3, borderRadius: 2, border: '1px solid #e5e7eb', minHeight: 180 }}>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
                      {selectedRapport.rapportTexte}
                    </pre>
                  </Box>
                </Grid>
              </Grid>

              {/* Boutons d’action */}
              <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<CheckCircleIcon />}
                  sx={{ bgcolor: '#0f9d58', '&:hover': { bgcolor: '#0d864c' } }}
                  onClick={handleValider}
                >
                  Valider le rapport
                </Button>

                <Button
                  variant="contained"
                  startIcon={<CancelIcon />}
                  sx={{ bgcolor: '#e74c3c', '&:hover': { bgcolor: '#c0392b' } }}
                  onClick={handleRejeter}
                >
                  Rejeter le rapport
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
}