import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Typography,
  Button,
  Stack,
  IconButton,
  InputAdornment,
  CircularProgress,
  Link,
  Fade
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import logo from "../../assets/BioScan2.jpg";

export default function LoginBioScan() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 20% 20%, #1e88e5 0%, #15314d 40%, #0f172a 100%)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Glow background effect */}
      <Box
        sx={{
          position: "absolute",
          width: 500,
          height: 500,
          background: "rgba(0,170,186,0.2)",
          filter: "blur(120px)",
          borderRadius: "50%",
          top: -100,
          right: -100
        }}
      />

      <Fade in timeout={800}>
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 420,
            p: 5,
            borderRadius: "24px",
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,0.15)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            color: "#fff"
          }}
        >
          {/* Logo */}
          <Stack alignItems="center" spacing={2} mb={4}>
            <Box
              sx={{
                width: 90,
                height: 90,
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,170,186,0.4)",
                transition: "0.3s",
                "&:hover": {
                  transform: "scale(1.05)"
                }
              }}
            >
              <Box
                component="img"
                src={logo}
                alt="BioScan Logo"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />
            </Box>

            <Typography variant="h5" fontWeight={700}>
              BioScan
            </Typography>

            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Analyse biomédicale intelligente
            </Typography>
          </Stack>

          {/* Email */}
          <TextField
            fullWidth
            label="Adresse Email"
            variant="outlined"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              input: { color: "#fff" },
              label: { color: "rgba(255,255,255,0.7)" },
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                "& fieldset": {
                  borderColor: "rgba(255,255,255,0.3)"
                },
                "&:hover fieldset": {
                  borderColor: "#00abab"
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#1e88e5"
                }
              }
            }}
          />

          {/* Password */}
          <TextField
            fullWidth
            label="Mot de passe"
            type={showPassword ? "text" : "password"}
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              input: { color: "#fff" },
              label: { color: "rgba(255,255,255,0.7)" },
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                "& fieldset": {
                  borderColor: "rgba(255,255,255,0.3)"
                },
                "&:hover fieldset": {
                  borderColor: "#00abab"
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#1e88e5"
                }
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    sx={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          {/* Forgot */}
          <Stack alignItems="flex-end" mt={1}>
            <Link
              href="#"
              underline="hover"
              sx={{
                fontSize: "0.8rem",
                color: "#00abab"
              }}
            >
              Mot de passe oublié ?
            </Link>
          </Stack>

          {/* Button */}
          <Button
            fullWidth
            size="large"
            onClick={handleLogin}
            disabled={loading}
            sx={{
              mt: 4,
              height: 50,
              borderRadius: "14px",
              fontWeight: 600,
              textTransform: "none",
              background:
                "linear-gradient(90deg, #00abab 0%, #1e88e5 100%)",
              boxShadow: "0 10px 30px rgba(30,136,229,0.4)",
              "&:hover": {
                transform: "translateY(-3px)"
              }
            }}
          >
            {loading ? (
              <CircularProgress size={22} sx={{ color: "#fff" }} />
            ) : (
              "Se connecter"
            )}
          </Button>
        </Paper>
      </Fade>
    </Box>
  );
}
