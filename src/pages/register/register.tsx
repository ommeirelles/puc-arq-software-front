import { AuthService } from "@src/services/auth";
import { type FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";

function Register() {
  const authApi = AuthService.getInstance();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  if (authApi.getToken()) {
    return <Navigate to="/store" replace />;
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      await authApi.register(name, email, password);
      await authApi.login(email, password);
      navigate("/store");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create account."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <form className="card-body gap-4" onSubmit={onSubmit}>
          <h1 className="card-title justify-center text-2xl">
            Fake Store APP
          </h1>
          <p className="text-center text-sm text-base-content/60">
            Create your account to start shopping
          </p>

          {error ? (
            <div role="alert" className="alert alert-error alert-soft">
              <span className="material-symbols-outlined">error</span>
              <span>{error}</span>
            </div>
          ) : null}

          <label className="input w-full">
            <span className="material-symbols-outlined">person</span>
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              autoComplete="name"
            />
          </label>

          <label className="input w-full">
            <span className="material-symbols-outlined">mail</span>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label className="input w-full">
            <span className="material-symbols-outlined">lock</span>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="new-password"
            />
          </label>

          <label className="input w-full">
            <span className="material-symbols-outlined">lock</span>
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              autoComplete="new-password"
            />
          </label>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : null}
            Create account
          </button>

          <p className="text-center text-xs text-base-content/50">
            Already have an account?{" "}
            <Link to="/" className="link link-primary">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
