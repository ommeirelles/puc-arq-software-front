import { Header } from "@src/components/header";
import { Payment } from "@types";
import { Link, useLocation } from "react-router";

function CheckoutSuccess() {
  const location = useLocation();
  const payment = (location.state as { payment?: Payment } | null)?.payment;

  return (
    <div className="min-h-screen bg-base-200">
      <Header />
      <main className="container mx-auto p-4 flex justify-center">
        <div className="card bg-base-100 shadow-xl max-w-md w-full">
          <div className="card-body items-center text-center gap-4">
            <span className="material-symbols-outlined text-success text-6xl">
              check_circle
            </span>
            <h1 className="card-title text-2xl">Order confirmed!</h1>
            <p className="text-base-content/60">
              Everything is ready — your order will be shipped to the address
              provided.
            </p>
            {payment ? (
              <div className="w-full flex flex-col gap-2">
                <div className="badge badge-soft badge-secondary badge-lg w-full">
                  PAID: R$ {payment.amount.toFixed(2)} —{" "}
                  {payment.card_brand.toUpperCase()} •••• {payment.card_last4}
                </div>
                <p className="text-sm text-base-content/60">
                  {payment.address.street}, {payment.address.number} —{" "}
                  {payment.address.neighborhood}, {payment.address.city}/
                  {payment.address.state} — CEP {payment.address.cep}
                </p>
              </div>
            ) : null}
            <Link to="/store" className="btn btn-primary w-full">
              Back to store
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CheckoutSuccess;
