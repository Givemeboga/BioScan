import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { useColorScheme } from '@mui/material/styles';

const userTestimonials = [
  {
    avatar: <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />,
    name: 'Remy Sharp',
    occupation: 'Satisfait',
    testimonial:
      "Grâce à BioScan, je peux suivre mes résultats en temps réel, c’est très pratique !",
  },
  {
    avatar: <Avatar alt="Travis Howard" src="/static/images/avatar/2.jpg" />,
    name: 'Travis Howard',
    occupation: 'Ravi',
    testimonial:
      "La plateforme est claire et facile à utiliser, même pour moi qui ne suis pas très à l’aise avec la technologie",
  },
  {
    avatar: <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />,
    name: 'Cindy Baker',
    occupation: 'Confiant',
    testimonial:
      'J’apprécie les notifications qui me préviennent dès qu’un résultat est disponible',
  },
  {
    avatar: <Avatar alt="Remy Sharp" src="/static/images/avatar/4.jpg" />,
    name: 'Julia Stewart',
    occupation: 'Heureuse',
    testimonial:
      "BioScan m’a fait gagner beaucoup de temps, plus besoin de me déplacer pour voir mes analyses.",
  },
  {
    avatar: <Avatar alt="Travis Howard" src="/static/images/avatar/5.jpg" />,
    name: 'John Smith',
    occupation: 'Ravi',
    testimonial:
      "Le tableau de bord est très intuitif et me permet de garder un œil sur toutes mes données médicales.",
  },
  {
    avatar: <Avatar alt="Cindy Baker" src="/static/images/avatar/6.jpg" />,
    name: 'Daniel Wolf',
    occupation: 'Confiant',
    testimonial:
      "Je recommande BioScan à tous mes amis, c’est fiable et sécurisé.",
  },
];

const darkModeLogos = [
  'https://assets-global.website-files.com/61ed56ae9da9fd7e0ef0a967/6560628e8573c43893fe0ace_Sydney-white.svg',
  'https://assets-global.website-files.com/61ed56ae9da9fd7e0ef0a967/655f4d520d0517ae8e8ddf13_Bern-white.svg',
  'https://assets-global.website-files.com/61ed56ae9da9fd7e0ef0a967/655f46794c159024c1af6d44_Montreal-white.svg',
  'https://assets-global.website-files.com/61ed56ae9da9fd7e0ef0a967/61f12e891fa22f89efd7477a_TerraLight.svg',
  'https://assets-global.website-files.com/61ed56ae9da9fd7e0ef0a967/6560a09d1f6337b1dfed14ab_colorado-white.svg',
  'https://assets-global.website-files.com/61ed56ae9da9fd7e0ef0a967/655f5caa77bf7d69fb78792e_Ankara-white.svg',
];

const lightModeLogos = [
  'https://assets-global.website-files.com/61ed56ae9da9fd7e0ef0a967/6560628889c3bdf1129952dc_Sydney-black.svg',
  'https://assets-global.website-files.com/61ed56ae9da9fd7e0ef0a967/655f4d4d8b829a89976a419c_Bern-black.svg',
  'https://assets-global.website-files.com/61ed56ae9da9fd7e0ef0a967/655f467502f091ccb929529d_Montreal-black.svg',
  'https://assets-global.website-files.com/61ed56ae9da9fd7e0ef0a967/61f12e911fa22f2203d7514c_TerraDark.svg',
  'https://assets-global.website-files.com/61ed56ae9da9fd7e0ef0a967/6560a0990f3717787fd49245_colorado-black.svg',
  'https://assets-global.website-files.com/61ed56ae9da9fd7e0ef0a967/655f5ca4e548b0deb1041c33_Ankara-black.svg',
];

const logoStyle = {
  width: '64px',
  opacity: 0.3,
};

export default function Testimonials() {
  const { mode, systemMode } = useColorScheme();

  let logos;
  if (mode === 'system') {
    if (systemMode === 'light') {
      logos = lightModeLogos;
    } else {
      logos = darkModeLogos;
    }
  } else if (mode === 'light') {
    logos = lightModeLogos;
  } else {
    logos = darkModeLogos;
  }

  return (
    <Container
      id="testimonials"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
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
        <Typography
          component="h2"
          variant="h4"
          gutterBottom
          sx={{ color: 'text.primary' }}
        >
          Témoignages
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Découvrez ce que nos patients disent de BioScan et comment notre plateforme facilite le suivi de leurs analyses médicales
        </Typography>
      </Box>
      <Grid container spacing={2}>
        {userTestimonials.map((testimonial, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index} sx={{ display: 'flex' }}>
            <Card
              variant="outlined"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                flexGrow: 1,
              }}
            >
              <CardContent>
                <Typography
                  variant="body1"
                  gutterBottom
                  sx={{ color: 'text.secondary' }}
                >
                  {testimonial.testimonial}
                </Typography>
              </CardContent>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <CardHeader
                  avatar={testimonial.avatar}
                  title={testimonial.name}
                  subheader={testimonial.occupation}
                />
                <img
                  src={logos[index]}
                  alt={`Logo ${index + 1}`}
                  style={logoStyle}
                />
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
