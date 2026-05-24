// 🚀 UPLOADCHART PRO - ZÉRO ESPACE + UX PREMIUM
import React, { useMemo, useCallback } from "react";
import { 
  Box, Typography, Chip, useTheme, useMediaQuery,
  Skeleton, Fade, Tooltip
} from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine, Cell
} from "recharts";
import { TrendingUp, Info } from "@mui/icons-material";

export default function UploadChart({ files = [] }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Données 7 jours optimisées
  const chartData = useMemo(() => {
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));
      const key = date.toISOString().slice(0, 10);
      const dayFiles = files.filter(f => f.uploadedAt?.slice(0, 10) === key);

      return {
        date: key,
        label: isMobile 
          ? date.toLocaleDateString('fr-FR', { day: 'numeric' })
          : date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        uploads: dayFiles.length,
        maxUploads: Math.max(...files.map(f => new Date(f.uploadedAt).toISOString().slice(0,10) === key ? 1 : 0))
      };
    });

    const totalUploads = days.reduce((sum, day) => sum + day.uploads, 0);
    const avgDaily = (totalUploads / 7).toFixed(1);

    return { days, totalUploads, avgDaily };
  }, [files, isMobile]);

  const CustomTooltip = useCallback(({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{
          bgcolor: "white",
          p: 2,
          borderRadius: 2,
          boxShadow: theme.shadows[8],
          border: `1px solid ${theme.palette.divider}`,
          minWidth: 120
        }}>
          <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
            {payload[0].payload.label}
          </Typography>
          <Typography variant="h5" color="primary.main" fontWeight={800}>
            {payload[0].value} upload{payload[0].value > 1 ? 's' : ''}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {payload[0].payload.date}
          </Typography>
        </Box>
      );
    }
    return null;
  }, [theme]);

  const isEmpty = chartData.totalUploads === 0;

  return (
    <Fade in timeout={600}>
      <Box sx={{
        height: "100%",
        minHeight: 380,
        width: "100%",
        borderRadius: 3,
        boxShadow: theme.shadows[3],
        border: `1px solid ${theme.palette.divider}`,
        display: "flex",
        flexDirection: "column",
        bgcolor: "white",
        overflow: "hidden",
        position: "relative"
      }}>
        {/* Header Premium */}
        <Box sx={{ 
          p: { xs: 2, md: 3 }, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center"
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{
              bgcolor: "primary.50", 
              p: 1.5, 
              borderRadius: 2.5,
              boxShadow: theme.shadows[2]
            }}>
              <TrendingUp sx={{ fontSize: 28, color: "primary.main" }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800} sx={{ color: "text.primary" }}>
                Activité 7 jours
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {chartData.totalUploads} fichier{chartData.totalUploads !== 1 ? 's' : ''} au total
              </Typography>
            </Box>
          </Box>

          <Tooltip title={`Moyenne: ${chartData.avgDaily}/jour`}>
            <Chip
              label={`${chartData.totalUploads}`}
              color="primary"
              variant="filled"
              size="medium"
              sx={{ 
                fontWeight: 700, 
                height: 36,
                px: 2,
                boxShadow: theme.shadows[1],
                "& .MuiChip-label": { px: 1.5 }
              }}
            />
          </Tooltip>
        </Box>

        {/* Chart Zone - ZÉRO ESPACE */}
        <Box sx={{ 
          flex: 1, 
          p: 0, 
          position: "relative",
          minHeight: 300,
          background: `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.common.white} 100%)`
        }}>
          {isEmpty ? (
            <Box sx={{ 
              height: "100%", 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              justifyContent: "center", 
              p: 4 
            }}>
              <TrendingUp sx={{ fontSize: 64, color: "action.disabled", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                Aucune activité
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Les uploads des 7 derniers jours apparaîtront ici
              </Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData.days}
                margin={{ top: 10, right: 5, left: 5, bottom: 15 }}
              >
                <CartesianGrid 
                  vertical={false} 
                  strokeDasharray="4 4" 
                  stroke={theme.palette.action.hover}
                />
                
                <ReferenceLine
                  y={parseFloat(chartData.avgDaily)}
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{
                    position: "top",
                    value: `Moy. ${chartData.avgDaily}`,
                    fill: theme.palette.primary.main,
                    fontSize: 12,
                    fontWeight: 700
                  }}
                />

                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ 
                    fontSize: 12, 
                    fontWeight: 600, 
                    fill: theme.palette.text.secondary 
                  }}
                  height={45}
                  interval={0}
                  angle={isMobile ? -30 : 0}
                  textAnchor={isMobile ? "end" : "middle"}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ 
                    fontSize: 12, 
                    fill: theme.palette.text.secondary 
                  }}
                  allowDecimals={false}
                  width={35}
                />

                <RechartsTooltip content={<CustomTooltip />} />
                
                <Bar dataKey="uploads" radius={[6, 6, 0, 0]}>
                  {chartData.days.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.uploads > 0 ? "#3B82F6" : theme.palette.action.disabledBackground}
                    />
                  ))}
                </Bar>

                <defs>
                  <linearGradient id="uploadGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="70%" stopColor="#1D4ED8" />
                    <stop offset="100%" stopColor="#1E3A8A" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Box>

        {/* Footer amélioré */}
        <Box sx={{ 
          p: 2.5, 
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: "grey.50",
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center" 
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip 
              label={`${chartData.avgDaily}/jour`} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
            <Typography variant="caption" color="text.secondary">
              Moyenne sur 7 jours
            </Typography>
          </Box>
          
          <Typography variant="caption" color="primary.main" fontWeight={600}>
            {chartData.days[0].label} → {chartData.days[6].label}
          </Typography>
        </Box>
      </Box>
    </Fade>
  );
}
