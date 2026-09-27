import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import "./main.css";
import { Loading } from "./components/loading";
import { RequireAuth } from "./components/require-auth";
import { initTelemetry } from "./telemetry";

const Login = lazy(() => import("./pages/login/login"));
const Register = lazy(() => import("./pages/register/register"));
const Store = lazy(() => import("./pages/store"));
const ProductDetails = lazy(() => import("./pages/product"));
const Checkout = lazy(() => import("./pages/checkout"));
const CheckoutSuccess = lazy(() => import("./pages/checkout/success"));

initTelemetry();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="w-full h-screen flex items-center justify-center">
            <Loading size="lg" />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/store"
            element={
              <RequireAuth>
                <Store />
              </RequireAuth>
            }
          />
          <Route
            path="/store/product/:id"
            element={
              <RequireAuth>
                <ProductDetails />
              </RequireAuth>
            }
          />
          <Route
            path="/checkout"
            element={
              <RequireAuth>
                <Checkout />
              </RequireAuth>
            }
          />
          <Route
            path="/checkout/success"
            element={
              <RequireAuth>
                <CheckoutSuccess />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>
);
