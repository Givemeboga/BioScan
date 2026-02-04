import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Security from '@mui/icons-material/Security';
import Insights from '@mui/icons-material/Insights';
import SmartToy  from '@mui/icons-material/SmartToy';
import SentimentVerySatisfied from '@mui/icons-material/SentimentVerySatisfied';
import NotificationsActive from '@mui/icons-material/NotificationsActive';
import Approval from '@mui/icons-material/Approval';

const items = [
  {
    icon: <SmartToy />,
    title: 'Analyses biologiques assistées par l\'IA',
    description:
      'Des interprétations intelligentes pour aider à comprendre les résultats biologiques, tout en restant supervisées par des professionnels de santé.',
  },
  {
    icon: <Security />,
    title: 'Sécurité et confidentialité des données',
    description:
      'Vos données médicales sont protégées par des standards de sécurité élevés, garantissant confidentialité et conformité.',
  },
  {
    icon: <Approval />,
    title: 'Validation médicale humaine',
    description:
      'Chaque analyse générée par l\'IA est validée par un médecin de laboratoire avant d\'être accessible au patient.',
  },
  {
    icon: <Insights />,
    title: 'Résultats clairs et compréhensibles',
    description:
      'Des rapports simplifiés pour les patients, accompagnés d\'une version médicale détaillée pour les professionnels.',
  },
  {
    icon: <NotificationsActive />,
    title: 'Système de notifications',
    description:
      'Recevez des notifications en temps réel lors de la disponibilité des résultats ou d\'actions importantes.',
  },
  {
    icon: <SentimentVerySatisfied />,
    title: 'Accessibilité et simplicité',
    description:
      'Une plateforme accessible depuis n\'importe quel appareil, pensée pour une prise en main rapide et intuitive.',
  },
];

export default function Highlights() {
  return (
    <Box
      id="highlights"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        color: 'white',
        bgcolor: 'grey.900',
      }}
    >
      <Container
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 3, sm: 6 },
        }}
      >
        <Box
          sx={{
            width: { sm: '100%', md: '60%' },
            textAlign: { sm: 'left', md: 'center' },
          }}
        >
          <Typography component="h2" variant="h4" gutterBottom>
            Points forts de Bioscan
          </Typography>
          <Typography variant="body1" sx={{ color: 'grey.400' }}>
            Découvrez une plateforme médicale conçue pour la fiabilité, la sécurité et la clarté des analyses biologiques, au service des patients et des professionnels de santé.
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {items.map((item, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Stack
                direction="column"
                component={Card}
                spacing={1}
                useFlexGap
                sx={{
                  color: 'inherit',
                  p: 3,
                  height: '100%',
                  borderColor: 'hsla(220, 25%, 25%, 0.3)',
                  backgroundColor: 'grey.800',
                }}
              >
                <Box sx={{ opacity: '50%' }}>{item.icon}</Box>
                <div>
                  <Typography gutterBottom sx={{ fontWeight: 'medium' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.400' }}>
                    {item.description}
                  </Typography>
                </div>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
