"use client";
import { useFormState } from "react-dom";
import { login } from "../actions";

export default function LoginPage() {
  const [state, action] = useFormState(login, null as null | { error?: string });
  const field = "w-full rounded-md border border-ink-500 bg-ink-900 px-4 py-3 focus:border-glow focus:outline-none";
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-900 px-5">
      <form action={action} className="card w-full max-w-sm space-y-3 p-6">
        <div className="font-display text-lg font-bold">Вход в админку</div>
        <input name="login" placeholder="Логин" className={field} />
        <input name="password" type="password" placeholder="Пароль" className={field} />
        {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
        <button className="btn-glow w-full">Войти</button>
      </form>
    </div>
  );
}
