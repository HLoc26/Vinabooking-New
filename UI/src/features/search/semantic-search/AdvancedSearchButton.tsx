import React from "react";
import { Button } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useNavigate } from "react-router-dom";

export const AdvancedSearchButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate("/search/semantic")}
      startIcon={<AutoAwesomeIcon />}
      variant="contained"
      color="secondary"
      sx={{
        borderRadius: "12px",
        fontWeight: 600,
        textTransform: "none",
        px: 3,
        py: 1.5,
        boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 6px 16px rgba(249, 115, 22, 0.4)",
        },
      }}
    >
      AI-Powered Search
    </Button>
  );
};
