import { AuthService } from "@src/services/auth";
import { LoginForm, LoginFormSchema } from "@types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate, useNavigate } from "react-router";

function Login() {
  const authApi = AuthService.getInstance();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(LoginFormSchema),
  });

  if (authApi.getToken()) {
    return <Navigate to="/store" replace />;
  }

  const onSubmit = async (data: LoginForm) => {
    try {
      await authApi.login(data.email, data.password);
      navigate("/store");
    } catch {
      setError("root", { message: "Invalid email or password." });
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <form
          className="card-body gap-4"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <h1 className="card-title justify-center text-2xl">
            Fake Store APP
          </h1>
          <p className="text-center text-sm text-base-content/60">
            Sign in to start shopping
          </p>

          {errors.root ? (
            <div role="alert" className="alert alert-error alert-soft">
              <span className="material-symbols-outlined">error</span>
              <span>{errors.root.message}</span>
            </div>
          ) : null}

          <div>
            <label
              className={`input w-full${errors.email ? " input-error" : ""}`}
            >
              <span className="material-symbols-outlined">mail</span>
              <input
                type="email"
                placeholder="Email"
                aria-invalid={Boolean(errors.email)}
                autoComplete="email"
                {...register("email")}
              />
            </label>
            {errors.email ? (
              <p className="text-error text-xs mt-1">{errors.email.message}</p>
            ) : null}
          </div>

          <div>
            <label
              className={`input w-full${errors.password ? " input-error" : ""}`}
            >
              <span className="material-symbols-outlined">lock</span>
              <input
                type="password"
                placeholder="Password"
                aria-invalid={Boolean(errors.password)}
                autoComplete="current-password"
                {...register("password")}
              />
            </label>
            {errors.password ? (
              <p className="text-error text-xs mt-1">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="loading loading-spinner loading-sm" />
            ) : null}
            Sign in
          </button>

          <p className="text-center text-xs text-base-content/50">
            Don't have an account?{" "}
            <Link to="/register" className="link link-primary">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
