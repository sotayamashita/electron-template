import { ThemeProvider } from "@/components/theme-provider";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./assets/main.css";
import "./lib/i18n"; // Initialize i18n before React renders
import { setupLanguageChangeHandler } from "./lib/i18n";

// Set up language change handler after React initializes
setupLanguageChangeHandler();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
