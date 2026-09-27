import { AuthService } from "@src/services/auth";
import { type FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router";

function Login() {
  const authApi = AuthService.getInstance();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  if (authApi.getToken()) {
    return <Navigate to="/store" replace />;
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined);
    setIsLoading(true);

    try {
      await authApi.login(username, password);
      navigate("/store");
    } catch {
      setError("Invalid username or password.");
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
            Sign in to start shopping
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
              placeholder="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              autoComplete="username"
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
              autoComplete="current-password"
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
            Sign in
          </button>

          <p className="text-center text-xs text-base-content/50">
            Demo credentials: mor_2314 / 83r5^_
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
