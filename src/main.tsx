import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import "./main.css";
import { RequireAuth } from "./components/require-auth";
import Login from "./pages/login/login";
import Store from "./pages/store";
import { initTelemetry } from "./telemetry";

initTelemetry();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/store"
          element={
            <RequireAuth>
              <Store />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
