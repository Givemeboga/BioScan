import React, { useMemo } from "react";
import { Box, Typography } from "@mui/material";

/**
 * Si tu as installé 'recharts', décommente et utilise la version chart avec BarChart.
 *
 * Sinon ce composant affiche un placeholder graphique simple.
 */

// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function UploadChart({ files = [] }) {
  const series = useMemo(() => {
    // group by day (last 7 days)
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      return { key, label: d.toLocaleDateString(), count: 0 };
    });
    files.forEach((f) => {
      const day = f.uploadedAt?.slice?.(0, 10);
      const idx = days.findIndex((d) => d.key === day);
      if (idx >= 0) days[idx].count += 1;
    });
    return days;
  }, [files]);

  // If Recharts available, you can replace the JSX below with:
  /*
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={series}>
        <XAxis dataKey="label" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="count" fill="#1976d2" radius={[6,6,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
  */

  // fallback simple bars
  const max = Math.max(...series.map((s) => s.count), 1);
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">Uploads dernier 7 jours</Typography>
      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
        {series.map((s) => (
          <Box key={s.key} sx={{ flex: 1 }}>
            <Box sx={{ height: 100, display: "flex", alignItems: "end", justifyContent: "center" }}>
              <Box sx={{ width: "70%", bgcolor: "var(--primary)", height: `${(s.count / max) * 100}%`, borderRadius: 1 }} />
            </Box>
            <Typography variant="caption" sx={{ display: "block", textAlign: "center", mt: 0.5 }}>{s.label.split("/").slice(0,2).join("/")}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}