"use client";

import { ReactNode } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// MUI date/time pickers themed to match the site tokens in app/globals.css.
const pickerTheme = createTheme({
  palette: {
    primary: { main: "#1E4A36", dark: "#163829", contrastText: "#F4EFE6" },
    error: { main: "#9E2B25" },
    text: { primary: "#1B1915", secondary: "#5E574C" },
    background: { paper: "#FBF8F2", default: "#F4EFE6" },
    divider: "#DDD4C4",
  },
  shape: { borderRadius: 4 },
  typography: {
    fontFamily: "var(--font-grotesk), ui-sans-serif, system-ui, sans-serif",
    button: { textTransform: "none", fontWeight: 500 },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#FBF8F2",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#CFC5B3" },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#7A7163" },
        },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
  },
});

export default function PickerProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={pickerTheme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>{children}</LocalizationProvider>
    </ThemeProvider>
  );
}
