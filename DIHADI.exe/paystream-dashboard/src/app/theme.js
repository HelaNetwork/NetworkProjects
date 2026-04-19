import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#6C63FF",
    },
    secondary: {
      main: "#00E5FF",
    },
    background: {
      default: "#0F172A",
      paper: "#1E293B",
    },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
  },
  shape: {
    borderRadius: 12,
  },
});

export default theme;