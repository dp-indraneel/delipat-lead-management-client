import { useState } from "react";
import Button from "../components/ui/Button";

interface Props {
  onLogin: (email: string, password: string) => Promise<void>;
}

export default function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fbfc] px-4">
      <div className="w-full max-w-md rounded-3xl border border-[#013144]/12 bg-white p-8 shadow-xl">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#fcb61f]">
          PI Law Management
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[#013144]">Sign in</h1>
        <p className="mt-2 text-sm text-[#013144]/55">
          Login uses the backend token and stores it in cookies for now.
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setLoading(true);
            setError("");
            try {
              await onLogin(email, password);
            } catch (nextError) {
              setError(nextError instanceof Error ? nextError.message : "Login failed");
            } finally {
              setLoading(false);
            }
          }}
        >
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            type="email"
            className="h-11 w-full rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none placeholder:text-[#013144]/35"
          />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            type="password"
            className="h-11 w-full rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none placeholder:text-[#013144]/35"
          />

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <Button className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}
