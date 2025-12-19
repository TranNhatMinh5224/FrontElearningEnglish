import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./Context/AuthContext";
import { StreakProvider } from "./Context/StreakContext";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <StreakProvider>
        <App />
      </StreakProvider>
    </AuthProvider>
  </React.StrictMode>
);
