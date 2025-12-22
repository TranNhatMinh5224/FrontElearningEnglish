import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./Context/AuthContext";
import { StreakProvider } from "./Context/StreakContext";
import { NotificationProvider } from "./Context/NotificationContext";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <StreakProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </StreakProvider>
    </AuthProvider>
  </React.StrictMode>
);
