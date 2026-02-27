import React, { useState, useEffect } from "react";
import {
  Box, Paper, TextField, Typography, Button, Stack, IconButton,
  InputAdornment, CircularProgress, Link, Fade, Alert, FormControlLabel,
  Checkbox, Snackbar
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import logo from "../../assets/BioScan2.jpg";
import { loginTechnicien } from "../../services/Technicien/authService";
import { useNavigate } from "react-router-dom";
export default function LoginBioScan() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const COLORS = {
    primaryDark: "#163554",
    primary: "#0f9acf",
    surface: "#ffffff",
    textPrimary: "#163554",
    textSecondary: "#64748b",
    border: "#0f9acf33",
    shadow: "#0f9acf22"
  };

  // Charger username sauvegardé
  useEffect(() => {
    const savedData = localStorage.getItem("bioScanRemembered");
    if (savedData) {
      const { username, rememberMe } = JSON.parse(savedData);
      setFormData(prev => ({ ...prev, username, rememberMe }));
    }
  }, []);

  // Si déjà connecté → redirection
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role === "technicien") {
      navigate("/technicien");
    }
  }, [navigate]);

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Nom d'utilisateur requis";
    } else if (formData.username.length < 3) {
      newErrors.username = "Minimum 3 caractères";
    }

    if (!formData.password) {
      newErrors.password = "Mot de passe requis";
    } else if (formData.password.length < 6) {
      newErrors.password = "Minimum 6 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const data = await loginTechnicien(
        formData.username,
        formData.password
      );

      // Vérifier rôle
      if (data.role !== "technicien") {
        throw new Error("Accès refusé : réservé aux techniciens");
      }

      // Remember me
      if (formData.rememberMe) {
        localStorage.setItem(
          "bioScanRemembered",
          JSON.stringify({
            username: formData.username,
            rememberMe: true
          })
        );
      }

      showSnackbar("Connexion réussie", "success");

      setTimeout(() => {
        navigate("/technicien");
      }, 800);

    } catch (err) {
      const message = err.message || "Erreur de connexion";
      setErrors({ general: message });
      showSnackbar(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleClearRemembered = () => {
    localStorage.removeItem("bioScanRemembered");
    setFormData({
      username: "",
      password: "",
      rememberMe: false
    });
  };

  const isFormValid =
    formData.username &&
    formData.password;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e6f0fb, #f0faff)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 3,
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* ECG animation */}
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          opacity: 0.15,
          zIndex: 0
        }}
      >
        <svg
          width="200%"
          height="200"
          viewBox="0 0 1200 200"
          style={{
            animation: "ecgMove 8s linear infinite"
          }}
        >
          <path
            d="M0 100 L80 100 L100 60 L120 140 L140 100 L300 100 L320 70 L340 130 L360 100 L520 100 L540 60 L560 140 L580 100 L1200 100"
            fill="none"
            stroke="#0f9acf"
            strokeWidth="2"
          />
        </svg>

        <style>
          {`
          @keyframes ecgMove {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          `}
        </style>
      </Box>

      <Fade in timeout={800}>
        <Paper
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: "100%",
            maxWidth: 420,
            p: 5,
            borderRadius: "24px",
            background: COLORS.surface,
            boxShadow: `0 16px 48px ${COLORS.shadow}`,
            zIndex: 1
          }}
        >
          <Stack alignItems="center" spacing={2} mb={4}>
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: "20px",
                overflow: "hidden"
              }}
            >
              <Box
                component="img"
                src={logo}
                alt="BioScan"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />
            </Box>

            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ color: COLORS.primaryDark }}
            >
              BioScan Lab
            </Typography>

            <Typography
              variant="body2"
              sx={{ color: COLORS.textSecondary }}
            >
              Espace Technicien
            </Typography>
          </Stack>

          {errors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.general}
            </Alert>
          )}

          <Stack spacing={3}>
            <TextField
              label="Nom d'utilisateur"
              fullWidth
              value={formData.username}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  username: e.target.value
                })
              }
              error={!!errors.username}
              helperText={errors.username}
              sx={inputStyle(COLORS)}
            />

            <TextField
              label="Mot de passe"
              fullWidth
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  password: e.target.value
                })
              }
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                    >
                      {showPassword ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={inputStyle(COLORS)}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.rememberMe}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rememberMe: e.target.checked
                    })
                  }
                />
              }
              label="Rester connecté"
            />

            <Button
              type="submit"
              fullWidth
              disabled={loading || !isFormValid}
              sx={{
                height: 56,
                borderRadius: "20px",
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
                color: "white"
              }}
            >
              {loading ? (
                <CircularProgress size={22} />
              ) : (
                "Se connecter"
              )}
            </Button>

            <Button
              onClick={handleClearRemembered}
              variant="text"
            >
              Effacer données
            </Button>
          </Stack>
        </Paper>
      </Fade>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() =>
          setSnackbar({
            ...snackbar,
            open: false
          })
        }
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

const inputStyle = (COLORS) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "16px",
    border: `1px solid ${COLORS.border}`
  }
});
