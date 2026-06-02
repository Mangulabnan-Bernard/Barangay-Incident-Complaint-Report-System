import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100 p-4 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold">Create a Resident Account</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Register to file and track complaints
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
