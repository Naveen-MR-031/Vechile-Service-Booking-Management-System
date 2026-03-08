import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./context/ThemeContext";
import { MockDataProvider } from "./context/MockDataContext";
import "./styles/themes.css"; // Import global theme styles
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <MockDataProvider>
        <App />
      </MockDataProvider>
    </ThemeProvider>
  </StrictMode>
);
