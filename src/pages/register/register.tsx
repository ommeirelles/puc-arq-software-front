import { AuthService } from "@src/services/auth";
import { RegisterForm, RegisterFormSchema } from "@types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate, useNavigate } from "react-router";

function Register() {
  const authApi = AuthService.getInstance();
  const navigate = useNavigate();
  const {
    register: registerField,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(RegisterFormSchema),
  });

  if (authApi.getToken()) {
    return <Navigate to="/store" replace />;
  }

  const onSubmit = async (data: RegisterForm) => {
    try {
      await authApi.register(data.name, data.email, data.password);
      await authApi.login(data.email, data.password);
      navigate("/store");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create account.";

      if (message.toLowerCase().includes("email already registered")) {
        setError("email", { message });
      } else {
        setError("root", { message });
      }
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
            Create your account to start shopping
          </p>

          {errors.root ? (
            <div role="alert" className="alert alert-error alert-soft">
              <span className="material-symbols-outlined">error</span>
              <span>{errors.root.message}</span>
            </div>
          ) : null}

          <div>
            <label
              className={`input w-full${errors.name ? " input-error" : ""}`}
            >
              <span className="material-symbols-outlined">person</span>
              <input
                type="text"
                placeholder="Full name"
                aria-invalid={Boolean(errors.name)}
                autoComplete="name"
                {...registerField("name")}
              />
            </label>
            {errors.name ? (
              <p className="text-error text-xs mt-1">{errors.name.message}</p>
            ) : null}
          </div>

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
                {...registerField("email")}
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
                autoComplete="new-password"
                {...registerField("password")}
              />
            </label>
            {errors.password ? (
              <p className="text-error text-xs mt-1">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          <div>
            <label
              className={`input w-full${errors.confirmPassword ? " input-error" : ""}`}
            >
              <span className="material-symbols-outlined">lock</span>
              <input
                type="password"
                placeholder="Confirm password"
                aria-invalid={Boolean(errors.confirmPassword)}
                autoComplete="new-password"
                {...registerField("confirmPassword")}
              />
            </label>
            {errors.confirmPassword ? (
              <p className="text-error text-xs mt-1">
                {errors.confirmPassword.message}
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
