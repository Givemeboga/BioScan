import React from "react";
import PropTypes from "prop-types";
import { 
  Card, CardContent, Typography, Box, useTheme, useMediaQuery,
  styled 
} from "@mui/material";
import { TrendingUp, TrendingDown } from "@mui/icons-material";

const StyledCard = styled(Card)(({ theme, color, small }) => ({
  height: small ? 84 : 110,
  display: "flex",
  alignItems: "center",
  borderRadius: 16,
  background: `linear-gradient(135deg, ${color}20 0%, ${color}10 50%, ${color}05 100%)`,
  borderLeft: `4px solid ${color}`,
  cursor: "pointer",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
  
  "&:hover": {
    transform: "translateY(-6px) scale(1.02)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
    background: `linear-gradient(135deg, ${color}25 0%, ${color}15 50%, ${color}08 100%)`
  },
  
  // 🆕 MOBILE OPTIM
  [theme.breakpoints.down('sm')]: {
    height: 76,
    borderRadius: 12,
    borderLeftWidth: "3px",
    "&:hover": {
      transform: "translateY(-3px)",
      boxShadow: "0 12px 24px rgba(0,0,0,0.12)"
    }
  }
}));

const IconBox = styled(Box)(({ theme, color, small }) => ({
  mr: 2,
  width: small ? 40 : 48,
  height: small ? 40 : 48,
  borderRadius: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `${color}15`,
  border: `1px solid ${color}30`,
  backdropFilter: "blur(10px)",
  boxShadow: `0 4px 12px ${color}20`,
  
  transition: "all 0.3s ease",
  
  "&:hover": {
    transform: "scale(1.1)",
    boxShadow: `0 8px 20px ${color}30`,
    background: `${color}20`
  },
  
  [theme.breakpoints.down('sm')]: {
    width: 36,
    height: 36,
    mr: 1.5
  }
}));

export default function StatCard({ 
  title, 
  value, 
  color = "#1976d2", 
  icon, 
  subtitle, 
  small = false, 
  trend = "neutral" 
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  

  const trendIcon = trend === "up" ? (
    <TrendingUp fontSize="small" sx={{ color: "#22c55e", ml: 0.5 }} />
  ) : trend === "down" ? (
    <TrendingDown fontSize="small" sx={{ color: "#ef4444", ml: 0.5 }} />
  ) : null;

  return (
    <StyledCard color={color} small={small} elevation={0}>
      <CardContent sx={{ 
        display: "flex", 
        alignItems: "center", 
        p: small || isMobile ? 1.5 : 2.5, 
        height: "100%",
        width: "100%"
      }}>
        {icon && (
          <IconBox color={color} small={small || isMobile}>
            <Box sx={{ 
              fontSize: small || isMobile ? 18 : 24, 
              color,
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
            }}>
              {icon}
            </Box>
          </IconBox>
        )}
        
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* 🆕 Title responsive */}
          <Typography 
            variant={isMobile ? "caption" : small ? "caption" : "subtitle2"} 
            sx={{ 
              color: "text.secondary", 
              fontWeight: 600, 
              mb: 0.5,
              fontSize: isMobile ? "0.75rem" : undefined,
              lineHeight: 1.3
            }} 
            noWrap
          >
            {title}
          </Typography>
          
          {/* 🆕 Value + trend responsive */}
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
            <Typography 
              variant={isMobile ? "h6" : small ? "h5" : "h4"} 
              sx={{ 
                fontWeight: 800, 
                color, 
                lineHeight: 1,
                fontSize: isMobile ? "1.5rem !important" : undefined
              }} 
              noWrap
            >
              {value ?? "—"}
            </Typography>
            {trendIcon}
          </Box>
          
          {/* 🆕 Subtitle responsive */}
          {subtitle && (
            <Typography 
              variant="caption" 
              sx={{ 
                mt: 0.75, 
                fontWeight: 500, 
                color: "text.secondary",
                fontSize: isMobile ? "0.7rem" : undefined,
                display: isTablet ? "none" : "block"
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </CardContent>
    </StyledCard>
  );
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.string,
  icon: PropTypes.node,
  subtitle: PropTypes.string,
  small: PropTypes.bool,
  trend: PropTypes.oneOf(["up", "down", "neutral"])
};

StatCard.defaultProps = {
  color: "#1976d2",
  trend: "neutral"
};
